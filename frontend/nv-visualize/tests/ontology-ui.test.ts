// @vitest-environment jsdom
import {afterEach,expect,test,vi} from 'vitest';
import {SelectionStore,featurePick,readDossier,validGeometry,type Dossier} from '../src/monitor/ontology/selection-store';
import {mountDossier,sourceLink,redactedJSON} from '../src/monitor/ontology/dossier';
import {mountOntology,readCatalog,isMappedLegacyEvent} from '../src/monitor/ontology/workbench';
import type {MapPort} from '../src/map/renderer';
const sid='source:synthetic:test';
const observation=(id:string)=>({observation_id:'obs:'+id,entity_id:id,provider_id:'synthetic',observed_at_utc:'2026-11-12T08:00:00Z',acquired_at_utc:'2026-11-12T08:01:00Z',recorded_at_utc:'2026-11-12T08:02:00Z',source_ids:[sid],status:'reported' as const,geometry:{type:'Point' as const,coordinates:[127,35] as [number,number]},geometry_source_id:sid,geometry_role:'provider_reported_position' as const,precision_m:1000,visibility_policy:'public' as const,measurements:{},quality_notes:[]});
function dossier(id='vessel:synthetic:test'):Dossier{return {schema_version:'nv-dossier/2.0',synthetic:true,object:{entity_id:id,kind:id.startsWith('aircraft:')?'aircraft':'vessel',display_name:'SYNTHETIC <img src=x onerror=alert(1)>',status:'reported',privacy_class:'non_sensitive_public_context',attributes:{},source_ids:[sid]},identifiers:[],latest_observation:observation(id),timeline:[observation(id)],claims:[],relations:[],sources:[{source_id:sid,url:'https://example.org/synthetic',publisher:'SYNTHETIC',content_hash:null,original_or_derived:'original',derived_from_source_id:null,independence_group:'synthetic',published_at_utc:null,indexed_at_utc:null,acquired_at_utc:'2026-11-12T08:01:00Z',license_status:'metadata_only',access_status:'metadata_only'}],anomalies:[],coverage:{total_observations:1},diagnostics:{historical_track_available:false}};}
afterEach(()=>{document.body.replaceChildren();vi.unstubAllGlobals();});

test('feature identity requires namespaced ID, known kind/status and source IDs',()=>{
 expect(featurePick({object_id:'vessel:synthetic:1',kind:'vessel',status:'reported',source_ids:[sid]})).toEqual({object_id:'vessel:synthetic:1',kind:'vessel'});
 expect(featurePick({object_id:'<script>',kind:'vessel',status:'reported',source_ids:[sid]})).toBeNull();
 expect(featurePick({object_id:'vessel:synthetic:1',kind:'vessel',status:'verified',source_ids:[sid]})).toBeNull();
 expect(featurePick({object_id:'vessel:synthetic:1',kind:'vessel',status:'reported',source_ids:[]})).toBeNull();
 expect(featurePick({object_id:'vessel:synthetic:1',object_kind:'vessel',status:'reported',source_ids:JSON.stringify([sid])})).not.toBeNull();
});

test('dossier rejects a different object, invalid geometry and missing geometry source',()=>{
 const d=dossier();expect(readDossier(d,d.object.entity_id)).toBe(d);
 expect(()=>readDossier(d,'vessel:other')).toThrow('식별자');
 const missing=structuredClone(d);missing.latest_observation!.source_ids=['source:missing'];expect(()=>readDossier(missing,d.object.entity_id)).toThrow('출처');
 const wrong=structuredClone(d);(wrong.latest_observation!.geometry as any).coordinates=[181,0];expect(()=>readDossier(wrong,d.object.entity_id)).toThrow('지오메트리');
 const owner=structuredClone(d);owner.latest_observation!.geometry_source_id='source:missing';expect(()=>readDossier(owner,d.object.entity_id)).toThrow('지오메트리');
});

test('geometry validates real finite coordinates and closed nonempty polygons only',()=>{
 expect(validGeometry({type:'Point',coordinates:[0,0]})).toBe(true);
 expect(validGeometry({type:'Point',coordinates:[true,3]})).toBe(false);
 expect(validGeometry({type:'Point',coordinates:[NaN,3]})).toBe(false);
 expect(validGeometry({type:'Polygon',coordinates:[]})).toBe(false);
 expect(validGeometry({type:'Polygon',coordinates:[[[0,0],[1,0],[1,1],[0,1]]]})).toBe(false);
 expect(validGeometry({type:'Polygon',coordinates:[[[0,0],[1,0],[1,1],[0,0]]]})).toBe(true);
});

