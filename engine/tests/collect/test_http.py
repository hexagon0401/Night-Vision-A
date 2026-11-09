from concurrent.futures import ThreadPoolExecutor
from email.utils import format_datetime
from datetime import timedelta
import httpx
import pytest
from nv_engine.collect.http import Fetcher, FetchError


def setup_fetcher(state, clock, handler):
    client = httpx.Client(transport=httpx.MockTransport(handler))
    return Fetcher(state, client, now=clock.now, sleep=clock.sleep, jitter=lambda:0)


def test_ttl_and_conditional_304_preserve_acquisition_time(state, clock, manifest):
    requests=[]
    def handler(request):
        requests.append(request)
        if len(requests)==1:
            return httpx.Response(200,content=b'{"articles":[]}',headers={'ETag':'"fixture-v1"','Last-Modified':'Thu, 01 Jan 2026 00:00:00 GMT'})
        assert request.headers['If-None-Match']=='"fixture-v1"'
        assert 'If-Modified-Since' in request.headers
        return httpx.Response(304)
    fetcher=setup_fetcher(state,clock,handler)
    config=manifest(live=True,ttl_seconds=10)
    first=fetcher.fetch(config)
    clock.advance(5)
    assert fetcher.fetch(config).from_cache
    assert len(requests)==1
    clock.advance(6)
    refreshed=fetcher.fetch(config)
    assert refreshed.fetched_at==first.fetched_at
    assert refreshed.body_hash==first.body_hash and refreshed.from_cache
    clock.advance(1)
    fetcher.fetch(config)
    assert len(requests)==2


@pytest.mark.parametrize('status',[401,403,404,302])
def test_permanent_errors_and_redirects_do_not_retry_or_follow(state,clock,manifest,status):
    calls=[]
    def handler(request):
        calls.append(request)
        return httpx.Response(status,headers={'Location':'https://elsewhere.example.invalid/'})
    with pytest.raises(FetchError,match=f'http_{status}'):
        setup_fetcher(state,clock,handler).fetch(manifest(live=True))
    assert len(calls)==1
    assert list((state.root/'blobs').iterdir())==[]


def test_retry_after_date_and_persistent_rate_limit(state,clock,manifest):
    calls=[]
    target=clock.now()+timedelta(seconds=10)
    def handler(request):
        calls.append(clock.now())
        return httpx.Response(429,headers={'Retry-After':format_datetime(target,usegmt=True)}) if len(calls)==1 else httpx.Response(200,content=b'ok')
    setup_fetcher(state,clock,handler).fetch(manifest(live=True,min_interval_seconds=2))
    assert (calls[1]-calls[0]).total_seconds()>=10
    assert len(calls)==2


def test_long_retry_after_defers_without_sleeping_or_early_retry(state,clock,manifest):
    calls=[]
    def handler(request):
        calls.append(request)
        return httpx.Response(429,headers={'Retry-After':'120'})
    fetcher=setup_fetcher(state,clock,handler)
    config=manifest(live=True,max_retry_delay_seconds=30)
    with pytest.raises(FetchError,match='retry_deferred_by_retry_after'):
        fetcher.fetch(config)
    with pytest.raises(FetchError,match='retry_deferred_by_provider_quota'):
        fetcher.fetch(config)
    assert len(calls)==1 and sum(clock.waits)==0


@pytest.mark.parametrize('kind',['timeout','503'])
def test_retries_exhaust_attempt_budget_with_backoff(state,clock,manifest,kind):
    calls=[]
    def handler(request):
        calls.append(request)
        if kind=='timeout':
            raise httpx.ReadTimeout('raw details must not escape',request=request)
        return httpx.Response(503,headers={'Retry-After':'not-a-date'})
    with pytest.raises(FetchError,match='transport_failure' if kind=='timeout' else 'http_503') as error:
        setup_fetcher(state,clock,handler).fetch(manifest(live=True,max_attempts=3,min_interval_seconds=.1))
    assert len(calls)==3 and sum(clock.waits)>=3
    assert 'raw details' not in str(error.value)


def test_decoded_response_size_limit_and_no_partial_cache(state,clock,manifest):
    fetcher=setup_fetcher(state,clock,lambda r:httpx.Response(200,content=b'x'*1025))
    with pytest.raises(FetchError,match='response_size_limit'):
        fetcher.fetch(manifest(live=True,max_bytes=1024))
    assert list((state.root/'blobs').iterdir())==[]


def test_disabled_and_unreviewed_sources_make_no_request(state,clock,manifest):
    def forbidden(request):
        pytest.fail('network must not be attempted')
    fetcher=setup_fetcher(state,clock,forbidden)
    with pytest.raises(FetchError,match='live_collection_disabled'):
        fetcher.fetch(manifest())
    config=manifest(live=True)
    config.rights.reviewed=False
    with pytest.raises(FetchError,match='source_rights_review_required'):
        fetcher.fetch(config)


