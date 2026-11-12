import modules from './nv2-modules.json';
import {resolveEvent} from './event-context.js';
import {caseEvidence,reason} from './ai.js';
import {stmt,rows,requireValue,json,body,sameOrigin} from './core.js';
import {requireUser} from './auth.js';

export function assembleInvestigation(record,payload,context=[],now=new Date().toISOString()) {
 const sources=[{source_id:record.id,url:record.source_url??'https://ucdp.uu.se/',publisher:'UCDP',published_at:null,retrieved_at:record.acquired_at??null,quote_span:null,independence_group:'ucdp',limitations:'Provider-reported record; underlying report not independently opened.'}];
 const claims=[{claim_id:'claim:'+record.id,statement:record.title,status:'reported',source_ids:[record.id],limitations:['Event identity, cause and current status need independent verification.']}];
 for(const item of context.slice(0,20)){
  if(!item.url||!/^https:\/\//.test(item.url))continue;
  sources.push({source_id:item.id,url:item.url,publisher:item.publisher??item.provider_id,published_at:item.published_at_utc??null,retrieved_at:item.acquired_at_utc,quote_span:null,independence_group:null,limitations:'Catalog metadata only; independence and full text not verified.'});
 }
 if(payload?.case){const packet=caseEvidence(payload);const ids=new Set(packet.sources.map(s=>s.source_id));for(const s of payload.case?.sources??[]){if(!ids.has(s.source_id)||sources.some(x=>x.source_id===s.source_id))continue;sources.push({source_id:s.source_id,url:s.url,publisher:s.publisher,published_at:s.published_at_utc??null,retrieved_at:s.retrieved_at_utc??null,quote_span:null,independence_group:s.publisher_family??null,limitations:'Derived country aggregation; not an independent account of this incident.'});}for(const c of packet.claims)claims.push({...c,status:c.evidence_status,limitations:['Country time-series aggregate, not single-incident verification.']});}
 const anomalies=(payload?.analysis?.anomalies??[]).slice(-20);
 const geo={type:'FeatureCollection',features:[]};
 if(record.precision===1&&Number.isFinite(record.lat)&&Number.isFinite(record.lon))geo.features.push({type:'Feature',geometry:{type:'Point',coordinates:[record.lon,record.lat]},properties:{id:record.id,evidence_status:'reported',source_ids:[record.id],location_claim:'provider_reported_point'}});
 const selected=['nv2-source-tracker','nv2-evidence-finder','nv2-chrono-search','nv2-map-pointer','nv2-maplizer','nv2-hypothesis-lab'];
 const resultById={
  'nv2-source-tracker':{sources,independence:'unresolved; publishers are not independent evidence'},
  'nv2-evidence-finder':{claims,detector_candidates:anomalies,causality:'unresolved'},
  'nv2-chrono-search':{event_interval:{from:record.day,to:record.end_day},retrieved_at:record.acquired_at??null,cutoff_utc:now},
  'nv2-map-pointer':{location_precision:record.precision,geometry:geo.features[0]?.geometry??null},
  'nv2-maplizer':geo,
  'nv2-hypothesis-lab':{hypotheses:[{id:'H0',statement:'자료 수정·수집 범위·보고 지연이 집계 변화를 설명할 수 있음',status:'unresolved',falsifier:'동일 범위와 보고 지연을 통제한 독립 시계열에서도 증가가 유지되는지 확인'},{id:'H1',statement:'보고된 분쟁 활동의 실제 변화',status:'unresolved',falsifier:'완료된 동일 범위 집계와 독립 자료에서 변화가 재현되지 않음'}]}
 };
 const moduleResults=modules.map(m=>({schema_version:'nv2-module/1.0',module:m.id,case_id:record.id,as_of:now,status:selected.includes(m.id)?(m.id==='nv2-maplizer'?'completed':'partial'):'blocked',result:resultById[m.id]??{},source_ledger:sources,claims:selected.includes(m.id)?claims:[],contradictions:[],unresolved:selected.includes(m.id)?['Independent source text and counterevidence remain unverified.']:['Required module-specific documents, imagery or historical observations are not supplied.'],hypothesis_impacts:[],loop_log:[],quality:{fabricated_source_count:0,unverified_claim_count:claims.length,unsupported_geo_count:0,independent_chain_count:null,stop_reason:selected.includes(m.id)?'supplied_evidence_exhausted':'missing_prerequisite'}}));
 return {schema_version:'nv-investigation/2.0',implementation_version:'nv-web:1',case_id:record.id,status:'partial',charter:{question:'보고된 사건 및 국가 시계열의 이상징후와 대안 설명',window_start:record.day,window_end:record.end_day,publication_cutoff_utc:now,geography:record.country},source_ledger:sources,claims,module_results:moduleResults,map:geo,detector:{state:payload?'published_python_engine':'waiting_for_baseline',candidates:anomalies,calibration:'uncalibrated',scope:'country time series; not proof this event caused an anomaly',warnings:payload?.analysis?.warnings??['Published country baseline unavailable']},quality_gate_results:{G0:{state:'pass',reason:'Date interval and retrieval cutoff retained'},G1:{state:'warning',reason:'Catalog/source metadata only; quote spans unknown'},G2:{state:'blocked',reason:'Independent claim conflict sweep needs source text'},G3:{state:'warning',reason:'Event interval retained; exact time unknown'},G4:{state:'warning',reason:'Published detector scores are uncalibrated'},G5:{state:'warning',reason:'Alternatives and falsifiers supplied; independent tests pending'},G6:{state:'pass',reason:'Source IDs and URLs preserved'},G7:{state:'pass',reason:'Actual adapters and unavailable modules distinguished'}},execution_log:moduleResults.map(m=>({module:m.module,status:m.status,executor:selected.includes(m.module)?'deterministic_adapter':'not_executed',stop_reason:m.quality.stop_reason})),ai:{state:'not_requested'}};
}

export async function engineRoute(request,env,url){
 if(url.pathname==='/api/v2/engine/modules'){requireValue(request.method==='GET','method_not_allowed',405);return json({version:'maestro-adapters:1',modules,execution:'bounded server adapters; no remote plugin calls'});}
 requireValue(['GET','POST'].includes(request.method),'method_not_allowed',405);
 let input={event_id:url.searchParams.get('event')};let user=null;
 if(request.method==='POST'){sameOrigin(request);user=await requireUser(request,env);input=await body(request,2000);}
 requireValue(typeof input.event_id==='string','invalid_event');
 const {r,snapshot}=await resolveEvent(env,input.event_id);
 const row=await stmt(env.DB,'SELECT c.body FROM cases c JOIN heads h ON c.snapshot=h.snapshot WHERE c.country=? ORDER BY c.priority DESC LIMIT 1',r.country).first();
 const payload=row?JSON.parse(row.body):null;
 const cache=await rows(env.DB,'SELECT body FROM event_context_cache WHERE event_id=? AND event_hash=? AND provider_version=?',r.id,r.hash,'context:5:'+snapshot);
 const items=cache.flatMap(c=>JSON.parse(c.body).items??[]);
 const investigation=assembleInvestigation(r,payload,items);
 if(user){
  const evidence=payload?caseEvidence(payload):{case_id:r.id,title:r.title,claims:investigation.claims,sources:investigation.source_ledger,candidates:[]};
  evidence.module_protocols=modules.filter(m=>['nv2-evidence-finder','nv2-hypothesis-lab'].includes(m.id)).map(m=>({id:m.id,protocol:m.protocol}));
  try{const interpretation=await reason(env,evidence,user.user_id,'maestro');investigation.ai={state:interpretation.status==='validated'?'available':'withheld',...interpretation};}catch(e){investigation.ai={state:'unavailable',error:/^(nim_|ai_|invalid_|unsupported_)/.test(e.message)?e.message:'analysis_unavailable',fallback:'deterministic_evidence_and_statistical_detection'};}
 }
 return json(investigation);
}
