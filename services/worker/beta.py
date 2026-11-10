"""Authorized three-round beta runner. Never prints or persists workload tokens."""
import argparse,hashlib,json,os,time,zipfile
from datetime import datetime,timezone
from pathlib import Path
from urllib.parse import urlsplit,quote
import httpx
from nv_engine.beta.research import Research,TOPIC,timestamp,common_prompt,markdown


def main():
 p=argparse.ArgumentParser();p.add_argument('--cutoff');p.add_argument('--out',type=Path,default=Path('.local/beta-output'));p.add_argument('--prepare-only',action='store_true');p.add_argument('--resume-id',default='');args=p.parse_args()
 cutoff=timestamp(args.cutoff) if args.cutoff else datetime.now(timezone.utc)
 if cutoff is None or cutoff>datetime.now(timezone.utc):p.error('Invalid/future cutoff')
 origin=os.environ.get('NV_WORKER_ORIGIN','https://nightvision.hexagon0401.workers.dev').rstrip('/');u=urlsplit(origin)
 if u.scheme!='https' or not u.hostname or u.username or u.password or u.query or u.fragment or u.path:p.error('Invalid Worker origin')
 out=args.out;out.mkdir(parents=True,exist_ok=True);(out/'comparison-prompt.md').write_text(common_prompt(cutoff))
 (out/'submission-template.json').write_text(json.dumps({'system':None,'model':None,'framework_version':None,'reasoning_setting':None,'cutoff_utc':cutoff.isoformat(),'rounds':3,'search_tools':[],'report_file':None,'duration_ms':None,'usage':None,'scores':{'source_verifiability':None,'factual_accuracy':None,'falsifiability':None,'counterevidence':None,'mechanisms':None,'causal_timing':None,'usability':None}},ensure_ascii=False,indent=2))
 client=httpx.Client(timeout=120,follow_redirects=False,headers={'User-Agent':'NightVisionBeta/2.0'})
 def token():
  url=os.environ.get('ACTIONS_ID_TOKEN_REQUEST_URL');guard=os.environ.get('ACTIONS_ID_TOKEN_REQUEST_TOKEN')
  if url and guard:
   r=client.get(url+('&' if '?' in url else '?')+'audience='+quote(origin+'/beta',safe=''),headers={'Authorization':'Bearer '+guard});r.raise_for_status();return r.json()['value']
  if os.environ.get('NV_INGEST_TOKEN'):return os.environ['NV_INGEST_TOKEN']
  raise ValueError('GitHub workload identity or NV_INGEST_TOKEN required; no login bypass')
 def post(path,data):
  try:r=client.post(origin+'/api/internal/beta/'+path,json=data,headers={'Authorization':'Bearer '+token()})
  except (httpx.HTTPError,KeyError):raise ValueError('beta_publication_or_identity_failure') from None
  if r.status_code!=200:
   try:code=r.json().get('error','request_failed')
   except ValueError:code='invalid_server_response'
   raise ValueError('beta_request_failed:'+str(r.status_code)+':'+str(code))
  return r.json()
 research=Research(cutoff);started=time.monotonic();run=None
 try:
  if args.resume_id:
   r=client.get(origin+'/api/v2/beta/'+args.resume_id);r.raise_for_status();run=r.json();cutoff=timestamp(run['cutoff']);research.cutoff=cutoff;research.start=cutoff-__import__('datetime').timedelta(days=90);research.sources={s['id']:s for s in run['input']['sources']}
   (out/'comparison-prompt.md').write_text(common_prompt(cutoff))
  else:
   sources=research.discover(['shipping attacks disruption','vessel transit rerouting'])
   (out/'research-audit.json').write_text(json.dumps({'cutoff':cutoff.isoformat(),'sources':sources,'audit':research.audit},ensure_ascii=False,indent=2))
   if args.prepare_only:return
   if len(sources)<2:raise ValueError('insufficient_accessible_sources; no model report generated')
   archive=Path('extensions/claude/v3/night_vision_v3.skill');framework_hash=hashlib.sha256(archive.read_bytes()).hexdigest()
   run=post('start',{'topic':TOPIC,'cutoff':cutoff.isoformat(),'sources':sources,'framework_sha256':framework_hash,'search_audit':research.audit,'comparison_prompt':common_prompt(cutoff),'framework':'NV Engine 2.0 beta-loop/2, informed by archived V3'} )
  (out/'run.json').write_text(json.dumps(run,ensure_ascii=False,indent=2));print('Beta run:',run['id'])
  for step in range(6):
   if time.monotonic()-started>1000:raise ValueError('beta_job_time_budget')
   if run['steps'][step]['state']=='complete':continue
   if step in (2,4):
    previous=run['steps'][step-1].get('output',{}).get('report',{}).get('research_requests',[])
    research.discover(previous or ['shipping impact corroboration'])
   sources=sorted(research.sources.values(),key=lambda s:(s['scope']!='window',s['url']))[:40]
   post('step',{'id':run['id'],'step':step,'sources':sources,'retry':bool(args.resume_id)})
   run=client.get(origin+'/api/v2/beta/'+run['id']).json()
   (out/'run.json').write_text(json.dumps(run,ensure_ascii=False,indent=2));(out/'NV-report.md').write_text(markdown(run));(out/'research-audit.json').write_text(json.dumps(research.audit,ensure_ascii=False,indent=2));print('Completed round',step//2+1,'role','A' if step%2==0 else 'B')
  if run['state']!='complete':raise ValueError('beta_incomplete')
 except Exception as error:
  if run:
   try:run=client.get(origin+'/api/v2/beta/'+run['id']).json();(out/'run.json').write_text(json.dumps(run,ensure_ascii=False,indent=2));(out/'NV-report.md').write_text(markdown(run))
   except Exception:pass
  safe=str(error) if isinstance(error,ValueError) else 'beta_transport_or_runtime_failed'
  (out/'status.json').write_text(json.dumps({'state':'paused','reason':safe},ensure_ascii=False));raise SystemExit(safe) from None
 finally:research.close();client.close()

if __name__=='__main__':main()
