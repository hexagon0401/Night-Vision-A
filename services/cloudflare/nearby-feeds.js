import {boundedJSON,iso,validGeometry} from './event-context-providers/common.js';
import {discoverWindy} from './event-context-providers/media.js';
export const distance=(a,b)=>{const rad=x=>x*Math.PI/180,h=Math.sin(rad(b.lat-a.lat)/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(rad(b.lon-a.lon)/2)**2;return 12742*Math.asin(Math.sqrt(Math.min(1,h)));};
export const validPoint=p=>Number.isFinite(p?.lat)&&Number.isFinite(p?.lon)&&Math.abs(p.lat)<=90&&Math.abs(p.lon)<=180;
export const coarse=p=>({lat:Math.round(p.lat*100)/100,lon:Math.round(p.lon*100)/100});
const AIRLINES=/^(KAL|AAR|JJA|JNA|TWB|ABL|ESR|ASV|JAL|ANA|APJ|JJP|DAL|AAL|UAL|SWA|FFT|JBU|ACA|WJA|BAW|AFR|KLM|DLH|SWR|AUA|FIN|SAS|RYR|EZY|THY|SIA|CPA|HDA|CSN|CCA|CES|UAE|QTR|ETH|QFA|ANZ|LAN|TAM|AVA|AMX|VOI|VIV)\d[A-Z0-9]*$/;
const AIRLINER=/^(A(19|20|21|22|23|25|26|30|31|32|33|34|35|36|38)|B(73|38|39|74|75|76|77|78)|BCS[13]|E(17|19)|AT[47]|DH8)/;
export function civilianAircraft(data,q,now=Date.now()) {
 if(!Array.isArray(data.ac)||!Number.isFinite(data.now)||Math.abs(now-data.now)>180000)throw Error('stale_aircraft_snapshot');
 const seen=new Set();const result=data.ac.slice(0,500).flatMap(a=>{
  if(!a||typeof a!=='object')return [];
  const flight=String(a.flight??'').trim(),p={lat:a.lat,lon:a.lon},age=Number(a.seen_pos),observed=data.now-age*1000;const icao24=/^[a-f0-9]{6}$/i.test(String(a.hex??''))&&!/^0{6}$/.test(String(a.hex))?String(a.hex).toLowerCase():null;const identity=icao24??'callsign:'+flight;
  if(!AIRLINES.test(flight)||!AIRLINER.test(String(a.t??''))||!a.r||((Number(a.dbFlags)||0)&1)||!validPoint(p)||!Number.isFinite(age)||age<0||now-observed>120000||observed>now+10000||distance(q,p)>q.radius||seen.has(identity))return [];
  seen.add(identity);return [{icao24,canonical_entity_id:icao24?'aircraft:icao24:'+icao24:null,legacy_id:'aircraft:'+flight,callsign:flight,aircraft_type:String(a.t),identity_scope:icao24?'icao24':'callsign_only_not_canonical',id:'aircraft:'+flight,kind:'aircraft',title:flight+' · '+String(a.t),...coarse(p),observed_at:new Date(observed).toISOString(),provider:'adsb_lol',source_url:'https://www.adsb.lol/',license:'ODbL-1.0',license_url:'https://opendatacommons.org/licenses/odbl/1-0/',note:'정기 민간 항공 편명·기종 기준을 통과한 참고 자료 · 좌표는 약 1km 단위로 표시'}];
 }).slice(0,30);
 const callsigns=new Map();for(const row of result)callsigns.set(row.callsign,(callsigns.get(row.callsign)??0)+1);
 return result.map(row=>callsigns.get(row.callsign)>1?{...row,id:row.id+':'+(row.icao24??'unresolved')}:row);
}
export async function nearbyAircraft(q) {
 const data=await boundedJSON(`https://api.adsb.lol/v2/lat/${q.lat}/lon/${q.lon}/dist/${Math.ceil(q.radius/1.852)}`);
 return civilianAircraft(data,q);
}
export async function nearbyCameras(q,env){
 const items=await discoverWindy({lat:q.lat,lon:q.lon,precision:q.radius<=15?1:2},new Date().toISOString(),env);
 return items.filter(i=>distance(q,i.location)<=Math.min(q.radius,25)).map(i=>({id:i.id,kind:'webcam',title:i.title,lat:i.location.lat,lon:i.location.lon,observed_at:null,provider:'windy',source_url:i.url,note:'공개 웹캠의 카탈로그 위치 · 촬영 시각·영상은 원출처에서 확인',attribution:i.attribution}));
}
export async function nearbyScenes(q){
 const d=Math.min(q.radius,25)/111,bbox=[Math.max(-180,q.lon-d/Math.max(.2,Math.cos(q.lat*Math.PI/180))),Math.max(-90,q.lat-d),Math.min(180,q.lon+d/Math.max(.2,Math.cos(q.lat*Math.PI/180))),Math.min(90,q.lat+d)];
 const end=new Date(),start=new Date(end.getTime()-60*86400000);
 const data=await boundedJSON('https://earth-search.aws.element84.com/v1/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({bbox,datetime:start.toISOString()+'/'+end.toISOString(),collections:['sentinel-2-l2a'],limit:4,sortby:[{field:'properties.datetime',direction:'desc'}]})});
 if(!Array.isArray(data.features))throw Error('invalid_stac');
 return data.features.slice(0,4).flatMap(f=>{
  const captured=iso(f.properties?.datetime);if(!captured||captured<start.toISOString()||captured>end.toISOString()||!/^S2[ABC]_\w{5}_\d{8}_\d+_L2A$/.test(f.id??''))return [];
  return [{collection:'sentinel-2-l2a',platform:typeof f.properties.platform==='string'?f.properties.platform:null,gsd_m:Number.isFinite(f.properties.gsd)?f.properties.gsd:null,geometry:validGeometry(f.geometry)&&['Polygon','MultiPolygon'].includes(f.geometry?.type)&&JSON.stringify(f.geometry).length<10000?f.geometry:null,id:f.id,kind:'satellite',title:'Copernicus Sentinel-2 · '+captured.slice(0,10),observed_at:captured,provider:'earth_search',source_url:'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/'+f.id,cloud_pct:Number.isFinite(f.properties['eo:cloud_cover'])?Math.round(f.properties['eo:cloud_cover']*10)/10:null,note:'해당 지역이 포함된 위성 타일의 저해상도 미리보기 · 실시간 사진이 아님',attribution:'Copernicus Sentinel data / Element 84 Earth Search'}];
 });
}
