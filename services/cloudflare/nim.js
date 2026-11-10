import {ApiError,stmt,requireValue} from './core.js';

// NVIDIA's published template enables thinking by default for this model.
// Keep the existing model, but reserve its bounded completion for the JSON report.
// https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b
export function generationOptions(model) {
 return model === 'nvidia/nemotron-3.5-lightning-30b-a3b'
  ? {chat_template_kwargs:{enable_thinking:false}} : {};
}
export const reasoningMode=model=>generationOptions(model).chat_template_kwargs
 ? 'thinking_disabled_for_structured_output' : 'provider_default';
export async function nimHealth(env,model,health) {
 await stmt(env.DB,'INSERT OR REPLACE INTO settings VALUES(?,?)','nim-health:'+model,JSON.stringify({model,checked_at:new Date().toISOString(),...health})).run();
}
export async function completion(env,{model,key,messages,maxTokens,timeout=60000}) {
 let diagnostic={model,max_tokens:maxTokens,reasoning_effort:reasoningMode(model)};
 try {
  const response=await fetch('https://integrate.api.nvidia.com/v1/chat/completions',{
   method:'POST',redirect:'manual',signal:AbortSignal.timeout(timeout),
   headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},
   body:JSON.stringify({model,temperature:.1,max_tokens:maxTokens,stream:false,...generationOptions(model),messages}),
  });
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
  let report;try{report=JSON.parse(choice.message.content.replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,''));}catch{throw new ApiError(502,'invalid_ai_response');}
  await nimHealth(env,model,{state:'responded',...diagnostic});
  return {report,diagnostic};
 }catch(e) {
  const error=e instanceof ApiError?e:new ApiError(502,'nim_transport_failure');
  // Persist usage/finish reason, never the provider body, key, prompt or reasoning text.
  await nimHealth(env,model,{state:'unavailable',error:error.message,...diagnostic});
  error.diagnostic=diagnostic;throw error;
 }
}
