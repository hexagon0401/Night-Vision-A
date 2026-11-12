import {boundedJSON} from './event-context-providers/common.js';
import {requireValue,stmt} from './core.js';
export function previewAsset(f,id){
 const href=f?.assets?.thumbnail?.href;let u;try{u=new URL(href);}catch{return null;}
 return f.id===id&&f.collection==='sentinel-2-l2a'&&u.protocol==='https:'&&u.hostname==='sentinel-cogs.s3.us-west-2.amazonaws.com'&&!u.port&&!u.username&&!u.password&&!u.search&&!u.hash&&/^\/sentinel-s2-l2a-cogs\/\d{1,2}\/[A-Z]\/[A-Z]{2}\/\d{4}\/\d{1,2}\//.test(u.pathname)&&u.pathname.endsWith('/'+id+'/preview.jpg')?u.href:null;
}
export async function preview(request,env,url){
 requireValue(request.method==='GET','method_not_allowed',405);const id=url.searchParams.get('scene')??'';requireValue(/^S2[ABC]_\w{5}_\d{8}_\d+_L2A$/.test(id),'invalid_scene');
 const quota=await stmt(env.DB,"INSERT INTO quotas VALUES(date('now'),'nearby-preview',1) ON CONFLICT(day,bucket) DO UPDATE SET count=count+1 WHERE count<200 RETURNING count").first();requireValue(quota,'preview_daily_budget',429);
 const f=await boundedJSON('https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/'+id);const asset=previewAsset(f,id);requireValue(asset,'preview_not_available',404);
 const r=await fetch(asset,{redirect:'manual',signal:AbortSignal.timeout(8000)});requireValue(r.ok&&r.headers.get('content-type')?.startsWith('image/jpeg'),'preview_upstream_failure',502);
 const reader=r.body.getReader(),chunks=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;requireValue(size<=2000000,'preview_size_limit',413);chunks.push(value);}}finally{await reader.cancel();}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}requireValue(bytes[0]===255&&bytes[1]===216&&bytes[2]===255,'invalid_preview_image',502);
 return new Response(bytes,{headers:{'Content-Type':'image/jpeg','Cache-Control':'no-store, max-age=0','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'",'Referrer-Policy':'no-referrer'}});
}
