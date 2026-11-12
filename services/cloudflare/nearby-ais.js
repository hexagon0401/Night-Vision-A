import {distance,validPoint,coarse} from './nearby-feeds.js';
export function aisTimestamp(value){
 if(typeof value!=='string')return null;const normalized=value.replace(' ','T').replace(/(\.\d{3})\d+/,'$1').replace(/ \+0000 UTC$/,'Z');const n=Date.parse(normalized);return Number.isFinite(n)?n:null;
}
export function civilianShips(messages,q,now=Date.now()) {
 const types=new Map(),positions=new Map();
 for(const m of messages){const id=String(m.MetaData?.MMSI??'');if(!/^\d{9}$/.test(id))continue;
  if(m.MessageType==='ShipStaticData'){const s=m.Message?.ShipStaticData;if(s?.Valid===true)types.set(id,{type:s.Type,name:String(s.Name??'').trim().slice(0,100)});}
  if(m.MessageType==='PositionReport'){const p=m.Message?.PositionReport,t=aisTimestamp(m.MetaData?.time_utc);if(p?.Valid===true&&validPoint({lat:p.Latitude,lon:p.Longitude})&&t&&now-t>=-10000&&now-t<300000)positions.set(id,{lat:p.Latitude,lon:p.Longitude,time:t});}
 }
 const result=[];for(const [id,p]of positions){const s=types.get(id);if(!s||!(s.type>=60&&s.type<=89||[30,36,37,52].includes(s.type))||distance(q,p)>q.radius)continue;
  result.push({id:'vessel:'+id,kind:'vessel',title:s.name||'민간 분류 선박',...coarse(p),observed_at:new Date(p.time).toISOString(),provider:'aisstream',source_url:'https://aisstream.io/',note:'선종·최근 위치가 함께 수신된 민간 분류 참고 자료 · 약 1km 단위 좌표'});
 }return result.slice(0,30);
}
export async function nearbyShips(q,env){
 // Request-scoped sample only: no background listener, retained track or relay.
 const d=q.radius/111,lon=d/Math.max(.2,Math.cos(q.lat*Math.PI/180));
 const response=await fetch('https://stream.aisstream.io/v0/stream',{headers:{Upgrade:'websocket'},redirect:'manual',signal:AbortSignal.timeout(4000)});
 if(response.status!==101||!response.webSocket)throw Error('upstream_websocket_unavailable');
 const ws=response.webSocket;ws.accept();const messages=[];
 try {
  await new Promise((resolve,reject)=>{
   const timer=setTimeout(resolve,6500);let total=0;
   const finish=()=>{clearTimeout(timer);resolve();};
   ws.addEventListener('close',finish,{once:true});ws.addEventListener('error',()=>{clearTimeout(timer);reject(Error('upstream_websocket_failed'));},{once:true});
   ws.addEventListener('message',event=>{
    if(typeof event.data!=='string'||event.data.length>50000)return;total+=event.data.length;
    if(total>1000000||messages.length>=200){finish();return;}
    try{const m=JSON.parse(event.data);if(m.error||m.Error){clearTimeout(timer);reject(Error('upstream_subscription_rejected'));return;}messages.push(m);}catch{}
   });
   ws.send(JSON.stringify({APIKey:env.AISSTREAM_API_KEY,BoundingBoxes:[[[Math.max(-90,q.lat-d),Math.max(-180,q.lon-lon)],[Math.min(90,q.lat+d),Math.min(180,q.lon+lon)]]],FilterMessageTypes:['PositionReport','ShipStaticData']}));
  });
  return civilianShips(messages,q);
 }finally{try{ws.close(1000,'sample complete');}catch{}}
}
