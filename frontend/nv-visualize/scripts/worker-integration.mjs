import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {build} from 'esbuild';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const built=await build({entryPoints:['../../services/cloudflare/worker.js'],bundle:true,format:'esm',platform:'browser',write:false,loader:{'.sql':'text'}});
// Diagnostics only inside the isolated mock runtime; production never reveals exception text.
const script=built.outputFiles[0].text.replace('"service_unavailable"','String(error.stack)');
let nimCalls=0;let profileId=82876856;let nimStatus=200;
const mf=new Miniflare(await convertV4MiniflareOptions({workers:[{name:'nv',modules:true,script,compatibilityDate:'2026-01-01',d1Databases:['DB'],bindings:{NV_INGEST_TOKEN:'test-internal',GITHUB_CLIENT_ID:'test-client',GITHUB_CLIENT_SECRET:'test-secret',GITHUB_ALLOWED_USER_IDS:'82876856',NVIDIA_API_KEY:'test-nim',NIM_ENABLED:'true',NIM_MODEL:'test-model',NIM_REVIEW_MODEL:'test-review'},outboundService:async request=>{
 const u=new URL(request.url);
 if(u.hostname==='github.com')return Response.json({access_token:'test-provider-token'});
 if(u.hostname==='api.github.com')return Response.json({id:profileId,login:'owner'});
 if(u.hostname==='integrate.api.nvidia.com'){nimCalls++;if(nimStatus!==200)return new Response('provider limit',{status:nimStatus});return Response.json({choices:[{message:{content:JSON.stringify({summary:[],alternatives:[],counterevidence:[],unknowns:[]})}}]});}
 return new Response('unexpected outbound',{status:500});
}}]}));
try {
 const db=await mf.getD1Database('DB');
 const origin='https://example.test';
 const req=(path,body,headers={})=>mf.dispatchFetch(origin+path,{redirect:'manual',method:body===undefined?'GET':'POST',headers:{...(body===undefined?{}:{'Content-Type':'application/json',Origin:origin}),...headers},body:body===undefined?undefined:JSON.stringify(body)});
 const internal=(path,body)=>req('/api/internal/'+path,body,{Authorization:'Bearer test-internal'});
 assert.equal((await req('/api/internal/start',{})).status,401);
 assert.equal((await req('/api/v2/ai/analyze',{case_id:'x'})).status,401);
 const snapshot={id:'snapshot:test',provider:'ucdp',expected:1,metadata:{coverage:'bounded test'}};
 assert.equal((await internal('start',snapshot)).status,200);
 assert.equal((await internal('publish',{id:snapshot.id})).status,409);
 const record={id:'ucdp:1',country:'Test',day:'2026-01-01',end_day:'2026-01-01',kind:'ucdp',version:'26.1',title:'reported',hash:'a'.repeat(64),lat:12,lon:22,low:0,best:0,high:0,precision:2,source_url:'https://ucdp.uu.se/'};
 assert.equal((await internal('batch',{id:snapshot.id,records:[record]})).status,200);
 const payload=JSON.parse(readFileSync('public/demo/alpha-case.json','utf8'));
 const exports={observed:readFileSync('public/exports/alpha-observed.zip').toString('base64'),all:readFileSync('public/exports/alpha-all.zip').toString('base64')};
 assert.equal((await internal('case',{id:snapshot.id,country:'Test',payload,exports})).status,200);
 assert.equal((await internal('batch',{id:snapshot.id,records:[record]})).status,200);
 assert.equal((await internal('publish',{id:snapshot.id})).status,200);
 assert.equal((await (await req('/api/v2/events')).json()).records.length,1);
 const exported=await req('/api/v2/cases/'+encodeURIComponent(payload.case.case_id)+'/export');assert.equal(exported.status,200);assert.equal(new Uint8Array(await exported.arrayBuffer())[0],80);
 // Incomplete replacement never changes the published head.
 await internal('start',{...snapshot,id:'snapshot:incomplete',expected:2});
 assert.equal((await internal('publish',{id:'snapshot:incomplete'})).status,409);
 assert.equal((await (await req('/api/v2/events')).json()).records.length,1);
 const start=await req('/api/auth/github');assert.equal(start.status,302);
 const redirect=new URL(start.headers.get('Location'));const state=redirect.searchParams.get('state');const stateCookie=start.headers.get('Set-Cookie').split(';')[0];
 assert.equal((await req('/api/auth/github/callback?state='+state+'&code=test')).status,400);
 const callback=await req('/api/auth/github/callback?state='+state+'&code=test',undefined,{Cookie:stateCookie});assert.equal(callback.status,302,await callback.clone().text());
 const session=callback.headers.getSetCookie().find(x=>x.startsWith('__Host-nv-session=')).split(';')[0];
 assert.equal((await req('/api/auth/github/callback?state='+state+'&code=test',undefined,{Cookie:stateCookie})).status,400);
 const me=await (await req('/api/auth/me',undefined,{Cookie:session})).json();assert.equal(me.user.user_id,'82876856');
 const nim=await req('/api/v2/admin/nim-test',{}, {Cookie:session});assert.equal(nim.status,200,await nim.clone().text());
 assert.equal((await req('/api/v2/admin/nim-test',{}, {Cookie:session})).status,200);assert.equal(nimCalls,1,'cache must avoid repeated NIM requests');
 assert.equal((await req('/api/v2/admin/nim-test',{}, {Cookie:session,Origin:'https://evil.test'})).status,403);
 profileId=999;
 const forbidden=await req('/api/auth/github');const forbiddenState=new URL(forbidden.headers.get('Location')).searchParams.get('state');
 assert.equal((await req('/api/auth/github/callback?state='+forbiddenState+'&code=test',undefined,{Cookie:forbidden.headers.get('Set-Cookie').split(';')[0]})).status,403);
 profileId=82876856;
 nimStatus=429;
 assert.equal((await req('/api/v2/ai/analyze',{case_id:payload.case.case_id},{Cookie:session})).status,429);
 const callsAfterPause=nimCalls;assert.equal((await req('/api/v2/ai/analyze',{case_id:payload.case.case_id},{Cookie:session})).status,429);assert.equal(nimCalls,callsAfterPause);
 await db.prepare("DELETE FROM settings WHERE key LIKE 'nim-paused:%'").run();nimStatus=200;
 // Race competing global reservations using actual D1 transactions.
 await db.prepare("INSERT OR REPLACE INTO quotas VALUES(date('now'),'nim',39)").run();
 const before=nimCalls;await Promise.all([internal('monitor-ai',{}),internal('monitor-ai',{})]);assert.equal(nimCalls-before,1,'concurrent requests must not exceed the global budget');
 const after=nimCalls;assert.equal((await internal('monitor-ai',{})).status,200);assert.equal(nimCalls,after,'cached results remain available after quota is exhausted');
 assert.equal((await db.prepare("SELECT count FROM quotas WHERE day=date('now') AND bucket='nim'").first()).count,40);
 await req('/api/auth/logout',{}, {Cookie:session});assert.equal((await (await req('/api/auth/me',undefined,{Cookie:session})).json()).user,null);
 console.log('Worker integration passed: actual D1, atomic publication, idempotence, OAuth state/session/CSRF, NIM cache/quotas, logout');
} finally {await mf.dispose();}
