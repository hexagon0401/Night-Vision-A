from datetime import timedelta
import json
import threading
import time
import httpx
import pytest
from nv_engine.collect.http import Fetcher
from nv_engine.collect.pipeline import Collector, to_bundle
from nv_engine.models import CaseBundle
from nv_engine.sources.adapters import AdapterError
from nv_engine.sources.config import Manifest


@pytest.mark.parametrize('provider,expected',[('gdelt',2),('ucdp',1),('firms',1),('rss',2)])
def test_replay_provider_contract_roundtrip_and_hashes(state,clock,manifest,provider_body,provider,expected):
    collector=Collector(state)
    try:
        result=collector.replay(manifest(provider),provider_body(provider),clock.now())
        assert result.report.accepted==expected and result.report.skipped==0
        assert result.report.input_mode=='replay'
        bundle=to_bundle(result)
        assert bundle.data_origin=='synthetic'
        assert CaseBundle.model_validate_json(bundle.model_dump_json())==bundle
        for record in result.records:
            assert state.read_blob(record.response_hash)==provider_body(provider)
            assert record.source.content_hash==record.payload_hash
            assert state.read_blob(record.payload_hash)
            assert record.source.quality.value=='unknown'
            assert record.claim.confidence.value=='unknown'
            assert record.claim.evidence_status.value=='reported'
    finally:
        collector.close()


def test_persistent_dedup_same_input_but_changed_payload_creates_revision(state,clock,manifest,provider_body):
    collector=Collector(state)
    config=manifest()
    first=collector.replay(config,provider_body('gdelt'),clock.now())
    assert first.report.newly_stored==2 and first.report.duplicates==1
    clock.advance(60)
    second=collector.replay(config,provider_body('gdelt'),clock.now())
    assert second.report.newly_stored==0 and second.report.duplicates==3
    assert to_bundle(first)==to_bundle(second)
    changed=json.loads(provider_body('gdelt'))
    changed['articles'][0]['title']='Revised synthetic headline'
    third=collector.replay(config,json.dumps(changed).encode(),clock.now())
    assert third.report.newly_stored==1
    assert to_bundle(third).case_id!=to_bundle(first).case_id
    collector.close()


def test_replay_cannot_poison_live_cache_or_source_origin(state,clock,manifest,provider_body):
    body=provider_body('gdelt')
    client=httpx.Client(transport=httpx.MockTransport(lambda r:httpx.Response(200,content=body)))
    collector=Collector(state,Fetcher(state,client,now=clock.now,sleep=clock.sleep))
    replay=collector.replay(manifest(),body,clock.now())
    live=collector.collect(manifest(live=True))
    assert to_bundle(replay).data_origin=='synthetic'
    assert to_bundle(live).data_origin=='source_backed'
    assert {r.record_key for r in replay.records}.isdisjoint(r.record_key for r in live.records)
    # Request was mocked; this test does not establish any real upstream behavior.


def test_gdelt_index_time_is_not_article_publication_or_event_time(state,clock,manifest,provider_body):
    collector=Collector(state)
    result=collector.replay(manifest(),provider_body('gdelt'),clock.now())
    record=result.records[0]
    assert record.provider_seen_at_utc.isoformat()=='2026-01-01T01:02:03+00:00'
    assert record.source.published_at_utc is None and record.event is None
    assert {'publication_time','event_time','location'}<=set(record.data_gaps)
    collector.close()


def test_ucdp_retains_day_range_without_inventing_midnight_or_precise_centroids(state,clock,manifest,provider_body):
    collector=Collector(state)
    body=json.loads(provider_body('ucdp'))
    result=collector.replay(manifest('ucdp'),json.dumps(body).encode(),clock.now())
    record=result.records[0]
    assert str(record.event_date_start)=='2026-01-01' and str(record.event_date_end)=='2026-01-02'
    assert record.date_precision=='day' and record.event.event_time_utc is None
    assert record.event.location.source_id==record.source.source_id
    body['Result'][0]['where_prec']=3
    coarse=collector.replay(manifest('ucdp'),json.dumps(body).encode(),clock.now()).records[0]
    assert coarse.event.location is None and 'location_precision_not_exact' in coarse.data_gaps
    collector.close()


def test_firms_uses_measured_timestamp_and_kelvin_without_causal_claim(state,clock,manifest,provider_body):
    collector=Collector(state)
    record=collector.replay(manifest('firms'),provider_body('firms'),clock.now()).records[0]
    assert record.observation.observed_at_utc.isoformat()=='2026-01-01T01:30:00+00:00'
    assert record.observation.value==310.5 and record.observation.unit=='K'
    assert record.observation.confidence.value=='unknown'
    assert record.event is None and 'cause is not established' in record.claim.statement
    collector.close()


