import {attachNewsCandidate} from './ontology-evidence.js';
import {fetchWindyImage} from './nearby-webcam.js';
import {preview} from './nearby-preview.js';
import {json,requireValue,rows,stmt,body,sameOrigin} from './core.js';
import {requireUser} from './auth.js';
import {normalizeProviderBatch} from './ontology-provider.js';
import {ontologyReady,entityRow,observationRow,sourceRow,parseJSON,publicDossier,writeOntologyGraph} from './ontology-store.js';
import {ontologyId,ontologyKinds,publicObservation} from './ontology-validation.js';
import {ontologyAnalysis,ontologyExtraction} from './ontology-analysis.js';
const PUBLIC="e.privacy_class!='restricted' AND e.kind!='person_public' AND e.synthetic=0";
function parameters(url){
 const limit=Number(url.searchParams.get('limit')??200),kind=url.searchParams.get('kind')??'',cursor=url.searchParams.get('cursor')??'';
 requireValue(Number.isInteger(limit)&&limit>=1&&limit<=200,'invalid_ontology_limit');requireValue(!kind||ontologyKinds.includes(kind),'invalid_ontology_kind');requireValue(!cursor||ontologyId(cursor),'invalid_ontology_cursor');
 let bbox=null;if(url.searchParams.has('bbox')){const raw=url.searchParams.get('bbox').split(',');bbox=raw.map(Number);requireValue(raw.length===4&&raw.every(x=>x.trim()!=='')&&bbox.every(Number.isFinite)&&bbox[0]>=-180&&bbox[2]<=180&&bbox[1]>=-90&&bbox[3]<=90&&bbox[0]<bbox[2]&&bbox[1]<bbox[3],'invalid_ontology_bbox');}
 return {limit,kind,cursor,bbox};
}
function intersects(geometry,b){if(!geometry)return false;if(geometry.type==='Point')return geometry.coordinates[0]>=b[0]&&geometry.coordinates[0]<=b[2]&&geometry.coordinates[1]>=b[1]&&geometry.coordinates[1]<=b[3];const coords=geometry.type==='Polygon'?geometry.coordinates.flat():geometry.coordinates.flat(2);const xs=coords.map(p=>p[0]),ys=coords.map(p=>p[1]);return Math.max(...xs)>=b[0]&&Math.min(...xs)<=b[2]&&Math.max(...ys)>=b[1]&&Math.min(...ys)<=b[3];}
export async function ontologyStatus(env){
 const enabled=env.NV_ONTOLOGY_V2_ENABLED==='true',migration_ready=await ontologyReady(env.DB);
 const base={enabled,ready:enabled&&migration_ready,migration_ready,schema_version:'nv-ontology/2.0',runtime_mcp_enabled:false,objects:0,providers:[],data_as_of_utc:null,diagnostics:enabled&&!migration_ready?['ontology_migration_required']:[]};
 if(!migration_ready||!enabled)return base;
 const count=await stmt(env.DB,"SELECT count(*) n,max(updated_at_utc) latest FROM nv2_entities e WHERE "+PUBLIC).first();
 const providers=await rows(env.DB,"SELECT o.provider_id,count(*) observations,max(o.observed_at_utc) last_observed_at,max(o.acquired_at_utc) last_checked_at FROM nv2_observations o JOIN nv2_entities e ON o.entity_id=e.entity_id WHERE "+PUBLIC+" AND o.visibility_policy='public' GROUP BY o.provider_id LIMIT 20");
 return {...base,objects:count.n,data_as_of_utc:count.latest,providers:providers.map(p=>({...p,provider:p.provider_id,status:p.last_checked_at&&Date.now()-Date.parse(p.last_checked_at)<3600000?'ok':'stale'}))};
}
async function catalog(env,url){
 const {limit,kind,cursor,bbox}=parameters(url);
 const fields=['observation_id','entity_id','provider_id','observed_at_utc','acquired_at_utc','recorded_at_utc','geometry_json','geometry_source_id','precision_m','geometry_role','visibility_policy','status','measurements_json'];
 const selected=fields.map(f=>'o.'+f+' AS obs_'+f).join(',');
 const found=await rows(env.DB,`SELECT e.*,${selected} FROM nv2_entities e LEFT JOIN nv2_observations o ON o.observation_id=(SELECT x.observation_id FROM nv2_observations x WHERE x.entity_id=e.entity_id AND x.visibility_policy='public' ORDER BY x.observed_at_utc IS NULL,x.observed_at_utc DESC,x.acquired_at_utc DESC,x.observation_id DESC LIMIT 1) WHERE ${PUBLIC} AND (?='' OR e.kind=?) AND e.entity_id>? ${bbox?"AND ((o.lat BETWEEN ? AND ? AND o.lon BETWEEN ? AND ?) OR o.geometry_role='scene_footprint')":''} ORDER BY e.entity_id LIMIT ?`,kind,kind,cursor,...(bbox?[bbox[1],bbox[3],bbox[0],bbox[2]]:[]),limit+1);
 const page=found.slice(0,limit),ids=new Set();for(const r of page){for(const sid of entityRow(r).source_ids??[])ids.add(sid);const m=parseJSON(r.obs_measurements_json);for(const sid of m._source_ids??[])ids.add(sid);}
 requireValue(ids.size<=2000,'ontology_source_budget',413);
 const sources=ids.size?(await rows(env.DB,'SELECT * FROM nv2_sources WHERE source_id IN (SELECT value FROM json_each(?))',JSON.stringify([...ids]))).map(sourceRow):[];
 const objects=[],features=[];
 for(const r of page){const object=entityRow(r);if(!object.source_ids.length||!object.source_ids.every(id=>sources.some(s=>s.source_id===id&&['approved','metadata_only'].includes(s.license_status))))continue;
  const observation=r.obs_observation_id?observationRow(Object.fromEntries(fields.map(f=>[f,r['obs_'+f]]))):null;
  if(bbox&&(!observation||!publicObservation(object,observation,sources)||!intersects(observation.geometry,bbox)))continue;
  objects.push(object);if(observation?.geometry&&publicObservation(object,observation,sources))features.push({type:'Feature',geometry:observation.geometry,properties:{legacy_event_id:object.kind==='event'?object.attributes.provider_record_id:null,object_id:object.entity_id,kind:object.kind,observation_id:observation.observation_id,source_ids:observation.source_ids,status:observation.status,synthetic:false,geometry_role:observation.geometry_role}});
 }
 return json({schema_version:'nv-objects/2.0',synthetic:false,data_as_of_utc:page.reduce((a,r)=>!a||r.updated_at_utc>a?r.updated_at_utc:a,null),objects,feature_collection:{type:'FeatureCollection',features},next_cursor:found.length>limit?page.at(-1).entity_id:null,warnings:['공급원 자료이며 독립 검증된 현재 상황을 뜻하지 않습니다.',...(bbox?['다각형은 촬영 범위의 외접 범위로 검색합니다.']:[])],coverage:{objects_returned:objects.length,records_examined:page.length,page_limit:limit,source_metadata_only:true}});
}