def test_named_credentials_no_values_leak_and_echo_is_not_saved(state,clock,manifest,monkeypatch):
    key='a'*32  # Synthetic MockTransport credential; never sent to an external service.
    monkeypatch.setenv('FIRMS_MAP_KEY',key)
    def handler(request):
        assert key in str(request.url)
        return httpx.Response(200,content=('echo '+key).encode())
    with pytest.raises(FetchError,match='credential_echo_rejected') as error:
        setup_fetcher(state,clock,handler).fetch(manifest('firms',live=True))
    assert key not in str(error.value)
    assert list((state.root/'blobs').iterdir())==[]
    assert key.encode() not in (state.root/'collector.sqlite3').read_bytes()


def test_ucdp_token_header_and_cache_partition(state,clock,manifest,monkeypatch):
    seen=[]
    def handler(request):
        seen.append(request.headers['x-ucdp-access-token'])
        return httpx.Response(200,content=b'{"Result":[]}')
    fetcher=setup_fetcher(state,clock,handler)
    monkeypatch.setenv('UCDP_ACCESS_TOKEN','SYNTHETIC-A')
    fetcher.fetch(manifest('ucdp',live=True))
    monkeypatch.setenv('UCDP_ACCESS_TOKEN','SYNTHETIC-B')
    fetcher.fetch(manifest('ucdp',live=True))
    assert seen==['SYNTHETIC-A','SYNTHETIC-B']
    assert b'SYNTHETIC-A' not in (state.root/'collector.sqlite3').read_bytes()


def test_missing_required_key_is_explicit_without_request(state,clock,manifest,monkeypatch):
    monkeypatch.delenv('FIRMS_MAP_KEY',raising=False)
    fetcher=setup_fetcher(state,clock,lambda r:pytest.fail('unexpected request'))
    with pytest.raises(FetchError,match='missing_credential:FIRMS_MAP_KEY'):
        fetcher.fetch(manifest('firms',live=True))


def test_shared_quota_reservations_serialize_across_instances(state,clock):
    from nv_engine.collect.state import CollectorState
    second=CollectorState(state.root)
    with ThreadPoolExecutor(max_workers=4) as pool:
        waits=list(pool.map(lambda i:(state if i%2 else second).reserve('gdelt',clock.now().timestamp(),1),range(4)))
    assert sorted(waits)==[0,1,2,3]


def test_corrupt_cache_is_detected_not_used(state,clock,manifest):
    fetcher=setup_fetcher(state,clock,lambda r:httpx.Response(200,content=b'fixture'))
    config=manifest(live=True)
    result=fetcher.fetch(config)
    (state.root/'blobs'/result.body_hash).write_bytes(b'changed')
    with pytest.raises(ValueError,match='integrity failure'):
        fetcher.fetch(config)


def test_changed_200_refreshes_body_and_respects_new_size_bound(state,clock,manifest):
    calls=[]
    def handler(request):
        calls.append(request)
        return httpx.Response(200,content=(b'a'*1200 if len(calls)==1 else b'b'*1200),headers={'ETag':str(len(calls))})
    fetcher=setup_fetcher(state,clock,handler)
    config=manifest(live=True,ttl_seconds=10)
    first=fetcher.fetch(config)
    clock.advance(11)
    second=fetcher.fetch(config)
    assert first.body_hash!=second.body_hash and not second.from_cache
    with pytest.raises(FetchError,match='response_size_limit'):
        fetcher.fetch(manifest(live=True,ttl_seconds=10,max_bytes=1024))
    assert len(calls)==2


def test_unexpected_304_is_a_failure(state,clock,manifest):
    with pytest.raises(FetchError,match='unexpected_304_without_cache'):
        setup_fetcher(state,clock,lambda r:httpx.Response(304)).fetch(manifest(live=True))


def test_firms_path_credential_is_redacted_even_from_httpx_info_logs(state,clock,manifest,monkeypatch,caplog):
    import logging
    key='b'*32  # Mock-only credential, never transmitted externally.
    monkeypatch.setenv('FIRMS_MAP_KEY',key)
    fetcher=setup_fetcher(state,clock,lambda r:httpx.Response(200,content=b'synthetic-fixture'))
    with caplog.at_level(logging.INFO,logger='httpx'):
        fetcher.fetch(manifest('firms',live=True))
    assert key not in caplog.text
    assert '[REDACTED]' in caplog.text
    assert key.encode() not in (state.root/'collector.sqlite3').read_bytes()
