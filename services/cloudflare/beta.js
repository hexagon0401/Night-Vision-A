import {completion,reasoningMode,nimHealth} from './nim.js';
import {ApiError,requireValue,body,json,stmt,rows,sha,utcDay} from './core.js';
import {nimKeys} from './credentials.js';
import {reserve} from './ai.js';
import {betaPrompt,PHASES,FRAMEWORK} from './beta-prompt.js';
export function validateBetaOutput(value,role,sourceIds){
 requireValue(value&&typeof value==='object'&&!Array.isArray(value),'invalid_beta_output',502);
 const allowed=role==='analyst'?['sections','source_ids','hypotheses','changes','research_requests']:['verdict','critique','source_ids','rubric','research_requests'];
 requireValue(Object.keys(value).every(k=>allowed.includes(k))&&Array.isArray(value.source_ids)&&value.source_ids.every(id=>sourceIds.has(id)),'beta_unknown_source_or_field',502);
 if(role==='analyst'){
  requireValue(value.sections&&PHASES.every(p=>typeof value.sections[p]==='string'&&value.sections[p].trim().length>=10),'beta_missing_phase',502);
  requireValue(Array.isArray(value.hypotheses)&&value.hypotheses.length<=3&&value.hypotheses.every(h=>typeof h.claim==='string'&&typeof h.falsifier==='string'&&['open','supported','refuted'].includes(h.status)),'beta_invalid_hypotheses',502);
 }else requireValue(['pass','revise','null'].includes(value.verdict)&&typeof value.critique==='string'&&Array.isArray(value.rubric)&&value.rubric.length===9&&value.rubric.every(r=>r.max===2&&Number.isInteger(r.score)&&r.score>=0&&r.score<=2),'beta_invalid_evaluation',502);
 requireValue(Array.isArray(value.research_requests)&&value.research_requests.length<=3&&value.research_requests.every(q=>typeof q==='string'&&q.length<=200),'beta_invalid_queries',502);
 const text=JSON.stringify(value);requireValue(text.length<=30000,'beta_output_budget',502);
 const citations=[...text.matchAll(/\[S:([^\]]+)\]/g)].map(m=>m[1]);requireValue(citations.every(id=>sourceIds.has(id)),'beta_unknown_inline_source',502);
 requireValue(value.source_ids.length>0,'beta_uncited_report',502);return value;
}
export function validateSources(sources,cutoff){
 requireValue(Array.isArray(sources)&&sources.length>=1&&sources.length<=40,'beta_source_budget');
 const ids=new Set();for(const s of sources){requireValue(typeof s.id==='string'&&/^[a-zA-Z0-9_:-]{1,100}$/.test(s.id)&&!ids.has(s.id),'beta_source_id');ids.add(s.id);const u=new URL(s.url);requireValue(u.protocol==='https:'&&!u.username&&!u.password&&!/[?&](?:key|token|access_token)=/i.test(u.search),'beta_unsafe_source');requireValue(typeof s.title==='string'&&s.title.length<=500&&typeof s.excerpt==='string'&&s.excerpt.length<=1500&&typeof s.publisher_family==='string','beta_source_fields');if(s.published_at)requireValue(Number.isFinite(Date.parse(s.published_at))&&Date.parse(s.published_at)<=Date.parse(cutoff),'beta_future_source');}
 return sources;
}
async function runView(env,id){const r=await stmt(env.DB,'SELECT * FROM beta_runs WHERE id=?',id).first();requireValue(r,'beta_not_found',404);const steps=await rows(env.DB,'SELECT step,state,output,error FROM beta_steps WHERE run_id=? ORDER BY step',id);return {...r,input:JSON.parse(r.input),models:JSON.parse(r.models),steps:steps.map(s=>({...s,output:s.output?JSON.parse(s.output):null})),framework:FRAMEWORK};}
export async function betaRoute(request,env,path,actor){
 if(request.method==='GET'){const id=decodeURIComponent(path.split('/').at(-1));if(id==='beta')return json({runs:await rows(env.DB,'SELECT id,topic,cutoff,state,created FROM beta_runs ORDER BY created DESC LIMIT 20')});return json(await runView(env,id));}
 const d=await body(request,250000);
 if(path.endsWith('/start')){
  requireValue(typeof d.cutoff==='string'&&Number.isFinite(Date.parse(d.cutoff))&&Date.parse(d.cutoff)<=Date.now()+60000&&typeof d.topic==='string'&&d.topic.length<=300,'invalid_beta_scope');
  validateSources(d.sources,d.cutoff);requireValue(typeof d.framework_sha256==='string'&&/^[a-f0-9]{64}$/.test(d.framework_sha256),'beta_framework_hash');
  requireValue(nimKeys(env).primary&&nimKeys(env).review&&env.NIM_ENABLED==='true','nim_not_enabled',503);
  const id='beta-'+utcDay()+'-'+(await sha(JSON.stringify([d.topic,d.cutoff]))).slice(0,12);const old=await stmt(env.DB,'SELECT id FROM beta_runs WHERE day=?',utcDay()).first();
  if(old){requireValue(old.id===id,'beta_daily_run_limit',429);return json(await runView(env,id));}
  const model={analyst:env.NIM_MODEL,critic:env.NIM_REVIEW_MODEL,reasoning_effort:'per-step settings; High not asserted',output_tokens:{analyst:4096,critic:2048}};
  await env.DB.batch([stmt(env.DB,'INSERT INTO beta_runs VALUES(?,?,?,?,?,?,?,?,?)',id,utcDay(),d.topic,d.cutoff,new Date().toISOString(),'running',JSON.stringify(d),JSON.stringify(model),actor.run_id),...Array.from({length:6},(_,step)=>stmt(env.DB,'INSERT INTO beta_steps(run_id,step,state) VALUES(?,?,?)',id,step,'pending'))]);return json(await runView(env,id));
 }
 requireValue(typeof d.id==='string'&&/^beta-[a-zA-Z0-9-]+$/.test(d.id),'invalid_beta_id');
 const run=await runView(env,d.id);const index=Number(d.step);requireValue(Number.isInteger(index)&&index>=0&&index<6,'invalid_beta_step');
 const existing=run.steps[index];if(existing.state==='complete')return json(existing.output);
 requireValue(run.steps.slice(0,index).every(s=>s.state==='complete'),'beta_prior_step_incomplete',409);
 if(d.sources){validateSources(d.sources,run.cutoff);run.input.sources=d.sources;}
 const role=index%2===0?'analyst':'critic',round=Math.floor(index/2)+1;
 const packet={topic:run.topic,cutoff:run.cutoff,window_days:90,sources:run.input.sources,previous_analysis:run.steps.filter(s=>s.step<index&&s.step%2===0).at(-1)?.output?.report??null,previous_evaluation:run.steps.filter(s=>s.step<index&&s.step%2===1).at(-1)?.output?.report??null};
 requireValue(JSON.stringify(packet).length<=70000,'beta_input_budget',413);
 const inputHash=await sha(JSON.stringify([role,round,packet]));
 const lock=await stmt(env.DB,"UPDATE beta_steps SET state='running',input_hash=?,lease_until=? WHERE run_id=? AND step=? AND (state='pending' OR (state='failed' AND ?=1) OR (state='running' AND lease_until<?)) RETURNING step",inputHash,Date.now()+180000,d.id,index,d.retry===true?1:0,Date.now()).first();requireValue(lock,'beta_step_busy_or_failed',409);
 const model=role==='analyst'?run.models.analyst:run.models.critic,start=Date.now();
 try{
  const pause=await stmt(env.DB,'SELECT value FROM settings WHERE key=?','nim-paused:'+utcDay()+':'+model).first();
  requireValue(!pause,'nim_quota_or_access_paused',429);
  await reserve(env.DB,'beta',role==='critic');
  const {report,diagnostic}=await completion(env,{model,key:role==='analyst'?nimKeys(env).primary:nimKeys(env).review,maxTokens:role==='analyst'?4096:2048,timeout:90000,messages:[{role:'system',content:betaPrompt(role,round)},{role:'user',content:JSON.stringify(packet)}]});
  validateBetaOutput(report,role,new Set(run.input.sources.map(s=>s.id)));
  await nimHealth(env,model,{state:'available',...diagnostic});
  const output={round,role,model,provider_model:diagnostic.provider_model,prompt_hash:await sha(betaPrompt(role,round)),runtime_version:env.CF_VERSION_METADATA?.id??null,report,usage:diagnostic.usage,duration_ms:Date.now()-start,finished_at:new Date().toISOString(),input_hash:inputHash,reasoning_effort:reasoningMode(model)};
  await env.DB.batch([stmt(env.DB,"UPDATE beta_steps SET state='complete',output=?,error=NULL WHERE run_id=? AND step=?",JSON.stringify(output),d.id,index),stmt(env.DB,'UPDATE beta_runs SET input=?,state=? WHERE id=?',JSON.stringify(run.input),index===5?'complete':'running',d.id)]);return json(output);
 }catch(e){const code=e instanceof ApiError?e.message:'beta_upstream_or_generation_failed';await nimHealth(env,model,{state:'unavailable',error:code,...(e.diagnostic??{})});await env.DB.batch([stmt(env.DB,"UPDATE beta_steps SET state='failed',error=?,output=? WHERE run_id=? AND step=?",code,e.diagnostic?JSON.stringify({diagnostic:e.diagnostic}):null,d.id,index),stmt(env.DB,"UPDATE beta_runs SET state='paused' WHERE id=?",d.id)]);throw new ApiError(e instanceof ApiError?e.status:502,code);}
}