export async function syncOntology(env,input){
 requireValue(env.NV_ONTOLOGY_V2_ENABLED==='true','ontology_disabled',503);requireValue(await ontologyReady(env.DB),'ontology_migration_required',503);
 const source=input.source??'ucdp';requireValue(['ucdp','nearby'].includes(source),'invalid_ontology_sync_source');const limit=Math.min(2,Number(input.limit??2));requireValue(Number.isInteger(limit)&&limit>0,'invalid_ontology_limit');
 const now=new Date().toISOString(),epoch=Date.now(),job='ontology-sync';
 const lease=await stmt(env.DB,'INSERT INTO context_locks VALUES(?,?,?) ON CONFLICT(slot) DO UPDATE SET job=excluded.job,expires=excluded.expires WHERE expires<? RETURNING slot',99,job,epoch+30000,epoch).first();requireValue(lease,'ontology_sync_busy',429);
 try{
 const permit=await stmt(env.DB,"INSERT INTO quotas VALUES(date('now'),'ontology-sync',1) ON CONFLICT(day,bucket) DO UPDATE SET count=count+1 WHERE count<500 RETURNING count").first();requireValue(permit,'ontology_sync_daily_budget',429);
 const size=await stmt(env.DB,'SELECT count(*) n FROM nv2_entities').first();requireValue(size.n<20000,'ontology_storage_limit',429);
 let normalized,next_cursor=null;
 if(source==='ucdp'){
  const cursor=input.cursor??'';requireValue(typeof cursor==='string'&&cursor.length<=180,'invalid_ontology_sync_cursor');
  const records=await rows(env.DB,"SELECT r.body,r.snapshot FROM records r JOIN heads h ON h.snapshot=r.snapshot WHERE h.provider='ucdp' AND r.kind='ucdp' AND r.id>? ORDER BY r.id LIMIT ?",cursor,limit+1);
  const selected=records.slice(0,Math.min(limit,2)).map(r=>parseJSON(r.body));normalized=normalizeProviderBatch(selected,{recordedAt:now});
  for(const e of normalized.graph.entities){const r=selected.find(x=>x.id===e.attributes.provider_record_id);if(!r)continue;const cid='claim:record:'+e.entity_id;e.attributes.claim_ids=[cid];normalized.graph.claims.push({claim_id:cid,statement:String(r.title).slice(0,5000),language:null,source_ids:e.source_ids,status:'reported',event_from_utc:null,event_to_utc:null,limitations:['제공기관의 구조화 기록 제목입니다. 원보도 본문과 사건 원인은 별도 검증이 필요합니다.'],review_state:'not_reviewed',quote_span:null});for(const sid of e.source_ids)normalized.graph.evidence_links.push({evidence_link_id:'evidence:'+cid,claim_id:cid,source_id:sid,role:'MENTIONS',quote_span:null,status:'reported'});}
  for(const record of selected){const cached=await stmt(env.DB,"SELECT body FROM event_context_cache WHERE event_id=? AND event_hash=? AND provider_id='gdelt_doc' AND provider_version=?",record.id,record.hash,'context:5:'+records[0].snapshot).first();if(cached){const item=parseJSON(cached.body).items?.find(i=>i.provider_id==='gdelt_doc');if(item)await attachNewsCandidate(normalized.graph,item,record.id);}}
  next_cursor=records.length>limit?selected.at(-1).id:null;
 }else{
  const cursor=input.cursor??{key:'',offset:0};requireValue(cursor&&typeof cursor.key==='string'&&cursor.key.length<=200&&Number.isInteger(cursor.offset)&&cursor.offset>=0&&cursor.offset<=100,'invalid_ontology_sync_cursor');
  const caches=await rows(env.DB,"SELECT key,value FROM settings WHERE key LIKE 'nearby:v1:%' AND key>=? AND CASE WHEN json_valid(value) THEN json_extract(value,'$.expires')>? AND json_extract(value,'$.body.status')='ok' ELSE 0 END ORDER BY key LIMIT 5",cursor.key,Date.now());
  const first=caches.find(c=>{const v=parseJSON(c.value);return v.expires>Date.now()&&v.body?.status==='ok'&&Array.isArray(v.body.items)&&v.body.items.length>(c.key===cursor.key?cursor.offset:0);});
  if(!first)return {source,counts:{fetched_count:0,normalized_count:0,accepted_count:0,rejected_count:0},diagnostics:['no_fresh_nearby_cache'],next_cursor:null};
  const cached=parseJSON(first.value),at=first.key===cursor.key?cursor.offset:0;const items=cached.body.items.slice(at,at+limit);
  normalized=normalizeProviderBatch(items,{queriedAt:cached.body.queried_at,recordedAt:now});next_cursor={key:first.key,offset:at+items.length};
 }
 let stored=null;try{stored=normalized.graph.entities.length?await writeOntologyGraph(env.DB,normalized.graph,{clock:now}):null;}catch(e){if(!['ontology_stale_transport_sample','ontology_transport_observation_conflict'].includes(e.message))throw e;normalized.diagnostics.push(e.message);}
 const result={source,checked_at:now,counts:normalized.counts,diagnostics:normalized.diagnostics,next_cursor,stored};
 await env.DB.batch([stmt(env.DB,'INSERT OR REPLACE INTO settings VALUES(?,?)','ontology:last-sync',JSON.stringify(result)),stmt(env.DB,"DELETE FROM nv2_module_runs WHERE module_run_id IN (SELECT module_run_id FROM nv2_module_runs WHERE completed_at_utc<strftime('%Y-%m-%dT%H:%M:%fZ','now','-30 days') LIMIT 30)"),stmt(env.DB,"DELETE FROM nv2_sources WHERE source_id IN (SELECT s.source_id FROM nv2_sources s WHERE s.acquired_at_utc<strftime('%Y-%m-%dT%H:%M:%fZ','now','-30 days') AND NOT EXISTS(SELECT 1 FROM nv2_record_sources r WHERE r.source_id=s.source_id) AND NOT EXISTS(SELECT 1 FROM nv2_observations o WHERE o.geometry_source_id=s.source_id) AND NOT EXISTS(SELECT 1 FROM nv2_evidence_links l WHERE l.source_id=s.source_id) AND NOT EXISTS(SELECT 1 FROM nv2_sources d WHERE d.derived_from_source_id=s.source_id) LIMIT 30)")]);return result;
 }finally{await stmt(env.DB,'DELETE FROM context_locks WHERE slot=99 AND job=?',job).run();}
}

