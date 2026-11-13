// All inputs/providers below are synthetic. Isolated D1 only, no real requests.
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {sha} from '../services/cloudflare/core.js';
const require=createRequire(new URL('../frontend/nv-visualize/package.json',import.meta.url));
const {Miniflare,convertV4MiniflareOptions}=require('miniflare'),{build}=require('esbuild');
const root=new URL('../',import.meta.url);
const built=await build({entryPoints:[fileURLToPath(new URL('services/cloudflare/worker.js',root))],bundle:true,format:'esm',platform:'browser',write:false,loader:{'.sql':'text'}});
const script=built.outputFiles[0].text.replace('"service_unavailable"','String(error.stack)');
let nimCalls=0,extractCalls=0,badAI=false;
const configuration=flag=>convertV4MiniflareOptions({workers:[{name:'nv32-runtime-test',modules:true,script,compatibilityDate:'2026-01-01',d1Databases:['DB'],bindings:{NV_ONTOLOGY_V2_ENABLED:flag,GITHUB_ALLOWED_USER_IDS:'82876856',NIM_ENABLED:'true',NVIDIA_API_KEY_A:'SYNTHETIC_KEY',NIM_MODEL:'test-model',FIRECRAWL_API_KEY:'SYNTHETIC_EXTRACT_KEY',NV_EVIDENCE_EXTRACTION_ENABLED:'true',NV_EVIDENCE_ALLOWED_DOMAINS:'example.test'},outboundService:async request=>{
 const u=new URL(request.url);
 if(u.hostname==='integrate.api.nvidia.com'){nimCalls++;assert.equal(request.headers.get('Authorization'),'Bearer SYNTHETIC_KEY');return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({summary:[{text:'SYNTHETIC TEST ONLY',source_ids:['S1']}],alternatives:[],counterevidence:[],unknowns:[],...(badAI?{geometry:{type:'Point',coordinates:[1,1]}}:{})})}}]});}
 if(u.hostname==='api.firecrawl.dev'){extractCalls++;assert.equal(request.headers.get('Authorization'),'Bearer SYNTHETIC_EXTRACT_KEY');return Response.json({success:true,data:{markdown:'SYNTHETIC source text, not a real document.',metadata:{sourceURL:'https://example.test/original'}}});}
 throw Error('Unexpected external request in isolated test: '+u.hostname);
 }}]});
