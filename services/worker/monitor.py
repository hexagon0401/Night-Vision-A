"""GitHub Actions entrypoint: bounded resumable acquisition and authenticated publication."""
import argparse,json,os,time,uuid
from datetime import datetime,timedelta,timezone
from pathlib import Path
import httpx
from nv_engine.monitor.ucdp import MonitorState,UCDPMonitor,digest
from nv_engine.monitor.analysis import aggregate,build_cases


def due(now,runs):
    if not 1<=runs<=24:raise ValueError('MONITOR_RUNS_PER_DAY must be 1..24')
    return now.hour in {i*24//runs for i in range(runs)}


class Publisher:
    def __init__(self,url,token):
        from urllib.parse import urlsplit
        u=urlsplit(url)
        if u.scheme!='https' or not u.hostname or u.username or u.password or u.query or u.fragment or u.path not in ('','/'):raise ValueError('invalid_worker_origin')
        self.url=url.rstrip('/');self.client=httpx.Client(timeout=60,follow_redirects=False,headers={'Authorization':'Bearer '+token})
    def post(self,path,value):
        try:r=self.client.post(self.url+'/api/internal/'+path,json=value)
        except httpx.HTTPError:raise ValueError('publication_transport_failure') from None
        if r.status_code!=200:raise ValueError('publication_failed_'+str(r.status_code))
        return r.json()
    def snapshot(self,provider,records,metadata,cases=None):
        identity='snapshot:'+digest([provider,records,metadata]);self.post('start',{'id':identity,'provider':provider,'expected':len(records),'metadata':metadata})
        for at in range(0,len(records),50):self.post('batch',{'id':identity,'records':records[at:at+50]})
        for case in cases or []:self.post('case',{'id':identity,**case})
        self.post('publish',{'id':identity});return identity


def main():
    p=argparse.ArgumentParser();p.add_argument('--state',type=Path,default=Path('.local/monitor.sqlite'));p.add_argument('--scheduled',action='store_true');args=p.parse_args()
    now=datetime.now(timezone.utc);runs=int(os.environ.get('MONITOR_RUNS_PER_DAY','12'))
    if args.scheduled and not due(now,runs):print('Outside configured monitoring slot');return
    origin=os.environ.get('NV_WORKER_ORIGIN');publish_token=os.environ.get('NV_INGEST_TOKEN')
    if not origin or not publish_token:print('Setup required: NV_WORKER_ORIGIN / NV_INGEST_TOKEN');return
    publisher=Publisher(origin,publish_token);run={'id':'run:'+os.environ.get('GITHUB_RUN_ID',uuid.uuid4().hex)+':'+os.environ.get('GITHUB_RUN_ATTEMPT','1'),'started':now.isoformat(),'state':'running','providers':{},'requests':0}
    publisher.post('run',run);state=MonitorState(args.state)
    try:
        token=os.environ.get('UCDP_ACCESS_TOKEN')
        if not token or os.environ.get('NV_UCDP_ENABLED')!='true':
            run['providers']['ucdp']={'state':'setup_required','reason':'UCDP_ACCESS_TOKEN and NV_UCDP_ENABLED=true required'}
        else:
            monitor=UCDPMonitor(state,token,now=now)
            try:
                annual=os.environ.get('UCDP_ANNUAL_VERSION','26.1');candidate=monitor.discover()
                complete=monitor.sync(annual,max_pages=15)
                if candidate:complete=monitor.sync(candidate,max_pages=10) and complete
                run['requests']=monitor.used
                if complete:
                    all_records=monitor.merged(annual,candidate);aggregates=aggregate(all_records)
                    for at in range(0,len(aggregates),50):publisher.post('aggregates',{'provider':'ucdp','rows':aggregates[at:at+50]})
                    cutoff=(now.date()-timedelta(days=90)).isoformat()
                    recent=[r for r in all_records if r['end_day']>=cutoff]
                    limited=len(recent)>20000;recent=recent[-20000:]
                    metadata={'annual':annual,'candidate':candidate,'coverage_start':all_records[0]['day'] if all_records else None,'coverage_end':all_records[-1]['end_day'] if all_records else None,'records':len(recent),'limited':limited,'acquired_at':now.isoformat(),'source_updated_at':None,'lag_note':'UCDP published records, not live incident reporting','attribution':'Uppsala Conflict Data Program; https://ucdp.uu.se/downloads/'}
                    # Only completed source queries create zero buckets; never extrapolate to today.
                    cases=build_cases(aggregates,now) if aggregates else []
                    snapshot=publisher.snapshot('ucdp',recent,metadata,cases)
                    run['providers']['ucdp']={'state':'complete','snapshot':snapshot,'records':len(recent),'candidates':sum(len(c['payload']['analysis']['anomalies']) for c in cases),'limited':limited}
                else:run['providers']['ucdp']={'state':'backfill_pending','reason':'next run resumes saved page; last published data retained'}
            finally:monitor.close()
        run['state']='complete' if any(v['state']=='complete' for v in run['providers'].values()) else 'skipped'
        run['completed']=datetime.now(timezone.utc).isoformat();publisher.post('run',run)
        publisher.post('monitor-ai',{'run_id':run['id']})
        print(json.dumps({'run_id':run['id'],'state':run['state'],'providers':run['providers']}))
    except Exception:
        run.update(state='failed',completed=datetime.now(timezone.utc).isoformat(),error='monitor_cycle_failed')
        try:publisher.post('run',run)
        except Exception:pass
        raise SystemExit('Monitor cycle failed; previous published snapshot retained') from None
    finally:state.close();publisher.client.close()


if __name__=='__main__':main()
