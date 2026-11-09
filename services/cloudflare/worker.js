import {ApiError,json,internal,stmt,sameOrigin} from './core.js';
import {ingest,publicData} from './data.js';

export default {
 async fetch(request,env,ctx) {
  const url=new URL(request.url);
  try {
   if(!url.pathname.startsWith('/api/')) {
    const response=await env.ASSETS.fetch(request);const headers=new Headers(response.headers);
    headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','no-referrer');
    headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.openfreemap.org https://assets.openfreemap.com; connect-src 'self' https://*.openfreemap.org https://assets.openfreemap.com; font-src 'self' data:; object-src 'none'; frame-ancestors 'none'");
    return new Response(response.body,{status:response.status,headers});
   }
   if(!env.DB)return json({configured:false,error:'database_not_configured',setup_url:'/setup.html'},503);
   if(url.pathname.startsWith('/api/internal/')) {
    await internal(request,env);if(request.method!=='POST')throw new ApiError(405,'method_not_allowed');
    return await ingest(request,env,url.pathname);
   }
   if(request.method!=='GET')throw new ApiError(405,'method_not_allowed');
   return await publicData(url,env);
  } catch(error) {
   return json({error:error instanceof ApiError?error.message:'service_unavailable'},error instanceof ApiError?error.status:503);
  }
 }
};
