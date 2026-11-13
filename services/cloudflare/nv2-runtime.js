import {requireValue,sha} from './core.js';

export function runtimeCapabilities(env){
 return {remote_module_execution_available:false,external_runtime_requested:env.NV2_RUNTIME_MCP_ENABLED==='true',executor:'bounded_server_adapters',reason:env.NV2_RUNTIME_MCP_ENABLED==='true'?'verified_external_module_service_not_configured':'external_runtime_disabled',canonical_promotion:false};
}
export async function executeWithReceipt({module,caseId,input,task},operation){
 const started=new Date().toISOString(),inputHash=await sha(JSON.stringify(input));
 const result=await operation();const completed=new Date().toISOString(),resultHash=await sha(JSON.stringify(result));
 return {result,execution:{module,case_id:caseId,task,executor:'deterministic_adapter',status:'completed',started_at_utc:started,completed_at_utc:completed,input_hash:inputHash,result_hash:resultHash,receipt:{tool_name:'nv-server:'+task,tool_call_id:'local:'+await sha(inputHash+resultHash+completed),completed_at_utc:completed},receipt_scope:'local_server_execution_not_independent_remote_module'}};
}
export function validateRelationProposals(value,{entityIds,sourceIds}){
 requireValue(Array.isArray(value)&&value.length<=30,'invalid_relation_proposals');
 for(const r of value){requireValue(r&&typeof r==='object'&&!Array.isArray(r)&&Object.keys(r).every(k=>['relation_id','subject_id','object_id','predicate','source_ids','status','resolution_state','valid_from_utc','valid_to_utc','limitations'].includes(k)),'unsupported_relation_proposal_fields');requireValue(entityIds.has(r.subject_id)&&entityIds.has(r.object_id)&&r.subject_id!==r.object_id,'proposal_unknown_entity');requireValue(['inferred','scenario','unresolved'].includes(r.status)&&r.resolution_state==='proposed','proposal_cannot_promote_fact');requireValue(Array.isArray(r.source_ids)&&r.source_ids.length&&r.source_ids.every(id=>sourceIds.has(id)),'proposal_unknown_source');}
 return value;
}
