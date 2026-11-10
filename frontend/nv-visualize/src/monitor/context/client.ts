import type {NV2UCDPEventContextBundleV1Proposed as Bundle} from './types';
export type {Bundle};
export function safeLink(value:unknown):string|null {try{if(typeof value!=='string')return null;const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port?u.href:null;}catch{return null;}}
export function readContext(value:unknown,eventId:string):Bundle {
 const b=value as Bundle;
 if(b?.schema_version!=='event_context.v1'||b.event_ref?.id!==eventId||!Array.isArray(b.provider_runs)||!Array.isArray(b.items)||b.items.length>100||!/^[a-f0-9]{64}$/.test(b.event_ref.original_hash))throw Error('사건 자료 형식을 검증할 수 없습니다.');
 for(const item of b.items)if(!safeLink(item.url)||item.thumbnail_url!==null||typeof item.title!=='string'||!Array.isArray(item.warnings))throw Error('안전한 원출처 링크를 확인할 수 없습니다.');return b;
}
export async function loadContext(eventId:string,signal:AbortSignal,include?:string,action=''):Promise<Bundle>{
 const query=new URLSearchParams();if(include)query.set('include',include);
 const response=await fetch('/api/v2/events/'+encodeURIComponent(eventId)+'/context'+action+'?'+query,{signal,credentials:'same-origin'});
 if(!response.ok)throw Error(response.status===404?'현재 게시 자료에서 사건을 찾을 수 없습니다.':'자료 탐색 연결을 확인할 수 없습니다.');return readContext(await response.json(),eventId);
}
