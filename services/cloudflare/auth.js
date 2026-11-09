import {ApiError,requireValue,random,sha,stmt,rows,json,sameOrigin} from './core.js';
const cookies=request=>Object.fromEntries((request.headers.get('Cookie')??'').split(';').map(x=>x.trim().split('=')));
const cookie=(name,value,seconds)=>`__Host-${name}=${value}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${seconds}`;
const allowed=env=>new Set((env.GITHUB_ALLOWED_USER_IDS??'82876856').split(',').map(x=>x.trim()).filter(x=>/^\d+$/.test(x)));

export async function currentUser(request,env) {
 const token=cookies(request)['__Host-nv-session'];if(!/^[a-f0-9]{64}$/.test(token??''))return null;
 const user=await stmt(env.DB,'SELECT user_id,login FROM sessions WHERE hash=? AND expires>?',await sha(token),Date.now()).first();
 return user&&allowed(env).has(user.user_id)?user:null;
}
export async function requireUser(request,env) {const user=await currentUser(request,env);requireValue(user,'github_login_required',401);return user;}

export async function auth(request,env,url) {
 const db=env.DB;
 if(url.pathname==='/api/auth/me')return json({user:await currentUser(request,env),configured:!!(env.GITHUB_CLIENT_ID&&env.GITHUB_CLIENT_SECRET)});
 if(url.pathname==='/api/auth/logout') {
  requireValue(request.method==='POST','method_not_allowed',405);sameOrigin(request);
  const token=cookies(request)['__Host-nv-session'];if(token)await stmt(db,'DELETE FROM sessions WHERE hash=?',await sha(token)).run();
  return new Response('{}',{headers:{'Content-Type':'application/json','Cache-Control':'no-store','Set-Cookie':cookie('nv-session','',0)}});
 }
 requireValue(request.method==='GET','method_not_allowed',405);
 requireValue(env.GITHUB_CLIENT_ID&&env.GITHUB_CLIENT_SECRET,'github_not_configured',503);
 const callback=url.origin+'/api/auth/github/callback';
 if(url.pathname==='/api/auth/github') {
  await stmt(db,'DELETE FROM oauth_states WHERE expires<?',Date.now()).run();
  const budget=await stmt(db,"INSERT INTO quotas VALUES(date('now'),'oauth',1) ON CONFLICT(day,bucket) DO UPDATE SET count=count+1 WHERE count<200 RETURNING count").first();requireValue(budget,'login_rate_limit',429);
  const state=random(),verifier=random();await stmt(db,'INSERT INTO oauth_states VALUES(?,?,?)',await sha(state),Date.now()+600000,verifier).run();
  const challenge=btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
  const to=new URL('https://github.com/login/oauth/authorize');Object.entries({client_id:env.GITHUB_CLIENT_ID,redirect_uri:callback,state,scope:'read:user',code_challenge:challenge,code_challenge_method:'S256'}).forEach(([k,v])=>to.searchParams.set(k,v));
  return new Response(null,{status:302,headers:{Location:to.href,'Cache-Control':'no-store','Set-Cookie':cookie('nv-state',state,600)}});
 }
 if(url.pathname==='/api/auth/github/callback') {
  const state=url.searchParams.get('state'),code=url.searchParams.get('code');
  requireValue(/^[a-f0-9]{64}$/.test(state??'')&&state===cookies(request)['__Host-nv-state']&&code&&code.length<=512,'oauth_state_invalid',400);
  const saved=await stmt(db,'DELETE FROM oauth_states WHERE hash=? AND expires>? RETURNING verifier',await sha(state),Date.now()).first();requireValue(saved,'oauth_state_expired',400);
  const exchange=await fetch('https://github.com/login/oauth/access_token',{method:'POST',redirect:'manual',signal:AbortSignal.timeout(15000),headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({client_id:env.GITHUB_CLIENT_ID,client_secret:env.GITHUB_CLIENT_SECRET,code,redirect_uri:callback,code_verifier:saved.verifier})});
  requireValue(exchange.ok,'github_exchange_failed',502);const token=await exchange.json();requireValue(typeof token.access_token==='string','github_exchange_rejected',401);
  const response=await fetch('https://api.github.com/user',{redirect:'manual',signal:AbortSignal.timeout(15000),headers:{Authorization:'Bearer '+token.access_token,Accept:'application/vnd.github+json','User-Agent':'Night-Vision'}});
  requireValue(response.ok,'github_profile_failed',502);const profile=await response.json();requireValue(allowed(env).has(String(profile.id)),'github_account_not_allowed',403);
  const session=random();await stmt(db,'DELETE FROM sessions WHERE expires<? OR user_id=?',Date.now(),String(profile.id)).run();
  await stmt(db,'INSERT INTO sessions VALUES(?,?,?,?)',await sha(session),String(profile.id),String(profile.login),Date.now()+7*86400000).run();
  const headers=new Headers({Location:'/?view=monitor','Cache-Control':'no-store'});headers.append('Set-Cookie',cookie('nv-session',session,7*86400));headers.append('Set-Cookie',cookie('nv-state','',0));
  return new Response(null,{status:302,headers});
 }
 throw new ApiError(404,'not_found');
}
