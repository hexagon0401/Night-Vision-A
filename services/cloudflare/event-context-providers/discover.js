import {boundedJSON,bbox,item,shift,iso,temporal,safeURL} from './common.js';
export async function discover(p,r,now){
 if(p.id==='ucdp_existing') {const i=item(p.id,'official_notice',r.id,r.title,r.source_url,now);i.attribution='UCDP';i.raw_source_ref=r.id;i.description='이미 게시된 UCDP 보고 기록. 개별 기사 인용은 원자료에 없으면 미확인.';i.warnings=['missing_primary_event_citation'];return [i];}
 if(p.id==='earth_search_stac') {
  const bounds=bbox(r);if(!bounds)throw new Error('geometry_required');
  const data=await boundedJSON('https://earth-search.aws.element84.com/v1/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({bbox:bounds,datetime:shift(r.day,-30)+'T00:00:00Z/'+shift(r.end_day,30)+'T23:59:59Z',collections:['sentinel-2-l2a'],limit:12})});
  if(!Array.isArray(data.features))throw new Error('invalid_stac');
  return data.features.slice(0,12).flatMap(f=>{
   const t=iso(f.properties?.datetime);if(!t||t.slice(0,10)<shift(r.day,-30)||t.slice(0,10)>shift(r.end_day,30)||typeof f.id!=='string'||f.collection!=='sentinel-2-l2a')return [];
   const url='https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/'+encodeURIComponent(f.id);
   const i=item(p.id,'satellite',f.id,f.id,url,now);i.observed_from_utc=i.observed_to_utc=t;i.temporal_role=temporal(r,t);i.attribution='Copernicus Sentinel data / Element 84 Earth Search';
   const n=k=>Number.isFinite(f.properties[k])?f.properties[k]:null;
   i.satellite={platform:String(f.properties.platform??'Sentinel-2'),scene_id:f.id,collection:f.collection,gsd_m:n('gsd'),cloud_pct:n('eo:cloud_cover'),asset_url:null};
   // Footprints are metadata, not a newly inferred incident location.
   if(f.geometry?.type==='Polygon'&&JSON.stringify(f.geometry).length<10000&&Array.isArray(f.geometry.coordinates)&&f.geometry.coordinates.flat(2).every(x=>Number.isFinite(x)&&Math.abs(x)<=180))i.location.geometry_geojson=f.geometry;
   i.location.location_claim='scene_footprint';i.relation_reasons=['historical_search_window','bbox_candidate_not_event_proof'];i.warnings=['10m imagery cannot identify people or establish incident cause.','Before-event scenes have temporal_role unknown; acquisition time is shown.'];return [i];
  });
 }
 if(p.id==='gdelt_doc') {
  const terms=[r.country,...(r.actors??[]).filter(Boolean).slice(0,2)].map(s=>'"'+s.replace(/[^\p{L}\p{N} -]/gu,' ').slice(0,100)+'"').join(' ');
  const u=new URL('https://api.gdeltproject.org/api/v2/doc/doc');u.search=new URLSearchParams({query:terms,mode:'artlist',format:'json',maxrecords:'20',startdatetime:shift(r.day,-14).replaceAll('-','')+'000000',enddatetime:shift(r.end_day,14).replaceAll('-','')+'235959'}).toString();
  const data=await boundedJSON(u.href);const seen=new Set();
  return (data.articles??[]).slice(0,20).flatMap((a,index)=>{const url=safeURL(a.url),day=typeof a.seendate==='string'?a.seendate.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,'$1-$2-$3T$4:$5:$6Z'):null,t=iso(day);if(!url||!t||t.slice(0,10)<shift(r.day,-14)||t.slice(0,10)>shift(r.end_day,14))return [];const title=String(a.title??'');const key=title.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');if(seen.has(key))return [];seen.add(key);const i=item(p.id,'article',String(index),title,url,now);i.published_at_utc=t;i.publisher=new URL(url).hostname;i.evidence_role='candidate';i.source_independence_group='unresolved:'+key.slice(0,100);i.temporal_role='unknown';i.warnings=['Metadata search candidate; original text and citation chain not verified.','GDELT seen time is an index timestamp, not a verified original publication time.'];i.published_at_utc=null;i.raw_source_ref=a.seendate;return [i];});
 }
 throw new Error('adapter_not_activated');
}
