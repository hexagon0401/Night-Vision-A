import {requireValue,stmt,rows,json,sha,sameOrigin} from './core.js';
import {requireUser} from './auth.js';
import {validateRecord} from './data.js';
import {providers,eligibility,policy} from './provider-policy.js';
import {discover} from './event-context-providers/discover.js';
import {shift,validateBundle,roles} from './event-context-providers/common.js';
const VERSION='context:5';
export async function resolveEvent(env,id){
 requireValue(/^ucdp:[\w.:-]{1,175}$/.test(id),'invalid_event_id');
 const found=await stmt(env.DB,"SELECT r.body,r.snapshot FROM records r JOIN heads h ON r.snapshot=h.snapshot WHERE r.id=? AND r.kind='ucdp' AND h.provider='ucdp' LIMIT 1",id).first();requireValue(found,'unknown_event',404);
 const r=validateRecord(JSON.parse(found.body));requireValue(!r.actors||(Array.isArray(r.actors)&&r.actors.length<=12&&r.actors.every(a=>typeof a==='string'&&a.length<=1000)),'invalid_event_actors',409);requireValue(r.id===id&&r.kind==='ucdp','event_identity_mismatch',409);return {r,snapshot:found.snapshot};
}
async function runProvider(env,p,r,snapshot,force=false,statusOnly=false){
 const now=new Date().toISOString(),version=VERSION+':'+snapshot,gate=eligibility(p,r),pol=policy(p,env);
 const base={provider_id:p.id,status:'empty',started_at_utc:now,completed_at_utc:now,cached:false,retry_after_utc:null,diagnostics_code:null,fetched_count:0,key_configured:p.key?!!env[p.key]:null,policy_url:p.terms,provider_url:p.url,mode:'metadata_link_only'};
 const blocked=(status,reason)=>({run:{...base,status,diagnostics_code:reason},items:[]});
 if(gate)return blocked('irrelevant',gate);if(pol)return blocked(pol.status,pol.reason);
 if(p.id==='gdelt_doc'&&shift(r.end_day,14)<shift(now.slice(0,10),-90))return blocked('historical_unavailable','outside_recent_news_window');
 const old=await stmt(env.DB,'SELECT body,expires_at FROM event_context_cache WHERE event_id=? AND provider_id=? AND event_hash=? AND provider_version=?',r.id,p.id,r.hash,version).first();
 if(old&&!force&&old.expires_at>now){const cached=JSON.parse(old.body);cached.run.cached=true;return cached;}
 if(statusOnly){if(old){const cached=JSON.parse(old.body);cached.run.cached=true;cached.run.diagnostics_code='stale_cache';return cached;}return blocked('disabled','not_requested');}
 const healthKey='context-health:'+p.id+(p.id==='mapillary_street_photo'?':small-window-v2':'');
 const health=await stmt(env.DB,'SELECT value FROM settings WHERE key=?',healthKey).first();
 if(!force&&health){const h=JSON.parse(health.value);if(h.retry_after_utc&&h.retry_after_utc>now){const held=blocked(h.status,h.diagnostics_code);held.run.retry_after_utc=h.retry_after_utc;if(old){held.items=JSON.parse(old.body).items;held.run.cached=true;held.run.diagnostics_code+=':stale_cache';}return held;}}
 const job=r.id+':'+p.id,epoch=Date.now();let slot=null;
 for(let i=0;i<3;i++){try{const lease=await stmt(env.DB,'INSERT INTO context_locks VALUES(?,?,?) ON CONFLICT(slot) DO UPDATE SET job=excluded.job,expires=excluded.expires WHERE expires<? RETURNING slot',i,job,epoch+15000,epoch).first();if(lease){slot=i;break;}}catch{}}
 if(slot===null)return blocked('rate_limited','concurrency_limit');
 try {
  const bucket='context:'+p.id,day=now.slice(0,10);
  const charged=await stmt(env.DB,'INSERT INTO quotas VALUES(?,?,1) ON CONFLICT(day,bucket) DO UPDATE SET count=count+1 WHERE count<50 RETURNING count',day,bucket).first();
  if(!charged)return blocked('rate_limited','daily_provider_budget');
  let result;
  try{const items=(await discover(p,r,now,env)).filter(i=>i.url).slice(0,20);result={run:{...base,status:items.length?'ok':'empty',fetched_count:items.length,completed_at_utc:new Date().toISOString()},items};}
  catch(e){result=blocked(e.message==='rate_limited'?'rate_limited':'temporarily_failed',/^upstream_|invalid_|geometry_|adapter_/.test(e.message)?e.message:'provider_fetch_failed');result.run.retry_after_utc=e.retry??new Date(Date.now()+300000).toISOString();if(old){const previous=JSON.parse(old.body);result.items=previous.items;result.run.cached=true;result.run.diagnostics_code+=':stale_cache';}}
  await stmt(env.DB,'INSERT OR REPLACE INTO settings VALUES(?,?)',healthKey,JSON.stringify({provider_id:p.id,status:result.run.status,diagnostics_code:result.run.diagnostics_code,checked_at:result.run.completed_at_utc,retry_after_utc:result.run.retry_after_utc,fetched_count:result.run.fetched_count})).run();
  const ttl=result.run.status==='ok'||result.run.status==='empty'?3600000:300000;
  await stmt(env.DB,'INSERT OR REPLACE INTO event_context_cache VALUES(?,?,?,?,?,?,?,?)',r.id,p.id,r.hash,version,now,new Date(Date.now()+ttl).toISOString(),result.run.status,JSON.stringify(result)).run();
  // Bounded retention; retain revision history for 30 days, never delete canonical data.
  await stmt(env.DB,"DELETE FROM event_context_cache WHERE rowid IN (SELECT rowid FROM event_context_cache WHERE fetched_at<datetime('now','-30 days') LIMIT 30)").run();
  return result;
 }finally{await stmt(env.DB,'DELETE FROM context_locks WHERE slot=? AND job=?',slot,job).run();}
}
export function eventRef(r){return {id:r.id,provider:'ucdp',upstream_id:r.upstream_id??null,provider_version:r.version,original_hash:r.hash,country:r.country,title:r.title,actors:(r.actors??[]).slice(0,12),conflict_type:r.conflict_type??null,interval:{from:r.day,to:r.end_day,precision_code:r.date_prec??null},location:{lat:r.lat,lon:r.lon,where_prec:r.precision,geometry_geojson:null,geometry_source:null,certainty:r.lat===null?'unknown':r.precision===1?'point_reported':'regional_only'}};}
export async function contextRoute(request,env,url){
 const match=url.pathname.match(/^\/api\/v2\/events\/([^/]+)\/context(?:\/(status|refresh|review|provider\/([\w_]+)))?$/);requireValue(match,'unknown_context_route',404);
 let id;try{id=decodeURIComponent(match[1]);}catch{requireValue(false,'invalid_event_id');}
 const {r,snapshot}=await resolveEvent(env,id);const action=match[2]??'';
 let actor=null;if(['refresh','review'].includes(action)){requireValue(request.method==='POST','method_not_allowed',405);sameOrigin(request);actor=await requireUser(request,env);}else requireValue(request.method==='GET','method_not_allowed',405);
 if(action==='review'){
  const day=new Date().toISOString().slice(0,10),permit=await stmt(env.DB,'INSERT INTO quotas VALUES(?,?,1) ON CONFLICT(day,bucket) DO UPDATE SET count=count+1 WHERE count<10 RETURNING count',day,'context-review:'+actor.user_id).first();requireValue(permit,'context_review_daily_limit',429);
  const evidence=await rows(env.DB,'SELECT body FROM event_context_cache WHERE event_id=? AND event_hash=? AND provider_version=?',id,r.hash,VERSION+':'+snapshot);
  const review={event_ref:eventRef(r),state:'manual_review_requested',created:new Date().toISOString(),user_id:actor.user_id,items:evidence.flatMap(e=>JSON.parse(e.body).items),automatic_promotion:false,modules:['source_finder','source_tracker','chrono_search','visual_forensics','hypothesis_lab']};
  const key=await sha(JSON.stringify(review));await stmt(env.DB,'INSERT INTO context_reviews VALUES(?,?,?,?,?,?)',key,id,r.hash,review.created,actor.user_id,JSON.stringify(review)).run();await stmt(env.DB,"DELETE FROM context_reviews WHERE created<datetime('now','-30 days')").run();return json({...review,id:key});
 }
 const include=url.searchParams.get('include');requireValue(!include||include.length<350,'invalid_include');const requested=match[3]?[match[3]]:include?include.split(','):['ucdp_existing','gdelt_doc','earth_search_stac'];
 requireValue(requested.length<=providers.length&&requested.every(id=>providers.some(p=>p.id===id)),'unknown_provider');
 if(action==='refresh'){
  const day=new Date().toISOString().slice(0,10),q=await stmt(env.DB,'INSERT INTO quotas VALUES(?,?,1) ON CONFLICT(day,bucket) DO UPDATE SET count=count+1 WHERE count<10 RETURNING count',day,'context-refresh:'+actor.user_id).first();requireValue(q,'context_refresh_daily_limit',429);
 }
 const results=await Promise.all(providers.map(p=>runProvider(env,p,r,snapshot,action==='refresh',action==='status'||!requested.includes(p.id))));
 const items=results.flatMap(x=>x.items),counts=Object.fromEntries(roles.map(role=>[role,items.filter(i=>i.evidence_role===role).length]));counts.total=items.length;counts.inaccessible=results.filter(x=>!['ok','empty','irrelevant'].includes(x.run.status)).length;
 const bundle=validateBundle({schema_version:'event_context.v1',event_ref:eventRef(r),generated_at_utc:new Date().toISOString(),query_plan:{aliases:[r.country,...(r.actors??[]).filter(Boolean).slice(0,2)],languages:[],radius_policy:[1,2].includes(r.precision)?'bounded_search_candidate_not_error_radius':'disabled_precision_insufficient',chronology_window:{from:shift(r.day,-14),to:shift(r.end_day,14)},eligible_sources:providers.filter(p=>!eligibility(p,r)).map(p=>p.id),skipped_sources:Object.fromEntries(providers.filter(p=>eligibility(p,r)).map(p=>[p.id,eligibility(p,r)]))},provider_runs:results.map(x=>x.run),items,counts});
 const response=json(bundle);response.headers.set('ETag','"'+await sha(JSON.stringify(bundle.items)+r.hash+snapshot)+'"');return response;
}
