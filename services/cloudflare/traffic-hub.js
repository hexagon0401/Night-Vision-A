import {bootstrapAdsb} from './adsb-bootstrap.mjs';
import {handleAdsbLolDO,adsbJson,adsbKey} from './adsb-lol.mjs';
import {configureAdsbAutopilot,runAdsbAutopilot,readAdsbAutopilotSnapshot,nextAutopilotDue} from './adsb-autopilot.mjs';
import {skyPolicy,skyNext,aisWindow} from './traffic-schedule.js';
import {shipRegistration} from './maritime-mid.js';
import {TrafficDelta} from './traffic-delta.js';
/** Shared, demand-driven world traffic. Latest samples only; no movement history. */
import {civilianShips,aisTimestamp} from './nearby-ais.js';
import {coarse} from './nearby-feeds.js';
import {boundedJSON} from './event-context-providers/common.js';
const trafficJSON=value=>Response.json(value,{headers:{'Cache-Control':'no-store'}});
export const TRAFFIC_LIMIT=10000;
const AIRLINE=/^(KAL|AAR|JJA|JNA|TWB|ABL|ESR|ASV|JAL|ANA|APJ|JJP|DAL|AAL|UAL|SWA|FFT|JBU|ACA|WJA|BAW|AFR|KLM|DLH|SWR|AUA|FIN|SAS|RYR|EZY|THY|SIA|CPA|CSN|CCA|CES|UAE|QTR|ETH|QFA|ANZ|LAN|TAM|AVA|AMX|VOI|VIV)\d[A-Z0-9]*$/;
export const direction=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<360?v:null;
export function globalAircraft(data,now=Date.now()){
 if(!Number.isFinite(data?.time)||Math.abs(now-data.time*1000)>180000||!Array.isArray(data.states))throw Error('invalid_global_aircraft');
 const result=new Map();for(const a of data.states.slice(0,30000)){
  if(!Array.isArray(a))continue;const [icao,call,,at,,lon,lat]=a,callsign=String(call??'').trim(),time=at*1000;
  if(!/^[a-f0-9]{6}$/.test(icao??'')||!AIRLINE.test(callsign)||typeof lat!=='number'||typeof lon!=='number'||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>85||Math.abs(lon)>180||!Number.isFinite(time)||now-time>120000||time>now+10000)continue;
  const item={id:'aircraft:'+icao,kind:'aircraft',icao24:icao,callsign,title:callsign,aircraft_type:null,...coarse({lat,lon}),observed_at:new Date(time).toISOString(),course_deg:direction(a[10]),heading_deg:null,speed_knots:typeof a[9]==='number'&&Number.isFinite(a[9])&&a[9]>=0?Math.round(a[9]*1.943844*10)/10:null,provider:'opensky',source_url:'https://opensky-network.org/',note:'공개 정기 항공 편명 기준 · 제공기관 보고 · 기종 미확인'};
  if(!result.has(icao)||Date.parse(result.get(icao).observed_at)<time)result.set(icao,item);
 }return [...result.values()].slice(0,TRAFFIC_LIMIT);
}
export class FleetMemory{
 constructor(){this.static=new Map();this.pending=new Map();this.visible=new Map();this.messages=0;}
 ingest(message,now=Date.now()){
  this.messages++;const id=String(message?.MetaData?.MMSI??'');if(!/^\d{9}$/.test(id)||/^0+$/.test(id))return;
  const embedded=message.Message?.[message.MessageType];
  if(message.MessageType==='ExtendedClassBPositionReport'&&embedded?.Valid===true&&Number.isInteger(embedded.Type)){this.ingest({MessageType:'ShipStaticData',MetaData:message.MetaData,Message:{ShipStaticData:{Valid:true,Type:embedded.Type,Name:embedded.Name}}},now);this.messages--;}
  if(message.MessageType==='StaticDataReport'&&embedded?.Valid===true){const previous=this.static.get(id)?.message.Message.ShipStaticData;const type=Number.isInteger(embedded.ReportB?.ShipType)?embedded.ReportB.ShipType:Number.isInteger(embedded.ReportB?.Type)?embedded.ReportB.Type:previous?.Type;if(Number.isInteger(type)){this.ingest({MessageType:'ShipStaticData',MetaData:message.MetaData,Message:{ShipStaticData:{Valid:true,Type:type,Name:embedded.ReportA?.Name??previous?.Name??''}}},now);this.messages--;}return;}
  if(message.MessageType==='ShipStaticData'&&message.Message?.ShipStaticData?.Valid===true){const s=message.Message.ShipStaticData;this.static.set(id,{message:{MessageType:'ShipStaticData',MetaData:{MMSI:id,time_utc:message.MetaData?.time_utc},Message:{ShipStaticData:{Valid:true,Type:s.Type,Name:String(s.Name??'').slice(0,100)}}},at:now});const type=message.Message.ShipStaticData.Type;if(type===35||type===55){this.pending.delete(id);this.visible.delete(id);}}
  if(['PositionReport','StandardClassBPositionReport','ExtendedClassBPositionReport'].includes(message.MessageType)){
   const raw=message.Message?.[message.MessageType],at=aisTimestamp(message.MetaData?.time_utc);if(raw?.Valid!==true||!Number.isFinite(raw.Latitude)||!Number.isFinite(raw.Longitude)||Math.abs(raw.Latitude)>85||Math.abs(raw.Longitude)>180||!at||now-at>=300000||at>now+10000)return;
   if(!this.pending.has(id)||this.pending.get(id).at<=at)this.pending.set(id,{message:{MessageType:'PositionReport',MetaData:{MMSI:id,time_utc:message.MetaData?.time_utc},Message:{PositionReport:{Valid:true,Latitude:raw.Latitude,Longitude:raw.Longitude,Sog:raw.Sog,Cog:raw.Cog,TrueHeading:raw.TrueHeading}}},at});
  }
  const p=this.pending.get(id),s=this.static.get(id);if(p&&s&&now-s.at<86400000){const rows=civilianShips([p.message,s.message],{lat:0,lon:0,radius:22000},now);if(rows[0])this.visible.set(id,{...rows[0],ship_name:s.message.Message.ShipStaticData.Name||null,...shipRegistration(id)});else this.visible.delete(id);}
  for(const map of [this.static,this.pending,this.visible])while(map.size>TRAFFIC_LIMIT)map.delete(map.keys().next().value);
 }
 snapshot(now=Date.now()){
  for(const [id,v] of this.pending)if(now-v.at>=300000){this.pending.delete(id);this.visible.delete(id);}
  for(const [id,v] of this.static)if(now-v.at>=86400000){this.static.delete(id);this.visible.delete(id);}
  return [...this.visible.values()].filter(v=>now-Date.parse(v.observed_at)<300000);
 }
}
export class TrafficHub{
 constructor(state,env){this.state=state;this.env=env;this.fleet=new FleetMemory();this.deltas={vessels:new TrafficDelta(300000),aircraft:new TrafficDelta(120000)};this.ws=null;this.connecting=null;this.air=null;this.airAt=0;this.airPending=null;this.lastDemand=0;this.lastFrame=null;this.connection='idle';this.lastError=null;this.retryAt=0;this.started=0;this.budget={day:'',seconds:0,messages:0,airRequests:0};state.blockConcurrencyWhile(async()=>{this.budget=await state.storage.get('budget')??this.budget;this.scheduledAis=await state.storage.get('ais:enabled')===true;const meta=await state.storage.get('air:meta');if(meta){this.scheduledAir=meta.scheduled===true;this.airAt=meta.at??0;const parts=await Promise.all(Array.from({length:Math.min(10,meta.parts??0)},(_,i)=>state.storage.get('air:'+i)));this.air=parts.flatMap(p=>Array.isArray(p)?p:[]);}const saved=await state.storage.get('static');for(const row of saved??[])if(Date.now()-row.at<86400000)this.fleet.static.set(row.id,{at:row.at,message:row.message});await bootstrapAdsb(this);});}
 resetDay(){const day=new Date().toISOString().slice(0,10);if(this.budget.day!==day)this.budget={day,seconds:0,messages:0,airRequests:0};}
 async save(){this.resetDay();if(this.started){this.budget.seconds+=(Date.now()-this.started)/1000;this.started=Date.now();}await this.state.storage.put('budget',this.budget);const saved=[...this.fleet.static].slice(-2000).map(([id,v])=>({id,...v}));await this.state.storage.put('static',saved);}
 stop(reason){clearTimeout(this.windowTimer);if(this.started){this.budget.seconds+=(Date.now()-this.started)/1000;this.started=0;}const ws=this.ws;this.ws=null;try{ws?.close(1000,'collector paused');}catch{}this.connection=reason;}
 async connect(){
  if(this.ws||this.connecting||Date.now()<this.retryAt)return;this.resetDay();
  if(!this.env.AISSTREAM_API_KEY){this.connection='key_required';return;}
  // Conservative free-plan duration/message ceilings; never auto-upgrade billing.
  if(this.budget.seconds>=1800||this.budget.messages>=1000000){this.connection='daily_budget';return;}
  if(this.scheduledAis&&!aisWindow(Date.now()).active){this.connection='scheduled_wait';return;}
  this.connecting=(async()=>{this.connection='connecting';const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),8000);let r;try{r=await fetch('https://stream.aisstream.io/v0/stream',{headers:{Upgrade:'websocket'},redirect:'manual',signal:abort.signal});}finally{clearTimeout(timer);}if(r.status!==101||!r.webSocket)throw Error('upstream_websocket_unavailable');const ws=r.webSocket;ws.accept();this.ws=ws;this.started=Date.now();this.connection='connected';this.lastError=null;if(this.scheduledAis){const window=aisWindow(Date.now());this.windowTimer=setTimeout(()=>{this.stop('scheduled_wait');this.state.waitUntil?.(this.save());},Math.max(1,Math.min(window.end-Date.now(),(1800-this.budget.seconds)*1000)));}
   ws.addEventListener('message',e=>{if(this.ws!==ws)return;let data=e.data;try{if(Object.prototype.toString.call(data)==='[object ArrayBuffer]'){if(data.byteLength>50000)return;data=new TextDecoder().decode(data);}if(typeof data!=='string'||data.length>50000)return;const m=JSON.parse(data);if(m.error||m.Error){this.lastError='upstream_subscription_rejected';this.retryAt=Date.now()+60000;this.stop('disconnected');return;}this.lastFrame=new Date().toISOString();this.budget.messages++;if(this.budget.messages>=1000000){this.stop('daily_budget');return;}this.fleet.ingest(m);}catch{}});
   const closed=()=>{if(this.ws===ws){if(this.started){this.budget.seconds+=(Date.now()-this.started)/1000;this.started=0;}this.ws=null;this.connection='disconnected';this.lastError='upstream_connection_closed';this.retryAt=Date.now()+15000;}};ws.addEventListener('close',closed);ws.addEventListener('error',closed);
   ws.send(JSON.stringify({APIKey:String(this.env.AISSTREAM_API_KEY).trim(),BoundingBoxes:[[[-85,-180],[85,180]]],FilterMessageTypes:['PositionReport','StandardClassBPositionReport','ExtendedClassBPositionReport','ShipStaticData','StaticDataReport']}));
  })().catch(()=>{this.connection='disconnected';this.lastError='upstream_connection_failed';this.retryAt=Date.now()+30000;}).finally(()=>{this.connecting=null;});return this.connecting;
 }
 async aircraft(){
  if(this.env.NV_AIRCRAFT_PROVIDER==='adsb_lol')return;
  if(this.airPending)return this.airPending;this.resetDay();const policy=skyPolicy(this.env,this.budget);if(Date.now()<skyNext(Date.now(),policy,this.budget))return;
  this.airPending=(async()=>{try{let headers={Accept:'application/json','User-Agent':'NightVision/3.2 (+https://nightvision.hexagon0401.workers.dev)'};this.airStage='configuration';if(this.env.OPENSKY_CLIENT_ID&&this.env.OPENSKY_CLIENT_SECRET){if(!this.token||Date.now()>=this.tokenUntil){this.airStage='oauth';const auth=await boundedJSON('https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Accept:'application/json','User-Agent':'NightVision/3.2 (+https://nightvision.hexagon0401.workers.dev)'},body:new URLSearchParams({grant_type:'client_credentials',client_id:this.env.OPENSKY_CLIENT_ID,client_secret:this.env.OPENSKY_CLIENT_SECRET}).toString()},30000,10000);if(typeof auth.access_token!=='string'||auth.access_token.length>10000)throw Error('upstream_invalid_oauth_response');this.token=auth.access_token;this.tokenUntil=Date.now()+Math.max(30,Math.min(3600,Number(auth.expires_in)||300)-30)*1000;}headers={...headers,Authorization:'Bearer '+this.token};}this.airStage='positions';this.budget.positionRequests=(this.budget.positionRequests??0)+1;if(this.budget.remainingCredits!==undefined)this.budget.remainingCredits=Math.max(0,this.budget.remainingCredits-4);this.budget.positionAt=Date.now();await this.state.storage.put('budget',this.budget);const d=await boundedJSON('https://opensky-network.org/api/states/all',{headers},6000000,15000,r=>{const raw=r.headers.get('X-Rate-Limit-Remaining');if(raw!==null&&Number.isFinite(Number(raw))){this.budget.remainingCredits=Math.max(0,Number(raw));if(this.env.OPENSKY_CLIENT_ID&&this.env.OPENSKY_CLIENT_SECRET)this.budget.confirmedCredits=Number(raw)>4000&&Number(raw)<=8000?8000:4000;}if(r.status===429){const raw=r.headers.get('X-Rate-Limit-Retry-After-Seconds')??r.headers.get('Retry-After');const seconds=Number(raw);this.budget.providerRetryAt=Date.now()+(Number.isFinite(seconds)&&seconds>0?seconds:3600)*1000;}});this.air=globalAircraft(d);this.airAt=Date.now();this.airError=null;this.airStage='ready';this.budget.failures=0;this.budget.failureRetryAt=0;await this.persistAir();}catch(error){this.airError=/^(upstream_|rate_limited|invalid_global_)/.test(error.message)?error.message:'upstream_aircraft_unavailable';this.airAt=Date.now();this.budget.failures=(this.budget.failures??0)+1;this.budget.failureRetryAt=Date.now()+Math.min(21600000,policy.interval_ms*2**Math.min(8,this.budget.failures));}finally{await this.state.storage.put('budget',this.budget);if(this.scheduledAir)await this.scheduleAir();}})().finally(()=>{this.airPending=null;});return this.airPending;
 }
 async persistAir(){const items=this.air??[];for(let at=0;at<items.length;at+=1000)await this.state.storage.put('air:'+at/1000,items.slice(at,at+1000));await this.state.storage.put('air:meta',{at:this.airAt,parts:Math.ceil(items.length/1000),scheduled:!!this.scheduledAir});}
 async scheduleAir(){return this.arm();}
 // Serialize manual calls, configuration and alarm work across all storage/network awaits.
 adsbWork(operation){const next=(this.adsbQueue??Promise.resolve()).catch(()=>{}).then(operation);this.adsbQueue=next.catch(()=>{});return next;}
 async adsbStatus(){
  const quota=await(await handleAdsbLolDO(new Request('https://traffic.internal/adsb?mode=status'),this)).json();
  const config=await this.state.storage.get('adsb:auto')??{enabled:false,regions:[],focus:null};
  const snapshot=await readAdsbAutopilotSnapshot(this);
  return adsbJson({...quota,collection:snapshot.schedule,provider_selected:this.env.NV_AIRCRAFT_PROVIDER==='adsb_lol',secret_binding:adsbKey(this.env)?(this.env['ADSB_API-KEY']?'ADSB_API-KEY':'ADSB_LOL_API_KEY'):null,config,next_alarm_at:await this.state.storage.getAlarm(),next_collection_at:this.env.NV_AIRCRAFT_PROVIDER==='adsb_lol'&&this.env.ADSB_LOL_ENABLED==='true'?nextAutopilotDue(config):null});
 }
 async arm(){
  const now=Date.now(),due=[],adsb=this.env.NV_AIRCRAFT_PROVIDER==='adsb_lol';
  if(this.scheduledAir&&!adsb)due.push(Math.max(now+1000,skyNext(now,skyPolicy(this.env,this.budget),this.budget)));
  if(adsb&&this.env.ADSB_LOL_ENABLED==='true'){const at=nextAutopilotDue(await this.state.storage.get('adsb:auto'),now);if(at!==null)due.push(at);}
  if(this.scheduledAis){const w=aisWindow(now);due.push(w.active?Math.min(now+30000,w.end):w.next_start);}
  if(due.length){const target=Math.max(now+1000,Math.min(...due)),existing=await this.state.storage.getAlarm();if(existing===null||existing<=now||target<existing)await this.state.storage.setAlarm(target);}
  else await this.state.storage.deleteAlarm();
 }
 async fetch(request){
  const url=new URL(request.url);
  if(url.pathname==='/adsb')return this.adsbWork(()=>handleAdsbLolDO(request,this));
  if(url.pathname==='/adsb-auto-status')return this.adsbWork(()=>this.adsbStatus());
  if(url.pathname==='/adsb-auto-config')return this.adsbWork(async()=>{
   if(request.method!=='POST')return adsbJson({error:'method_not_allowed'},405);
   let command;try{command=await request.json();}catch{return adsbJson({error:'invalid_autopilot_command'},400);}
   if(command.enabled&&(this.env.NV_AIRCRAFT_PROVIDER!=='adsb_lol'||this.env.ADSB_LOL_ENABLED!=='true'||!adsbKey(this.env)))return adsbJson({error:'runtime_configuration_required'},409);
   try{await configureAdsbAutopilot(this,command);}catch(e){return adsbJson({error:/^(invalid_|watch_regions_required)/.test(e.message)?e.message:'invalid_autopilot_command'},400);}
   await this.arm();return this.adsbStatus();
  });
  const kind=url.searchParams.get('type');const format=(payload)=>{if(url.searchParams.get('format')!=='delta')return trafficJSON(payload);const tracker=this.deltas[kind];tracker.update(payload.items);const {items,...meta}=payload;return trafficJSON({...meta,...tracker.response(url.searchParams.get('cursor'))});};if(!['vessels','aircraft'].includes(kind))return Response.json({error:'invalid_traffic_type'},{status:400});
  if(kind==='vessels'){if(!this.scheduledAis){this.scheduledAis=true;await this.state.storage.put('ais:enabled',true);}this.lastDemand=Date.now();await this.connect();await this.arm();const items=this.fleet.snapshot();return format({status:items.length?'ok':['key_required','daily_budget','scheduled_wait'].includes(this.connection)?this.connection:this.connection==='disconnected'?'temporarily_failed':'empty',items,queried_at:new Date().toISOString(),provider:'aisstream',schedule:{windows_per_day:24,seconds_per_window:75,next_window_at:new Date(aisWindow(Date.now()).next_start).toISOString(),window_active:aisWindow(Date.now()).active,source:'https://aisstream.io/documentation'},connection:this.connection,reason:this.lastError,source_diagnostics:{received_live_messages:this.fleet.messages,timed_positions:this.fleet.pending.size,classified_static_objects:this.fleet.static.size,accepted_objects:items.length,last_frame_at:this.lastFrame,coverage:'global_receiver_coverage_not_complete',collector:'shared_persistent_websocket',warmup:this.fleet.static.size===0},remaining_active_seconds:Math.max(0,Math.floor(1800-this.budget.seconds)),note:'전 세계 수신 범위의 최근 민간 선박 · 초기 선종 매칭 대기 · 수신되지 않은 선박은 표시하지 않음'});}
  if(this.env.NV_AIRCRAFT_PROVIDER==='adsb_lol'){const snapshot=await readAdsbAutopilotSnapshot(this);snapshot.runtime_enabled=this.env.ADSB_LOL_ENABLED==='true';return format(snapshot);}
  if(!this.scheduledAir){this.scheduledAir=true;await this.state.storage.put('air:meta',{at:this.airAt,parts:Math.ceil((this.air??[]).length/1000),scheduled:true});}await this.aircraft();await this.scheduleAir();const items=(this.air??[]).filter(s=>Date.now()-Date.parse(s.observed_at)<120000);return format({status:this.airError?'temporarily_failed':items.length?'ok':'empty',items,provider:'opensky',schedule:{...skyPolicy(this.env,this.budget),used_requests:this.budget.positionRequests??0,remaining_credits:this.budget.remainingCredits??null,next_request_at:new Date(Math.max(Date.now(),skyNext(Date.now(),skyPolicy(this.env,this.budget),this.budget))).toISOString(),source:'https://openskynetwork.github.io/opensky-api/rest.html#api-credits'},upstream_stage:this.airStage??null,credential_status:{client_id:!!this.env.OPENSKY_CLIENT_ID,client_secret:!!this.env.OPENSKY_CLIENT_SECRET,authenticated:!!this.token&&Date.now()<this.tokenUntil},queried_at:new Date(this.airAt||Date.now()).toISOString(),reason:this.airError??null,connection:this.airError?'disconnected':'snapshot',note:'OpenSky 전 세계 공개 정기 항공 편명 · 일일 크레딧 균등 분산 · 수신 범위/누락 있음'});
 }
 async alarm(){
  try{
   await this.save();this.fleet.snapshot();
   if(this.scheduledAis){if(!aisWindow(Date.now()).active)this.stop('scheduled_wait');else await this.connect();}
   if(this.env.NV_AIRCRAFT_PROVIDER==='adsb_lol')await this.adsbWork(()=>runAdsbAutopilot(this));
   else if(this.scheduledAir)await this.aircraft();
  }finally{await this.arm();}
 }

}
export async function trafficRoute(request,env,url){if(request.method!=='GET')return Response.json({error:'method_not_allowed'},{status:405});if(!env.TRAFFIC_HUB)return Response.json({status:'setup_required',items:[],reason:'traffic_hub_binding_required'},{status:503});const id=env.TRAFFIC_HUB.idFromName('public-world-v1');const target=new URL('https://traffic.internal/');for(const key of ['type','format','cursor'])if(url.searchParams.has(key))target.searchParams.set(key,url.searchParams.get(key));if(!target.searchParams.has('type'))target.searchParams.set('type','vessels');return env.TRAFFIC_HUB.get(id).fetch(target);}
