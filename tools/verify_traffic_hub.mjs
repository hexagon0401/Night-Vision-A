// Isolated SQLite Durable Object, synthetic upstream only; no real collection.
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const require=createRequire(new URL('../frontend/nv-visualize/package.json',import.meta.url));
const {Miniflare,convertV4MiniflareOptions}=require('miniflare'),{build}=require('esbuild');
const built=await build({entryPoints:[fileURLToPath(new URL('../services/cloudflare/worker.js',import.meta.url))],bundle:true,format:'esm',platform:'browser',write:false,loader:{'.sql':'text'}});
let calls=0;const mf=new Miniflare(convertV4MiniflareOptions({workers:[{name:'traffic-test',modules:true,script:built.outputFiles[0].text,compatibilityDate:'2026-01-01',durableObjects:{TRAFFIC_HUB:{className:'TrafficHub',useSQLite:true}},outboundService:async request=>{assert.equal(new URL(request.url).hostname,'opensky-network.org');calls++;const now=Date.now()/1000;return Response.json({time:now,states:[['abc123','KAL123','SYNTHETIC',now,now,129,35,null,false,100,90]]});}}]}));
try{
 const get=type=>mf.dispatchFetch('https://example.test/api/v2/traffic?type='+type);
 const first=await get('aircraft');assert.equal(first.status,200);const body=await first.json();assert.equal(body.items.length,1);assert.equal(body.items[0].course_deg,90);assert.equal(body.items[0].heading_deg,null);assert.equal(body.provider,'opensky');assert.equal(first.headers.get('Cache-Control'),'no-store');
 await get('aircraft');assert.equal(calls,1,'global upstream request is shared/cached');
 const delta=await(await mf.dispatchFetch('https://example.test/api/v2/traffic?type=aircraft&format=delta')).json();assert.equal(delta.mode,'snapshot');assert.equal(delta.upserts.length,1);assert.equal(delta.items,undefined);const next=await(await mf.dispatchFetch('https://example.test/api/v2/traffic?type=aircraft&format=delta&cursor='+encodeURIComponent(delta.cursor))).json();assert.equal(next.mode,'delta');assert.equal(next.upserts.length,0);assert.equal(calls,1);

 const vessels=await(await get('vessels')).json();assert.equal(vessels.status,'key_required');assert.equal(vessels.source_diagnostics.collector,'shared_persistent_websocket');assert.equal(calls,1);
 assert.equal((await get('invalid')).status,400);
 console.log('Traffic integration passed: actual SQLite DO binding, world aircraft normalization/cache, missing AIS key, status/error and no-store boundaries.');
}finally{await mf.dispose();}
