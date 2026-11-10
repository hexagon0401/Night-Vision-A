import {ApiError,stmt,requireValue} from './core.js';

// NVIDIA's published template enables thinking by default for this model.
// Keep the existing model, but reserve its bounded completion for the JSON report.
// https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b
export function generationOptions(model) {
 const known=['nvidia/nemotron-3.5-lightning-30b-a3b','meta/llama-3.3-70b-instruct'].includes(model);
 return {...(known?{response_format:{type:'json_object'}}:{}),...(model==='nvidia/nemotron-3.5-lightning-30b-a3b'?{chat_template_kwargs:{enable_thinking:false}}:{})};
}
export function parseCompletion(text) {
 let clean=text.trim();
 // Some providers include an empty reasoning delimiter, never expose reasoning.
 clean=clean.replace(/^<think>\s*<\/think>\s*/i,'').replace(/^<\/think>\s*/i,'');
 clean=clean.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
 return JSON.parse(clean);
}
export const reasoningMode=model=>generationOptions(model).chat_template_kwargs
 ? 'thinking_disabled_for_structured_output' : 'provider_default';
export async function selectModel(env,requested,role='analyst') {
 if(role!=='analyst'||requested!=='nvidia/nemotron-3.5-lightning-30b-a3b'||env.NIM_REVIEW_MODEL!=='meta/llama-3.3-70b-instruct') return {model:requested,requested_model:requested,fallback_reason:null};
 const health=await stmt(env.DB,'SELECT value FROM settings WHERE key=?','nim-health:'+requested).first();
 const failure=health?JSON.parse(health.value):null;
 // Response-format fallback only: same A key, same budgets, never an access/quota bypass.
 if(['invalid_ai_response','nim_truncated_response'].includes(failure?.error)) return {model:env.NIM_REVIEW_MODEL,requested_model:requested,fallback_reason:'primary_structured_output_failure',shared_model_with_critic:true};
 return {model:requested,requested_model:requested,fallback_reason:null};
}
export async function nimHealth(env,model,health) {
 await stmt(env.DB,'INSERT OR REPLACE INTO settings VALUES(?,?)','nim-health:'+model,JSON.stringify({model,checked_at:new Date().toISOString(),...health})).run();
}
export async function completion(env,{model,key,messages,maxTokens,timeout=60000}) {
 let diagnostic={model,max_tokens:maxTokens,reasoning_effort:reasoningMode(model),response_format:generationOptions(model).response_format?.type??'prompt_only'};
 try {
  const response=await fetch('https://integrate.api.nvidia.com/v1/chat/completions',{
   method:'POST',redirect:'manual',signal:AbortSignal.timeout(timeout),
   headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},
   body:JSON.stringify({model,temperature:.1,max_tokens:maxTokens,stream:false,...generationOptions(model),messages}),
  });
  diagnostic.http_status=response.status;
  if([401,402,403,404,429].includes(response.status)) {
   await stmt(env.DB,'INSERT OR REPLACE INTO settings VALUES(?,?)','nim-paused:'+new Date().toISOString().slice(0,10)+':'+model,String(response.status)).run();
   throw new ApiError([402,429].includes(response.status)?429:503,'nim_quota_or_model_unavailable');
  }
  requireValue(response.ok,'nim_upstream_failure',502);
  const outer=await response.json(),choice=outer.choices?.[0];
  const usage={};for(const field of ['prompt_tokens','completion_tokens','total_tokens']) if(Number.isFinite(outer.usage?.[field])&&outer.usage[field]>=0) usage[field]=outer.usage[field];
  diagnostic={...diagnostic,provider_model:typeof outer.model==='string'?outer.model.slice(0,160):null,finish_reason:typeof choice?.finish_reason==='string'?choice.finish_reason.slice(0,40):null,usage:Object.keys(usage).length?usage:null,content_characters:choice?.message?.content?.length??0};
  requireValue(choice?.finish_reason!=='length','nim_truncated_response',502);
  requireValue(typeof choice?.message?.content==='string'&&choice.message.content.length<=30000,'invalid_ai_response',502);
  const text=choice.message.content;
  diagnostic.format={starts_json:text.trimStart().startsWith('{'),has_fence:text.includes('```'),has_reasoning_delimiter:/<\/?think>/i.test(text)};
  let report;try{report=parseCompletion(text);}catch{throw new ApiError(502,'invalid_ai_response');}
  await nimHealth(env,model,{state:'responded',...diagnostic});
  return {report,diagnostic};
 }catch(e) {
  const error=e instanceof ApiError?e:new ApiError(502,'nim_transport_failure');
  // Persist usage/finish reason, never the provider body, key, prompt or reasoning text.
  await nimHealth(env,model,{state:'unavailable',error:error.message,...diagnostic});
  error.diagnostic=diagnostic;throw error;
 }
}
