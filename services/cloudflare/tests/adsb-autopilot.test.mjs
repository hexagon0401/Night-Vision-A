import test from 'node:test';
import assert from 'node:assert/strict';
import {alignNext,BASE_INTERVAL_MS,FOCUS_INTERVAL_MS,FOCUS_MAX_CALLS_PER_DAY,validateWatchRegions,configureAdsbAutopilot,runAdsbAutopilot,readAdsbAutopilotSnapshot,adaptiveInterval,nextAutopilotDue} from '../adsb-autopilot.mjs';

const T=Date.UTC(2026,10,13,0,1,0);
const region={id:'synthetic_region_1',label:'Synthetic only',lat:10,lon:20,radius_nm:125};
function makeHub(){
 const map=new Map();return {env:{ADSB_LOL_ENABLED:'true',ADSB_LOL_API_KEY:'MOCK_KEY_ONLY',NV_AIRCRAFT_PROVIDER:'adsb_lol',ADSB_LOL_DAILY_LIMIT:'300'},
  state:{storage:{get:async k=>map.get(k),put:async(k,v)=>{map.set(k,structuredClone(v));}}},map};
}
function fakeResponse({now,positionAge=0,header={}}){
 const data={now:Math.floor(now/1000),ac:[{hex:'abc123',flight:'TEST100',lat:10,lon:20,seen_pos:positionAge,gs:0,track:0,type:'adsb_icao',t:'A320'}]};
 return Response.json(data,{headers:header});
}
test('6-minute baseline is 240 slots per UTC day; focus 90 sec is 40/h',()=>{
 assert.equal(UTCslots(),240);assert.equal(3600000/FOCUS_INTERVAL_MS,40);
 function UTCslots(){return 86400000/BASE_INTERVAL_MS;}
});
test('region validation prevents arbitrary/unsafe upstream queries',()=>{
 assert.throws(()=>validateWatchRegions([{...region,radius_nm:251}]));
 assert.throws(()=>validateWatchRegions([{...region,id:'bad/region'}]));
 assert.throws(()=>validateWatchRegions([{...region,id:'focus'}]));
 assert.throws(()=>validateWatchRegions([region,region]));
 assert.equal(validateWatchRegions([region])[0].lon,20);
});
test('owner must explicitly configure a region to activate scheduled calls',async()=>{
 const hub=makeHub();assert.equal((await runAdsbAutopilot(hub,{now:T,fetchImpl:()=>{throw Error('must not run');}})).status,'idle');
 await assert.rejects(configureAdsbAutopilot(hub,{enabled:true,regions:[]},{now:T}),/watch_regions_required/);
});
test('DO schedule persists, skips missed slots, and restarts without catch-up',async()=>{
 const hub=makeHub();await configureAdsbAutopilot(hub,{enabled:true,regions:[region]},{now:T});
 const due=(await hub.state.storage.get('adsb:auto')).base_at;
 assert.equal(due,alignNext(T));
 let fetchCalls=0;
 const mk=(now)=>async()=>{fetchCalls++;return fakeResponse({now});};
 const a=await runAdsbAutopilot(hub,{now:due,fetchImpl:mk(due)});
 assert.equal(a.status,'ok');assert.equal(fetchCalls,1);
 const res=await readAdsbAutopilotSnapshot(hub,{now:due+3000});
 assert.equal(res.status,'ok');assert.equal(res.items[0].provider,'adsb.lol');
 const mid=await runAdsbAutopilot(hub,{now:due+60000,fetchImpl:mk(due+60000)});
 assert.equal(mid.status,'not_due');assert.equal(fetchCalls,1);
 const late=due+5*BASE_INTERVAL_MS+10_000;
 const after=await runAdsbAutopilot(hub,{now:late,fetchImpl:mk(late)});
 assert.equal(after.status,'ok');assert.equal(fetchCalls,2,'one call, not five missed calls');
});
test('120-sec freshness rule prevents stale last-known positions from posing as live',async()=>{
 const hub=makeHub();await configureAdsbAutopilot(hub,{enabled:true,regions:[region]},{now:T});const due=alignNext(T);
 await runAdsbAutopilot(hub,{now:due,fetchImpl:async()=>fakeResponse({now:due})});
 assert.equal((await readAdsbAutopilotSnapshot(hub,{now:due+119_000})).items.length,1);
 assert.equal((await readAdsbAutopilotSnapshot(hub,{now:due+121_000})).items.length,0);
});
test('focus interval runs by 90-sec slots and shares the underlying daily quota',async()=>{
 const hub=makeHub();await configureAdsbAutopilot(hub,{enabled:true,regions:[region],focus:{enabled:true,mode:'hex',value:'ABC123'}},{now:T});
 const a=await runAdsbAutopilot(hub,{now:T+FOCUS_INTERVAL_MS,fetchImpl:async()=>fakeResponse({now:T+FOCUS_INTERVAL_MS})});
 assert.equal(a.source,'focus');assert.equal(a.status,'ok');
 const b=await runAdsbAutopilot(hub,{now:T+FOCUS_INTERVAL_MS+10_000,fetchImpl:()=>{throw Error('unexpected');}});
 assert.equal(b.status,'not_due');
 assert.equal((await hub.state.storage.get('adsb:auto')).focus_used,1);
});
test('focus cap, and baseline round-robin for multiple regions',async()=>{
 const hub=makeHub();const second={...region,id:'synthetic_region_2',lat:11};
 await configureAdsbAutopilot(hub,{enabled:true,regions:[region,second],focus:{enabled:true,mode:'point',lat:10,lon:20}},{now:T});
 let cfg=await hub.state.storage.get('adsb:auto');cfg.focus_used=FOCUS_MAX_CALLS_PER_DAY;await hub.state.storage.put('adsb:auto',cfg);
 const due=cfg.base_at;
 const first=await runAdsbAutopilot(hub,{now:due,fetchImpl:async()=>fakeResponse({now:due})});
 assert.equal(first.source,region.id);
 const next=alignNext(due);
 const secondRun=await runAdsbAutopilot(hub,{now:next,fetchImpl:async()=>fakeResponse({now:next})});
 assert.equal(secondRun.source,second.id);
});
test('response size pacing extends interval to protect the 4GB/month data cap',()=>{
 assert.equal(adaptiveInterval({now:T,ema_bytes:null}),BASE_INTERVAL_MS);
 assert.ok(adaptiveInterval({now:T,ema_bytes:1_300_000})>BASE_INTERVAL_MS);
 assert.ok(adaptiveInterval({now:T,ema_bytes:10_000,month_bytes:3_399_999_000})>=BASE_INTERVAL_MS);
});
test('provider Retry-After skips future alarms and preserves required pause',async()=>{
 const hub=makeHub();await configureAdsbAutopilot(hub,{enabled:true,regions:[region]},{now:T});const due=alignNext(T);
 let n=0;const no=async()=>{n++;return new Response('rate limit',{status:429,headers:{'Retry-After':'3600'}})};
 const a=await runAdsbAutopilot(hub,{now:due,fetchImpl:no});assert.equal(a.status,'rate_limited');assert.equal(n,1);
 const b=await runAdsbAutopilot(hub,{now:due+600_000,fetchImpl:no});assert.equal(b.status,'not_due');assert.equal(n,1);
 assert.ok(nextAutopilotDue(await hub.state.storage.get('adsb:auto'),due+1000)>=due+3600000);
});
test('key-disabled runtime is not a successful scheduled collection',async()=>{
 const hub=makeHub();await configureAdsbAutopilot(hub,{enabled:true,regions:[region]},{now:T});hub.env.ADSB_LOL_ENABLED='false';
 assert.equal((await runAdsbAutopilot(hub,{now:alignNext(T),fetchImpl:()=>{throw Error('must not run');}})).status,'runtime_disabled');
});
test('month rollover does not keep prior month byte counter',async()=>{
 const hub=makeHub();const t=Date.UTC(2026,10,30,23,49);
 await configureAdsbAutopilot(hub,{enabled:true,regions:[region]},{now:t});
 let cfg=await hub.state.storage.get('adsb:auto');cfg.meter_month='2026-10';cfg.last_month_bytes=1_500_000_000;cfg.ema_bytes=100000;await hub.state.storage.put('adsb:auto',cfg);
 const due=alignNext(t);await runAdsbAutopilot(hub,{now:due,fetchImpl:async()=>fakeResponse({now:due})});
 const after=await hub.state.storage.get('adsb:auto');assert.equal(after.meter_month,'2026-11');assert.ok(after.last_month_bytes<1_000_000);
});
