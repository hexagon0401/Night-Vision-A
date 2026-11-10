from datetime import datetime,timezone
import importlib.util,json
from pathlib import Path
import httpx,pytest
from nv_engine.monitor.ucdp import MonitorState,UCDPMonitor,normalize
from nv_engine.monitor.analysis import aggregate,build_cases

NOW=datetime(2026,11,9,tzinfo=timezone.utc)
def row(identity=1,**kw):return {'id':identity,'date_start':'2026-11-01','date_end':'2026-11-02','country':'Testland','latitude':'12','longitude':'22','where_prec':2,'low':1,'best':2,'high':3,**kw}

def test_precision_interval_and_uncertainty():
 r=normalize(row(),'26.1',NOW.isoformat());assert r['location_status']=='approximate';assert r['day']!=r['end_day'];assert (r['low'],r['best'],r['high'])==(1,2,3)
 assert r['hash']!=normalize(row(best=3),'26.1',NOW.isoformat())['hash']

@pytest.mark.parametrize('change',[{'latitude':999},{'date_end':'2026-01-01'},{'low':5,'high':2},{'best':-1}])
def test_bad_ucdp(change):
 with pytest.raises(ValueError):normalize(row(**change),'26.1',NOW.isoformat())

def test_pagination_resume_and_no_partial_replace(tmp_path):
 s=MonitorState(tmp_path/'state.db');calls=[]
 def handle(req):
  page=int(req.url.params['page']);calls.append(page)
  return httpx.Response(200,json={'Result':[row(page)],'TotalPages':2})
 client=httpx.Client(transport=httpx.MockTransport(handle));m=UCDPMonitor(s,'not-a-real-token',client=client,now=NOW,sleep=lambda _:None)
 assert m.sync('26.1',max_pages=1) is False
 assert m.merged('26.1',None)==[]
 assert m.sync('26.1',max_pages=1) is True
 assert calls==[1,2];assert len(m.merged('26.1',None))==2
 assert m.sync('26.1') is True and len(calls)==2
 s.close()

def test_daily_budget_includes_errors(tmp_path):
 s=MonitorState(tmp_path/'s.db');m=UCDPMonitor(s,'x',client=httpx.Client(transport=httpx.MockTransport(lambda r:httpx.Response(401))),now=NOW,max_requests=1)
 with pytest.raises(ValueError,match='auth_rejected'):m.get('26.1')
 with pytest.raises(ValueError,match='daily_request_budget'):m.get('26.1')
 s.close()

def test_candidate_revision_wins_without_losing_annual(tmp_path):
 s=MonitorState(tmp_path/'s.db')
 for v,raw in [('26.1',row()),('26.1',row(2)),('26.0.11',row(best=3))]:
  r=normalize(raw,v,NOW.isoformat());s.db.execute('INSERT INTO upstream VALUES(?,?,?)',(v,r['id'],json.dumps(r)))
 m=UCDPMonitor(s,'x',now=NOW);records=m.merged('26.1','26.0.11');assert len(records)==2
 revised=next(r for r in records if r['id']=='ucdp:1');assert revised['best']==3 and revised['previous_hash']
 m.close();s.close()

def test_aggregates_keep_source_ids_and_bucket_semantics():
 records=[normalize(row(i,date_start=f'2026-10-{i:02}',date_end=f'2026-10-{i:02}'),'26.1',NOW.isoformat()) for i in range(1,20)]
 a=aggregate(records);assert a[0]['record_ids']==['ucdp:1']
 cases=build_cases(a,NOW);p=cases[0]['payload'];assert p['case']['data_origin']=='source_backed'
 assert all(o['location'] is None for o in p['case']['observations']);assert p['aggregation_evidence']
 assert 'never a provider-reported event instant' in p['time_semantics']

