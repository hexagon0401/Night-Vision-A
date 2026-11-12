import {afterEach,test,expect,vi} from 'vitest';
import {normalizeUcdp,normalizeNearby,normalizeProviderBatch,ontologyTime} from '../../../services/cloudflare/ontology-provider.js';
import {civilianAircraft} from '../../../services/cloudflare/nearby-feeds.js';
import {civilianShips,mergeAisStaticCache,nearbyShips} from '../../../services/cloudflare/nearby-ais.js';
import {discover,gdeltWindow} from '../../../services/cloudflare/event-context-providers/discover.js';
const at='2026-11-12T08:00:00Z',options={queriedAt:at,recordedAt:at};
const aircraft={id:'aircraft:KAL123',kind:'aircraft',title:'SYNTHETIC KAL123',callsign:'KAL123',provider:'adsb_lol',icao24:'ABC123',source_url:'https://www.adsb.lol/',lat:37.51234,lon:126.93456,observed_at:'2026-11-12T07:59:55Z'};
const event={id:'ucdp:42',upstream_id:'42',kind:'ucdp',version:'26.1',title:'SYNTHETIC TEST',country:'SYNTHETIC',day:'2026-10-01',end_day:'2026-10-03',precision:2,lat:20,lon:30,hash:'a'.repeat(64),source_url:'https://ucdp.uu.se/'};
afterEach(()=>vi.unstubAllGlobals());
test('canonical aircraft identity requires ICAO24 and retains coarsened civilian source metadata',()=>{
 expect(normalizeNearby({...aircraft,icao24:undefined},options).diagnostics).toContain('aircraft_icao24_missing_or_invalid');const g=normalizeNearby(aircraft,options).graph;
 expect(g.entities[0].entity_id).toBe('aircraft:icao24:abc123');expect(g.entities[0].attributes.callsign).toBe('KAL123');expect(g.observations[0].measurements.callsign).toBe('KAL123');expect(g.observations[0].precision_m).toBeNull();expect(g.observations[0].geometry.coordinates).toEqual([126.93,37.51]);expect(g.observations[0].geometry_source_id).toBe(g.sources[0].source_id);
 const rows=civilianAircraft({now:Date.parse(at),ac:[{flight:'KAL123',hex:'ABC123',t:'A320',r:'HL1234',seen_pos:5,lat:37.51,lon:126.93}]},{lat:37.5,lon:126.9,radius:25},Date.parse(at));expect(rows[0].icao24).toBe('abc123');expect(rows[0].callsign).toBe('KAL123');
});
test('MMSI remains identifier scoped and one matched AIS sample is not a route',()=>{
 const meta={MMSI:123456789,time_utc:'2026-11-12 07:59:59.000 +0000 UTC'};
 const rows=civilianShips([{MetaData:meta,MessageType:'ShipStaticData',Message:{ShipStaticData:{Valid:true,Type:70,Name:'SYNTHETIC'}}},{MetaData:meta,MessageType:'PositionReport',Message:{PositionReport:{Valid:true,Latitude:37.51,Longitude:126.93}}}],{lat:37.5,lon:126.9,radius:25},Date.parse(at));
 expect(rows[0].mmsi).toBe('123456789');const g=normalizeNearby(rows[0],options).graph;expect(g.entities[0].entity_id).toBe('vessel:ais:mmsi:123456789');expect(g.entities[0].attributes.identity_scope).toContain('not_verified_hull');expect(g.relations).toEqual([]);expect(g.observations).toHaveLength(1);
});
test('UCDP version and date range retained; approximate coordinates do not become points',()=>{
 const g=normalizeUcdp(event,{acquiredAt:at,recordedAt:at}).graph;expect(g.entities[0].entity_id).toBe('event:ucdp:42@26.1');expect(g.observations[0].observed_at_utc).toBeNull();expect(g.observations[0].geometry).toBeNull();expect(g.entities[0].attributes.date_to).toBe('2026-10-03');expect(g.sources[0].content_hash).toBe('a'.repeat(64));
 const exact=normalizeUcdp({...event,precision:1},{acquiredAt:at}).graph;expect(exact.observations[0].geometry.coordinates).toEqual([30,20]);expect(exact.observations[0].recorded_at_utc).toBeNull();expect(normalizeUcdp({...event,version:'26.2'}).graph.entities[0].entity_id).not.toBe(g.entities[0].entity_id);
});
test('bad coordinates, unknown clocks and absent scene footprint remain explicit nulls',()=>{
 const g=normalizeNearby({...aircraft,lat:999,observed_at:'invalid'},{}).graph;expect(g.observations[0].geometry).toBeNull();expect(g.observations[0].observed_at_utc).toBeNull();expect(g.observations[0].acquired_at_utc).toBeNull();expect(g.observations[0].recorded_at_utc).toBeNull();
 const scene=normalizeNearby({id:'S2B_52SBG_20261110_0_L2A',kind:'satellite',title:'SYNTHETIC',provider:'earth_search',source_url:'https://earth-search.aws.element84.com/',observed_at:at},options).graph;expect(scene.entities[0].kind).toBe('satellite_scene');expect(scene.observations[0].geometry).toBeNull();
 for(const source_url of ['javascript:alert(1)','https://user:secret@example.com'])expect(normalizeNearby({...aircraft,source_url},options).graph.entities).toEqual([]);expect(ontologyTime('2026-02-30T00:00:00Z')).toBeNull();
});
test('camera catalog observation is not a captured frame date',()=>{
 const g=normalizeNearby({id:'windy_webcams_v3:42',kind:'webcam',provider:'windy',title:'SYNTHETIC',source_url:'https://www.windy.com/webcams/42',lat:20,lon:30,observed_at:at},options).graph;
 expect(g.entities[0].entity_id).toBe('camera:windy_webcams_v3:42');expect(g.observations[0].observed_at_utc).toBeNull();expect(g.observations[0].geometry_role).toBe('catalog_location');
});
test('counts distinguish invalid and duplicate rows; future positions rejected',()=>{
 const x=normalizeProviderBatch([aircraft,aircraft,{...aircraft,icao24:null}],options);expect(x.counts).toEqual({fetched_count:3,normalized_count:2,accepted_count:1,rejected_count:2});expect(x.graph.entities).toHaveLength(1);expect(x.graph.observations[0].source_ids).toEqual(x.graph.entities[0].source_ids);expect(normalizeNearby({...aircraft,observed_at:'2030-01-01T00:00:00Z'},options).diagnostics).toContain('observation_in_future');
});
test('GDELT cutoff is exact UTC, old inverted windows are explicit coverage failures',()=>{
 const w=gdeltWindow({day:'2026-11-10',end_day:'2026-11-12'},at);expect(w.enddatetime).toBe('20261112080000');expect(w.to).toBe('2026-11-12T08:00:00.000Z');expect(()=>gdeltWindow({day:'2020-01-01',end_day:'2020-01-02'},at)).toThrow('upstream_out_of_coverage');
});
test('GDELT malformed is not empty, URL duplicates removed, index date is not publication',async()=>{
 const r={country:'Test',actors:[],day:'2026-11-10',end_day:'2026-11-12'};vi.stubGlobal('fetch',vi.fn(()=>Promise.resolve(Response.json({not_articles:[]}))));await expect(discover({id:'gdelt_doc'},r,at,{})).rejects.toThrow('upstream_invalid_response');
 vi.stubGlobal('fetch',vi.fn(()=>Promise.resolve(Response.json({articles:[{title:'SYNTHETIC',url:'https://news.example/a?utm_source=one',seendate:'20261111T120000Z'},{title:'Different title same URL',url:'https://news.example/a?utm_source=two',seendate:'20261111T120100Z'},{title:'Future lead',url:'https://news.example/b',seendate:'20261112T090000Z'}]}))));
 const items=await discover({id:'gdelt_doc'},r,at,{});expect(items).toHaveLength(1);expect(items[0].published_at_utc).toBeNull();expect(items[0].indexed_at_utc).toBe('2026-11-11T12:00:00.000Z');expect(items[0].source_independence_group).toBeNull();
});


