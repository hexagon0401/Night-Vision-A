import {requireValue,internal} from './core.js';
const ISSUER='https://token.actions.githubusercontent.com';
let cached,expires=0;
const decode=value=>Uint8Array.from(atob(value.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));
export async function verifyWorkload(token,audience,now=Date.now(),purpose='beta') {
 requireValue(typeof token==='string'&&token.length<=16000,'invalid_workload_token',401);
 const parts=token.split('.');requireValue(parts.length===3,'invalid_workload_token',401);
 let header,claims;try{header=JSON.parse(new TextDecoder().decode(decode(parts[0])));claims=JSON.parse(new TextDecoder().decode(decode(parts[1])));}catch{requireValue(false,'invalid_workload_token',401);}
 requireValue(header.alg==='RS256'&&typeof header.kid==='string','invalid_workload_algorithm',401);
 if(!cached||now>=expires){const r=await fetch(ISSUER+'/.well-known/jwks',{redirect:'manual',signal:AbortSignal.timeout(10000)});requireValue(r.ok,'workload_issuer_unavailable',503);cached=(await r.json()).keys;expires=now+300000;}
 const jwk=cached?.find(k=>k.kid===header.kid&&k.kty==='RSA');requireValue(jwk,'workload_key_unknown',401);
 const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
 requireValue(await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,decode(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1])),'workload_signature_invalid',401);
 requireValue(claims.iss===ISSUER&&claims.aud===audience&&Number.isFinite(claims.exp)&&Number.isFinite(claims.iat)&&claims.exp>now/1000&&claims.iat<=now/1000+60&&claims.exp-claims.iat<=900&&(claims.nbf??0)<=now/1000+60,'workload_expired_or_wrong_audience',401);
 const workflow=purpose==='monitor'?'monitor.yml':'beta-comparison.yml';
 const allowedEvents=purpose==='monitor'?['schedule','workflow_dispatch']:['workflow_dispatch'];
 requireValue(claims.repository==='hexagon0401/Night-Vision-A'&&String(claims.repository_id)==='1204033173'&&claims.ref==='refs/heads/main'&&allowedEvents.includes(claims.event_name)&&claims.workflow_ref===`hexagon0401/Night-Vision-A/.github/workflows/${workflow}@refs/heads/main`,'workload_not_allowed',403);
 return {run_id:String(claims.run_id),sha:claims.sha};
}
export async function betaAuthorization(request,env){
 const token=request.headers.get('Authorization')?.replace(/^Bearer /,'');
 if(token?.split('.').length===3)return verifyWorkload(token,new URL(request.url).origin+'/beta');
 await internal(request,env);return {run_id:'internal-operator'};
}

export async function monitorAuthorization(request,env) {
 const token=request.headers.get('Authorization')?.replace(/^Bearer /,'');
 if(token?.split('.').length===3) {
  const path=new URL(request.url).pathname;
  requireValue(['/api/internal/start','/api/internal/batch','/api/internal/case','/api/internal/publish','/api/internal/aggregates','/api/internal/run','/api/internal/ucdp-permit','/api/internal/monitor-ai'].includes(path),'workload_scope_denied',403);
  return verifyWorkload(token,new URL(request.url).origin+'/monitor',Date.now(),'monitor');
 }
 await internal(request,env);return {run_id:'internal-operator'};
}
