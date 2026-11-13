/** Search metadata becomes a document candidate, never a corroborated incident. */
import {sha} from './core.js';
import {ontologyURL,ontologyTime} from './ontology-provider.js';
export async function attachNewsCandidate(graph,item,legacyEventId=null){
 const event=graph.entities.find(e=>e.kind==='event'&&(!legacyEventId||e.attributes.provider_record_id===legacyEventId));
 const url=ontologyURL(item?.url);if(!event||item?.provider_id!=='gdelt_doc'||!url)return graph;
 const hash=await sha(url),sid='source:url:'+hash,docId='document:url:'+hash;
 const source={source_id:sid,url,publisher:typeof item.publisher==='string'?item.publisher:null,content_hash:null,original_or_derived:'unknown',derived_from_source_id:null,independence_group:null,published_at_utc:ontologyTime(item.published_at_utc),indexed_at_utc:ontologyTime(item.indexed_at_utc),acquired_at_utc:ontologyTime(item.acquired_at_utc),license_status:'metadata_only',access_status:'metadata_only',title:String(item.title??'검색 기사 후보').slice(0,300),quote_span:null};
 if(!graph.sources.some(s=>s.source_id===sid))graph.sources.push(source);if(!graph.entities.some(e=>e.entity_id===docId))graph.entities.push({entity_id:docId,kind:'document',display_name:source.title,status:'reported',privacy_class:'non_sensitive_public_context',attributes:{provider:'gdelt_doc',context_relation:'search_candidate_not_event_identity',index_timestamp_is_not_publication:true},source_ids:[sid],aliases:[],created_at_utc:null});
 const relationId='relation:news:'+await sha(event.entity_id+docId);if(graph.relations.some(r=>r.relation_id===relationId))return graph;
 graph.relations.push({relation_id:relationId,subject_id:event.entity_id,predicate:'RELATED_TO',object_id:docId,source_ids:[sid],status:'unresolved',valid_from_utc:null,valid_to_utc:null,resolution_state:'proposed'});
 return graph;
}
