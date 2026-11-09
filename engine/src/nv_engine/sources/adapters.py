"""Provider shapes only: no scraping, inference or source-quality promotion."""
from dataclasses import dataclass
from datetime import date, datetime, timezone
from email.utils import parsedate_to_datetime
import csv
import io
import json
import math
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from defusedxml import ElementTree

from nv_engine.models import Claim, Entity, Event, Location, Observation, Provenance, Source
from nv_engine.models.canonical import utc
from nv_engine.collect.state import CollectorState, digest, json_bytes
from nv_engine.collect.types import CollectedRecord
from .config import Manifest

ADAPTER_VERSION = '1'


class AdapterError(ValueError):
    pass


@dataclass
class Page:
    rows: list[dict]
    next_page: bool = False


def decode(manifest: Manifest, body: bytes) -> Page:
    try:
        if manifest.provider in ('gdelt', 'ucdp', 'usgs'):
            data = json.loads(body)
            field = 'articles' if manifest.provider == 'gdelt' else 'features' if manifest.provider=='usgs' else 'Result'
            if not isinstance(data, dict) or field not in data or not isinstance(data[field], list):
                raise AdapterError('unexpected_provider_schema')
            return Page(data[field], bool(data.get('NextPageUrl')) or (manifest.provider=='usgs' and len(data[field])>=int(manifest.params.get('limit','250'))))
        if manifest.provider == 'firms':
            reader = csv.DictReader(io.StringIO(body.decode('utf-8-sig'), newline=''), strict=True)
            required = {'latitude', 'longitude', 'acq_date', 'acq_time', 'bright_ti4'}
            if not reader.fieldnames or not required.issubset(reader.fieldnames):
                raise AdapterError('unexpected_provider_schema')
            rows = list(reader)
            if any(None in row or any(v is None for v in row.values()) for row in rows):
                raise AdapterError('ragged_csv')
            return Page(rows)
        root = ElementTree.fromstring(body)
        local = lambda tag: tag.rsplit('}', 1)[-1]
        if local(root.tag) == 'rss':
            channel = root.find('channel')
            if channel is None:
                raise AdapterError('unexpected_provider_schema')
            entries = channel.findall('item')
        elif local(root.tag) == 'feed':
            entries = [element for element in root if local(element.tag) == 'entry']
        else:
            raise AdapterError('unexpected_provider_schema')
        rows = []
        for entry in entries:
            row = {'xml': ElementTree.tostring(entry, encoding='unicode')}
            for element in entry:
                name = local(element.tag)
                if name == 'link' and element.get('href') and element.get('rel', 'alternate') == 'alternate':
                    row['link'] = element.get('href')
                elif name in ('title', 'link', 'guid', 'id', 'pubDate', 'published'):
                    row[name] = ''.join(element.itertext()).strip()
            rows.append(row)
        return Page(rows)
    except AdapterError:
        raise
    except Exception:
        # XML/entity/JSON/CSV parser diagnostics may contain provider content.
        raise AdapterError('invalid_provider_document') from None


def canonical_url(value: str) -> str:
    u = urlsplit(value)
    if u.scheme not in ('http', 'https') or not u.hostname or u.username or u.password:
        raise AdapterError('invalid_record_url')
    query = [(k, v) for k, v in parse_qsl(u.query, keep_blank_values=True)
             if not k.lower().startswith('utm_') and k.lower() not in ('fbclid', 'gclid')]
    # Keep all substantive query parameters; never merge different articles by title alone.
    return urlunsplit((u.scheme.lower(), u.netloc.lower(), u.path or '/', urlencode(sorted(query)), ''))


def timestamp(value, *, rss=False):
    if not value:
        return None
    try:
        return utc(parsedate_to_datetime(value) if rss else value)
    except (ValueError, TypeError, OverflowError):
        return None


def finite(value):
    if isinstance(value, bool):
        raise AdapterError('invalid_numeric_value')
    number = float(value)
    if not math.isfinite(number):
        raise AdapterError('invalid_numeric_value')
    return number