export async function ontologyRoute(request,env,url){
 if(url.pathname==='/api/v2/ontology/status'){requireValue(request.method==='GET','method_not_allowed',405);return json(await ontologyStatus(env));}
 const action=url.pathname==='/api/v2/admin/ontology-sync';if(action){requireValue(request.method==='POST','method_not_allowed',405);sameOrigin(request);await requireUser(request,env);return json(await syncOntology(env,await body(request,2000)));}
 requireValue(env.NV_ONTOLOGY_V2_ENABLED==='true','ontology_disabled',503);requireValue(await ontologyReady(env.DB),'ontology_migration_required',503);
 if(url.pathname==='/api/v2/ontology/objects'){requireValue(request.method==='GET','method_not_allowed',405);return catalog(env,url);}
 const match=url.pathname.match(/^\/api\/v2\/ontology\/objects\/([^/]+)(?:\/(analyze|extract|preview))?$/);
 if(match){let id;try{id=decodeURIComponent(match[1]);}catch{requireValue(false,'invalid_ontology_id');}requireValue(ontologyId(id),'invalid_ontology_id');if(match[2]==='preview'){requireValue(request.method==='GET','method_not_allowed',405);const d=await publicDossier(env.DB,id);requireValue(d,'unknown_ontology_object',404);if(d.object.kind==='satellite_scene'){const u=new URL(request.url);u.search=new URLSearchParams({scene:String(d.object.attributes.item_id??'')});return preview(request,env,u);}if(d.object.kind==='camera'&&id.startsWith('camera:windy_webcams_v3:'))return fetchWindyImage(env,id.slice('camera:windy_webcams_v3:'.length));return json({error:'ontology_preview_not_supported'},404);}
 if(match[2]){requireValue(request.method==='POST','method_not_allowed',405);sameOrigin(request);const user=await requireUser(request,env);return match[2]==='analyze'?ontologyAnalysis(env,id,user):ontologyExtraction(env,id,user,await body(request,1000));}
  requireValue(request.method==='GET','method_not_allowed',405);const cursor=url.searchParams.get('cursor');requireValue(!cursor||ontologyId(cursor),'invalid_ontology_cursor');const dossier=await publicDossier(env.DB,id,{cursor});requireValue(dossier,'unknown_ontology_object',404);dossier.diagnostics.source_extraction_available=env.NV_EVIDENCE_EXTRACTION_ENABLED==='true'&&!!env.FIRECRAWL_API_KEY&&!!env.NV_EVIDENCE_ALLOWED_DOMAINS;return json(dossier);}
 const source=url.pathname.match(/^\/api\/v2\/ontology\/sources\/([^/]+)$/);if(source){requireValue(request.method==='GET','method_not_allowed',405);let id;try{id=decodeURIComponent(source[1]);}catch{requireValue(false,'invalid_ontology_id');}requireValue(ontologyId(id),'invalid_ontology_id');const row=await stmt(env.DB,`SELECT s.* FROM nv2_sources s WHERE s.source_id=? AND EXISTS(SELECT 1 FROM nv2_record_sources r JOIN nv2_entities e ON e.entity_id=r.record_id WHERE r.record_kind='entity' AND r.source_id=s.source_id AND ${PUBLIC})`,id).first();requireValue(row,'unknown_ontology_source',404);return json(sourceRow(row));}
 const runs=url.pathname.match(/^\/api\/v2\/ontology\/runs\/([^/]+)$/);if(runs){requireValue(request.method==='GET','method_not_allowed',405);let id;try{id=decodeURIComponent(runs[1]);}catch{requireValue(false,'invalid_ontology_id');}requireValue(ontologyId(id),'invalid_ontology_id');requireValue(await publicDossier(env.DB,id),'unknown_ontology_object',404);return json({runs:await rows(env.DB,'SELECT * FROM nv2_module_runs WHERE case_id=? ORDER BY completed_at_utc DESC LIMIT 30',id),runtime_mcp_enabled:false});}
 return json({error:'unknown_ontology_route'},404);
}
