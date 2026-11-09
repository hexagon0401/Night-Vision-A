"""One bounded acquisition per source. No scheduler, implicit live access or paging."""
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

from nv_engine.models import CaseBundle
from nv_engine.sources.adapters import AdapterError, decode, normalize
from nv_engine.sources.config import Manifest
from .http import Fetched, Fetcher
from .state import CollectorState, digest, json_bytes
from .types import CollectionReport, CollectionResult


class Collector:
    def __init__(self, state: CollectorState, fetcher: Fetcher | None = None):
        self.state = state
        self.fetcher = fetcher or Fetcher(state)

    def close(self):
        self.fetcher.close()

    def replay(self, manifest: Manifest, body: bytes, acquired: datetime) -> CollectionResult:
        if acquired.tzinfo is None or acquired.utcoffset() is None:
            raise ValueError('replay acquisition time needs an explicit timezone')
        if len(body) > manifest.max_bytes:
            raise AdapterError('response_size_limit')
        body_hash = self.state.put_blob(body)
        self.state.log_fetch(manifest.source_id, 'synthetic-replay', body_hash, acquired,
                             {'mode': 'replay', 'manifest': manifest.model_dump(mode='json')})
        return self._process(manifest, Fetched(body, body_hash, acquired.astimezone(timezone.utc), False), 'replay')

    def collect(self, manifest: Manifest) -> CollectionResult:
        return self._process(manifest, self.fetcher.fetch(manifest), 'live')

    def collect_many(self, manifests: list[Manifest], max_workers=4) -> dict[str, CollectionResult | str]:
        if not 1 <= max_workers <= 4:
            raise ValueError('max_workers must be between 1 and 4')
        if len(manifests) > 32 or len({m.source_id for m in manifests}) != len(manifests):
            raise ValueError('batch needs <=32 unique source IDs')
        def run(manifest):
            try:
                return manifest.source_id, self.collect(manifest)
            except Exception:
                # One failed provider cannot discard successful acquisitions; no raw exception leakage.
                return manifest.source_id, 'collection_failed'
        with ThreadPoolExecutor(max_workers=max_workers) as pool:
            return dict(pool.map(run, manifests))

    def _process(self, manifest: Manifest, fetched: Fetched, mode: str) -> CollectionResult:
        if len(fetched.body) > manifest.max_bytes:
            raise AdapterError('response_size_limit')
        page = decode(manifest, fetched.body)
        rows = page.rows[:manifest.max_records]
        records, seen, reasons = [], set(), Counter()
        new = duplicates = skipped = 0
        for row in rows:
            try:
                record = normalize(manifest, row, fetched.body_hash, fetched.fetched_at, self.state,
                                   'synthetic' if mode == 'replay' else 'source_backed')
            except (ValueError, TypeError, KeyError, OverflowError) as error:
                code = str(error) if isinstance(error, AdapterError) else 'invalid_record_fields'
                reasons[code] += 1
                skipped += 1
                continue
            retained, inserted = self.state.remember(record)
            new += int(inserted)
            duplicates += int(not inserted)
            if retained.record_key not in seen:
                seen.add(retained.record_key)
                records.append(retained)
        limited = len(page.rows) > len(rows) or page.next_page
        if manifest.provider == 'gdelt':
            # The DOC API has no continuation token; reaching its request limit is partial coverage.
            limit = int(manifest.params.get('maxrecords', '75'))
            limited = limited or len(page.rows) >= limit
        report = CollectionReport(provider_id=manifest.source_id, provider_endpoint=manifest.endpoint,
                                  provider_parameters=manifest.params, license_terms_url=str(manifest.rights.terms_url),
                                  rights_reviewed=manifest.rights.reviewed, redistribution=manifest.rights.redistribution,
                                  input_mode=mode, response_hash=fetched.body_hash,
                                  fetched_at_utc=fetched.fetched_at, from_cache=fetched.from_cache, considered=len(rows),
                                  accepted=len(records), newly_stored=new, duplicates=duplicates, skipped=skipped,
                                  limited=limited, next_page_available=page.next_page, skip_reasons=dict(reasons))
        return CollectionResult(report=report, records=records)


def to_bundle(result: CollectionResult) -> CaseBundle | None:
    if not result.records:
        return None
    fields = {'sources': [], 'claims': [], 'entities': [], 'events': [], 'observations': []}
    origins = {record.data_origin for record in result.records}
    if len(origins) != 1:
        raise ValueError('synthetic and source-backed records cannot share a bundle')
    for record in sorted(result.records, key=lambda value: value.record_key):
        for plural, singular in [('sources', 'source'), ('claims', 'claim'), ('entities', 'entity'),
                                 ('events', 'event'), ('observations', 'observation')]:
            value = getattr(record, singular)
            if value is not None:
                fields[plural].append(value)
    case_hash = digest(json_bytes(sorted(record.record_key for record in result.records)))
    origin = origins.pop()
    return CaseBundle(case_id=f'case:{case_hash}', title=f"{'SYNTHETIC DATA — ' if origin == 'synthetic' else ''}{result.report.provider_id} bounded acquisition",
                      data_origin=origin, **fields)
