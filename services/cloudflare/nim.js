import {ApiError,stmt,requireValue} from './core.js';

// NVIDIA's published template enables thinking by default for this model.
// Keep the existing model, but reserve its bounded completion for the JSON report.
// https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b
export function generationOptions(model) {
 const known=['meta/llama-3.3-70b-instruct','mistralai/mistral-large-2-instruct'].includes(model);
 return {...(known?{response_format:{type:'json_object'}}:{}),...(['nvidia/nemotron-3.5-lightning-30b-a3b','nvidia/nemotron-3.5-super-vl-120b-a12b'].includes(model)?{chat_template_kwargs:{enable_thinking:false}}:{})};
}
export function parseCompletion(text) {
 let clean=text.trim();
 if(!clean.startsWith('{')&&clean.includes('</think>')) clean=clean.slice(clean.lastIndexOf('</think>')+8).trim();
 if(clean.startsWith('<think>')) throw new Error('incomplete_reasoning_delimiter');
 clean=clean.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
 try{return JSON.parse(clean);}catch{}
 // Strip framing, not JSON syntax: accept one complete object only. Never
 // repair truncated output, synthesize fields or expose the discarded preface.
 const objects=[];let start=-1,depth=0,quoted=false,escaped=false;
 for(let i=0;i<clean.length;i++) {
  const c=clean[i];
  if(start<0){if(c==='{'){start=i;depth=1;}continue;}
  if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;continue;}
  if(c==='"')quoted=true;else if(c==='{')depth++;else if(c==='}'&&--depth===0){try{objects.push(JSON.parse(clean.slice(start,i+1)));}catch{}start=-1;}
 }
 if(objects.length!==1||start>=0)throw new Error('ambiguous_or_incomplete_json');
 return objects[0];
}
export function responseShape(value) {
 if(!value||typeof value!=='object'||Array.isArray(value))return {type:Array.isArray(value)?'array':typeof value};
 return Object.fromEntries(Object.entries(value).slice(0,12).map(([k,v])=>[k.slice(0,40),Array.isArray(v)?{type:'array',length:v.length,item_types:v.slice(0,2).map(x=>typeof x),item_shapes:v.slice(0,2).map(x=>x&&typeof x==='object'?{text_type:typeof x.text,citations_type:Array.isArray(x.source_ids)?'array':typeof x.source_ids,citations_count:Array.isArray(x.source_ids)?x.source_ids.length:null}:{}),item_fields:v.slice(0,2).map(x=>x&&typeof x==='object'?Object.keys(x).slice(0,8):[])}:{type:typeof v}]));
}
export const reasoningMode=model=>generationOptions(model).chat_template_kwargs
 ? 'thinking_disabled_for_structured_output' : 'provider_default';
const ACTIVE_PRIMARY='nvidia/nemotron-3.5-lightning-30b-a3b';
export async function selectModel(env,requested,role='analyst') {
 // Retired Llama and its unavailable migration target never become a key or
 // quota rotation. Use the existing first-party model with the same role key.
 if(role==='analyst'&&requested===ACTIVE_PRIMARY) {
  const health=await stmt(env.DB,'SELECT value FROM settings WHERE key=?','nim-health:'+requested).first();
  if(health&&['invalid_ai_response','ai_uncited_summary','ai_unknown_source','nim_truncated_response'].includes(JSON.parse(health.value).error)) return {model:'nvidia/nemotron-3.5-super-vl-120b-a12b',requested_model:requested,fallback_reason:'primary_grounding_or_format_failure',shared_model_with_critic:false};
 }
 if(requested==='meta/llama-3.3-70b-instruct') return {model:ACTIVE_PRIMARY,requested_model:requested,fallback_reason:'provider_model_retired',shared_model_with_critic:true};
 return {model:requested,requested_model:requested,fallback_reason:null,shared_model_with_critic:requested===ACTIVE_PRIMARY&&env.NIM_REVIEW_MODEL==='meta/llama-3.3-70b-instruct'};
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
  if([401,402,403,404,410,429].includes(response.status)) {
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
  diagnostic.response_shape=responseShape(report);
  await nimHealth(env,model,{state:'responded',...diagnostic});
  return {report,diagnostic};
 }catch(e) {
  const error=e instanceof ApiError?e:new ApiError(502,'nim_transport_failure');
  // Persist usage/finish reason, never the provider body, key, prompt or reasoning text.
  await nimHealth(env,model,{state:'unavailable',error:error.message,...diagnostic});
  error.diagnostic=diagnostic;throw error;
 }
}