def test_schedule_supports_12_24_and_rejects_invalid():
 spec=importlib.util.spec_from_file_location('scheduled_worker',Path(__file__).resolve().parents[2]/'services/worker/monitor.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
 assert sum(module.due(NOW.replace(hour=h),12) for h in range(24))==12
 assert sum(module.due(NOW.replace(hour=h),24) for h in range(24))==24
 with pytest.raises(ValueError):module.due(NOW,25)

def test_missing_candidate_is_not_fabricated(tmp_path):
 s=MonitorState(tmp_path/'s.db');m=UCDPMonitor(s,'x',client=httpx.Client(transport=httpx.MockTransport(lambda r:httpx.Response(404))),now=NOW,sleep=lambda _:None)
 assert m.discover() is None and m.used==3
 m.close();s.close()

def test_discovery_gap_preserves_completed_candidate(tmp_path):
 s=MonitorState(tmp_path/'s.db');s.db.execute("INSERT INTO cursors VALUES('26.0.10',2,1,?,?)",(NOW.isoformat(),'2026-01-01'))
 m=UCDPMonitor(s,'x',client=httpx.Client(transport=httpx.MockTransport(lambda r:httpx.Response(404))),now=NOW)
 assert m.discover('26.1')=='26.0.10' and m.candidate_cached
 m.close();s.close()

def test_coverage_gap_is_not_zero_filled():
 a=aggregate([normalize(row(1,date_start='2026-09-01',date_end='2026-09-01'),'26.1',NOW.isoformat()),normalize(row(2,date_start='2026-11-01',date_end='2026-11-01'),'26.0.11',NOW.isoformat())])
 case=build_cases(a,NOW,coverage_intervals=[('2026-09-01','2026-09-01'),('2026-11-01','2026-11-01')])[0]['payload']
 assert len(case['case']['observations'])==4
 assert any('coverage gaps' in w for w in case['analysis']['warnings'])

def test_rss_requires_explicit_approval(tmp_path):
 from nv_engine.monitor.rss import collect_official
 manifest=Path(__file__).resolve().parents[2]/'configs/sources/un-news.json'
 with pytest.raises(ValueError,match='rights_or_enablement'):collect_official(manifest,tmp_path/'rss')
 with pytest.raises(ValueError,match='rights_or_enablement'):collect_official(manifest,tmp_path/'rss',enable=True)

def test_unchanged_snapshot_does_not_reupload_records():
 spec=importlib.util.spec_from_file_location('scheduled_worker',Path(__file__).resolve().parents[2]/'services/worker/monitor.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
 p=object.__new__(module.Publisher);calls=[]
 def post(path,data):calls.append(path);return {'state':'published'}
 p.post=post;p.snapshot('ucdp',[],{'records':0});assert calls==['start']


def test_publisher_uses_fresh_scoped_oidc_without_shared_key(monkeypatch):
 spec=importlib.util.spec_from_file_location('monitor_oidc',Path(__file__).resolve().parents[2]/'services/worker/monitor.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
 monkeypatch.setenv('ACTIONS_ID_TOKEN_REQUEST_URL','https://identity.example.test/token?api-version=2')
 monkeypatch.setenv('ACTIONS_ID_TOKEN_REQUEST_TOKEN','synthetic-request-guard')
 calls=[]
 def handle(req):
  calls.append(req)
  if req.url.host=='identity.example.test':
   assert req.url.params['audience']=='https://example.test/monitor'
   assert req.headers['Authorization']=='Bearer synthetic-request-guard'
   return httpx.Response(200,json={'value':'synthetic-workload-token'})
  assert req.headers['Authorization']=='Bearer synthetic-workload-token'
  return httpx.Response(200,json={'recorded':True})
 publisher=module.Publisher('https://example.test','stale-legacy-key');publisher.client.close();publisher.client=httpx.Client(transport=httpx.MockTransport(handle))
 publisher.post('run',{});publisher.post('run',{})
 assert len(calls)==4
 publisher.client.close()


def test_monitor_preserves_success_when_ai_unavailable(tmp_path,monkeypatch):
 spec=importlib.util.spec_from_file_location('monitor_cycle',Path(__file__).resolve().parents[2]/'services/worker/monitor.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
 monkeypatch.setenv('NV_WORKER_ORIGIN','https://example.test');monkeypatch.setenv('NV_INGEST_TOKEN','synthetic-test-key');monkeypatch.setenv('UCDP_ACCESS_TOKEN','synthetic-test-key');monkeypatch.setenv('NV_UCDP_ENABLED','true');monkeypatch.delenv('NV_RSS_ENABLED',raising=False)
 class FakePublisher:
  client=type('Client',(),{'close':lambda self:None})()
  def __init__(self,*args):pass
  def post(self,path,data):
   if path=='monitor-ai':raise ValueError('publication_failed_502')
   return {'recorded':True}
  def snapshot(self,*args):return 'snapshot:test'
 class FakeUCDP:
  candidate_cached=False;used=1
  def __init__(self,*args,**kwargs):pass
  def discover(self,*args,**kwargs):return None
  def sync(self,*args,**kwargs):return True
  def merged(self,*args):return [normalize(row(),'26.1',NOW.isoformat())]
  def close(self):pass
 monkeypatch.setattr(module,'Publisher',FakePublisher);monkeypatch.setattr(module,'UCDPMonitor',FakeUCDP);monkeypatch.setattr(module,'published_candidate',lambda now:None)
 monkeypatch.setattr('sys.argv',['monitor.py','--state',str(tmp_path/'state.db')]);module.main()
 status=json.loads((tmp_path/'monitor-status.json').read_text())
 assert status['state']=='complete' and status['providers']['ucdp']['state']=='complete'
 assert status['ai']['state']=='ai_unavailable'


def test_unreleased_candidate_400_does_not_prevent_annual_or_published_candidate(tmp_path):
 state=MonitorState(tmp_path/'s.db');versions=[]
 def handle(req):
  version=req.url.path.split('/')[-1];versions.append(version)
  if version in ('26.0.11','26.0.10'):return httpx.Response(400)
  return httpx.Response(200,json={'Result':[row()],'TotalPages':1})
 monitor=UCDPMonitor(state,'synthetic-token',now=NOW,sleep=lambda _:None,client=httpx.Client(transport=httpx.MockTransport(handle)))
 assert monitor.discover()=='26.0.9' and versions==['26.0.11','26.0.10','26.0.9']
 assert monitor.sync('26.1') is True
 bad=UCDPMonitor(state,'synthetic-token',now=NOW,client=httpx.Client(transport=httpx.MockTransport(lambda r:httpx.Response(400))))
 with pytest.raises(ValueError,match='ucdp_upstream_http_400'):bad.get('26.1')
 state.close()


def test_published_candidate_index_is_public_bounded_and_preferred(tmp_path):
 from nv_engine.monitor.ucdp import published_candidate
 def index(req):
  assert req.url.host=='ucdp.uu.se' and 'x-ucdp-access-token' not in req.headers
  return httpx.Response(200,text='<code>26.0.9</code> <code>26.0.12</code> <code>27.0.1</code>')
 assert published_candidate(NOW,httpx.Client(transport=httpx.MockTransport(index)))=='26.0.9'
 state=MonitorState(tmp_path/'s.db');seen=[]
 def api(req):
  seen.append(req.url.path.split('/')[-1]);return httpx.Response(200,json={'Result':[row()]})
 monitor=UCDPMonitor(state,'synthetic-token',now=NOW,client=httpx.Client(transport=httpx.MockTransport(api)))
 assert monitor.discover(hint='26.0.9')=='26.0.9' and seen==['26.0.9']
 state.close()
