"""GitHub Actions entrypoint: bounded resumable acquisition and authenticated publication."""
import argparse,json,os,time,uuid
import base64
from datetime import datetime,timedelta,timezone
from pathlib import Path
import httpx
from nv_engine.monitor.ucdp import MonitorState,UCDPMonitor,digest,published_candidate
from nv_engine.monitor.analysis import aggregate,build_cases


def due(now,runs):
    if not 1<=runs<=24:raise ValueError('MONITOR_RUNS_PER_DAY must be 1..24')
    return now.hour in {i*24//runs for i in range(runs)}


class Publisher:
    def __init__(self,url,token):
        from urllib.parse import urlsplit
        u=urlsplit(url)
        if u.scheme!='https' or not u.hostname or u.username or u.password or u.query or u.fragment or u.path not in ('','/'):raise ValueError('invalid_worker_origin')
        self.url=url.rstrip('/');self.token=token;self.client=httpx.Client(timeout=120,follow_redirects=False)
    def authorization(self):
        from urllib.parse import quote
        url=os.environ.get('ACTIONS_ID_TOKEN_REQUEST_URL');guard=os.environ.get('ACTIONS_ID_TOKEN_REQUEST_TOKEN')
        if not url or not guard:
            if self.token:return self.token
            raise ValueError('workload_identity_unavailable')
        try:
            r=self.client.get(url+('&' if '?' in url else '?')+'audience='+quote(self.url+'/monitor',safe=''),headers={'Authorization':'Bearer '+guard})
            r.raise_for_status();return r.json()['value']
        except (httpx.HTTPError,KeyError,ValueError):raise ValueError('workload_identity_unavailable') from None
    def post(self,path,value):
        try:r=self.client.post(self.url+'/api/internal/'+path,json=value,headers={'Authorization':'Bearer '+self.authorization()})
        except httpx.HTTPError:raise ValueError('publication_transport_failure') from None
        if r.status_code!=200:raise ValueError('publication_failed_'+str(r.status_code))
        return r.json()
    def snapshot(self,provider,records,metadata,cases=None):
        identity='snapshot:'+digest([provider,records,metadata]);status=self.post('start',{'id':identity,'provider':provider,'expected':len(records),'metadata':metadata})
        if status.get('state')=='published':return identity
        for at in range(0,len(records),50):self.post('batch',{'id':identity,'records':records[at:at+50]})
        from nv_engine.export.foundry.bundle import export_bundle,ExportOptions
        from nv_engine.models import CaseBundle
        for case in cases or []:
            bundle=CaseBundle.model_validate(case['payload']['case'])
            exports={scope:base64.b64encode(export_bundle(bundle,ExportOptions(include_inferred=scope=='all'))).decode() for scope in ('observed','all')}
            self.post('case',{'id':identity,**case,'exports':exports})
        self.post('publish',{'id':identity});return identity


def main():
    p=argparse.ArgumentParser();p.add_argument('--state',type=Path,default=Path('.local/monitor.sqlite'));p.add_argument('--scheduled',action='store_true');args=p.parse_args()
    now=datetime.now(timezone.utc);runs=int(os.environ.get('MONITOR_RUNS_PER_DAY','12'))
    if args.scheduled and not due(now,runs):print('Outside configured monitoring slot');return
    origin=os.environ.get('NV_WORKER_ORIGIN','https://nightvision.hexagon0401.workers.dev');publish_token=os.environ.get('NV_INGEST_TOKEN')
    if not publish_token and not os.environ.get('ACTIONS_ID_TOKEN_REQUEST_TOKEN'):raise SystemExit('Setup required: GitHub Actions workload identity or NV_INGEST_TOKEN')
    publisher=Publisher(origin,publish_token);run={'id':'run:'+os.environ.get('GITHUB_RUN_ID',uuid.uuid4().hex)+':'+os.environ.get('GITHUB_RUN_ATTEMPT','1'),'started':now.isoformat(),'state':'running','providers':{},'requests':0}
    publisher.post('run',run);state=MonitorState(args.state)
    try:
        try:
            token=os.environ.get('UCDP_ACCESS_TOKEN')
            if not token or os.environ.get('NV_UCDP_ENABLED')!='true':
                run['providers']['ucdp']={'state':'setup_required','reason':'UCDP_ACCESS_TOKEN and NV_UCDP_ENABLED=true required'}
            else:
                monitor=UCDPMonitor(state,token,now=now,permit=lambda:publisher.post('ucdp-permit',{}))
                try:
                    annual=os.environ.get('UCDP_ANNUAL_VERSION','26.1');candidate=monitor.discover(annual,hint=published_candidate(now))
                    complete=monitor.sync(annual,max_pages=15)
                    if candidate and not monitor.candidate_cached:complete=monitor.sync(candidate,max_pages=10) and complete
                    run['requests']=monitor.used
                    if complete:
                        all_records=monitor.merged(annual,candidate);aggregates=aggregate(all_records)
                        for at in range(0,len(aggregates),50):publisher.post('aggregates',{'provider':'ucdp','rows':aggregates[at:at+50]})
                        cutoff=(now.date()-timedelta(days=90)).isoformat()
                        recent=[r for r in all_records if r['end_day']>=cutoff]
                        limited=len(recent)>20000;recent=recent[-20000:]
                        metadata={'annual':annual,'candidate':candidate,'coverage_start':all_records[0]['day'] if all_records else None,'coverage_end':max((r['end_day'] for r in all_records),default=None),'records':len(recent),'limited':limited,'acquired_at':max((r['acquired_at'] for r in all_records),default=None),'source_updated_at':None,'lag_note':'UCDP published records, not live incident reporting','attribution':'Uppsala Conflict Data Program; https://ucdp.uu.se/downloads/'}
                        # Only completed source queries create zero buckets; never extrapolate to today.
                        intervals=[]
                        for version in (annual,candidate):
                            version_rows=[r for r in all_records if r['version']==version]
                            if version_rows:intervals.append((min(r['day'] for r in version_rows),max(r['end_day'] for r in version_rows)))
                        metadata['coverage_intervals']=intervals
                        metadata['candidate_cached']=monitor.candidate_cached
                        cases=build_cases(aggregates,now,coverage_intervals=intervals) if aggregates else []
                        for case in cases:case['payload']['map_context']=[r for r in recent if r['country']==case['country'] and r['lat'] is not None][-250:]
                        snapshot=publisher.snapshot('ucdp',recent,metadata,cases)
                        run['providers']['ucdp']={'state':'complete','snapshot':snapshot,'records':len(recent),'candidates':sum(len(c['payload']['analysis']['anomalies']) for c in cases),'limited':limited}
                    else:run['providers']['ucdp']={'state':'backfill_pending','reason':'next run resumes saved page; last published data retained'}
                finally:run['requests']=monitor.used;monitor.close()
        except Exception as error:
            safe=str(error) if isinstance(error,ValueError) and str(error).startswith(('ucdp_','publication_','daily_request_')) else 'ucdp_processing_'+type(error).__name__
            run['providers']['ucdp']={'state':'failed','reason':safe}
        if os.environ.get('NV_RSS_ENABLED')=='true':
            try:
                from nv_engine.monitor.rss import collect_official
                records,metadata=collect_official(os.environ.get('NV_RSS_MANIFEST','configs/sources/un-news.json'),args.state.parent/'monitor-rss',enable=True,rights_reviewed=os.environ.get('NV_RSS_RIGHTS_REVIEWED')=='true')
                snapshot=publisher.snapshot('un-news-rss',records,metadata)
                run['providers']['rss']={'state':'complete','snapshot':snapshot,'records':len(records)}
            except Exception:
                run['providers']['rss']={'state':'failed','reason':'RSS fetch, rights review or publication failed; previous data retained'}
        if os.environ.get('NV_RSS_ENABLED')!='true':run['providers']['rss']={'state':'setup_required','reason':'RSS not enabled; metadata terms review required'}
        run['state']='complete' if any(v['state']=='complete' for v in run['providers'].values()) else 'failed' if any(v['state']=='failed' for v in run['providers'].values()) else 'skipped'
        run['completed']=datetime.now(timezone.utc).isoformat();publisher.post('run',run)
        if run['state']=='complete':
            try:run['ai']=publisher.post('monitor-ai',{'run_id':run['id']})
            except ValueError:run['ai']={'state':'ai_unavailable','error':'analysis_request_failed'}
        else:run['ai']={'state':'waiting_for_data','error':'monitor_data_unavailable'}
        publisher.post('run',run)  # Keep AI status separate from successful statistical detection.
        args.state.parent.mkdir(parents=True,exist_ok=True);(args.state.parent/'monitor-status.json').write_text(json.dumps(run,ensure_ascii=False,indent=2))
        print(json.dumps({'run_id':run['id'],'state':run['state'],'providers':run['providers']}))
        if run['state']=='failed':raise SystemExit('All enabled providers failed; previous published data retained')
    except Exception:
        run.update(state='failed',completed=datetime.now(timezone.utc).isoformat(),error='monitor_cycle_failed')
        try:publisher.post('run',run)
        except Exception:pass
        raise SystemExit('Monitor cycle failed; previous published snapshot retained') from None
    finally:state.close();publisher.client.close()


if __name__=='__main__':main()
