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
