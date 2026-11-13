import {test,expect,vi,afterEach} from 'vitest';
import {FleetMemory,TrafficHub,globalAircraft,direction,trafficRoute} from '../../../services/cloudflare/traffic-hub.js';
import {iconFromAIS,iconFromICAOType} from '../src/map/traffic-classification.mjs';
afterEach(()=>{vi.unstubAllGlobals();vi.useRealTimers();});
const now=Date.parse('2026-11-13T00:00:00Z'),id=123456789;
const pos=(time=now,lon=129)=>({MessageType:'PositionReport',MetaData:{MMSI:id,time_utc:new Date(time).toISOString()},Message:{PositionReport:{Valid:true,Latitude:35,Longitude:lon,Sog:10,Cog:90,TrueHeading:511}}});
const stat=(type=70)=>({MessageType:'ShipStaticData',MetaData:{MMSI:id,time_utc:new Date(now).toISOString()},Message:{ShipStaticData:{Valid:true,Type:type,Name:'SYNTHETIC'}}});
test('persistent fleet joins position and classification arriving in different calls without 30-item cap',()=>{
 const f=new FleetMemory();f.ingest(pos(),now);expect(f.snapshot(now)).toHaveLength(0);f.ingest(stat(),now+1000);expect(f.snapshot(now+1000)[0]).toMatchObject({mmsi:String(id),course_deg:90,heading_deg:null});
 f.ingest(pos(now-1000,128),now+1000);expect(f.snapshot(now+1000)[0].lon).toBe(129);
 for(let n=1;n<120;n++){const s=stat(),p=pos();s.MetaData.MMSI+=n;p.MetaData.MMSI+=n;f.ingest(s,now);f.ingest(p,now);}expect(f.snapshot(now)).toHaveLength(120);
 expect(f.snapshot(now+300000)).toHaveLength(0);expect(f.pending.size).toBe(0);
});
test('classified military and revoked classification never become public latest positions',()=>{const f=new FleetMemory();f.ingest(stat(),now);f.ingest(pos(),now);expect(f.snapshot(now)).toHaveLength(1);f.ingest(stat(35),now+1);expect(f.snapshot(now+1)).toHaveLength(0);expect(f.pending.size).toBe(0);});
test('provider-documented extended Class B reports carry position and type, with no invented subtype',()=>{
 const f=new FleetMemory(),p=pos();f.ingest({...p,MessageType:'ExtendedClassBPositionReport',Message:{ExtendedClassBPositionReport:{...p.Message.PositionReport,Type:37,Name:'SYNTHETIC CLASS B'}}},now);expect(f.snapshot(now)[0]).toMatchObject({ship_type:37,heading_deg:null});
});
test('global aircraft preserve observed track separately, exclude unknown/private callsigns and stale positions',()=>{
 const row=['abc123','KAL123','TEST',now/1000,now/1000,129,35,null,false,100,0];
 const items=globalAircraft({time:now/1000,states:[row,[...row.slice(0,1),'RCH123',...row.slice(2)],['abc124','UAL123','TEST',now/1000-500,now/1000,129,35]]},now);expect(items).toHaveLength(1);expect(items[0]).toMatchObject({icao24:'abc123',course_deg:0,heading_deg:null,aircraft_type:null,speed_knots:194.4});expect(()=>globalAircraft({time:0,states:[]},now)).toThrow();
});
test('icons describe verified category only and invalid headings are unknown',()=>{
 expect(iconFromAIS(71)).toBe('vessel-cargo');expect(iconFromAIS(82)).toBe('vessel-tanker');expect(iconFromICAOType('B77W')).toBe('aircraft-widebody');expect(iconFromICAOType(null)).toBe('aircraft-unknown');expect(direction(0)).toBe(0);expect(direction(511)).toBe(null);
});
function setup(){const values=new Map();let alarm=null;const state={storage:{get:async k=>values.get(k),put:async(k,v)=>values.set(k,v),getAlarm:async()=>alarm,setAlarm:async v=>{alarm=v}},blockConcurrencyWhile(fn){this.ready=fn();}};const hub=new TrafficHub(state,{AISSTREAM_API_KEY:'SYNTHETIC_KEY'});return {state,hub,getAlarm:()=>alarm};}
test('world collector shares one connection and does not postpone its idle alarm on every poll',async()=>{
 vi.useFakeTimers();vi.setSystemTime(now);const {state,hub,getAlarm}=setup();await state.ready;const ws=Object.assign(new EventTarget(),{accept:vi.fn(),close:vi.fn(),send:vi.fn()});const fetcher=vi.fn().mockResolvedValue({status:101,webSocket:ws});vi.stubGlobal('fetch',fetcher);
 await Promise.all([hub.fetch(new Request('https://t/?type=vessels')),hub.fetch(new Request('https://t/?type=vessels'))]);expect(fetcher).toHaveBeenCalledTimes(1);expect(JSON.parse(ws.send.mock.calls[0][0]).BoundingBoxes).toEqual([[[-85,-180],[85,180]]]);expect(JSON.parse(ws.send.mock.calls[0][0]).FilterMessageTypes).toContain('StandardClassBPositionReport');const firstAlarm=getAlarm();vi.setSystemTime(now+15000);await hub.fetch(new Request('https://t/?type=vessels'));expect(getAlarm()).toBe(firstAlarm);
 for(const m of [pos(now+15000),stat()])ws.dispatchEvent(new MessageEvent('message',{data:new TextEncoder().encode(JSON.stringify(m)).buffer}));const data=await (await hub.fetch(new Request('https://t/?type=vessels'))).json();expect(data.items).toHaveLength(1);expect(JSON.stringify(data)).not.toContain('SYNTHETIC_KEY');vi.setSystemTime(now+150000);await hub.alarm();expect(ws.close).toHaveBeenCalled();expect(hub.connection).toBe('idle');
});
test('missing binding/key and exhausted free budget are explicit and never trigger paid fallback',async()=>{
 expect((await trafficRoute(new Request('https://t/'),{},new URL('https://t/'))).status).toBe(503);const {state,hub}=setup();await state.ready;const fetcher=vi.fn();vi.stubGlobal('fetch',fetcher);hub.budget={day:new Date().toISOString().slice(0,10),seconds:1800,messages:0,airRequests:0};const d=await(await hub.fetch(new Request('https://t/?type=vessels'))).json();expect(d.status).toBe('daily_budget');expect(fetcher).not.toHaveBeenCalled();
});
test('map symbol rotation uses reported heading before COG, preserves zero, and marks unknown direction',async()=>{
 const {attachOverlay}=await import('../src/map/overlay');const layers=[],sources=new Map();let features;vi.stubGlobal('window',{matchMedia:()=>({matches:true})});const map={hasImage:()=>true,getSource:id=>sources.get(id),isStyleLoaded:()=>true,addSource:(id)=>sources.set(id,{setData:data=>{features=data.features}}),addLayer:layer=>layers.push(layer),once:()=>{},on:()=>{}};
 const overlay=attachOverlay(map as any,{} as any,()=>{});overlay.render({nearby:[{id:'vessel:a',kind:'vessel',lat:35,lon:129,ship_type:70,heading_deg:0,course_deg:90},{id:'aircraft:a',kind:'aircraft',lat:35,lon:129,heading_deg:null,course_deg:null}],candidates:[],links:[],selected:null,showMarkers:true,showLinks:false});expect(features[0].properties).toMatchObject({icon_id:'vessel-cargo',bearing:0,direction_known:true});expect(features[1].properties).toMatchObject({icon_id:'aircraft-unknown',direction_known:false});expect(layers.find(l=>l.id==='nv-traffic-icons').layout['icon-rotate']).toEqual(['coalesce',['get','bearing'],0]);expect(layers.find(l=>l.id==='nv-traffic-selected').layout['icon-allow-overlap']).toBe(true);
});
test('registered OpenSky OAuth credentials stay server-side and token/source responses are cached',async()=>{
 const {state,hub}=setup();await state.ready;hub.env.OPENSKY_CLIENT_ID='SYNTHETIC_ID';hub.env.OPENSKY_CLIENT_SECRET='SYNTHETIC_SECRET';const now=Date.now()/1000;const fetcher=vi.fn().mockImplementation((url,options)=>{if(String(url).includes('auth.opensky-network.org')){expect(options.body).toContain('client_secret=SYNTHETIC_SECRET');return Promise.resolve(Response.json({access_token:'SYNTHETIC_TOKEN',expires_in:300}));}expect(options.headers.Authorization).toBe('Bearer SYNTHETIC_TOKEN');return Promise.resolve(Response.json({time:now,states:[['abc123','KAL123','TEST',now,now,129,35,null,false,100,0]]}));});vi.stubGlobal('fetch',fetcher);const d=await(await hub.fetch(new Request('https://t/?type=aircraft'))).json();expect(d.status).toBe('ok');expect(d.credential_status.authenticated).toBe(true);expect(JSON.stringify(d)).not.toContain('SYNTHETIC_SECRET');expect(JSON.stringify(d)).not.toContain('SYNTHETIC_TOKEN');await hub.fetch(new Request('https://t/?type=aircraft'));expect(fetcher).toHaveBeenCalledTimes(2);
});
test('global aircraft rate-limit diagnostics are explicit and failed upstream requests are not retried every poll',async()=>{const {state,hub}=setup();await state.ready;const fetcher=vi.fn().mockResolvedValue(Response.json({error:'SYNTHETIC'},{status:429}));vi.stubGlobal('fetch',fetcher);const d=await(await hub.fetch(new Request('https://t/?type=aircraft'))).json();expect(d.reason).toBe('rate_limited');await hub.fetch(new Request('https://t/?type=aircraft'));expect(fetcher).toHaveBeenCalledTimes(1);});