test('callsign reuse does not erase distinct ICAO24 identities or create duplicate nearby IDs',()=>{
 const base={flight:'KAL123',t:'A320',r:'HL1234',seen_pos:5,lat:37.51,lon:126.93};
 const rows=civilianAircraft({now:Date.parse(at),ac:[{...base,hex:'ABC123'},{...base,hex:'DEF456'}]},{lat:37.5,lon:126.9,radius:25},Date.parse(at));
 expect(rows).toHaveLength(2);expect(new Set(rows.map(r=>r.id)).size).toBe(2);expect(new Set(rows.map(r=>normalizeNearby(r,options).graph.entities[0].entity_id)).size).toBe(2);
 expect(rows.every(r=>r.legacy_id==='aircraft:KAL123')).toBe(true);
});
test('invalid clock rollover and secret-bearing source URLs are never persisted',()=>{
 for(const v of ['2026-11-12T24:00:00Z','2026-11-12T08:60:00Z','2026-11-12T08:00:60Z'])expect(ontologyTime(v)).toBeNull();
 for(const source_url of ['https://www.adsb.lol/?access_token=secret','https://www.adsb.lol/#token=secret'])expect(normalizeNearby({...aircraft,source_url},options).graph.sources).toEqual([]);
 expect(normalizeUcdp(event,{acquiredAt:'2030-01-01T00:00:00Z',recordedAt:at}).diagnostics).toContain('acquisition_after_recording');
});
test('out-of-order AIS position reports retain the latest timestamp',()=>{
 const meta={MMSI:123456789,time_utc:'2026-11-12 07:59:59.000 +0000 UTC'};
 const staticData={MetaData:meta,MessageType:'ShipStaticData',Message:{ShipStaticData:{Valid:true,Type:70,Name:'SYNTHETIC'}}};
 const pos=(time,lat)=>({MetaData:{...meta,time_utc:time},MessageType:'PositionReport',Message:{PositionReport:{Valid:true,Latitude:lat,Longitude:126.93}}});
 const rows=civilianShips([staticData,pos(meta.time_utc,37.51),pos('2026-11-12 07:59:50.000 +0000 UTC',37.52)],{lat:37.5,lon:126.9,radius:25},Date.parse(at));
 expect(rows[0].observed_at).toBe('2026-11-12T07:59:59.000Z');expect(rows[0].lat).toBe(37.51);
});