def normalize(manifest: Manifest, row: dict, response_hash: str, acquired: datetime,
              state: CollectorState, data_origin: str) -> CollectedRecord:
    if not isinstance(row, dict):
        raise AdapterError('invalid_record_shape')
    payload = json_bytes(row)
    payload_hash = digest(payload)
    gaps, provider_seen, event_time, observed, published = [], None, None, None, None
    date_start = date_end = None
    precision = 'unknown'
    provider = manifest.provider
    publisher, family = manifest.publisher, manifest.publisher_family
    position = None
    if provider in ('gdelt', 'rss'):
        url = canonical_url(str(row.get('url') if provider == 'gdelt' else row.get('link', '')))
        identity = str(row.get('guid') or row.get('id') or url) if provider == 'rss' else url
        raw_title = row.get('title')
        title = raw_title.strip() if isinstance(raw_title, str) else ''
        if not title:
            raise AdapterError('missing_title')
        if provider == 'gdelt':
            domain = urlsplit(url).hostname.lower()
            publisher = domain
            family = manifest.publisher_families.get(domain, domain)
            # GDELT seendate is an indexing timestamp, never publication/event time.
            seen = row.get('seendate')
            if seen:
                try:
                    provider_seen = datetime.strptime(seen, '%Y%m%dT%H%M%SZ').replace(tzinfo=timezone.utc)
                except (ValueError, TypeError):
                    gaps.append('provider_seen_time')
        else:
            domain = urlsplit(url).hostname.lower()
            feed_domain = urlsplit(manifest.endpoint).hostname.lower().removeprefix('www.')
            if domain != feed_domain and not domain.endswith('.' + feed_domain):
                publisher = domain
                family = manifest.publisher_families.get(domain, domain)
            value = row.get('pubDate') or row.get('published')
            published = timestamp(value, rss='pubDate' in row)
    elif provider == 'ucdp':
        identity = str(row.get('id') if row.get('id') is not None else '').strip()
        if not identity:
            raise AdapterError('missing_upstream_identity')
        url = 'https://ucdp.uu.se/'
        title = f"UCDP reported event {identity}: {row.get('country', 'country unknown')}"
        for field, output in [('date_start', 'start'), ('date_end', 'end')]:
            value = row.get(field)
            if value:
                try:
                    parsed = date.fromisoformat(str(value)[:10])
                except ValueError:
                    raise AdapterError('invalid_event_date') from None
                if output == 'start':
                    date_start = parsed
                else:
                    date_end = parsed
        if date_start and date_end and date_end < date_start:
            raise AdapterError('invalid_event_interval')
        if date_start:
            precision = 'day'
        # UCDP dates are day-resolution; do not invent midnight UTC instants.
        if row.get('latitude') not in (None, '') and row.get('longitude') not in (None, ''):
            if str(row.get('where_prec')) == '1':
                position = (finite(row['latitude']), finite(row['longitude']))
            else:
                gaps.append('location_precision_not_exact')
    elif provider=='usgs':
        properties=row['properties'];identity=str(row['id'])
        observed=datetime.fromtimestamp(finite(properties['time'])/1000,timezone.utc);event_time=observed;precision='instant'
        coordinates=row['geometry']['coordinates'];position=(finite(coordinates[1]),finite(coordinates[0]))
        url=canonical_url(properties['url']);title=f"USGS reported magnitude {properties['mag']} ({properties.get('magType','unknown')}): {properties.get('place','location description unavailable')}"
    else:
        observed = datetime.strptime(f"{row['acq_date']} {str(row['acq_time']).zfill(4)}", '%Y-%m-%d %H%M').replace(tzinfo=timezone.utc)
        precision = 'instant'
        position = (finite(row['latitude']), finite(row['longitude']))
        identity = '|'.join(str(row.get(k, '')) for k in ('satellite', 'instrument', 'acq_date', 'acq_time', 'latitude', 'longitude'))
        url = 'https://firms.modaps.eosdis.nasa.gov/'
        title = 'FIRMS reported satellite thermal detection; cause is not established'
    if published is None:
        gaps.append('publication_time')
    if event_time is None and provider != 'firms':
        gaps.append('event_time')
    if position is None:
        gaps.append('location')
    # Source snapshots are versioned by provider record identity and exact canonical payload.
    record_key = digest(json_bytes([ADAPTER_VERSION, data_origin, manifest.source_id,
                                   manifest.publisher, manifest.publisher_family, manifest.publisher_families,
                                   manifest.rights.model_dump(mode='json'), identity, payload_hash]))
    suffix = f'{manifest.source_id}:{record_key}'
    source_id = f'source:{suffix}'
    source = Source(source_id=source_id, url=url, publisher=publisher, publisher_family=family,
                    published_at_utc=published, retrieved_at_utc=acquired, content_hash=payload_hash,
                    license=manifest.rights.statement, access='restricted' if manifest.credential_env else 'public',
                    extraction_method=f'{provider}:canonical-provider-record-json:v{ADAPTER_VERSION}')
    provenance = Provenance(source_ids=[source_id], extraction_method=source.extraction_method,
                            evidence_span_hash=payload_hash)
    location = Location(latitude=position[0], longitude=position[1], role='verified', source_id=source_id,
                        note='Provider-reported point; not independently ground-verified') if position else None
    entity = event = observation = None
    if provider == 'ucdp':
        event = Event(event_id=f'event:{suffix}', event_type='reported_conflict_event', event_time_utc=event_time,
                      description=title, location=location, evidence_status='reported', provenance=provenance)
    if provider=='usgs':
        entity=Entity(entity_id=f'entity:{manifest.source_id}:catalog',entity_type='earthquake_catalog_series',name='USGS bounded regional earthquake catalog',location=None,evidence_status='reported',provenance=provenance)
        event=Event(event_id=f'event:{suffix}',event_type='reported_earthquake',event_time_utc=event_time,description=title,entity_ids=[entity.entity_id],location=location,evidence_status='reported',provenance=provenance)
        observation=Observation(observation_id=f'observation:{suffix}',entity_id=entity.entity_id,observed_at_utc=observed,metric='earthquake_magnitude',value=finite(row['properties']['mag']),unit=str(row['properties'].get('magType') or 'unknown_magnitude_scale'),source_record_id=identity,location=location,evidence_status='reported',provenance=provenance)
    if provider == 'firms':
        entity = Entity(entity_id=f'entity:{suffix}', entity_type='satellite_detection', name=title,
                        location=location, evidence_status='reported', provenance=provenance)
        observation = Observation(observation_id=f'observation:{suffix}', entity_id=entity.entity_id,
                                  observed_at_utc=observed, metric='viirs_brightness_temperature_ti4',
                                  value=finite(row['bright_ti4']), unit='K', source_record_id=identity,
                                  location=location, evidence_status='reported', provenance=provenance)
    claim = Claim(claim_id=f'claim:{suffix}', statement=title, evidence_status='reported',
                  assessment='Provider record only; no independent corroboration or causal inference',
                  provenance=provenance, event_ids=[event.event_id] if event else [],
                  observation_ids=[observation.observation_id] if observation else [])
    result = CollectedRecord(data_origin=data_origin, record_key=record_key, story_key=digest(json_bytes([data_origin, family, url if provider in ('gdelt', 'rss') else identity])),
                             provider_id=manifest.source_id, provider_endpoint=manifest.endpoint,
                             provider_parameters=manifest.params, license_terms_url=str(manifest.rights.terms_url),
                             upstream_record_id=identity, response_hash=response_hash,
                             payload_hash=payload_hash, provider_seen_at_utc=provider_seen, date_precision=precision,
                             event_date_start=date_start, event_date_end=date_end,
                             source=source, claim=claim, entity=entity, event=event, observation=observation, data_gaps=gaps)
    state.put_blob(payload)
    return result
