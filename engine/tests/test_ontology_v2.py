"""Contract-freeze tests, independent of providers and production storage."""
import copy
import json
from pathlib import Path
import sqlite3

import jsonschema
import pytest
from pydantic import ValidationError

from nv_engine.models import CaseBundle, OntologyGraph
from nv_engine.models.ontology_adapter import from_case_bundle, stable_id

ROOT = Path(__file__).resolve().parents[2]

@pytest.fixture
def graph():
    return json.loads((ROOT / 'data/fixtures/synthetic/ontology-v2/handoff.synthetic.json').read_text())


def test_handoff_fixture_matches_executable_and_generated_contract(graph):
    schema = json.loads((ROOT / 'schemas/ontology-graph.v2.schema.json').read_text())
    jsonschema.Draft202012Validator.check_schema(schema)
    jsonschema.Draft202012Validator(schema, format_checker=jsonschema.FormatChecker()).validate(graph)
    validated = OntologyGraph.model_validate(graph)
    assert validated.synthetic is True
    assert validated.schema_version != CaseBundle.model_fields['schema_version'].default
    assert OntologyGraph.model_validate_json(validated.model_dump_json()) == validated


@pytest.mark.parametrize(('group', 'key', 'value', 'error'), [
    ('observations','entity_id','vessel:missing','unknown_reference'),
    ('observations','source_ids',['source:missing'],'unknown_reference'),
    ('observations','geometry_source_id',None,'geometry_source_missing'),
    ('observations','observed_at_utc','2030-01-01T00:00:00Z','observation_in_future'),
    ('observations','recorded_at_utc','2020-01-01T00:00:00Z','acquisition_after_recording'),
    ('observations','observed_at_utc','2026-11-12T08:00:00','explicit timezone'),
    ('observations','source_ids',['source:synthetic:ais']*2,'duplicate_references'),
    ('relations','object_id','event:ghost','unknown_reference'),
    ('relations','object_id','vessel:synthetic:v01','self_relation'),
    ('relations','valid_to_utc','2020-01-01T00:00:00Z','reverse_interval'),
    ('relations','resolution_state','accepted','unreviewed_relation_promotion'),
    ('identifiers','entity_id','vessel:missing','unknown_reference'),
    ('claims','source_ids',['source:missing'],'unknown_reference'),
    ('claims','status','verified','literal_error'),
    ('evidence_links','claim_id','claim:ghost','unknown_reference'),
    ('module_runs','status','completed','false_module_completion'),
    ('module_runs','executor','mcp_remote_verified','missing_execution_receipt'),
])
def test_reference_and_truth_failures(graph, group, key, value, error):
    if key == 'valid_to_utc':
        graph[group][0]['valid_from_utc'] = '2026-01-01T00:00:00Z'
    graph[group][0][key] = value
    with pytest.raises((ValidationError, ValueError), match=error):
        OntologyGraph.model_validate(graph)


@pytest.mark.parametrize('coordinates', [[180.1,0],[1,90.1],[True,3],[float('nan'),2],[0],[0,0,0]])
def test_invalid_geometry_never_repaired(graph, coordinates):
    graph['observations'][0]['geometry']['coordinates'] = coordinates
    with pytest.raises(ValidationError):
        OntologyGraph.model_validate(graph)


def test_unclosed_polygon_is_rejected(graph):
    graph['observations'][0]['geometry'] = {'type':'Polygon','coordinates':[[[0,0],[1,0],[1,1],[0,1]]]}
    with pytest.raises(ValidationError, match='unclosed_polygon_ring'):
        OntologyGraph.model_validate(graph)


def test_null_geometry_is_explicit_and_never_zero(graph):
    o=graph['observations'][0]
    o.update(geometry=None, geometry_source_id=None, geometry_role='unlocated', precision_m=None)
    validated=OntologyGraph.model_validate(graph)
    assert validated.observations[0].geometry is None
    o['geometry_source_id']='source:synthetic:ais'
    with pytest.raises(ValidationError,match='invalid_null_geometry'):
        OntologyGraph.model_validate(graph)


def test_person_geometry_cannot_be_public_or_delayed(graph):
    graph['entities'][0].update(kind='person_public', privacy_class='public')
    for visibility in ['public','delayed_public','aggregated_only']:
        graph['observations'][0]['visibility_policy']=visibility
        with pytest.raises(ValidationError,match='person_location_not_public'):
            OntologyGraph.model_validate(graph)


def test_duplicate_ids_and_source_lineage_cycles(graph):
    duplicate=copy.deepcopy(graph)
    duplicate['entities'].append(copy.deepcopy(duplicate['entities'][0]))
    with pytest.raises(ValidationError,match='duplicate_ids'):
        OntologyGraph.model_validate(duplicate)
    first,second=graph['sources'][:2]
    first.update(original_or_derived='derived',derived_from_source_id=second['source_id'])
    second.update(original_or_derived='derived',derived_from_source_id=first['source_id'])
    with pytest.raises(ValidationError,match='cyclic_source_lineage'):
        OntologyGraph.model_validate(graph)


def test_unreviewed_inference_cannot_be_source_verified(graph):
    graph['claims'][0].update(status='inferred',review_state='source_verified')
    with pytest.raises(ValidationError,match='inference_is_not_source_verified'):
        OntologyGraph.model_validate(graph)


