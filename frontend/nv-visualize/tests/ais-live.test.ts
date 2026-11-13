// @vitest-environment jsdom
import {test,expect,vi,afterEach} from 'vitest';
import {freshShips,viewport,liveAis} from '../src/monitor/ais-live';
import {nearbyQuery} from '../../../services/cloudflare/nearby.js';
import {civilianShips,nearbyShips} from '../../../services/cloudflare/nearby-ais.js';
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();document.body.replaceChildren();});
const ship=(at=Date.now())=>({id:'vessel:123456789',kind:'vessel',mmsi:'123456789',title:'SYNTHETIC',lat:35.1,lon:129,observed_at:new Date(at).toISOString(),speed_knots:12,course_deg:90,heading_deg:null});
test('freshness rejects unknown/future/expired times and deduplicates without regressing',()=>{
 const now=Date.now();expect(freshShips([ship(now-100),ship(now-1000),ship(now-300000),{...ship(),mmsi:'invalid'},{...ship(),observed_at:'unknown'},ship(now+11000)],now)).toEqual([ship(now-100)]);
});
test('viewport is bounded and malformed or world requests fail closed',()=>{
 expect(viewport({bounds:()=>[0,0,3,3]} as any)).toBeNull();
 const q=nearbyQuery(new URL('https://test/?lat=35.1&lon=129&type=vessels&bbox=128.9,35,129.1,35.2'));expect(q.bbox).toEqual([128.9,35,129.1,35.2]);
 for(const bbox of ['128,35,130,36',',0,.1,.1','129,35,128,36'])expect(()=>nearbyQuery(new URL('https://test/?lat=35&lon=129&type=vessels&bbox='+bbox))).toThrow();
});
test('AIS metadata keeps unavailable speed/direction null and filters viewport',()=>{
 const now=Date.now(),meta={MMSI:123456789,time_utc:new Date(now).toISOString()},position={MessageType:'PositionReport',MetaData:meta,Message:{PositionReport:{Valid:true,Latitude:35.1,Longitude:129,Sog:102.3,Cog:360,TrueHeading:511}}},staticData={MessageType:'ShipStaticData',MetaData:meta,Message:{ShipStaticData:{Valid:true,Type:70,Name:'SYNTHETIC'}}};
 const q={lat:35.1,lon:129,radius:50,bbox:[128.9,35,129.1,35.2]};const rows=civilianShips([position,staticData],q,now);expect(rows[0]).toMatchObject({speed_knots:null,course_deg:null,heading_deg:null});expect(civilianShips([position,staticData],{...q,bbox:[128,35,128.1,35.2]},now)).toHaveLength(0);
});
test('live layer polls only while enabled, preserves last sample on failure and expires it',async()=>{
 vi.useFakeTimers();const now=Date.now();vi.setSystemTime(now);const host=document.createElement('main'),root=document.createElement('details'),state=document.createElement('small'),detail=document.createElement('article');root.className='layer-control';host.append(root);document.body.append(host);const update=vi.fn(),fetcher=vi.fn().mockResolvedValue({ok:true,json:async()=>({status:'ok',items:[ship(now)]})});vi.stubGlobal('fetch',fetcher);
 const ctrl=liveAis(host,{bounds:()=>[128.9,35,129.1,35.2]} as any,state,detail,update);ctrl.setEnabled(true);await vi.advanceTimersByTimeAsync(1);expect(fetcher).toHaveBeenCalledTimes(1);
 host.dispatchEvent(new CustomEvent('nv:nearby-pick',{detail:'vessel:123456789'}));expect(detail.textContent).toContain('123456789');expect(detail.textContent).toContain('12 kn');expect(update.mock.lastCall?.[0][0].selected).toBe(true);
 fetcher.mockRejectedValue(new Error('선박 연결 끊김'));await vi.advanceTimersByTimeAsync(61000);expect(state.textContent).toContain('연결 끊김');expect(update.mock.lastCall?.[0]).toHaveLength(1);
 await vi.advanceTimersByTimeAsync(240000);expect(update.mock.lastCall?.[0]).toHaveLength(0);expect(detail.textContent).toContain('만료');ctrl.setEnabled(false);const count=fetcher.mock.calls.length;await vi.advanceTimersByTimeAsync(120000);expect(fetcher).toHaveBeenCalledTimes(count);ctrl.dispose();expect(vi.getTimerCount()).toBe(0);
});
test('world zoom skips collection and viewport change cancels stale request',async()=>{
 vi.useFakeTimers();const host=document.createElement('main'),state=document.createElement('small'),detail=document.createElement('article'),update=vi.fn();let bounds=[0,0,3,3];const fetcher=vi.fn().mockImplementation(()=>new Promise(()=>{}));vi.stubGlobal('fetch',fetcher);const ctrl=liveAis(host,{bounds:()=>bounds} as any,state,detail,update);ctrl.setEnabled(true);await vi.advanceTimersByTimeAsync(1);expect(fetcher).not.toHaveBeenCalled();expect(state.textContent).toContain('확대');bounds=[128.9,35,129.1,35.2];host.dispatchEvent(new Event('nv:map-move'));await vi.advanceTimersByTimeAsync(801);expect(fetcher).toHaveBeenCalledTimes(1);const signal=fetcher.mock.calls[0][1].signal;bounds=[0,0,3,3];host.dispatchEvent(new Event('nv:map-move'));expect(signal.aborted).toBe(true);ctrl.dispose();
});

test('early provider websocket close is a failure, never successful zero coverage',async()=>{const ws=Object.assign(new EventTarget(),{accept:vi.fn(),close:vi.fn(),send:()=>queueMicrotask(()=>ws.dispatchEvent(new Event('close')))});vi.stubGlobal('fetch',vi.fn().mockResolvedValue({status:101,webSocket:ws}));await expect(nearbyShips({lat:35,lon:129,radius:25},{})).rejects.toThrow('upstream_websocket_closed');expect(ws.close).toHaveBeenCalled();});
test('handshake timeout is cleared before sampling and binary AIS frames are decoded',async()=>{
 vi.useFakeTimers();const now=Date.now(),meta={MMSI:123456789,time_utc:new Date(now).toISOString()};let signal:AbortSignal;
 const ws=Object.assign(new EventTarget(),{accept:vi.fn(),close:vi.fn(),send:()=>queueMicrotask(()=>{for(const message of [{MessageType:'PositionReport',MetaData:meta,Message:{PositionReport:{Valid:true,Latitude:35,Longitude:129,Sog:1,Cog:90}}},{MessageType:'ShipStaticData',MetaData:meta,Message:{ShipStaticData:{Valid:true,Type:70,Name:'SYNTHETIC'}}}])ws.dispatchEvent(new MessageEvent('message',{data:new TextEncoder().encode(JSON.stringify(message)).buffer}));})});
 vi.stubGlobal('fetch',vi.fn().mockImplementation((_url,options)=>{signal=options.signal;return Promise.resolve({status:101,webSocket:ws});}));const promise=nearbyShips({lat:35,lon:129,radius:25},{});await vi.advanceTimersByTimeAsync(10001);expect(signal!.aborted).toBe(false);expect(await promise).toHaveLength(1);expect(ws.close).toHaveBeenCalled();
});
