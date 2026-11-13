import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {parseAdsbRequest,normalizeAdsb,handleAdsbLolDO,parseRetryAfter} from '../adsb-lol.mjs';
const NOW=Date.parse('2026-11-13T00:00:00Z');
const fixture=JSON.parse(readFileSync(fileURLToPath(new URL('./fixtures/point.synthetic.json',import.meta.url)),'utf8'));
const fakeStorage=()=>{const store=new Map();return {get:async k=>store.get(k),put:async(k,v)=>{store.set(k,structuredClone(v));},store};};
const makeHub=(env={})=>({state:{storage:fakeStorage()},env:{ADSB_LOL_ENABLED:'true',ADSB_LOL_API_KEY:'TEST_ONLY_NOT_REAL',...env},adsbCache:new Map()});
const get=url=>new Request('https://nightvision.example/api/v2/adsb?'+url);
const apiResponse=(body=fixture,opts={})=>new Response(JSON.stringify(body),{status:opts.status??200,headers:opts.headers??{'Content-Type':'application/json'}});

test('endpoint allowlist and radius unit in nautical miles',()=>{
 assert.equal(parseAdsbRequest(get('mode=point&lat=37.5&lon=127&radius_nm=125').url).path,'/v2/point/37.5/127/125');
 assert.equal(parseAdsbRequest(get('mode=hex&value=aB12cd').url).path,'/v2/hex/AB12CD');
 assert.equal(parseAdsbRequest(get('mode=status').url).mode,'status');
 for(const query of ['mode=point&lat=100&lon=0','mode=point&lat=37&lon=127&radius_nm=251','mode=point&lat=NaN&lon=1','mode=hex&value=abc/evil','mode=evil','mode=reg&value=wrong%2Furl'])assert.throws(()=>parseAdsbRequest(get(query).url));
});
test('normalization preserves source and does not hallucinate positions/routes',()=>{
 const rows=normalizeAdsb(fixture,NOW);
 assert.equal(rows.length,2);assert.equal(rows[0].title,'KAL123');assert.equal(rows[0].aircraft_type,'B738');
 assert.equal(rows[0].position_source,'adsb_icao');assert.equal(rows[0].provider,'adsb.lol');
 assert.equal(rows[0].speed_knots,440.5);assert.equal(rows[0].observed_at,'2026-11-12T23:59:57.600Z');
 assert.equal(rows[1].on_ground,true);assert.equal(rows[1].speed_knots,0);assert.equal(rows[1].course_deg,0);
 for(const x of rows){assert.equal(x.route,undefined);assert.equal(x.is_military,undefined);assert.equal(x.destination,undefined);}
 assert.throws(()=>normalizeAdsb({...fixture,now:123},NOW));
});
test('first upstream call includes secret in header only, returns safe public JSON; cache saves quota',async()=>{
 const hub=makeHub();let calls=0;
 const fetchImpl=async(url,init)=>{calls++;assert.equal(new URL(url).hostname,'api.adsb.lol');assert.equal(init.headers['x-api-key'],'TEST_ONLY_NOT_REAL');assert(!url.includes('TEST_ONLY_NOT_REAL'));return apiResponse();};
 const req=get('mode=point&lat=37.5&lon=127&radius_nm=125');
 const a=await handleAdsbLolDO(req,hub,{fetchImpl,now:NOW});assert.equal(a.status,200);
 const x=await a.json();assert.equal(x.items.length,2);assert.equal(x.cached,false);assert(!JSON.stringify(x).includes('TEST_ONLY_NOT_REAL'));
 const b=await handleAdsbLolDO(req,hub,{fetchImpl,now:NOW+1000});assert.equal((await b.json()).cached,true);
 assert.equal(calls,1);assert.equal((await hub.state.storage.get('adsb:quota')).day.used,1);
});
test('single global rate gate, daily limit, UTC reset, no key',async()=>{
 const hub=makeHub({ADSB_LOL_DAILY_LIMIT:'1'});let calls=0;
 const fetchImpl=async()=>{calls++;return apiResponse({...fixture,now:calls===1?NOW:NOW+86400000});};
 const first=await handleAdsbLolDO(get('mode=hex&value=ab12cd'),hub,{fetchImpl,now:NOW});assert.equal(first.status,200);
 const gap=await handleAdsbLolDO(get('mode=hex&value=bb22dd'),hub,{fetchImpl,now:NOW+15000});
 assert.equal(gap.status,429);assert.equal((await gap.json()).status,'daily_budget');
 const reset=await handleAdsbLolDO(get('mode=hex&value=bb22dd'),hub,{fetchImpl,now:NOW+86400000});
 assert.equal(reset.status,200);assert.equal(calls,2);
 const missing=await handleAdsbLolDO(get('mode=hex&value=ab12cd'),makeHub({ADSB_LOL_API_KEY:''}),{fetchImpl,now:NOW});assert.equal(missing.status,503);
});
test('429 Retry-After persists in storage; no unintended retry',async()=>{
 const hub=makeHub();let calls=0;
 const fetchImpl=async()=>{calls++;return new Response('',{status:429,headers:{'Retry-After':'90'}});};
 const first=await handleAdsbLolDO(get('mode=hex&value=ab12cd'),hub,{fetchImpl,now:NOW});assert.equal(first.status,429);
 const second=await handleAdsbLolDO(get('mode=hex&value=bb22dd'),hub,{fetchImpl,now:NOW+32000});assert.equal(second.status,429);
 assert.equal(calls,1);assert.equal((await second.json()).status,'cooldown');assert.equal(parseRetryAfter('90',NOW),90);
});
test('global filters disabled by default; status probe makes no remote calls',async()=>{
 const hub=makeHub();const off=await handleAdsbLolDO(get('mode=mil'),hub,{now:NOW});assert.equal(off.status,403);
 const stat=await handleAdsbLolDO(get('mode=status'),hub,{now:NOW});assert.equal(stat.status,200);assert.equal((await stat.json()).quota.used,0);
});
test('untrusted schema and 5xx are contained and charged once',async()=>{
 const hub=makeHub();const r=await handleAdsbLolDO(get('mode=hex&value=ab12cd'),hub,{fetchImpl:async()=>apiResponse({hello:'world'}),now:NOW});
 assert.equal(r.status,502);assert.equal((await r.json()).error,'upstream_schema_invalid');assert.equal((await hub.state.storage.get('adsb:quota')).day.used,1);
});

