/** Pure provider-to-nv-ontology/2.0 adapters. No retrieval, persistence or identity joins.
 * Input is the existing bounded, civilian-filtered provider read model, never an
 * arbitrary public ingestion endpoint. One snapshot does not establish a route.
 */
const GROUPS=['entities','identifiers','observations','sources','claims','evidence_links','relations','anomalies','module_runs'];
export function emptyOntology(){return {schema_version:'nv-ontology/2.0',synthetic:false,...Object.fromEntries(GROUPS.map(k=>[k,[]])),as_of_utc:null};}
const validDay=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
export function ontologyTime(value){
 if(typeof value!=='string'||!validDay(value.slice(0,10))||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)||Number(value.slice(11,13))>23||Number(value.slice(14,16))>59||Number(value.slice(17,19))>59||!Number.isFinite(Date.parse(value)))return null;
 return new Date(value).toISOString();
}
export function ontologyURL(value){try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password&&u.hostname&&!/(?:^|[?&#])(?:access_token|api_key|apikey|authorization|signature|token)=/i.test(u.search+u.hash)?u.href:null;}catch{return null;}}
const part=value=>typeof value==='string'&&/^[A-Za-z0-9:._@-]{1,150}$/.test(value)?value:null;
const point=(lat,lon)=>Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180?{type:'Point',coordinates:[lon,lat]}:null;
const clean=value=>typeof value==='string'?value.slice(0,300):'';
const stamp=value=>(value??'unknown').replace(/[^A-Za-z0-9]/g,'');
const reject=reason=>({graph:emptyOntology(),diagnostics:[reason]});
function footprint(g){
 if(!g||!['Polygon','MultiPolygon'].includes(g.type)||!Array.isArray(g.coordinates)||JSON.stringify(g).length>10000)return null;
 const polygons=g.type==='Polygon'?[g.coordinates]:g.coordinates;
 if(!polygons.length||!polygons.every(p=>Array.isArray(p)&&p.length>0&&p.length<=20&&p.every(r=>Array.isArray(r)&&r.length>=4&&r.length<=1000&&r.every(c=>Array.isArray(c)&&c.length===2&&point(c[1],c[0]))&&r[0][0]===r.at(-1)[0]&&r[0][1]===r.at(-1)[1])))return null;
 return structuredClone(g);
}
function assemble({entityId,kind,label,provider,url,attributes,identifiers=[],geometry=null,geometryRole='unlocated',precision=null,observedAt=null,acquiredAt=null,recordedAt=null,publishedAt=null,indexedAt=null,hash=null,measurements={},notes=[],status='reported'}){
 const graph=emptyOntology();
 const revision=stamp(observedAt??acquiredAt)+':'+(geometry?.type==='Point'?geometry.coordinates.join('_'):'metadata');
 const sourceId='source:'+entityId+':'+revision;
 const observationId='observation:'+entityId+':'+revision;
 if(sourceId.length>256||observationId.length>256)return reject('identifier_length_limit');
 const source={source_id:sourceId,url,publisher:provider,content_hash:hash,original_or_derived:'unknown',derived_from_source_id:null,independence_group:provider,published_at_utc:publishedAt,indexed_at_utc:indexedAt,acquired_at_utc:acquiredAt,license_status:'metadata_only',access_status:'metadata_only',quote_span:null};
 const entity={entity_id:entityId,kind,display_name:label||entityId,status,privacy_class:'non_sensitive_public_context',attributes,source_ids:[sourceId],aliases:[],created_at_utc:null};
 graph.sources.push(source);graph.entities.push(entity);
 graph.observations.push({observation_id:observationId,entity_id:entityId,provider_id:provider,observed_at_utc:observedAt,acquired_at_utc:acquiredAt,recorded_at_utc:recordedAt,source_ids:[sourceId],status,geometry,geometry_source_id:geometry?sourceId:null,precision_m:geometry?precision:null,geometry_role:geometry?geometryRole:'unlocated',visibility_policy:'public',measurements,quality_notes:notes});
 graph.identifiers.push(...identifiers.map(i=>({identifier_id:'identifier:'+entityId+':'+i.namespace,entity_id:entityId,namespace:i.namespace,value:i.value,valid_from_utc:null,valid_to_utc:null,source_ids:[sourceId],status:'reported'})));
 graph.as_of_utc=recordedAt??acquiredAt;
 return {graph,diagnostics:notes};
}
export function normalizeUcdp(record,{acquiredAt,recordedAt}={}){
 if(!record||record.kind!=='ucdp')return reject('unsupported_ucdp_record');
 const upstream=String(record.upstream_id??record.id?.match(/^ucdp:(\d+)$/)?.[1]??'');
 const version=part(record.version);
 if(!/^\d{1,30}$/.test(upstream)||!version)return reject('ucdp_identity_missing');
 if(!validDay(record.day)||!validDay(record.end_day)||record.day>record.end_day)return reject('invalid_event_interval');
 const acquired=ontologyTime(acquiredAt??record.acquired_at),recorded=ontologyTime(recordedAt);
 if(acquired&&recorded&&Date.parse(acquired)>Date.parse(recorded)+600000)return reject('acquisition_after_recording');
 const geometry=record.precision===1?point(record.lat,record.lon):null;
 const notes=['reported_incident_not_independently_verified','event_date_interval_not_observation_instant'];
 if(!geometry)notes.push('event_location_unlocated_or_approximate');
 const result=assemble({entityId:`event:ucdp:${upstream}@${version}`,kind:'event',label:clean(record.title),provider:'ucdp',url:ontologyURL(record.source_url)??'https://ucdp.uu.se/',attributes:{provider_record_id:String(record.id??''),upstream_id:upstream,version,country:clean(record.country),date_from:record.day,date_to:record.end_day,date_precision:record.date_prec??null,where_precision:record.precision??null,actors:Array.isArray(record.actors)?record.actors.filter(a=>typeof a==='string').slice(0,12):[],conflict_type:record.conflict_type??null},identifiers:[{namespace:'ucdp_versioned_record',value:upstream+'@'+version}],geometry,geometryRole:'provider_reported_position',observedAt:null,acquiredAt:acquired,recordedAt:recorded,hash:/^[a-f0-9]{64}$/.test(record.hash??'')?record.hash:null,measurements:{date_from:record.day,date_to:record.end_day,fatalities_low:Number.isFinite(record.low)?record.low:null,fatalities_best:Number.isFinite(record.best)?record.best:null,fatalities_high:Number.isFinite(record.high)?record.high:null},notes});
 if(!result.graph.entities.length)return result;
 // Source revision hash distinguishes source corrections with the same dataset version.
 if(record.hash&&/^[a-f0-9]{64}$/.test(record.hash)){const suffix=':'+record.hash.slice(0,16);for(const source of result.graph.sources)source.source_id+=suffix;for(const e of result.graph.entities)e.source_ids=e.source_ids.map(id=>id+suffix);for(const o of result.graph.observations){o.observation_id+=suffix;o.source_ids=o.source_ids.map(id=>id+suffix);if(o.geometry_source_id)o.geometry_source_id+=suffix;}for(const i of result.graph.identifiers)i.source_ids=i.source_ids.map(id=>id+suffix);if(result.graph.sources.some(s=>s.source_id.length>256)||result.graph.observations.some(o=>o.observation_id.length>256))return reject('identifier_length_limit');}
 return result;
}
export function normalizeNearby(item,{queriedAt,recordedAt}={}){
 if(!item||typeof item!=='object')return reject('invalid_nearby_item');
 const url=ontologyURL(item.source_url);if(!url)return reject('source_url_missing_or_unsafe');
 const observed=ontologyTime(item.observed_at),acquired=ontologyTime(queriedAt),recorded=ontologyTime(recordedAt);
 if(observed&&acquired&&Date.parse(observed)>Date.parse(acquired)+600000)return reject('observation_in_future');
 if(acquired&&recorded&&Date.parse(acquired)>Date.parse(recorded)+600000)return reject('acquisition_after_recording');
 let entityId,kind,provider,geometry=point(item.lat,item.lon),geometryRole='provider_reported_position',precision=null;
 let attributes={provider_record_id:clean(item.id)},identifiers=[],measurements={},notes=['current_context_not_event_evidence','single_snapshot_not_a_trajectory'];
 if(item.kind==='aircraft'){
  const icao24=typeof item.icao24==='string'?item.icao24.toLowerCase():'';
  if(!/^[a-f0-9]{6}$/.test(icao24)||icao24==='000000')return reject('aircraft_icao24_missing_or_invalid');
  if(item.provider!=='adsb_lol')return reject('unreviewed_aircraft_provider');
  entityId='aircraft:icao24:'+icao24;kind='aircraft';provider='adsb_lol';attributes={...attributes,icao24,callsign:clean(item.callsign??item.title),aircraft_type:clean(item.aircraft_type)||null};identifiers=[{namespace:'icao24',value:icao24}];measurements={callsign:attributes.callsign,aircraft_type:attributes.aircraft_type};
 }else if(item.kind==='vessel'){
  const mmsi=String(item.mmsi??item.id?.match(/^vessel:(\d{9})$/)?.[1]??'');if(!/^\d{9}$/.test(mmsi)||/^0+$/.test(mmsi))return reject('vessel_mmsi_missing_or_invalid');
  if(item.provider!=='aisstream')return reject('unreviewed_vessel_provider');
  entityId='vessel:ais:mmsi:'+mmsi;kind='vessel';provider='aisstream';attributes={...attributes,mmsi,identity_scope:'provider_reported_mmsi_not_verified_hull',ship_type:Number.isInteger(item.ship_type)?item.ship_type:null,static_source:['cached_provider_static','current_subscription'].includes(item.static_source)?item.static_source:null,static_acquired_at:ontologyTime(item.static_acquired_at),static_observed_at:ontologyTime(item.static_observed_at)};identifiers=[{namespace:'ais_mmsi',value:mmsi}];notes.push('mmsi_may_be_reassigned_no_imo_join');
 }else if(item.kind==='satellite'){
  const id=part(item.id),collection=part(item.collection??'sentinel-2-l2a');if(!id||!collection||item.provider!=='earth_search')return reject('scene_identity_missing_or_unreviewed');
  entityId='satellite:stac:'+collection+':'+id;kind='satellite_scene';provider='earth_search';geometry=footprint(item.geometry);geometryRole='scene_footprint';precision=null;attributes={...attributes,collection,item_id:id,cloud_pct:Number.isFinite(item.cloud_pct)?item.cloud_pct:null,platform:clean(item.platform)||null,gsd_m:Number.isFinite(item.gsd_m)?item.gsd_m:null};notes=['scene_footprint_not_incident_evidence','preview_requires_explicit_user_action'];
 }else if(item.kind==='webcam'){
  const match=String(item.id??'').match(/^(windy_webcams_v3|us_road_cameras_official):(\d{1,30})$/);if(!match)return reject('camera_catalog_identity_missing');
  entityId='camera:'+match[1]+':'+match[2];kind='camera';provider=match[1];geometryRole='catalog_location';precision=null;attributes={...attributes,catalog_id:match[2],viewer_url:url,capture_time_known:false};identifiers=[{namespace:'camera_catalog',value:match[1]+':'+match[2]}];notes=['camera_catalog_not_recording','frame_capture_time_unknown'];
 }else return reject('unsupported_nearby_kind');
 if(geometry&&['aircraft','vessel'].includes(kind)){geometry={type:'Point',coordinates:geometry.coordinates.map(n=>Math.round(n*100)/100)};attributes.display_grid_degrees=.01;notes.push('coordinates_coarsened_about_1km_not_provider_accuracy');}
 if(!geometry)notes.push('no_source_geometry');
 if(item.observed_at!=null&&!observed)notes.push('invalid_observation_time_not_inferred');
 const capture=kind==='camera'?null:observed;
 return assemble({entityId,kind,label:clean(item.title),provider,url,attributes,identifiers,geometry,geometryRole,precision,measurements,observedAt:capture,acquiredAt:acquired,recordedAt:recorded,notes,status:['satellite_scene','camera'].includes(kind)?'documented':'reported'});
}
export function normalizeProviderBatch(items,options={}){
 const graph=emptyOntology(),diagnostics=[];const counts={fetched_count:Array.isArray(items)?items.length:0,normalized_count:0,accepted_count:0,rejected_count:0};
 if(!Array.isArray(items))return {graph,counts,diagnostics:['invalid_provider_batch']};
 const maps=Object.fromEntries(GROUPS.map(k=>[k,new Map()]));const keys={entities:'entity_id',identifiers:'identifier_id',observations:'observation_id',sources:'source_id',claims:'claim_id',evidence_links:'evidence_link_id',relations:'relation_id',anomalies:'candidate_id',module_runs:'module_run_id'};
 for(const item of items.slice(0,500)){
  const normalized=item?.kind==='ucdp'?normalizeUcdp(item,options):normalizeNearby(item,options);diagnostics.push(...normalized.diagnostics);
  if(!normalized.graph.observations.length){counts.rejected_count++;continue;}counts.normalized_count++;
  if(normalized.graph.observations.every(o=>maps.observations.has(o.observation_id))){counts.rejected_count++;diagnostics.push('duplicate_observation');continue;}counts.accepted_count++;
  for(const k of GROUPS)for(const row of normalized.graph[k]){const previous=maps[k].get(row[keys[k]]);if(k==='entities'&&previous)row.source_ids=[...new Set([...previous.source_ids,...row.source_ids])];maps[k].set(row[keys[k]],row);}
 }
 if(items.length>500){counts.rejected_count+=items.length-500;diagnostics.push('normalization_batch_limit');}
 for(const k of GROUPS)graph[k]=[...maps[k].values()];graph.as_of_utc=ontologyTime(options.recordedAt??options.queriedAt??options.acquiredAt);
 return {graph,counts,diagnostics:[...new Set(diagnostics)]};
}
