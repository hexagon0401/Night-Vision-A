import {discoverMapillary,discoverWindy} from './media.js';
import {boundedJSON,bbox,item,shift,iso,temporal,safeURL,validGeometry} from './common.js';
export async function discover(p,r,now,env){
 if(p.id==='mapillary_street_photo')return discoverMapillary(r,now,env);
 if(p.id==='windy_webcams_v3')return discoverWindy(r,now,env);
 if(p.id==='ucdp_existing') {const i=item(p.id,'official_notice',r.id,r.title,r.source_url,now);i.attribution='UCDP';i.raw_source_ref=r.id;i.description='이미 게시된 UCDP 보고 기록. 개별 기사 인용은 원자료에 없으면 미확인.';i.warnings=['missing_primary_event_citation'];return [i];}
 if(p.id==='earth_search_stac') {
  const bounds=bbox(r);if(!bounds)throw new Error('geometry_required');
  const features=[];
  // Separate bounded searches guarantee an opportunity to retrieve both sides
  // of the incident interval rather than taking only the newest catalog page.
  for(const [start,end] of [[shift(r.day,-30),shift(r.day,-1)],[r.day,shift(r.end_day,30)]]) {
   const data=await boundedJSON('https://earth-search.aws.element84.com/v1/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({bbox:bounds,datetime:start+'T00:00:00Z/'+end+'T23:59:59Z',collections:['sentinel-2-l2a'],limit:3})},1000000,4500);
   if(!Array.isArray(data.features))throw new Error('invalid_stac');
   features.push(...data.features.slice(0,3).filter(f=>{const day=iso(f.properties?.datetime)?.slice(0,10);return day&&day>=start&&day<=end;}));
  }
  const data={features};
  return data.features.slice(0,12).flatMap(f=>{
   const t=iso(f.properties?.datetime);if(!t||t.slice(0,10)<shift(r.day,-30)||t.slice(0,10)>shift(r.end_day,30)||typeof f.id!=='string'||f.collection!=='sentinel-2-l2a')return [];
   const url='https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/'+encodeURIComponent(f.id);
   const i=item(p.id,'satellite',f.id,f.id,url,now);i.observed_from_utc=i.observed_to_utc=t;i.temporal_role=temporal(r,t);i.attribution='Copernicus Sentinel data / Element 84 Earth Search';
   const n=k=>Number.isFinite(f.properties[k])?f.properties[k]:null;
   i.satellite={platform:String(f.properties.platform??'Sentinel-2'),scene_id:f.id,collection:f.collection,gsd_m:n('gsd'),cloud_pct:n('eo:cloud_cover'),asset_url:null};
   // Footprints are metadata, not a newly inferred incident location.
   if(f.geometry&&validGeometry(f.geometry)&&JSON.stringify(f.geometry).length<10000)i.location.geometry_geojson=f.geometry;
   i.location.location_claim='scene_footprint';i.relation_reasons=['historical_search_window','bbox_candidate_not_event_proof'];i.warnings=['10m imagery cannot identify people or establish incident cause.','Before-event scenes have temporal_role unknown; acquisition time is shown.'];return [i];
  });
 }
 if(p.id==='us_road_cameras_official') {
  const key='context-caltrans-d4-catalog';const cached=await env.DB.prepare('SELECT value FROM settings WHERE key=?').bind(key).first();let catalog;
  if(cached&&JSON.parse(cached.value).expires>Date.now())catalog=JSON.parse(cached.value).rows;
  else {
   const raw=await boundedJSON('https://cwwp2.dot.ca.gov/data/d4/cctv/cctvStatusD04.json',{},3000000);
   if(!Array.isArray(raw.data))throw new Error('invalid_camera_catalog');
   catalog=raw.data.slice(0,3000).flatMap(row=>{const c=row.cctv,l=c?.location,lat=Number(l?.latitude),lon=Number(l?.longitude);return l&&Number.isFinite(lat)&&Number.isFinite(lon)&&lat>=32&&lat<=42&&lon>=-125&&lon<=-114?[{id:String(c.index),name:String(l.locationName??'Caltrans camera').slice(0,300),lat,lon,direction:String(l.direction??'unknown').slice(0,50)}]:[];});
   await env.DB.prepare('INSERT OR REPLACE INTO settings VALUES(?,?)').bind(key,JSON.stringify({expires:Date.now()+86400000,rows:catalog})).run();
  }
  const bounds=bbox(r);if(!bounds)throw new Error('geometry_required');
  return catalog.filter(c=>c.lon>=bounds[0]&&c.lon<=bounds[2]&&c.lat>=bounds[1]&&c.lat<=bounds[3]).slice(0,4).map(c=>{
   const i=item(p.id,'cctv',c.id,c.name,'https://cwwp2.dot.ca.gov/tools/cctv.html',now);i.attribution='Caltrans — CWWP2 (catalog metadata only)';i.publisher='California Department of Transportation';i.temporal_role='present_context';i.location={lat:c.lat,lon:c.lon,accuracy_m:null,geometry_geojson:null,location_claim:'provider_camera_catalog_location'};
   i.camera={camera_id:c.id,camera_type:'public_traffic',heading_deg:null,heading_confidence:'unknown',feed_mode:'link_only',frame_captured_at_utc:null};i.relation_reasons=['nearby_catalog_context_only'];i.warnings=['현재 공개 카탈로그 위치이며 과거 사건의 녹화 영상이 아닙니다.','촬영 시각·시야 방향은 검증되지 않았습니다. 공식 뷰어에서 카메라 이름을 확인하세요.'];return i;
  });
 }
 if(p.id==='gdelt_doc') {
  const quote=s=>'"'+s.replace(/[^\p{L}\p{N} -]/gu,' ').slice(0,100)+'"';
  const actors=(r.actors??[]).filter(Boolean).slice(0,2).map(quote);
  const terms=quote(r.country)+(actors.length?' ('+actors.join(' OR ')+')':'');
  const u=new URL('https://api.gdeltproject.org/api/v2/doc/doc');u.search=new URLSearchParams({query:terms,mode:'artlist',format:'json',maxrecords:'20',startdatetime:[shift(r.day,-14),shift(now.slice(0,10),-90)].sort().at(-1).replaceAll('-','')+'000000',enddatetime:shift(r.end_day,14).replaceAll('-','')+'235959'}).toString();
  const data=await boundedJSON(u.href);const seen=new Set();
  return (data.articles??[]).slice(0,20).flatMap((a,index)=>{const url=safeURL(a.url),day=typeof a.seendate==='string'?a.seendate.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,'$1-$2-$3T$4:$5:$6Z'):null,t=iso(day);if(!url||!t||t.slice(0,10)<shift(r.day,-14)||t.slice(0,10)>shift(r.end_day,14))return [];const title=String(a.title??'');const key=title.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');if(seen.has(key))return [];seen.add(key);const i=item(p.id,'article',String(index),title,url,now);i.published_at_utc=t;i.publisher=new URL(url).hostname;i.evidence_role='candidate';i.source_independence_group='unresolved:'+key.slice(0,100);i.temporal_role='unknown';i.warnings=['Metadata search candidate; original text and citation chain not verified.','GDELT seen time is an index timestamp, not a verified original publication time.'];i.published_at_utc=null;i.raw_source_ref=a.seendate;return [i];});
 }
 throw new Error('adapter_not_activated');
}