def test_rss_and_atom_publication_dates_and_missing_dates(state,clock,manifest,provider_body):
    collector=Collector(state)
    rss=collector.replay(manifest('rss'),provider_body('rss'),clock.now())
    assert rss.records[0].source.published_at_utc.isoformat()=='2026-01-01T00:00:00+00:00'
    assert rss.records[1].source.published_at_utc is None
    atom=collector.replay(manifest('rss'),provider_body('atom'),clock.now())
    assert atom.records[0].source.published_at_utc.isoformat()=='2026-01-01T00:00:00+00:00'
    collector.close()


def test_invalid_rows_and_record_limits_are_visible(state,clock,manifest,provider_body):
    collector=Collector(state)
    data=json.loads(provider_body('gdelt'))
    data['articles'].append({'title':'invalid fixture, missing URL'})
    result=collector.replay(manifest(),json.dumps(data).encode(),clock.now())
    assert result.report.skipped==1 and result.report.skip_reasons=={'invalid_record_url':1}
    capped=collector.replay(manifest(max_records=1),provider_body('gdelt'),clock.now())
    assert capped.report.limited and capped.report.considered==1
    collector.close()


def test_ucdp_next_page_is_reported_but_never_automatically_fetched(state,clock,manifest,provider_body):
    collector=Collector(state)
    data=json.loads(provider_body('ucdp'))
    data['NextPageUrl']='https://untrusted.example.invalid/not-followed'
    result=collector.replay(manifest('ucdp'),json.dumps(data).encode(),clock.now())
    assert result.report.next_page_available and result.report.limited
    collector.close()


@pytest.mark.parametrize('provider,body',[
    ('gdelt',b'{"message":"error"}'),('ucdp',b'{"Result":{}}'),
    ('firms',b'Invalid MAP_KEY'),('rss',b'<html>error</html>'),
    ('rss',b'<!DOCTYPE rss [<!ENTITY x SYSTEM "file:///etc/passwd">]><rss><channel><item><title>&x;</title></item></channel></rss>')])
def test_error_documents_and_xml_entities_do_not_become_successful_empty_runs(state,clock,manifest,provider,body):
    collector=Collector(state)
    with pytest.raises(AdapterError):
        collector.replay(manifest(provider),body,clock.now())
    collector.close()


@pytest.mark.parametrize('provider,body',[('gdelt',b'{"articles":[]}'),('ucdp',b'{"Result":[],"NextPageUrl":null}'),('rss',b'<rss><channel/></rss>')])
def test_valid_empty_responses_have_report_and_no_fabricated_case(state,clock,manifest,provider,body):
    collector=Collector(state)
    result=collector.replay(manifest(provider),body,clock.now())
    assert result.report.accepted==0 and to_bundle(result) is None
    collector.close()


def test_same_editorial_family_is_preserved_without_auto_corroboration(state,clock,manifest,provider_body):
    collector=Collector(state)
    config=manifest(publisher_families={'news.example.invalid':'fixture-wire'})
    bundle=to_bundle(collector.replay(config,provider_body('gdelt'),clock.now()))
    assert len(bundle.sources)==2 and {s.publisher_family for s in bundle.sources}=={'fixture-wire'}
    assert all(not claim.provenance.corroborating_source_ids for claim in bundle.claims)
    assert all(claim.confidence.value=='unknown' for claim in bundle.claims)
    collector.close()


def test_bounded_parallel_batch_isolates_failures(state,clock,manifest,monkeypatch):
    collector=Collector(state)
    running=peak=0
    lock=threading.Lock()
    def mocked(config):
        nonlocal running,peak
        with lock:
            running+=1;peak=max(peak,running)
        time.sleep(.01)
        with lock:
            running-=1
        if config.provider=='ucdp':
            raise RuntimeError('sensitive transport details')
        return config.provider
    monkeypatch.setattr(collector,'collect',mocked)
    result=collector.collect_many([manifest('gdelt'),manifest('ucdp'),manifest('firms'),manifest('rss')],max_workers=2)
    assert result['ucdp-ged']=='collection_failed' and result['nasa-rss']=='rss'
    assert peak<=2
    with pytest.raises(ValueError):
        collector.collect_many([manifest()],max_workers=5)
    collector.close()


def test_collector_result_and_manifest_match_generated_json_schemas(state,clock,manifest,provider_body):
    from pathlib import Path
    from jsonschema import Draft202012Validator, FormatChecker
    from nv_engine.collect.types import CollectionResult
    root=Path(__file__).resolve().parents[3]
    collector=Collector(state)
    config=manifest()
    result=collector.replay(config,provider_body('gdelt'),clock.now())
    for name,model,value in [('source-manifest',Manifest,config),('collection-result',CollectionResult,result)]:
        schema=json.loads((root/f'schemas/{name}.schema.json').read_text())
        assert schema==model.model_json_schema()
        Draft202012Validator.check_schema(schema)
        Draft202012Validator(schema,format_checker=FormatChecker()).validate(value.model_dump(mode='json'))
    collector.close()
