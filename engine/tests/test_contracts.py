from copy import deepcopy
from datetime import datetime
import math
import pytest
from pydantic import ValidationError
from nv_engine.models import CaseBundle, Location


def test_round_trip_preserves_provenance_gaps_and_distinct_clocks(payload):
    bundle = CaseBundle.model_validate(payload)
    assert CaseBundle.model_validate_json(bundle.model_dump_json()) == bundle
    assert bundle.entities[0].location is None
    assert bundle.sources[0].published_at_utc < bundle.observations[0].observed_at_utc < bundle.sources[0].retrieved_at_utc
    assert bundle.claims[0].counterevidence_claim_ids == ['claim:counter']
    assert bundle.hypotheses[0].disconfirming_claim_ids == ['claim:counter']
    assert bundle.claims[0].confidence.value == 'unknown'  # Two sources do not upgrade confidence.


def test_timezone_offsets_normalize_without_changing_instant(payload):
    payload['observations'][0]['observed_at_utc'] = '2026-01-01T11:00:00+09:00'
    bundle = CaseBundle.model_validate(payload)
    assert bundle.observations[0].observed_at_utc.isoformat() == '2026-01-01T02:00:00+00:00'
    assert bundle.model_dump(mode='json')['observations'][0]['observed_at_utc'].endswith('Z')


@pytest.mark.parametrize('value', ['2026-01-01T02:00:00', 1767232800, True, datetime(2026, 1, 1)])
def test_naive_or_numeric_times_rejected(payload, value):
    payload['observations'][0]['observed_at_utc'] = value
    with pytest.raises(ValidationError, match='explicit timezone'):
        CaseBundle.model_validate(payload)


@pytest.mark.parametrize('value', [math.nan, math.inf, -math.inf, '12.5', True])
def test_nonfinite_and_coerced_metrics_rejected(payload, value):
    payload['observations'][0]['value'] = value
    with pytest.raises(ValidationError):
        CaseBundle.model_validate(payload)


def test_verified_location_is_sourced_and_does_not_accept_partial_coordinates(payload):
    payload['events'][0]['location'] = dict(latitude=35.0, longitude=127.0, role='verified',source_id='src:synthetic-a',accuracy_m=20.0)
    assert CaseBundle.model_validate(payload).events[0].location.crs == 'EPSG:4326'
    del payload['events'][0]['location']['longitude']
    with pytest.raises(ValidationError):
        CaseBundle.model_validate(payload)


@pytest.mark.parametrize('patch', [dict(latitude=91.0),dict(longitude=-181.0),dict(latitude=math.nan),dict(source_id=None),dict(crs='EPSG:3857'),dict(accuracy_m=-1.0)])
def test_bad_geometry_rejected(patch):
    point = dict(latitude=0.0, longitude=0.0, role='verified',source_id='src:test')
    with pytest.raises(ValidationError):
        Location.model_validate(point | patch)


def test_symbolic_anchor_cannot_masquerade_as_event_location(payload):
    symbolic = dict(latitude=0.0, longitude=0.0,role='symbolic',note='Synthetic illustrative anchor only')
    payload['entities'][0]['location'] = symbolic
    assert CaseBundle.model_validate(payload).entities[0].location.role == 'symbolic'
    payload['events'][0]['location'] = symbolic
    with pytest.raises(ValidationError, match='symbolic'):
        CaseBundle.model_validate(payload)


@pytest.mark.parametrize('change,match', [
    (lambda p: p['sources'].append(deepcopy(p['sources'][0])), 'duplicate source'),
    (lambda p: p['observations'][0].update(entity_id='entity:missing'), 'unresolved entity'),
    (lambda p: p['entities'][0]['provenance'].update(source_ids=[]), 'at least 1'),
    (lambda p: p['sources'][1].update(publisher_family='synthetic-a'), 'independent publisher'),
    (lambda p: p['claims'][0].update(counterevidence_claim_ids=['claim:sample']), 'counter itself'),
    (lambda p: p['relations'][0].update(valid_from_utc='2026-02-01T00:00:00Z',valid_to_utc='2026-01-01T00:00:00Z'), 'end precedes'),
    (lambda p: p['anomalies'][0].update(window_start_utc='2026-01-01T02:30:00Z'), 'outside its window'),
    (lambda p: p['narratives'][0]['steps'][0].update(visible_relation_ids=['relation:missing']), 'unresolved relation'),
    (lambda p: p['relations'][0].update(evidence_status='observed'), 'promote'),
    (lambda p: p['narratives'][0]['steps'][0].update(evidence_status='documented'), 'promote'),
    (lambda p: p['sources'][0].update(content_hash='fake'), 'pattern'),
    (lambda p: p['sources'][0].update(url='file:///tmp/secret'), 'URL'),
    (lambda p: p.update(schema_version='9.0.0'), '2.0.0'),
    (lambda p: p.update(automatic_high_confidence=True), 'Extra inputs'),
])
def test_invalid_graph_and_provenance_are_rejected(payload, change, match):
    change(payload)
    with pytest.raises(ValidationError, match=match):
        CaseBundle.model_validate(payload)


def test_fixture_hashes_match_retained_synthetic_inputs(payload):
    import hashlib
    from pathlib import Path
    root = Path(__file__).resolve().parents[2] / 'data/fixtures/synthetic/raw'
    for source, letter in zip(payload['sources'], 'ab'):
        assert source['content_hash'] == hashlib.sha256((root / f'{letter}.txt').read_bytes()).hexdigest()
