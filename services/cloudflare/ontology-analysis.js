import {reason} from './ai.js';
import {rows,stmt,sha,json,requireValue} from './core.js';
import {publicDossier} from './ontology-store.js';
import {boundedJSON} from './event-context-providers/common.js';

export async function ontologyAnalysis(env,id,user){
 const dossier=await publicDossier(env.DB,id);requireValue(dossier,'unknown_ontology_object',404);
 const selected=dossier.timeline.slice(-5),ids=new Set([...selected.flatMap(o=>o.source_ids),...dossier.claims.flatMap(c=>c.source_ids),...dossier.relations.flatMap(r=>r.source_ids)]);
 if(!ids.size)for(const id of dossier.object.source_ids)ids.add(id);
 const evidence={case_id:id,title:dossier.object.display_name,claims:[...dossier.claims.slice(0,5).map(c=>({claim_id:c.claim_id,statement:c.statement.slice(0,600),evidence_status:c.status,source_ids:c.source_ids})),...selected.map(o=>({claim_id:o.observation_id,statement:JSON.stringify({observed_at_utc:o.observed_at_utc,measurements:o.measurements}).slice(0,600),evidence_status:o.status,source_ids:o.source_ids}))],related_candidates:dossier.relations.map(r=>({relation_id:r.relation_id,status:r.status,resolution_state:r.resolution_state,source_ids:r.source_ids,limitation:'Search candidate only, not event identity or corroboration'})),sources:dossier.sources.filter(s=>ids.has(s.source_id)).map(s=>({source_id:s.source_id,url:s.url,publisher:s.publisher,published_at:s.published_at_utc,publisher_family:s.independence_group})),warnings:['metadata_only','No independent incident verification; current transport snapshot is not a historical route.']};
 requireValue(evidence.sources.length>0,'source_absent',409);
 const extracts=await rows(env.DB,"SELECT body FROM context_reviews WHERE event_id=? AND user_id=? AND id LIKE 'extract:ontology:%' ORDER BY created DESC LIMIT 2",id,user.user_id);evidence.source_excerpts=extracts.map(x=>{try{const e=JSON.parse(x.body);return ids.has(e.source_id)?{source_id:e.source_id,content_hash:e.content_hash,examined_span:e.examined_span,text:e.text.slice(0,3000)}:null;}catch{return null;}}).filter(Boolean);
 const started=new Date().toISOString(),inputHash=await sha(JSON.stringify(evidence));let result;
 try{result=await reason(env,evidence,user.user_id,'ontology-proposal');}catch(e){result={status:'unavailable',error:/^(nim_|ai_|invalid_|unsupported_)/.test(e.message)?e.message:'analysis_unavailable',result:null};}
 const completed=new Date().toISOString(),resultHash=await sha(JSON.stringify(result)),proposalId='proposal:ontology:'+await sha(inputHash+completed+user.user_id);
 const proposal={schema_version:'nv-ontology-proposal/1.0',proposal_id:proposalId,object_id:id,state:'proposed',canonical_promotion:false,created_at_utc:completed,source_ids:[...ids],quality_gate_results:{G2:'blocked_independent_source_conflict_sweep_required'},analysis:result};
 await env.DB.batch([
  stmt(env.DB,'INSERT INTO context_reviews VALUES(?,?,?,?,?,?)',proposalId,id,inputHash,completed,user.user_id,JSON.stringify(proposal)),
  stmt(env.DB,'INSERT INTO nv2_module_runs(module_run_id,case_id,module_id,executor,state,input_hash,output_hash,receipt_json,started_at_utc,completed_at_utc) VALUES(?,?,?,?,?,?,?,?,?,?)','run:'+proposalId,id,result.cached?'nim-cache-read':'nim-summary-proposal','deterministic_adapter',result.status==='validated'?'completed':'partial',inputHash,resultHash,JSON.stringify({tool_name:result.cached?'ai-results-cache':'nim.completion',tool_call_id:proposalId,completed_at_utc:completed}),started,completed),
  stmt(env.DB,"DELETE FROM context_reviews WHERE created<strftime('%Y-%m-%dT%H:%M:%fZ','now','-30 days')"),
 ]);
 return json(proposal);
}

export async function ontologyExtraction(env,id,user,input){
 const dossier=await publicDossier(env.DB,id);requireValue(dossier,'unknown_ontology_object',404);
 requireValue(env.NV_EVIDENCE_EXTRACTION_ENABLED==='true','evidence_extraction_disabled',503);
 requireValue(env.FIRECRAWL_API_KEY,'firecrawl_key_required',503);
 const allowed=new Set((env.NV_EVIDENCE_ALLOWED_DOMAINS??'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean));
 const source=dossier.sources.find(s=>s.source_id===input.source_id);requireValue(source?.url,'unknown_ontology_source',404);
 const url=new URL(source.url);requireValue(url.protocol==='https:'&&allowed.has(url.hostname)&&!url.username&&!url.password,'evidence_domain_not_approved',403);
 const permitted=await stmt(env.DB,"INSERT INTO quotas VALUES(date('now'),'evidence-extraction',1) ON CONFLICT(day,bucket) DO UPDATE SET count=count+1 WHERE count<10 RETURNING count").first();requireValue(permitted,'evidence_daily_budget',429);
 // Explicit provider invocation; never fetch model-suggested URLs or silently
 // use a paid alternative. Text remains an untrusted, unverified source extract.
 const started=new Date().toISOString();
 const response=await boundedJSON('https://api.firecrawl.dev/v2/scrape',{method:'POST',redirect:'manual',headers:{Authorization:'Bearer '+env.FIRECRAWL_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({url:url.href,formats:['markdown'],onlyMainContent:true,timeout:10000})},1000000,15000);
 requireValue(response.success===true&&typeof response.data?.markdown==='string','invalid_evidence_extract',502);
 const finalURL=response.data.metadata?.sourceURL??response.data.metadata?.url??url.href;let final;try{final=new URL(finalURL);}catch{requireValue(false,'invalid_evidence_source',502);}
 requireValue(final.protocol==='https:'&&allowed.has(final.hostname)&&!final.username&&!final.password,'evidence_redirect_not_approved',502);
 const text=response.data.markdown.slice(0,12000),hash=await sha(text),completed=new Date().toISOString(),extractId='extract:ontology:'+await sha(id+source.source_id+hash);
 const extract={schema_version:'nv-source-extract/1.0',object_id:id,source_id:source.source_id,url:url.href,final_url:final.href,acquired_at_utc:completed,published_at_utc:source.published_at_utc,indexed_at_utc:source.indexed_at_utc,content_hash:hash,text,examined_span:'bounded markdown characters 0..'+text.length,independent_verification:false,state:'unreviewed_source_text',truncated:response.data.markdown.length>12000};
 await env.DB.batch([
  stmt(env.DB,'INSERT OR REPLACE INTO context_reviews VALUES(?,?,?,?,?,?)',extractId,id,hash,completed,user.user_id,JSON.stringify(extract)),
  stmt(env.DB,'INSERT OR REPLACE INTO nv2_module_runs(module_run_id,case_id,module_id,executor,state,input_hash,output_hash,receipt_json,started_at_utc,completed_at_utc) VALUES(?,?,?,?,?,?,?,?,?,?)','run:'+extractId,id,'source-text-extraction','deterministic_adapter','completed',await sha(url.href),hash,JSON.stringify({tool_name:'firecrawl.scrape',tool_call_id:extractId,completed_at_utc:completed}),started,completed),
 ]);
 return json(extract);
}
