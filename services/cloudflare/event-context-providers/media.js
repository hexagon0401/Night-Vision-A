import {boundedJSON,item,iso,temporal,safeURL} from './common.js';
export async function discoverMapillary(r,now,env){
 // Current Entity API requires bbox area <0.01 square degrees. This is a
 // limited search window, never an uncertainty radius or full regional coverage.
 const d=.02,bounds=[r.lon-d,r.lat-d,r.lon+d,r.lat+d];
 const url=new URL('https://graph.mapillary.com/images');url.search=new URLSearchParams({fields:'id,captured_at,geometry',bbox:bounds.join(','),limit:'10'}).toString();
 const data=await boundedJSON(url.href,{headers:{Authorization:'OAuth '+env.MAPILLARY_ACCESS_TOKEN}});
 if(data.error){const code=data.error.code;throw new Error(code===190?'upstream_authentication_failed':[10,200].includes(code)?'upstream_permission_denied':'upstream_invalid_response');}
 if(!Array.isArray(data.data))throw new Error('upstream_invalid_response');
 const seen=new Set();
 return data.data.slice(0,10).flatMap(photo=>{
  const id=String(photo.id??''),p=photo.geometry?.coordinates;
  if(seen.has(id)||!/^\d{1,30}$/.test(id)||photo.geometry?.type!=='Point'||!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite)||p[0]<bounds[0]||p[0]>bounds[2]||p[1]<bounds[1]||p[1]>bounds[3])return [];
  seen.add(id);
  const i=item('mapillary_street_photo','street_view',id,'공개 거리 사진 · '+id,'https://www.mapillary.com/app/?pKey='+id+'&focus=photo',now);
  const captured=Number.isFinite(photo.captured_at)&&photo.captured_at>0&&photo.captured_at<=Date.now()?iso(new Date(photo.captured_at).toISOString()):null;
  i.observed_from_utc=i.observed_to_utc=captured;i.temporal_role=temporal(r,captured);
  i.location={lat:p[1],lon:p[0],accuracy_m:null,geometry_geojson:null,location_claim:'provider_photo_location'};
  i.publisher='Mapillary';i.attribution='Mapillary contributors · 원출처에서 촬영자·이용 조건 확인';i.relation_reasons=['limited_point_neighborhood_context'];
  i.warnings=['보고 지점 주변 일부 영역의 거리 사진입니다. 사건 현장·동일 장면으로 확인한 자료가 아닙니다.','촬영 날짜가 사건 날짜와 다를 수 있습니다. 원본 사진은 Mapillary에서 확인하세요.'];return i;
 });
}
export async function discoverWindy(r,now,env){
 const radius=r.precision===1?15:25;
 const url=new URL('https://api.windy.com/webcams/api/v3/webcams');url.search=new URLSearchParams({nearby:[r.lat,r.lon,radius].join(','),include:'location,urls',limit:'4',lang:'ko'}).toString();
 const data=await boundedJSON(url.href,{headers:{'x-windy-api-key':env.WINDY_API_KEY}});
 if(!Array.isArray(data.webcams)||!Number.isFinite(data.total))throw new Error('upstream_invalid_response');
 const seen=new Set();
 return data.webcams.slice(0,4).flatMap(camera=>{
  const id=String(camera.webcamId??''),l=camera.location;
  if(seen.has(id)||!/^\d{1,30}$/.test(id)||camera.status!=='active'||!Number.isFinite(l?.latitude)||!Number.isFinite(l?.longitude)||Math.abs(l.latitude)>90||Math.abs(l.longitude)>180)return [];
  // Enforce the requested neighborhood even if the provider returns wider data.
  const rad=x=>x*Math.PI/180,a=rad(l.latitude-r.lat),b=rad(l.longitude-r.lon),h=Math.sin(a/2)**2+Math.cos(rad(r.lat))*Math.cos(rad(l.latitude))*Math.sin(b/2)**2;
  if(6371*2*Math.asin(Math.sqrt(Math.min(1,h)))>radius)return [];
  seen.add(id);
  const official=safeURL(camera.urls?.detail);let link=null;
  if(official){const u=new URL(official);if(u.hostname==='windy.com'||u.hostname.endsWith('.windy.com')){u.search='';u.hash='';link=u.href;}}
  const i=item('windy_webcams_v3','cctv',id,String(camera.title??'공개 카메라'),'https://webcams.windy.com/webcams/'+id,now);if(link)i.url=link;
  i.publisher='Windy.com';i.attribution='Webcams provided by Windy.com — https://www.windy.com/webcams/add';i.temporal_role='present_context';
  i.location={lat:l.latitude,lon:l.longitude,accuracy_m:null,geometry_geojson:null,location_claim:'provider_camera_catalog_location'};
  i.camera={camera_id:id,camera_type:'public_webcam',heading_deg:null,heading_confidence:'unknown',feed_mode:'link_only',frame_captured_at_utc:null};
  i.raw_source_ref=iso(camera.lastUpdatedOn);i.relation_reasons=['nearby_public_camera_context_only'];
  i.warnings=['현재 주변 공개 카메라입니다. 과거 사건 당시 녹화 영상이 아닙니다.','카탈로그 갱신 시각은 촬영 시각이 아닙니다. 영상·촬영 시각은 Windy 원출처에서 확인하세요.'];return i;
 });
}
