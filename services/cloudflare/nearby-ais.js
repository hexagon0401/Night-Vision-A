import {distance,validPoint,coarse} from './nearby-feeds.js';
export function aisTimestamp(value){
 if(typeof value!=='string')return null;const normalized=value.replace(' ','T').replace(/(\.\d{3})\d+/,'$1').replace(/ \+0000 UTC$/,'Z');const n=Date.parse(normalized);return Number.isFinite(n)?n:null;
}
const civilType=type=>Number.isInteger(type)&&(type>=60&&type<=89||[30,36,37,52].includes(type));
export function mergeAisStaticCache(messages,previous,now=Date.now()){
 const objects=new Map();
 for(const row of Array.isArray(previous?.objects)?previous.objects.slice(0,200):[]){
  const acquired=Date.parse(row?.acquired_at),expires=Date.parse(row?.expires_at);
  if(/^\d{9}$/.test(row?.mmsi??'')&&!/^0+$/.test(row.mmsi)&&civilType(row.type)&&Number.isFinite(acquired)&&Number.isFinite(expires)&&acquired<=now&&expires>now&&expires-acquired<=86400000)objects.set(row.mmsi,{mmsi:row.mmsi,type:row.type,name:String(row.name??'').slice(0,100),acquired_at:new Date(acquired).toISOString(),expires_at:new Date(expires).toISOString(),observed_at:typeof row.observed_at==='string'&&Number.isFinite(Date.parse(row.observed_at))?new Date(row.observed_at).toISOString():null});
 }
 const cached=[...objects.values()].map(row=>({MessageType:'ShipStaticData',MetaData:{MMSI:row.mmsi},Message:{ShipStaticData:{Valid:true,Type:row.type,Name:row.name}},_cached_static:true,_static_acquired_at:row.acquired_at,_static_observed_at:row.observed_at}));
 for(const m of messages){if(m?.MessageType!=='ShipStaticData')continue;const id=String(m.MetaData?.MMSI??''),r=m.Message?.ShipStaticData;if(!/^\d{9}$/.test(id)||/^0+$/.test(id)||r?.Valid!==true)continue;
  if(!civilType(r.Type)){objects.delete(id);continue;}const observed=aisTimestamp(m.MetaData?.time_utc);objects.set(id,{mmsi:id,type:r.Type,name:String(r.Name??'').trim().slice(0,100),acquired_at:new Date(now).toISOString(),expires_at:new Date(now+86400000).toISOString(),observed_at:observed&&observed<=now+10000?new Date(observed).toISOString():null});}
 const current=messages.map(m=>m?.MessageType==='ShipStaticData'?{...m,_static_acquired_at:new Date(now).toISOString()}:m);
 return {messages:[...cached,...current],cache:{schema_version:'ais-static-cache/1',objects:[...objects.values()].sort((a,b)=>b.acquired_at.localeCompare(a.acquired_at)).slice(0,200)}};
}
export function civilianShips(messages,q,now=Date.now()) {
 const types=new Map(),positions=new Map();
 for(const m of messages){if(!m||typeof m!=='object')continue;const id=String(m.MetaData?.MMSI??'');if(!/^\d{9}$/.test(id))continue;
  if(m.MessageType==='ShipStaticData'){const s=m.Message?.ShipStaticData;if(s?.Valid===true)types.set(id,{type:s.Type,name:String(s.Name??'').trim().slice(0,100),cached:m._cached_static===true,acquired_at:m._static_acquired_at??null,observed_at:m._static_observed_at??(aisTimestamp(m.MetaData?.time_utc)?new Date(aisTimestamp(m.MetaData.time_utc)).toISOString():null)});}
  if(m.MessageType==='PositionReport'){const p=m.Message?.PositionReport,t=aisTimestamp(m.MetaData?.time_utc);if(p?.Valid===true&&validPoint({lat:p.Latitude,lon:p.Longitude})&&t&&now-t>=-10000&&now-t<300000)if(!positions.has(id)||positions.get(id).time<=t)positions.set(id,{lat:p.Latitude,lon:p.Longitude,time:t,speed_knots:Number.isFinite(p.Sog)&&p.Sog>=0&&p.Sog<102.3?p.Sog:null,course_deg:Number.isFinite(p.Cog)&&p.Cog>=0&&p.Cog<360?p.Cog:null,heading_deg:Number.isInteger(p.TrueHeading)&&p.TrueHeading>=0&&p.TrueHeading<360?p.TrueHeading:null});}
 }
 const result=[];for(const [id,p]of positions){const s=types.get(id);if(!s||!civilType(s.type)||(q.bbox?!(p.lon>=q.bbox[0]&&p.lon<=q.bbox[2]&&p.lat>=q.bbox[1]&&p.lat<=q.bbox[3]):distance(q,p)>q.radius))continue;
  result.push({mmsi:id,speed_knots:p.speed_knots,course_deg:p.course_deg,heading_deg:p.heading_deg,ship_type:s.type,static_source:s.cached?'cached_provider_static':'current_subscription',static_acquired_at:s.acquired_at,static_observed_at:s.observed_at,identity_scope:'provider_reported_mmsi_not_verified_hull',id:'vessel:'+id,kind:'vessel',title:s.name||'민간 분류 선박',...coarse(p),observed_at:new Date(p.time).toISOString(),provider:'aisstream',source_url:'https://aisstream.io/',note:(s.cached?'이전에 수신한 민간 선종 정보와 이번 위치가 연결된 참고 자료':'선종·최근 위치가 함께 수신된 민간 분류 참고 자료')+' · 약 1km 단위 좌표 · 단일 표본이며 항로가 아님'});
 }const rows=result.slice(0,30);Object.defineProperty(rows,'provider_diagnostics',{value:{input_messages:messages.length,timed_positions:positions.size,classified_static_objects:types.size,accepted_objects:rows.length,unmatched_or_rejected_positions:Math.max(0,positions.size-rows.length),coverage:'request_scoped_sample'}});return rows;
}
export async function nearbyShips(q,env){
 // Request-scoped positions only. Optional cache retains civilian static classification, never positions.
 const cacheEnabled=(!!q.bbox||env.NV_ONTOLOGY_V2_ENABLED==='true')&&!!env.DB;let previous=null,cacheState=cacheEnabled?'empty':'disabled';
 if(cacheEnabled){try{const row=await env.DB.prepare('SELECT value FROM settings WHERE key=?').bind('ais-static:v1').first();previous=row?JSON.parse(row.value):null;cacheState=previous?'loaded':'empty';}catch{cacheState='unavailable';}}
 const d=q.radius/111,lon=d/Math.max(.2,Math.cos(q.lat*Math.PI/180));
 const response=await fetch('https://stream.aisstream.io/v0/stream',{headers:{Upgrade:'websocket'},redirect:'manual',signal:AbortSignal.timeout(4000)});
 if(response.status!==101||!response.webSocket)throw Error('upstream_websocket_unavailable');
 const ws=response.webSocket;ws.accept();const messages=[];
 try {
  await new Promise((resolve,reject)=>{
   const timer=setTimeout(resolve,6500);let total=0;
   const finish=()=>{clearTimeout(timer);resolve();};
   ws.addEventListener('close',()=>{clearTimeout(timer);reject(Error('upstream_websocket_closed'));},{once:true});ws.addEventListener('error',()=>{clearTimeout(timer);reject(Error('upstream_websocket_failed'));},{once:true});
   ws.addEventListener('message',event=>{
    if(typeof event.data!=='string'||event.data.length>50000)return;total+=event.data.length;
    if(total>1000000||messages.length>=200){finish();return;}
    try{const m=JSON.parse(event.data);if(m.error||m.Error){clearTimeout(timer);reject(Error('upstream_subscription_rejected'));return;}messages.push(m);}catch{}
   });
   ws.send(JSON.stringify({APIKey:env.AISSTREAM_API_KEY,BoundingBoxes:q.bbox?[[[q.bbox[1],q.bbox[0]],[q.bbox[3],q.bbox[2]]]]:[[[Math.max(-90,q.lat-d),Math.max(-180,q.lon-lon)],[Math.min(90,q.lat+d),Math.min(180,q.lon+lon)]]],FilterMessageTypes:['PositionReport','ShipStaticData']}));
  });
  const at=Date.now(),merged=cacheEnabled?mergeAisStaticCache(messages,previous,at):null;const rows=civilianShips(merged?.messages??messages,q,at);
  if(merged){try{await env.DB.prepare('INSERT OR REPLACE INTO settings(key,value) VALUES(?,?)').bind('ais-static:v1',JSON.stringify(merged.cache)).run();cacheState='updated';}catch{cacheState='unavailable';}}
  Object.defineProperty(rows,'source_diagnostics',{value:{...rows.provider_diagnostics,received_live_messages:messages.length,static_cache_state:cacheState,static_cache_objects:merged?.cache.objects.length??0,position_retention:'request_only'}});return rows;
 }finally{try{ws.close(1000,'sample complete');}catch{}}
}
