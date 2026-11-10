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
