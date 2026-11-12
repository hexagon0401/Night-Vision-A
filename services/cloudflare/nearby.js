import {json,requireValue,stmt} from './core.js';
import {nearbyAircraft,nearbyCameras,nearbyScenes} from './nearby-feeds.js';
import {nearbyShips} from './nearby-ais.js';
export function nearbyQuery(url){
 const lat=Number(url.searchParams.get('lat')),lon=Number(url.searchParams.get('lon')),radius=Number(url.searchParams.get('radius')??25);
 requireValue(url.searchParams.has('lat')&&url.searchParams.has('lon')&&url.searchParams.get('lat')!==''&&url.searchParams.get('lon')!==''&&Number.isFinite(lat)&&Math.abs(lat)<=85&&Number.isFinite(lon)&&Math.abs(lon)<=179.5&&[10,25,50].includes(radius),'invalid_nearby_query');
 const type=url.searchParams.get('type')??'webcams';requireValue(['webcams','aircraft','vessels','satellite'].includes(type),'invalid_nearby_type');
 return {lat:Math.round(lat*100)/100,lon:Math.round(lon*100)/100,radius,type};
}
export async function nearbyRoute(request,env,url){
 requireValue(request.method==='GET','method_not_allowed',405);const q=nearbyQuery(url),now=new Date().toISOString(),key='nearby:v1:'+q.type+':'+q.lat+':'+q.lon+':'+q.radius;
 const base={schema_version:'nearby_context.v1',query:q,queried_at:now,status:'empty',items:[],note:q.type==='webcams'&&q.radius>25?'웹캠은 중심에서 최대 25km만 조회합니다. 사건 증거가 아니며 수신 누락·지연이 있을 수 있습니다.':'조회한 주변 현황이며 사건 증거가 아닙니다. 수신 누락·지연이 있을 수 있습니다.'};
 if(q.type==='vessels'&&!env.AISSTREAM_API_KEY)return json({...base,status:'key_required',reason:'AISSTREAM_API_KEY'});
 if(q.type==='webcams'&&!env.WINDY_API_KEY)return json({...base,status:'key_required',reason:'WINDY_API_KEY'});
 if((env.NEARBY_DISABLED_PROVIDERS??'').split(',').includes(q.type))return json({...base,status:'disabled'});
 const old=await stmt(env.DB,'SELECT value FROM settings WHERE key=?',key).first();if(old){const x=JSON.parse(old.value);if(x.expires>Date.now()&&(q.type!=='satellite'||x.body.items.every(i=>Object.hasOwn(i,'geometry'))))return json({...x.body,cached:true});}
 const epoch=Date.now(),job=key;let slot=null;
 for(let i=0;i<3;i++){try{if(await stmt(env.DB,'INSERT INTO context_locks VALUES(?,?,?) ON CONFLICT(slot) DO UPDATE SET job=excluded.job,expires=excluded.expires WHERE expires<? RETURNING slot',i,job,epoch+16000,epoch).first()){slot=i;break;}}catch{}}
 if(slot===null)return json({...base,status:'rate_limited',reason:'concurrency_limit'});
 try {
  const count=await stmt(env.DB,'SELECT COUNT(*) n FROM settings WHERE key LIKE ?','nearby:v1:%').first();if(count.n>=300&&!old){await stmt(env.DB,"DELETE FROM settings WHERE key IN (SELECT key FROM settings WHERE key LIKE 'nearby:v1:%' LIMIT 30)").run();}
  const quota=await stmt(env.DB,"INSERT INTO quotas VALUES(date('now'),?,1) ON CONFLICT(day,bucket) DO UPDATE SET count=count+1 WHERE count<200 RETURNING count",'nearby:'+q.type).first();if(!quota)return json({...base,status:'rate_limited',reason:'daily_provider_budget'});
  let body;
  try{const items=await(q.type==='aircraft'?nearbyAircraft(q):q.type==='vessels'?nearbyShips(q,env):q.type==='satellite'?nearbyScenes(q):nearbyCameras(q,env));body={...base,queried_at:new Date().toISOString(),status:items.length?'ok':'empty',items};}
  catch(e){body={...base,status:e.message==='rate_limited'?'rate_limited':'temporarily_failed',reason:/^(upstream_|stale_|invalid_)/.test(e.message)?e.message:'upstream_lookup_failed'};}
  const ttl=body.status==='ok'||body.status==='empty'?(q.type==='webcams'||q.type==='satellite'?3600000:30000):60000;
  await stmt(env.DB,'INSERT OR REPLACE INTO settings VALUES(?,?)',key,JSON.stringify({expires:Date.now()+ttl,body})).run();return json(body);
 }finally{await stmt(env.DB,'DELETE FROM context_locks WHERE slot=? AND job=?',slot,job).run();}
}