def test_remote_receipt_is_not_simulated_completion(graph):
    run=graph['module_runs'][0]
    run.update(executor='mcp_remote_verified',status='completed',receipt={
        'tool_name':'synthetic-test-tool','tool_call_id':'test-only','completed_at_utc':'2026-11-12T08:00:00Z'})
    with pytest.raises(ValidationError,match='missing_completed_run_provenance'):
        OntologyGraph.model_validate(graph)
    run.update(started_at_utc='2026-11-12T07:00:00Z',completed_at_utc='2026-11-12T08:00:00Z',input_hash='a'*64,result_hash='b'*64)
    OntologyGraph.model_validate(graph)
    run['receipt']['completed_at_utc']='2026-11-12T08:01:00Z'
    with pytest.raises(ValidationError,match='execution_receipt_time_mismatch'):
        OntologyGraph.model_validate(graph)


def test_stable_id_is_scoped_and_not_a_name_join():
    assert stable_id('vessel:ais:mmsi','123456789')=='vessel:ais:mmsi:123456789'
    assert stable_id('event:ucdp','42@26.1') != stable_id('event:ucdp','42@26.2')
    assert stable_id('source','a b') != stable_id('source','ab')
    assert len(stable_id('source','a'*500))<=256
    with pytest.raises(ValueError):stable_id('bad namespace','value')


def test_legacy_adapter_preserves_original_and_requires_kind_map(payload):
    original=copy.deepcopy(payload)
    case=CaseBundle.model_validate(payload)
    with pytest.raises(ValueError,match='explicit_entity_kind_required'):
        from_case_bundle(case)
    mapped=from_case_bundle(case,kind_overrides={e.entity_id:'organization' for e in case.entities})
    assert payload==original
    assert mapped.legacy==case
    assert mapped.graph.synthetic is True
    assert mapped.graph.module_runs==[]
    assert all(o.visibility_policy=='restricted' for o in mapped.graph.observations)
    assert all(c.review_state!='source_verified' for c in mapped.graph.claims)
    assert 'publication_policy_review_required' in mapped.diagnostics


def test_disputed_is_not_silently_changed_to_refuted(payload):
    payload['entities'][0]['evidence_status']='disputed'
    case=CaseBundle.model_validate(payload)
    mapped=from_case_bundle(case,kind_overrides={e.entity_id:'organization' for e in case.entities})
    entity=mapped.graph.entities[0]
    assert entity.status=='unresolved'
    assert entity.attributes['legacy_status']=='disputed'
    assert mapped.legacy.entities[0].evidence_status=='disputed'


@pytest.mark.parametrize('with_existing_schema', [False, True])
def test_sql_proposal_is_additive_idempotent_and_not_auto_applied(with_existing_schema):
    proposal=ROOT/'docs/design/nv3.2/0004_ontology_v2.proposed.sql'
    sql=proposal.read_text()
    db=sqlite3.connect(':memory:')
    try:
        if with_existing_schema:
            for p in sorted((ROOT/'services/cloudflare/migrations').glob('*.sql')):
                if p.name >= '0004':continue
                db.executescript(p.read_text())
            db.execute("INSERT INTO settings(key,value) VALUES('pr1-sentinel','preserve')")
        before={r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        db.executescript(sql);db.executescript(sql)
        after={r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        assert len(after-before)==12
        assert all(n.startswith('nv2_') for n in after-before)
        assert list(db.execute('PRAGMA foreign_key_check'))==[]
        if with_existing_schema:
            assert db.execute("SELECT value FROM settings WHERE key='pr1-sentinel'").fetchone()[0]=='preserve'
        assert '0004_ontology_v2' not in (ROOT/'services/cloudflare/database.js').read_text()
        active=(ROOT/'services/cloudflare/migrations/0004_ontology_v2.sql').read_text()
        strip=lambda value:'\n'.join(line for line in value.splitlines() if not line.lstrip().startswith('--'))
        assert strip(active)==strip(sql)
        # SQL NULL semantics must not allow only one coordinate to be populated.
        db.execute("INSERT INTO nv2_sources(source_id,source_kind,license_status,access_status) VALUES('source:test','unknown','unknown','metadata_only')")
        db.execute("INSERT INTO nv2_entities(entity_id,kind,display_name,status,privacy_class,updated_at_utc) VALUES('entity:test','location','TEST','reported','public','2026-11-12T00:00:00Z')")
        with pytest.raises(sqlite3.IntegrityError):
            db.execute("INSERT INTO nv2_observations(observation_id,entity_id,provider_id,lat,lon,geometry_role,visibility_policy,status) VALUES('obs:test','entity:test','test',NULL,30,'unlocated','public','reported')")
    finally:
        db.close()


def test_version_is_required_and_blocked_is_not_execution(graph):
    graph['module_runs'][0]['status']='blocked'
    OntologyGraph.model_validate(graph)
    del graph['schema_version']
    with pytest.raises(ValidationError,match='schema_version'):
        OntologyGraph.model_validate(graph)


def test_anomaly_references_and_calibration_are_checked(graph):
    a=dict(candidate_id='anomaly:synthetic:1',entity_id=None,metric='test',detector='test',
           baseline={},score=None,calibration='uncalibrated',source_ids=['source:synthetic:ais'],
           observation_ids=['obs:missing'],status='inferred',review_state='candidate')
    graph['anomalies']=[a]
    with pytest.raises(ValidationError,match='unknown_reference:observations'):
        OntologyGraph.model_validate(graph)
    a['observation_ids']=['obs:synthetic:v01']
    a['calibration']='calibrated_with_validation'
    with pytest.raises(ValidationError,match='uncorroborated_calibration'):
        OntologyGraph.model_validate(graph)