test('AIS cache retains bounded civilian static metadata only, expires after 24h',()=>{
 const now=Date.parse(at),staticMessage=(id,type=70)=>({MetaData:{MMSI:id,time_utc:at},MessageType:'ShipStaticData',Message:{ShipStaticData:{Valid:true,Type:type,Name:'SYNTHETIC'}}});
 const many=Array.from({length:205},(_,i)=>staticMessage(String(123450000+i)));
 const merged=mergeAisStaticCache([...many,staticMessage('999999999',35)],null,now);expect(merged.cache.objects).toHaveLength(200);expect(merged.cache.objects.some(r=>r.mmsi==='999999999')).toBe(false);expect(JSON.stringify(merged.cache)).not.toMatch(/Latitude|Longitude|PositionReport|APIKey/);
 expect(mergeAisStaticCache([],merged.cache,now+86400001).cache.objects).toHaveLength(0);
 const one=mergeAisStaticCache([staticMessage('123456789')],null,now);
 const position={MetaData:{MMSI:123456789,time_utc:'2026-11-12 08:00:01.000 +0000 UTC'},MessageType:'PositionReport',Message:{PositionReport:{Valid:true,Latitude:37.51,Longitude:126.93}}};
 const cached=mergeAisStaticCache([position],one.cache,now+1000);const rows=civilianShips(cached.messages,{lat:37.5,lon:126.9,radius:25},now+1000);
 expect(rows).toHaveLength(1);expect(rows[0].static_source).toBe('cached_provider_static');expect(rows[0].static_acquired_at).toBe('2026-11-12T08:00:00.000Z');expect(rows.source_diagnostics).toBeUndefined();expect(rows.provider_diagnostics.coverage).toBe('request_scoped_sample');
 const revoked=mergeAisStaticCache([position,staticMessage('123456789',35)],one.cache,now+1000);expect(revoked.cache.objects).toEqual([]);expect(civilianShips(revoked.messages,{lat:37.5,lon:126.9,radius:25},now+1000)).toHaveLength(0);
});
test('disabled ontology flag leaves AIS static storage untouched',async()=>{
 const prepare=vi.fn(()=>{throw Error('must not query cache');});vi.stubGlobal('fetch',vi.fn(async()=>({status:502})));
 await expect(nearbyShips({lat:37.5,lon:126.9,radius:25},{DB:{prepare},NV_ONTOLOGY_V2_ENABLED:'false'})).rejects.toThrow('upstream_websocket_unavailable');expect(prepare).not.toHaveBeenCalled();
});


test('malformed individual feed rows are skipped instead of crashing valid rows',()=>{
 const valid={flight:'KAL123',hex:'abc123',t:'A320',r:'HL1234',seen_pos:5,lat:37.51,lon:126.93};
 expect(civilianAircraft({now:Date.parse(at),ac:[null,valid]},{lat:37.5,lon:126.9,radius:25},Date.parse(at))).toHaveLength(1);
 expect(civilianShips([null],{lat:37.5,lon:126.9,radius:25},Date.parse(at))).toHaveLength(0);
});
