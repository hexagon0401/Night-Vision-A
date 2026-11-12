"""Explicit one-way legacy adapter. No providers, entity merging or publication.

The original validated CaseBundle is returned alongside the graph so unsupported
legacy semantics and statuses are retained rather than silently reinterpreted.
"""
from dataclasses import dataclass
from hashlib import sha256
import re

from .canonical import CaseBundle
from .ontology import OntologyGraph, Kind


def stable_id(namespace: str, value: str) -> str:
    if len(namespace)>96 or not re.fullmatch(r'[a-z][a-z0-9_-]*(?::[a-z][a-z0-9_-]*)*', namespace):
        raise ValueError('invalid_id_namespace')
    if not isinstance(value, str) or not value.strip():
        raise ValueError('invalid_id_value')
    result = namespace + ':' + value
    if len(result) <= 256 and re.fullmatch(r'[A-Za-z][A-Za-z0-9:._@-]+', result):
        return result
    return namespace + ':sha256:' + sha256(value.encode()).hexdigest()


@dataclass(frozen=True)
class OntologyAdaptation:
    graph: OntologyGraph
    legacy: CaseBundle
    diagnostics: tuple[str, ...]


def from_case_bundle(case: CaseBundle, *, kind_overrides: dict[str, Kind] | None = None,
                     relation_predicates: dict[str, str] | None = None) -> OntologyAdaptation:
    """Keep legacy data untouched; unknown entity kinds require an explicit map.

    Imported observations remain restricted pending PR3 publication-policy review.
    Symbolic anchors never become observed spatial evidence. No reverse adapter
    is offered: refuted/unresolved do not have lossless legacy equivalents.
    """
    # Validate even model_construct()-created inputs without altering the caller.
    legacy = CaseBundle.model_validate(case.model_dump(mode='json'))
    raw = legacy.model_dump(mode='json')
    graph = {k: [] for k in ('entities', 'identifiers', 'observations', 'sources',
                            'claims', 'evidence_links', 'relations', 'anomalies', 'module_runs')}
    graph.update(schema_version='nv-ontology/2.0', synthetic=legacy.data_origin == 'synthetic')
    diagnostics = []
    sid = {s.source_id: stable_id('source:legacy', s.source_id) for s in legacy.sources}
    eid = {e.entity_id: stable_id('entity:legacy', e.entity_id) for e in legacy.entities}
    oid = {o.observation_id: stable_id('observation:legacy', o.observation_id) for o in legacy.observations}

    def status(row):
        old = row['evidence_status']
        if old in ('disputed', 'unverified'):
            diagnostics.append('status_preserved_in_legacy:' + old)
            return 'unresolved'
        return old

    def sources(row):
        p = row['provenance']
        return [sid[s] for s in p['source_ids'] + p.get('corroborating_source_ids', [])]

    def geometry(location):
        if location is None or location['role'] != 'verified':
            return dict(geometry=None, geometry_source_id=None, geometry_role='unlocated', precision_m=None)
        return dict(geometry={'type': 'Point', 'coordinates': [location['longitude'], location['latitude']]},
                    geometry_source_id=sid[location['source_id']],
                    geometry_role='provider_reported_position', precision_m=location['accuracy_m'])

    kinds = {'country': 'location', 'country_conflict_series': 'location', 'region': 'location', 'city': 'location'}
    allowed = {'event', 'vessel', 'aircraft', 'satellite_scene', 'camera', 'facility',
               'organization', 'location', 'person_public', 'document', 'anomaly'}
    for s in raw['sources']:
        graph['sources'].append(dict(source_id=sid[s['source_id']], url=s['url'], publisher=s['publisher'],
            content_hash=s['content_hash'], original_or_derived='unknown', derived_from_source_id=None,
            independence_group=s['publisher_family'], published_at_utc=s['published_at_utc'],
            indexed_at_utc=None, acquired_at_utc=s['retrieved_at_utc'], license_status='unknown',
            access_status='restricted' if s['access'] == 'restricted' else 'metadata_only'))
    for e in raw['entities']:
        kind = (kind_overrides or {}).get(e['entity_id'], kinds.get(e['entity_type'], e['entity_type']))
        if kind not in allowed:
            raise ValueError('explicit_entity_kind_required:' + e['entity_id'])
        graph['entities'].append(dict(entity_id=eid[e['entity_id']], kind=kind, display_name=e['name'],
            status=status(e), privacy_class='restricted', source_ids=sources(e), attributes={
                'legacy_id': e['entity_id'], 'legacy_type': e['entity_type'],
                'legacy_status': e['evidence_status'], 'legacy_location': e['location']}))
        graph['identifiers'].append(dict(identifier_id=stable_id('identifier:legacy', e['entity_id']),
            entity_id=eid[e['entity_id']], namespace='legacy_entity_id', value=e['entity_id'],
            valid_from_utc=None, valid_to_utc=None, source_ids=sources(e), status=status(e)))
        if e['location'] and e['location']['role'] == 'symbolic':
            diagnostics.append('symbolic_anchor_not_emitted:' + e['entity_id'])
    for e in raw['events']:
        event_id = stable_id('event:legacy', e['event_id'])
        graph['entities'].append(dict(entity_id=event_id, kind='event', display_name=e['description'][:300],
            status=status(e), privacy_class='restricted', source_ids=sources(e), attributes={
                'legacy_id': e['event_id'], 'legacy_status': e['evidence_status'],
                'event_type': e['event_type'], 'event_time_utc': e['event_time_utc'],
                'legacy_entity_ids': e['entity_ids']}))
        graph['observations'].append(dict(observation_id=stable_id('observation:legacy:event', e['event_id']),
            entity_id=event_id, provider_id='legacy-case-bundle', observed_at_utc=e['event_time_utc'],
            acquired_at_utc=None, recorded_at_utc=None, source_ids=sources(e), status=status(e),
            visibility_policy='restricted', measurements={}, **geometry(e['location'])))
    for o in raw['observations']:
        graph['observations'].append(dict(observation_id=oid[o['observation_id']], entity_id=eid[o['entity_id']],
            provider_id='legacy-case-bundle', observed_at_utc=o['observed_at_utc'], acquired_at_utc=None,
            recorded_at_utc=None, source_ids=sources(o), status=status(o), **geometry(o['location']),
            visibility_policy='restricted', measurements={'metric': o['metric'], 'value': o['value'], 'unit': o['unit'],
                'legacy_source_record_id': o['source_record_id'], 'legacy_status': o['evidence_status']}))
    for c in raw['claims']:
        claim_id = stable_id('claim:legacy', c['claim_id'])
        graph['claims'].append(dict(claim_id=claim_id, statement=c['statement'], language=None,
            source_ids=sources(c), status=status(c), event_from_utc=None, event_to_utc=None,
            limitations=[c['assessment'], 'legacy_status:' + c['evidence_status']],
            review_state='proposed' if c['evidence_status'] in ('inferred', 'scenario') else 'not_reviewed'))
        for source_id in sources(c):
            graph['evidence_links'].append(dict(evidence_link_id=stable_id('evidence:legacy', c['claim_id'] + ':' + source_id),
                claim_id=claim_id, source_id=source_id, role='MENTIONS', quote_span=None, status=status(c)))
    predicates = {'REPORTED_IN', 'OBSERVED_AT', 'OPERATED_BY', 'LOCATED_AT', 'MENTIONED_IN', 'RELATED_TO',
                  'CITES', 'DERIVED_FROM', 'CONTRADICTS', 'CORROBORATES', 'POSSIBLY_SAME_AS', 'REPORTED_INVOLVED_IN'}
    for r in raw['relations']:
        predicate = (relation_predicates or {}).get(r['relation_type'], r['relation_type'])
        if predicate not in predicates:
            diagnostics.append('relation_requires_mapping:' + r['relation_id'] + ':' + r['relation_type'])
            continue
        graph['relations'].append(dict(relation_id=stable_id('relation:legacy', r['relation_id']),
            subject_id=eid[r['source_entity_id']], object_id=eid[r['target_entity_id']], predicate=predicate,
            source_ids=sources(r), status=status(r), valid_from_utc=r['valid_from_utc'],
            valid_to_utc=r['valid_to_utc'], resolution_state='proposed'))
    metrics = {o['observation_id']: o['metric'] for o in raw['observations']}
    for a in raw['anomalies']:
        owner_ids = {o.entity_id for o in legacy.observations if o.observation_id in a['observation_ids']}
        graph['anomalies'].append(dict(candidate_id=stable_id('anomaly:legacy', a['anomaly_id']),
            entity_id=eid[next(iter(owner_ids))] if len(owner_ids) == 1 else None,
            metric=' | '.join(sorted({metrics[x] for x in a['observation_ids']})), detector=a['detector'],
            baseline={'description': a['baseline_description'], 'detector_version': a['detector_version'],
                'window_start_utc': a['window_start_utc'], 'window_end_utc': a['window_end_utc']},
            score=a['score'], calibration='uncalibrated', source_ids=sources(a),
            observation_ids=[oid[x] for x in a['observation_ids']], status=status(a), review_state='candidate'))
    diagnostics.extend(['legacy_payload_retained_no_reverse_conversion', 'publication_policy_review_required'])
    return OntologyAdaptation(OntologyGraph.model_validate(graph), legacy, tuple(sorted(set(diagnostics))))
