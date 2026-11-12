import {test,expect} from 'vitest';
import {normalizeNearby,normalizeUcdp} from '../../../services/cloudflare/ontology-provider.js';
import {validateOntologyGraph,publicObservation,safeSourceURL} from '../../../services/cloudflare/ontology-validation.js';
import {runtimeCapabilities,executeWithReceipt,validateRelationProposals} from '../../../services/cloudflare/nv2-runtime.js';
const now='2026-11-12T08:00:00Z';
const sample=()=>normalizeNearby({id:'aircraft:SYN1',icao24:'abc123',callsign:'SYN1',kind:'aircraft',title:'SYNTHETIC TEST ONLY',provider:'adsb_lol',source_url:'https://example.test/',lat:35,lon:127,observed_at:now},{queriedAt:now,recordedAt:now}).graph;
test('frozen graph server validation rejects missing sources, malformed geometry and private publication',()=>{
 const g=sample();expect(validateOntologyGraph(g)).toBe(g);g.observations[0].geometry.coordinates=[999,1];expect(()=>validateOntologyGraph(g)).toThrow();
 const missing=sample();missing.observations[0].source_ids=['source:ghost'];expect(()=>validateOntologyGraph(missing)).toThrow();
 const person=sample();person.entities[0].kind='person_public';expect(()=>validateOntologyGraph(person)).toThrow();
});
test('map publication gates do not turn unknown license or inference into a position',()=>{
 const g=sample();expect(publicObservation(g.entities[0],g.observations[0],g.sources)).toBe(true);g.sources[0].license_status='pending';expect(publicObservation(g.entities[0],g.observations[0],g.sources)).toBe(false);g.sources[0].license_status='metadata_only';g.observations[0].status='inferred';expect(publicObservation(g.entities[0],g.observations[0],g.sources)).toBe(false);
});
test('source links cannot leak credentials',()=>{
 expect(safeSourceURL('https://user:password@example.test/')).toBe(null);expect(safeSourceURL('https://example.test/?api_key=private')).toBe(null);expect(safeSourceURL('javascript:alert(1)')).toBe(null);
});
test('runtime capability flags never claim a separate module execution service exists',()=>{
 expect(runtimeCapabilities({NV2_RUNTIME_MCP_ENABLED:'true'}).remote_module_execution_available).toBe(false);
});
test('server receipts are created only after actual work and hash the actual output',async()=>{
 let called=false;const r=await executeWithReceipt({module:'test-only',caseId:'case:test',input:{x:1},task:'synthetic-check'},async()=>{called=true;return {x:2}});expect(called).toBe(true);expect(r.execution.input_hash).toMatch(/^[a-f0-9]{64}$/);expect(r.execution.result_hash).not.toBe(r.execution.input_hash);expect(r.execution.executor).toBe('deterministic_adapter');expect(r.execution.receipt_scope).toContain('not_independent_remote');
});
test('model relation proposals cannot promote facts, add locations or cite missing entities',()=>{
 const context={entityIds:new Set(['entity:a','entity:b']),sourceIds:new Set(['source:a'])};const r={relation_id:'relation:a',subject_id:'entity:a',object_id:'entity:b',predicate:'RELATED_TO',source_ids:['source:a'],status:'inferred',resolution_state:'proposed',valid_from_utc:null,valid_to_utc:null};expect(validateRelationProposals([r],context)).toHaveLength(1);expect(()=>validateRelationProposals([{...r,resolution_state:'accepted'}],context)).toThrow();expect(()=>validateRelationProposals([{...r,geometry:{}}],context)).toThrow();expect(()=>validateRelationProposals([{...r,source_ids:['source:fake']}],context)).toThrow();
});

test('repeated news candidates retain one document and unresolved source-linked relationships',async()=>{
 const {attachNewsCandidate}=await import('../../../services/cloudflare/ontology-evidence.js');
 const g=normalizeUcdp({kind:'ucdp',id:'ucdp:123',upstream_id:'123',version:'26.1',title:'SYNTHETIC',country:'TEST',day:'2026-11-01',end_day:'2026-11-01',hash:'a'.repeat(64),precision:2,lat:35,lon:127,low:0,best:0,high:0,source_url:'https://example.test/original',acquired_at:now},{recordedAt:now}).graph;
 const item={provider_id:'gdelt_doc',url:'https://example.test/news',title:'SYNTHETIC CANDIDATE',indexed_at_utc:now,acquired_at_utc:now};await attachNewsCandidate(g,item);await attachNewsCandidate(g,item);
 expect(validateOntologyGraph(g)).toBe(g);expect(g.entities).toHaveLength(2);expect(g.relations).toHaveLength(1);expect(g.relations[0].status).toBe('unresolved');const s=g.sources.find(s=>s.url===item.url);expect(s.published_at_utc).toBe(null);expect(s.indexed_at_utc).toBe(new Date(now).toISOString());expect(s.content_hash).toBe(null);expect(s.independence_group).toBe(null);
});