test('selecting a second object aborts the first and ignores its delayed response',async()=>{
 const pending=new Map<string,{resolve:(d:Dossier)=>void;signal:AbortSignal}>();
 const store=new SelectionStore((id,signal)=>new Promise(resolve=>pending.set(id,{resolve,signal})));
 const first=store.select({object_id:'vessel:synthetic:first',kind:'vessel'});const second=store.select({object_id:'aircraft:synthetic:second',kind:'aircraft'});
 expect(pending.get('vessel:synthetic:first')!.signal.aborted).toBe(true);
 pending.get('aircraft:synthetic:second')!.resolve(dossier('aircraft:synthetic:second'));await second;
 pending.get('vessel:synthetic:first')!.resolve(dossier('vessel:synthetic:first'));await first;
 expect(store.state.phase).toBe('loaded');if(store.state.phase==='loaded')expect(store.state.dossier.object.entity_id).toBe('aircraft:synthetic:second');store.dispose();
});

test('closing cancels selection and a mismatched detail response becomes an explicit error',async()=>{
 let finish:(d:Dossier)=>void=()=>{};const store=new SelectionStore(()=>new Promise(resolve=>{finish=resolve;}));
 const pending=store.select({object_id:'vessel:synthetic:test',kind:'vessel'});store.clear();finish(dossier());await pending;expect(store.state.phase).toBe('idle');store.dispose();
 const mismatch=new SelectionStore(async()=>dossier('vessel:synthetic:wrong'));await mismatch.select({object_id:'vessel:synthetic:test',kind:'vessel'});expect(mismatch.state.phase).toBe('error');mismatch.dispose();
});

test('dossier uses text, accessible tabs and explicit snapshot context',()=>{
 const host=document.createElement('div');document.body.append(host);const view=mountDossier(host,()=>{},()=>{});const d=dossier();view.render({phase:'loaded',pick:{object_id:d.object.entity_id,kind:'vessel'},dossier:d});
 expect(host.querySelector('img')).toBeNull();expect(host.textContent).toContain('<img src=x');expect(host.textContent).toContain('관측 1건 이하');
 const tabs=Array.from(host.querySelectorAll<HTMLButtonElement>('[role=tab]'));expect(tabs).toHaveLength(5);tabs[0].focus();tabs[0].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));expect(tabs[1].getAttribute('aria-selected')).toBe('true');expect(document.activeElement).toBe(tabs[1]);
 expect(sourceLink('javascript:alert(1)')).toBeNull();expect(sourceLink('https://token:secret@example.org')).toBeNull();view.dispose();
});

test('catalog rejects coordinate and identity substitution',()=>{
 const d=dossier();const c={schema_version:'nv-objects/2.0',synthetic:true,objects:[d.object],feature_collection:{type:'FeatureCollection',features:[{type:'Feature',geometry:d.latest_observation!.geometry,properties:{object_id:d.object.entity_id,kind:'vessel',status:'reported',source_ids:[sid]}}]},next_cursor:null,data_as_of_utc:null,warnings:[],coverage:{}};
 expect(readCatalog(c).objects).toHaveLength(1);(c.feature_collection.features[0].properties as any).object_id='vessel:missing';expect(()=>readCatalog(c)).toThrow('식별자');
});

test('disabled feature does not alter the legacy map or request a catalog',async()=>{
 const fetchMock=vi.fn(async()=>Response.json({enabled:false,ready:false}));vi.stubGlobal('fetch',fetchMock);vi.stubGlobal('matchMedia',()=>({matches:false}));
 const host=document.createElement('main');document.body.append(host);const change=vi.fn();const view=mountOntology(host,{resize:vi.fn()} as unknown as MapPort,change,()=>{});await vi.waitFor(()=>expect(fetchMock).toHaveBeenCalledOnce());await new Promise(resolve=>setTimeout(resolve,0));expect(change).not.toHaveBeenCalled();expect(host.classList.contains('ontology-enabled')).toBe(false);expect(host.querySelector<HTMLElement>('.ontology-catalog')!.hidden).toBe(true);view.dispose();
});


