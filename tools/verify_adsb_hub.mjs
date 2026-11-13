// Actual SQLite DO and production Worker auth; all source responses are synthetic.
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(new URL('../frontend/nv-visualize/package.json',import.meta.url));
const {Miniflare,convertV4MiniflareOptions}=require('miniflare'),{build}=require('esbuild');
const dir=fileURLToPath(new URL('../services/cloudflare/',import.meta.url));
const testEntry=`import app from './worker.js';import {TrafficHub} from './traffic-hub.js';
export class TestHub extends TrafficHub {
 async fetch(request){const u=new URL(request.url);if(u.pathname==='/__test'){
  const x=await request.json();globalThis.__nvTestNow=x.now;
  if(x.seed)for(const [k,v]of Object.entries(x.seed))await this.state.storage.put(k,v);
  if(x.alarm)await this.alarm();
  return Response.json({auto:await this.state.storage.get('adsb:auto'),quota:await this.state.storage.get('adsb:quota'),alarm:await this.state.storage.getAlarm()});
 }return super.fetch(request);}
}
export default app;`;
const built=await build({stdin:{contents:testEntry,resolveDir:dir},bundle:true,format:'esm',platform:'browser',write:false,loader:{'.sql':'text'},define:{'Date.now':'NV_TEST_NOW'},banner:{js:'const NV_TEST_NOW=()=>globalThis.__nvTestNow??Date.now();'}});
let calls=0,upstreamStatus=200;
// Keep fake alarms in the runtime's future; Miniflare clamps past alarms to wall time.
const T=Math.ceil(Date.now()/360000)*360000+86400000;
const persist=mkdtempSync(join(tmpdir(),'nv-adsb-test-'));
const options=convertV4MiniflareOptions({resourcePersistencePath:persist,workers:[{name:'adsb-test',modules:true,script:built.outputFiles[0].text,compatibilityDate:'2026-01-01',d1Databases:['DB'],bindings:{NV_AIRCRAFT_PROVIDER:'adsb_lol',ADSB_LOL_ENABLED:'true','ADSB_API-KEY':'SYNTHETIC_SECRET',GITHUB_ALLOWED_USER_IDS:'82876856'},durableObjects:{TRAFFIC_HUB:{className:'TestHub',useSQLite:true}},outboundService:async request=>{
 assert.equal(new URL(request.url).hostname,'api.adsb.lol','no OpenSky in selected mode');assert.equal(request.headers.get('x-api-key'),'SYNTHETIC_SECRET');assert.ok(!request.url.includes('SYNTHETIC_SECRET'));assert.match(new URL(request.url).pathname,/^\/v2\/(point|hex)\//);calls++;
 if(upstreamStatus!==200)return new Response('',{status:upstreamStatus,headers:{'Retry-After':'60'}});
 return Response.json({now:globalClock,ac:[{hex:'abc123',flight:'SYNTHETIC',r:'TEST-ONLY',t:'A320',type:'adsb_icao',lat:10,lon:20,seen_pos:0,gs:0,track:0}]});
}}]});
let mf=new Miniflare(options);
let globalClock=T;
try{
 const ns=await mf.getDurableObjectNamespace('TRAFFIC_HUB'),hub=ns.get(ns.idFromName('public-world-v1'));
 const ctl=async(now,extra={})=>{globalClock=now;return(await hub.fetch('https://traffic.internal/__test',{method:'POST',body:JSON.stringify({now,...extra})})).json();};
 const publicGet=async query=>(await mf.dispatchFetch('https://example.test/api/v2/traffic?type=aircraft'+(query??''))).json();
 const direct=async query=>hub.fetch('https://traffic.internal/adsb?'+query);
 const config=command=>hub.fetch('https://traffic.internal/adsb-auto-config',{method:'POST',body:JSON.stringify(command)});
 await ctl(T);assert.equal((await publicGet()).status,'setup_required');assert.equal(calls,0);
 const region={id:'synthetic',label:'SYNTHETIC TEST REGION',lat:10,lon:20,radius_nm:125};
 assert.equal((await config({enabled:true,regions:[]})).status,400);
 let r=await config({enabled:true,regions:[region]});assert.equal(r.status,200);let state=await ctl(T);assert.equal(state.auto.base_at,T+360000);assert.equal(state.alarm,T+360000);
 // No viewers are present when the real alarm handler runs.
 await ctl(T+360000,{alarm:true});assert.equal(calls,1);state=await ctl(T+360000,{alarm:true});assert.equal(calls,1,'duplicate alarm does not repeat source call');assert.equal(state.quota.day.used,1);
 const snapshot=await publicGet('&format=delta');assert.equal(snapshot.mode,'snapshot');assert.equal(snapshot.upserts.length,1);assert.equal(snapshot.upserts[0].speed_knots,0);assert.equal(snapshot.upserts[0].position_source,'adsb_icao');
 await Promise.all(Array.from({length:100},()=>publicGet('&format=delta&cursor='+encodeURIComponent(snapshot.cursor))));assert.equal(calls,1,'100 public clients cost zero upstream calls');
 const unchanged=await publicGet('&format=delta&cursor='+encodeURIComponent(snapshot.cursor));assert.equal(unchanged.upserts.length,0);assert.equal(unchanged.provider,'adsb.lol');assert.equal(unchanged.coverage,'selected_regions_only_receiver_dependent');assert.ok(!JSON.stringify(unchanged).includes('SYNTHETIC_SECRET'));
 // One manual request shares the scheduler budget; concurrent calls cannot bypass min-gap.
 await ctl(T+391000);const pair=await Promise.all([direct('mode=hex&value=abc123'),direct('mode=point&lat=11&lon=20&radius_nm=100')]);assert.deepEqual(pair.map(x=>x.status).sort(),[200,429]);assert.equal(calls,2);assert.equal((await ctl(T+391000)).quota.day.used,2);
 await ctl(T+481000);assert.equal((await publicGet()).items.length,0,'stale positions removed');
 // Authentication and CSRF use the production router and actual D1 session lookup.
 const req=(path,opts)=>mf.dispatchFetch('https://example.test'+path,opts);
 for(const path of ['/api/v2/adsb?mode=hex&value=abc123','/api/v2/adsb/admin/status'])assert.equal((await req(path)).status,401);
 assert.equal((await req('/api/v2/adsb/admin/config',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://example.test'},body:JSON.stringify({enabled:true,regions:[region]})})).status,401);
 const db=await mf.getD1Database('DB'),token='a'.repeat(64),hash=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))).toString('hex');
 await db.prepare('INSERT INTO sessions(hash,user_id,login,expires) VALUES(?,?,?,?)').bind(hash,'82876856','synthetic-owner',T+86400000).run();
 const headers={Cookie:'__Host-nv-session='+token,'Content-Type':'application/json'};
 assert.equal((await req('/api/v2/adsb/admin/config',{method:'POST',headers,body:JSON.stringify({enabled:false,regions:[region]})})).status,403);
 assert.equal((await req('/api/v2/adsb/admin/status',{headers})).status,200);
 assert.equal((await req('/api/v2/adsb?mode=hex&value=abc123',{headers})).status,403,'manual GET cannot be triggered cross-site');
 assert.equal((await req('/api/v2/adsb?mode=status',{headers})).status,200);assert.equal(calls,2);
 await db.prepare('UPDATE sessions SET user_id=? WHERE hash=?').bind('9999',hash).run();assert.equal((await req('/api/v2/adsb/admin/status',{headers})).status,401);await db.prepare('UPDATE sessions SET user_id=? WHERE hash=?').bind('82876856',hash).run();
 // Persisted Retry-After and permanent review stop are not reset by owner reconfiguration.
 upstreamStatus=429;await ctl(T+720000,{alarm:true});assert.equal(calls,3);state=await ctl(T+730000,{alarm:true});assert.equal(calls,3);assert.equal(state.quota.blockedUntil,T+780000);
 await ctl(T+1080000,{alarm:true});state=await ctl(T+1080000);assert.equal(calls,4);assert.equal(state.quota.manualReview,true);assert.equal(state.auto.enabled,false);
 await config({enabled:true,regions:[region]});await ctl(T+1440000,{alarm:true});assert.equal(calls,4);assert.equal((await ctl(T+1440000)).auto.enabled,false,'reconfiguration cannot erase provider review pause');
 const stop=await req('/api/v2/adsb/admin/config',{method:'POST',headers:{...headers,Origin:'https://example.test'},body:JSON.stringify({enabled:false,regions:[region]})});assert.equal(stop.status,200);
 const ais=await(await mf.dispatchFetch('https://example.test/api/v2/traffic?type=vessels')).json();assert.equal(ais.status,'key_required');assert.equal(ais.source_diagnostics.collector,'shared_persistent_websocket');assert.ok((await ctl(T+1440000)).alarm,'AIS alarm survives ADS-B stop');
 await mf.dispose();mf=new Miniflare(options);const coldNS=await mf.getDurableObjectNamespace('TRAFFIC_HUB'),cold=coldNS.get(coldNS.idFromName('public-world-v1'));
 await cold.fetch('https://traffic.internal/__test',{method:'POST',body:JSON.stringify({now:T+1440000})});
 const restored=await(await cold.fetch('https://traffic.internal/adsb-auto-status')).json();assert.equal(restored.quota.used,4);assert.equal(restored.provider_paused,true);assert.equal(restored.config.enabled,false);assert.ok(restored.next_alarm_at,'shared alarm persists across actual runtime restart');assert.equal(calls,4);
 await mf.dispose();const bootOptions={...options,resourcePersistencePath:join(persist,'bootstrap'),workers:options.workers.map(w=>({...w,config:{...w.config,env:{...w.config.env}}}))};
 const bindings=bootOptions.workers[0].config.env;bindings.ADSB_LOL_AUTOSTART_ID={...bindings.ADSB_LOL_ENABLED,value:'synthetic-bootstrap'};bindings.ADSB_LOL_WATCHLIST_JSON={...bindings.ADSB_LOL_ENABLED,value:JSON.stringify([region])};
 mf=new Miniflare(bootOptions);const bootNS=await mf.getDurableObjectNamespace('TRAFFIC_HUB'),bootHub=bootNS.get(bootNS.idFromName('public-world-v1'));
 const boot=await(await bootHub.fetch('https://traffic.internal/adsb-auto-status')).json();assert.equal(boot.config.enabled,true);assert.equal(boot.config.regions.length,1);assert.ok(boot.next_alarm_at);assert.equal(calls,4,'bootstrap arms but never fetches immediately');
 console.log('ADSB SQLite integration passed: owner auth/CSRF, actual alarm, shared serialized quota, 100 read-only viewers, deltas, stale removal, retry pause and AIS isolation.');
}finally{await mf.dispose();rmSync(persist,{recursive:true,force:true});}
