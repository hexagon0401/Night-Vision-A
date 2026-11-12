// @vitest-environment jsdom
import {test,expect,vi} from 'vitest';
import {contextDrawer} from '../src/monitor/context/drawer';
import fixture from './fixtures/event-context.json';
test('switching events cancels the old request and never renders its delayed response',async()=>{
 let finish:(value:Response)=>void=()=>{};let signal:AbortSignal|undefined;
 const fetchMock=vi.fn((_url:any,options:any)=>{signal=options.signal;return new Promise<Response>(resolve=>{finish=resolve;});});vi.stubGlobal('fetch',fetchMock);
 const host=document.createElement('div');document.body.append(host);
 const dispose=contextDrawer(host,fixture.event_ref.id);expect(fetchMock).toHaveBeenCalledTimes(1);dispose();expect(signal?.aborted).toBe(true);
 finish(Response.json(fixture));await new Promise(resolve=>setTimeout(resolve,0));expect(host.textContent).toBe('');host.remove();vi.unstubAllGlobals();
});

test('satellite preview is requested and released when changing tabs',async()=>{
 const b=structuredClone(fixture) as any;
 b.provider_runs.push({...b.provider_runs[0],provider_id:'earth_search_stac',status:'ok',fetched_count:1});
 b.items.push({id:'earth_search_stac:S2A_33UVR_20261105_1_L2A',kind:'satellite',provider_id:'earth_search_stac',source_id:'scene',title:'scene',thumbnail_url:null,url:'https://earth-search.aws.element84.com/',acquired_at_utc:'2026-11-10T00:00:00Z',observed_from_utc:'2026-11-05T00:00:00Z',satellite:{scene_id:'S2A_33UVR_20261105_1_L2A'},temporal_role:'unknown',evidence_role:'context_only',warnings:[]});
 const create=vi.fn(()=> 'blob:test');const revoke=vi.fn();vi.stubGlobal('URL',Object.assign(URL,{createObjectURL:create,revokeObjectURL:revoke}));
 const fetchMock=vi.fn((url:string)=>Promise.resolve(url.includes('/preview?')?new Response(new Blob(['image'],{type:'image/jpeg'})):Response.json(b)));vi.stubGlobal('fetch',fetchMock);
 const host=document.createElement('div');document.body.append(host);const dispose=contextDrawer(host,b.event_ref.id);
 await vi.waitFor(()=>expect(host.textContent).toContain('사건 자료 탐색'));
 await vi.waitFor(()=>expect(host.textContent).toContain('발견'));
 (host.querySelectorAll('[role=tab]')[2] as HTMLButtonElement).click();
 await vi.waitFor(()=>expect(host.querySelector('section')?.getAttribute('aria-busy')).not.toBe('true'));await vi.waitFor(()=>expect(host.textContent).toContain('위성 사진 보기'));
 const button=Array.from(host.querySelectorAll('button')).find(x=>x.textContent==='위성 사진 보기')!;button.click();
 await vi.waitFor(()=>expect(host.querySelector('img')?.getAttribute('src')).toBe('blob:test'));
 (host.querySelectorAll('[role=tab]')[0] as HTMLButtonElement).click();expect(revoke).toHaveBeenCalledWith('blob:test');dispose();host.remove();vi.unstubAllGlobals();
});
