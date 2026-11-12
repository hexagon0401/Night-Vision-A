import {requireValue} from './core.js';
export function validGeometry(g){
 if(g===null)return true;
 const point=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&Math.abs(p[0])<=180&&Math.abs(p[1])<=90;
 if(g?.type==='Point')return point(g.coordinates);
 const polygon=c=>Array.isArray(c)&&c.length>0&&c.length<=20&&c.every(r=>Array.isArray(r)&&r.length>=4&&r.length<=1000&&r.every(point)&&r[0][0]===r.at(-1)[0]&&r[0][1]===r.at(-1)[1]);
 if(g?.type==='Polygon')return polygon(g.coordinates);
 return g?.type==='MultiPolygon'&&Array.isArray(g.coordinates)&&g.coordinates.length>0&&g.coordinates.length<=20&&g.coordinates.every(polygon);
}
export const ontologyId=id=>typeof id==='string'&&id.length<=256&&/^[A-Za-z][A-Za-z0-9:._@-]{2,255}$/.test(id);
export const ontologyKinds=['event','vessel','aircraft','satellite_scene','camera','facility','organization','location','person_public','document','anomaly'];
const states=['observed','documented','reported','inferred','scenario','refuted','unresolved'];
const time=t=>t===null||typeof t==='string'&&/T.*(?:Z|[+-]\d\d:\d\d)$/.test(t)&&Number.isFinite(Date.parse(t));
const interval=(a,b)=>a===null||b===null||Date.parse(a)<=Date.parse(b);
export function safeSourceURL(value){try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password&&!Array.from(u.searchParams.keys()).some(k=>/^(?:key|api_key|access_token|token|authorization|signature)$/i.test(k))?u.href:null;}catch{return null;}}
export function validateOntologyGraph(g){
 requireValue(g&&g.schema_version==='nv-ontology/2.0'&&typeof g.synthetic==='boolean','invalid_ontology_graph');
 const groups={entities:'entity_id',identifiers:'identifier_id',observations:'observation_id',sources:'source_id',claims:'claim_id',evidence_links:'evidence_link_id',relations:'relation_id',anomalies:'candidate_id',module_runs:'module_run_id'},index={};
 for(const [name,key] of Object.entries(groups)){
  requireValue(Array.isArray(g[name])&&g[name].length<=2000,'ontology_record_limit');index[name]=new Map();
  for(const row of g[name]){requireValue(row&&ontologyId(row[key])&&!index[name].has(row[key]),'invalid_ontology_id');index[name].set(row[key],row);}
 }
 const refs=(name,ids)=>requireValue(Array.isArray(ids)&&new Set(ids).size===ids.length&&ids.every(id=>index[name].has(id)),'unknown_ontology_reference');
 const sourced=r=>{requireValue(r.source_ids?.length>0&&states.includes(r.status),'ontology_provenance_required');refs('sources',r.source_ids);};
 for(const s of g.sources){requireValue((s.url===null||safeSourceURL(s.url))&&['original','derived','unknown'].includes(s.original_or_derived)&&['approved','metadata_only','pending','prohibited','unknown'].includes(s.license_status),'invalid_ontology_source');for(const k of ['published_at_utc','indexed_at_utc','acquired_at_utc'])requireValue(time(s[k]),'invalid_ontology_time');if(s.original_or_derived==='derived')requireValue(s.derived_from_source_id,'missing_source_lineage');let p=s.derived_from_source_id,seen=new Set([s.source_id]);while(p!==null){refs('sources',[p]);requireValue(!seen.has(p),'cyclic_source_lineage');seen.add(p);p=index.sources.get(p).derived_from_source_id;}}
 for(const e of g.entities){requireValue(ontologyKinds.includes(e.kind)&&states.includes(e.status)&&typeof e.display_name==='string'&&e.display_name.length>0&&e.display_name.length<=300&&['public','restricted','non_sensitive_public_context'].includes(e.privacy_class),'invalid_ontology_entity');refs('sources',e.source_ids);}
 for(const i of g.identifiers){sourced(i);refs('entities',[i.entity_id]);requireValue(time(i.valid_from_utc)&&time(i.valid_to_utc)&&interval(i.valid_from_utc,i.valid_to_utc),'invalid_ontology_interval');}
 for(const o of g.observations){sourced(o);refs('entities',[o.entity_id]);requireValue(validGeometry(o.geometry)&&['unlocated','provider_reported_position','measured_position','scene_footprint','catalog_location'].includes(o.geometry_role)&&['public','restricted','delayed_public','aggregated_only'].includes(o.visibility_policy),'invalid_ontology_geometry');
  if(o.geometry===null)requireValue(o.geometry_source_id===null&&o.geometry_role==='unlocated'&&o.precision_m===null,'invalid_null_geometry');else requireValue(o.geometry_role!=='unlocated'&&o.source_ids.includes(o.geometry_source_id)&&(o.precision_m===null||Number.isFinite(o.precision_m)&&o.precision_m>=0),'geometry_source_missing');
  for(const k of ['observed_at_utc','acquired_at_utc','recorded_at_utc'])requireValue(time(o[k]),'invalid_ontology_time');
  if(o.observed_at_utc&&o.acquired_at_utc)requireValue(Date.parse(o.observed_at_utc)<=Date.parse(o.acquired_at_utc)+600000,'observation_in_future');
  if(o.acquired_at_utc&&o.recorded_at_utc)requireValue(Date.parse(o.acquired_at_utc)<=Date.parse(o.recorded_at_utc)+600000,'acquisition_after_recording');
  const e=index.entities.get(o.entity_id);requireValue(e.privacy_class!=='restricted'||o.visibility_policy==='restricted','restricted_ontology_entity');requireValue(e.kind!=='person_public'||!o.geometry||o.visibility_policy==='restricted','person_location_not_public');
 }
 for(const c of g.claims){sourced(c);requireValue(typeof c.statement==='string'&&c.statement.length<=5000&&time(c.event_from_utc)&&time(c.event_to_utc)&&interval(c.event_from_utc,c.event_to_utc),'invalid_ontology_claim');requireValue(!(['inferred','scenario'].includes(c.status)&&c.review_state==='source_verified'),'inference_is_not_source_verified');}
 for(const l of g.evidence_links){refs('claims',[l.claim_id]);refs('sources',[l.source_id]);requireValue(index.claims.get(l.claim_id).source_ids.includes(l.source_id),'evidence_source_outside_claim');}
 for(const r of g.relations){sourced(r);refs('entities',[r.subject_id,r.object_id]);requireValue(r.subject_id!==r.object_id&&time(r.valid_from_utc)&&time(r.valid_to_utc)&&interval(r.valid_from_utc,r.valid_to_utc),'invalid_ontology_relation');requireValue(!(r.predicate==='POSSIBLY_SAME_AS'&&r.resolution_state==='accepted')&&!(['inferred','scenario','unresolved'].includes(r.status)&&r.resolution_state==='accepted'),'unreviewed_ontology_relation');}
 for(const a of g.anomalies){sourced(a);refs('observations',a.observation_ids);if(a.entity_id!==null)refs('entities',[a.entity_id]);requireValue(a.calibration!=='calibrated_with_validation'||a.review_state==='reviewed','uncorroborated_calibration');}
 for(const r of g.module_runs){requireValue(r.executor!=='not_executed'||!['completed','partial'].includes(r.status),'false_module_completion');if(r.executor==='mcp_remote_verified')requireValue(r.receipt?.tool_name&&r.receipt?.tool_call_id,'missing_execution_receipt');}
 return g;
}

export function publicObservation(entity,observation,sources){
 if(!entity||entity.kind==='person_public'||entity.privacy_class==='restricted'||observation.visibility_policy!=='public'||!['observed','documented','reported'].includes(observation.status))return false;
 if(!Array.isArray(observation.source_ids)||!observation.source_ids.length||!observation.source_ids.every(id=>sources.some(s=>s.source_id===id&&['approved','metadata_only'].includes(s.license_status))))return false;
 return observation.geometry===null||validGeometry(observation.geometry)&&observation.source_ids.includes(observation.geometry_source_id);
}