test('raw dossier view redacts secret-shaped fields and credential-bearing URLs',()=>{
 const raw=redactedJSON({display_name:'test',NVIDIA_API_KEY_A:'do-not-render',source:'https://example.org/?access_token=private',url:'https://example.org/public'});
 expect(raw).not.toContain('do-not-render');expect(raw).not.toContain('access_token=private');expect(raw).toContain('https://example.org/public');
});

test('NIM action is manual and login failures preserve the source dossier',async()=>{
 const fetchMock=vi.fn(async()=>Response.json({error:'github_login_required'},{status:401}));vi.stubGlobal('fetch',fetchMock);
 const host=document.createElement('div');document.body.append(host);const view=mountDossier(host,()=>{},()=>{});const d=dossier();view.render({phase:'loaded',pick:{object_id:d.object.entity_id,kind:'vessel'},dossier:d});expect(fetchMock).not.toHaveBeenCalled();
 Array.from(host.querySelectorAll('button')).find(b=>b.textContent==='NIM 근거 해석 요청')!.click();await vi.waitFor(()=>expect(host.textContent).toContain('GitHub 로그인'));expect(fetchMock).toHaveBeenCalledOnce();expect(host.textContent).toContain(d.object.entity_id);expect(d.claims).toEqual([]);view.dispose();
});

test('NIM proposals need matching object, proposed state and supplied citations',async()=>{
 const d=dossier();const proposal={schema_version:'nv-ontology-proposal/1.0',object_id:d.object.entity_id,state:'proposed',canonical_promotion:false,analysis:{status:'validated',result:{summary:[{text:'Synthetic proposal',source_ids:['source:invented']}],alternatives:[],counterevidence:[],unknowns:[]}}};
 vi.stubGlobal('fetch',vi.fn(async()=>Response.json(proposal)));const host=document.createElement('div');document.body.append(host);const view=mountDossier(host,()=>{},()=>{});view.render({phase:'loaded',pick:{object_id:d.object.entity_id,kind:'vessel'},dossier:d});Array.from(host.querySelectorAll('button')).find(b=>b.textContent==='NIM 근거 해석 요청')!.click();await vi.waitFor(()=>expect(host.textContent).toContain('AI 제안의 출처를 검증하지 못했습니다'));expect(host.textContent).not.toContain('Synthetic proposal');expect(d.claims).toEqual([]);view.dispose();
});

test('source extraction is hidden by default and remains unreviewed when explicitly enabled',async()=>{
 const d=dossier();const host=document.createElement('div');document.body.append(host);const view=mountDossier(host,()=>{},()=>{});view.render({phase:'loaded',pick:{object_id:d.object.entity_id,kind:'vessel'},dossier:d});(host.querySelectorAll('[role=tab]')[2] as HTMLButtonElement).click();expect(host.textContent).not.toContain('원문 텍스트 확인');
 d.diagnostics.source_extraction_available=true;const fetchMock=vi.fn(async()=>Response.json({schema_version:'nv-source-extract/1.0',object_id:d.object.entity_id,source_id:sid,state:'unreviewed_source_text',independent_verification:false,text:'SYNTHETIC <img src=x> original text'}));vi.stubGlobal('fetch',fetchMock);view.render({phase:'loaded',pick:{object_id:d.object.entity_id,kind:'vessel'},dossier:d});expect(fetchMock).not.toHaveBeenCalled();Array.from(host.querySelectorAll('button')).find(b=>b.textContent==='원문 텍스트 확인')!.click();await vi.waitFor(()=>expect(host.textContent).toContain('아직 독립적으로 검증하지 않은 자료'));expect(host.querySelector('img')).toBeNull();expect(d.claims).toEqual([]);view.dispose();
});


test('partial ontology backfill preserves legacy events and avoids only matching mapped revisions',()=>{
 const legacy={id:'ucdp:42',upstream_id:'42',version:'26.1'};const feature:any={type:'Feature',geometry:{type:'Point',coordinates:[1,2]},properties:{kind:'event',object_id:'event:ucdp:42@26.1',legacy_event_id:'ucdp:42'}};
 expect(isMappedLegacyEvent(legacy,{type:'FeatureCollection',features:[]})).toBe(false);expect(isMappedLegacyEvent(legacy,{type:'FeatureCollection',features:[feature]})).toBe(true);feature.properties.object_id='event:ucdp:42@25.1';expect(isMappedLegacyEvent(legacy,{type:'FeatureCollection',features:[feature]})).toBe(false);feature.geometry=null;expect(isMappedLegacyEvent(legacy,{type:'FeatureCollection',features:[feature]})).toBe(false);
});