const mf=new Miniflare(await configuration('false'));
const req=(path,value,headers={})=>mf.dispatchFetch('https://example.test'+path,{method:value===undefined?'GET':'POST',headers:{...(value===undefined?{}:{'Content-Type':'application/json',Origin:'https://example.test'}),...headers},...(value===undefined?{}:{body:JSON.stringify(value)})});
const asJSON=async response=>{const value=await response.json();assert.equal(response.status,200,JSON.stringify(value));return value;};
try{
 assert.equal((await asJSON(await req('/api/v2/ontology/status'))).enabled,false);
 assert.equal((await req('/api/v2/ontology/objects')).status,503);
 let db=await mf.getD1Database('DB');
 // Prepared SQL is intentionally applied only here, never by Worker initialize.
 const ddl=(await readFile(new URL('docs/design/nv3.2/0004_ontology_v2.proposed.sql',root),'utf8')).replace(/^--.*$/gm,'').split(';').map(s=>s.trim()).filter(s=>s&&!s.startsWith('PRAGMA'));
 await db.batch(ddl.map(s=>db.prepare(s)));await db.batch(ddl.map(s=>db.prepare(s)));
 await mf.setOptions(await configuration('true'));db=await mf.getD1Database('DB');
 assert.equal((await asJSON(await req('/api/v2/ontology/status'))).ready,true);
 const now=new Date().toISOString(),token='a'.repeat(64),cookie='__Host-nv-session='+token;
 await db.prepare('INSERT INTO sessions VALUES(?,?,?,?)').bind(await sha(token),'82876856','synthetic-owner',Date.now()+600000).run();
 const record={id:'ucdp:9876',upstream_id:'9876',kind:'ucdp',country:'SYNTHETIC TEST',title:'SYNTHETIC TEST ONLY',day:'2026-11-01',end_day:'2026-11-02',version:'26.1',hash:'a'.repeat(64),precision:2,lat:12,lon:22,low:0,best:0,high:0,source_url:'https://example.test/original',acquired_at:now};
 await db.batch([db.prepare('INSERT INTO snapshots VALUES(?,?,?,?,?,?)').bind('snapshot:ontology-test','ucdp',now,1,'published','{}'),db.prepare('INSERT INTO heads VALUES(?,?)').bind('ucdp','snapshot:ontology-test'),db.prepare('INSERT INTO records VALUES(?,?,?,?,?,?,?,?)').bind('snapshot:ontology-test',record.id,record.country,record.day,record.lat,record.lon,'ucdp',JSON.stringify(record))]);
 assert.equal((await req('/api/v2/admin/ontology-sync',{source:'ucdp'})).status,401);
 assert.equal((await req('/api/v2/admin/ontology-sync',{source:'ucdp'},{Cookie:cookie,Origin:'https://evil.test'})).status,403);
 const sync=await asJSON(await req('/api/v2/admin/ontology-sync',{source:'ucdp'},{Cookie:cookie}));assert.equal(sync.counts.accepted_count,1);
 const list=await asJSON(await req('/api/v2/ontology/objects'));assert.equal(list.objects.length,1);assert.equal(list.feature_collection.features.length,0,'approximate event must not become a precise pin');
 const eventId=list.objects[0].entity_id,path='/api/v2/ontology/objects/'+encodeURIComponent(eventId);
 let detail=await asJSON(await req(path));assert.equal(detail.object.entity_id,eventId);assert.equal(detail.latest_observation.geometry,null);assert.equal(detail.claims.length,1);assert.equal(detail.claims[0].status,'reported');assert.equal(detail.diagnostics.historical_track_available,false);
 const sources=new Set(detail.sources.map(s=>s.source_id));assert.ok(detail.object.source_ids.every(id=>sources.has(id)));
 assert.equal((await req('/api/v2/ontology/objects?limit=201')).status,400);assert.equal((await req('/api/v2/ontology/objects/%ZZ')).status,400);
 assert.equal((await req(path+'/analyze',{})).status,401);assert.equal(nimCalls,0);
 const claimsBefore=(await db.prepare('SELECT count(*) n FROM nv2_claims').first()).n;
 const proposal=await asJSON(await req(path+'/analyze',{}, {Cookie:cookie}));assert.equal(proposal.canonical_promotion,false);assert.equal(proposal.analysis.status,'validated');assert.equal(nimCalls,1);
 const extract=await asJSON(await req(path+'/extract',{source_id:detail.sources[0].source_id},{Cookie:cookie}));assert.equal(extract.state,'unreviewed_source_text');assert.equal(extractCalls,1);
 assert.equal((await req(path+'/extract',{source_id:'source:invented'},{Cookie:cookie})).status,404);
 await db.prepare("DELETE FROM ai_results WHERE kind='ontology-proposal'").run();badAI=true;
 const withheld=await asJSON(await req(path+'/analyze',{}, {Cookie:cookie}));assert.equal(withheld.analysis.status,'withheld');assert.equal((await db.prepare('SELECT count(*) n FROM nv2_claims').first()).n,claimsBefore,'AI never mutates canonical claims');
 assert.equal((await asJSON(await req(path))).latest_observation.geometry,null,'AI geometry injection never changes location');
 const sample={id:'aircraft:SYN1',kind:'aircraft',icao24:'abc123',callsign:'SYN1',title:'SYNTHETIC AIRCRAFT',lat:35,lon:127,observed_at:new Date(Date.now()-60000).toISOString(),provider:'adsb_lol',source_url:'https://example.test/aircraft'};
 const cacheKey='nearby:v1:aircraft:35:127:25';
 const cache=async item=>db.prepare('INSERT OR REPLACE INTO settings VALUES(?,?)').bind(cacheKey,JSON.stringify({expires:Date.now()+60000,body:{status:'ok',queried_at:new Date().toISOString(),items:[item]}})).run();
 await cache(sample);await asJSON(await req('/api/v2/admin/ontology-sync',{source:'nearby'},{Cookie:cookie}));
 let air=await asJSON(await req('/api/v2/ontology/objects/aircraft%3Aicao24%3Aabc123'));assert.equal(air.timeline.length,1);
 await cache({...sample,lon:128,observed_at:new Date(Date.now()-30000).toISOString()});await asJSON(await req('/api/v2/admin/ontology-sync',{source:'nearby'},{Cookie:cookie}));
 air=await asJSON(await req('/api/v2/ontology/objects/aircraft%3Aicao24%3Aabc123'));assert.equal(air.timeline.length,1);assert.equal(air.sources.length,1,'obsolete transport provenance is not a public track');assert.equal(air.latest_observation.geometry.coordinates[0],128);
 await cache(sample);const stale=await asJSON(await req('/api/v2/admin/ontology-sync',{source:'nearby'},{Cookie:cookie}));assert.ok(stale.diagnostics.includes('ontology_stale_transport_sample'));
 await db.prepare("UPDATE nv2_entities SET privacy_class='restricted' WHERE entity_id='aircraft:icao24:abc123'").run();assert.equal((await req('/api/v2/ontology/objects/aircraft%3Aicao24%3Aabc123')).status,404);
 assert.equal((await req('/api/v2/ontology/sources/'+encodeURIComponent(air.sources[0].source_id))).status,404);
 // A cached search hit is a source-linked document candidate, not corroboration.
 const article={provider_id:'gdelt_doc',url:'https://example.test/article',title:'SYNTHETIC article candidate',publisher:'Synthetic publisher',published_at_utc:null,indexed_at_utc:now,acquired_at_utc:now};
 await db.prepare('INSERT INTO event_context_cache VALUES(?,?,?,?,?,?,?,?)').bind(record.id,'gdelt_doc',record.hash,'context:5:snapshot:ontology-test',now,new Date(Date.now()+60000).toISOString(),'ok',JSON.stringify({items:[article]})).run();
 await asJSON(await req('/api/v2/admin/ontology-sync',{source:'ucdp'},{Cookie:cookie}));detail=await asJSON(await req(path));assert.equal(detail.relations.length,1);assert.equal(detail.relations[0].resolution_state,'proposed');assert.equal(detail.relations[0].status,'unresolved');
 const docId=detail.relations[0].object_id,news=detail.sources.find(s=>s.url===article.url);assert.ok(news);assert.equal(news.published_at_utc,null);assert.equal(news.indexed_at_utc,now);assert.equal(news.independence_group,null);assert.equal(news.content_hash,null);
 await db.prepare("UPDATE nv2_entities SET privacy_class='restricted' WHERE entity_id=?").bind(docId).run();detail=await asJSON(await req(path));assert.equal(detail.relations.length,0);assert.ok(!detail.sources.some(s=>s.url===article.url),'restricted relation endpoint must not expose provenance');
 await mf.setOptions(await configuration('false'));const off=await asJSON(await req('/api/v2/ontology/status'));assert.equal(off.ready,false);assert.equal(off.objects,0);assert.equal((await req('/api/v2/ontology/objects')).status,503);
 assert.equal((await req('/api/v2/events?limit=1')).status,200,'legacy monitoring survives flag OFF');
 console.log('Ontology runtime passed: OFF/ON/OFF, auth/CSRF, migration gate, source refs, unresolved news candidates, provider sync, snapshot-only retention, source extraction, NIM proposals/withholding, privacy, legacy fallback.');
}finally{await mf.dispose();}
