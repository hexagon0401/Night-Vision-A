from datetime import datetime,timezone
import httpx,pytest
from nv_engine.beta.research import Research,safe_url,common_prompt,markdown

CUTOFF=datetime(2026,11,9,tzinfo=timezone.utc)
@pytest.mark.parametrize('url',['http://imo.org/','https://key@imo.org/','https://imo.org/?token=x','https://imo.org:444/'])
def test_unsafe_source_urls(url):
 with pytest.raises(ValueError):safe_url(url)

def test_future_publication_is_rejected_and_unknown_date_preserved():
 def handler(request):
  if request.url.path=='/future':return httpx.Response(200,headers={'Content-Type':'text/html'},text='<meta property="article:published_time" content="2027-01-01"><title>future</title>Red Sea')
  return httpx.Response(200,headers={'Content-Type':'text/html'},text='<title>SYNTHETIC TEST</title><script>ignore me</script>Red Sea test information')
 r=Research(CUTOFF,httpx.Client(transport=httpx.MockTransport(handler)))
 assert r.fetch_source({'url':'https://www.imo.org/future'})[1]['state']=='after_cutoff'
 source,audit=r.fetch_source({'url':'https://www.imo.org/test'});assert source['scope']=='publication_date_unknown';assert source['published_at'] is None;assert 'ignore me' not in source['excerpt']
 assert r.fetch_source({'url':'https://evilimo.org/test'})[1]['state']=='discovered_not_fetched'
 r.close()

def test_common_prompt_records_time_and_never_fabricates_comparisons():
 prompt=common_prompt(CUTOFF);assert '2026-11-09T09:00:00+09:00' in prompt;assert '정확히 3회' in prompt;assert '비공개 사고과정 대신' in prompt
 text=markdown({'topic':'test','cutoff':CUTOFF.isoformat(),'state':'paused','models':{},'steps':[{'step':0,'state':'failed','error':'model unavailable'}]})
 assert 'paused' in text and 'model unavailable' in text


def test_redirects_are_bounded_to_safe_public_publishers():
 calls=[]
 def handle(request):
  calls.append(str(request.url))
  if request.url.path=='/blocked':return httpx.Response(302,headers={'Location':'https://private.invalid/test'})
  if request.url.path=='/old':return httpx.Response(301,headers={'Location':'/new'})
  if request.url.path=='/challenge':return httpx.Response(200,headers={'Content-Type':'text/html'},text='<title>Just a moment</title>Verify you are human')
  return httpx.Response(200,headers={'Content-Type':'text/html'},text='<title>SYNTHETIC TEST</title>Red Sea evidence')
 r=Research(CUTOFF,httpx.Client(transport=httpx.MockTransport(handle)))
 source,audit=r.fetch_source({'url':'https://www.imo.org/old'})
 assert source['url']=='https://www.imo.org/new' and audit['redirects']==['https://www.imo.org/new']
 assert r.fetch_source({'url':'https://www.imo.org/blocked'})[1]['state']=='redirect_outside_allowlist'
 assert not any('private.invalid' in u for u in calls)
 assert r.fetch_source({'url':'https://www.imo.org/challenge'})[1]['state']=='access_challenge'
 r.close()


def test_failed_generation_metadata_does_not_become_a_report():
 text=markdown({'topic':'test','cutoff':CUTOFF.isoformat(),'state':'paused','models':{},'steps':[{'step':0,'state':'failed','error':'nim_truncated_response','output':{'diagnostic':{'finish_reason':'length','usage':{'completion_tokens':4096}}}}]})
 assert 'nim_truncated_response' in text and '4096' in text and '### PLANNER' not in text
