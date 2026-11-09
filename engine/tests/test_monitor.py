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