test('provided account caps and local month/week tracking survive UTC day reset',async()=>{
 const hub=makeHub();let calls=0;
 const DAY_SHIFT=86400000;
 const first=await handleAdsbLolDO(get('mode=hex&value=ab12cd'),hub,{fetchImpl:async()=>{calls++;return apiResponse();},now:NOW});
 assert.equal(first.status,200);
 let q=await hub.state.storage.get('adsb:quota');
 assert.equal(q.day.used,1);assert.equal(q.month.used,1);assert(q.day.bytes>0);assert.equal(q.week.used,1);
 const second=await handleAdsbLolDO(get('mode=hex&value=bb22dd'),hub,{fetchImpl:async()=>apiResponse({...fixture,now:fixture.now+86400000}),now:NOW+DAY_SHIFT});
 assert.equal(second.status,200);
 q=await hub.state.storage.get('adsb:quota');
 assert.equal(q.day.used,1);assert.equal(q.month.used,2);assert(q.month.bytes>q.day.bytes);
});
test('monthly 10k request cap is guarded at a local 9500 and data at 3.4GB',async()=>{
 const hub=makeHub(),getReq=get('mode=hex&value=ab12cd');let calls=0;
 let r=await handleAdsbLolDO(get('mode=status'),hub,{now:NOW});assert.equal((await r.json()).quota.windows.month.provider_limit,10000);
 await hub.state.storage.put('adsb:quota',{month:{key:'2026-11',used:9500,bytes:0}});
 r=await handleAdsbLolDO(getReq,hub,{fetchImpl:async()=>{calls++;return apiResponse();},now:NOW});
 assert.equal(r.status,429);assert.equal((await r.json()).status,'monthly_budget');assert.equal(calls,0);
 await hub.state.storage.put('adsb:quota',{month:{key:'2026-11',used:0,bytes:3_399_000_000}});
 r=await handleAdsbLolDO(getReq,hub,{fetchImpl:async()=>{calls++;return apiResponse();},now:NOW});
 assert.equal(r.status,429);assert.equal((await r.json()).status,'monthly_data_budget');assert.equal(calls,0);
});
test('independent 30s, minute, hour, weekly caps and data windows are exposed',async()=>{
 const hub=makeHub();
 const r=await handleAdsbLolDO(get('mode=status'),hub,{now:NOW}),d=await r.json();
 assert.equal(d.quota.windows.s30.provider_limit,20);assert.equal(d.quota.windows.minute.provider_limit,120);
 assert.equal(d.quota.windows.hour.provider_limit,1000);assert.equal(d.quota.windows.week.provider_limit,5000);
 assert.equal(d.quota.data.provider_day_max_bytes,1_000_000_000);assert.equal(d.quota.data.provider_month_max_bytes,4_000_000_000);
 const s30=String(Math.floor(NOW/30000));
 await hub.state.storage.put('adsb:quota',{s30:{key:s30,used:18,bytes:0}});
 const blocked=await handleAdsbLolDO(get('mode=hex&value=ab12cd'),hub,{now:NOW,fetchImpl:async()=>{throw Error('must not run');}});
 assert.equal(blocked.status,429);assert.equal((await blocked.json()).status,'window_budget');
});
test('month-scale Retry-After and repeated 429 produce persistent manual-review stop',async()=>{
 const hub=makeHub();let calls=0;const now=NOW;
 const until=new Date(NOW+7*86400000).toUTCString();
 assert(parseRetryAfter(until,now)>=7*86400);
 const fetchImpl=async()=>{calls++;return new Response('',{status:429,headers:{'Retry-After':'60'}});};
 const a=await handleAdsbLolDO(get('mode=hex&value=ab12cd'),hub,{fetchImpl,now});assert.equal(a.status,429);
 const b=await handleAdsbLolDO(get('mode=hex&value=bb22dd'),hub,{fetchImpl,now:NOW+61000});assert.equal(b.status,503);
 assert.equal((await b.json()).status,'provider_paused');assert.equal(calls,2);
 const c=await handleAdsbLolDO(get('mode=hex&value=cc33ee'),hub,{fetchImpl,now:NOW+130000});assert.equal(c.status,503);assert.equal(calls,2);
});
