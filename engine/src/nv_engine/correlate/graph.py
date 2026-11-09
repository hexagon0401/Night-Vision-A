"""Explicit provenance links and separately labelled candidate co-occurrence edges."""
import hashlib
from nv_engine.detect.contracts import EvidenceGraph, GraphEdge, GraphNode


def build_graph(case, anomalies, candidates, edge_budget):
    nodes, edges = {}, {}
    for kind,records in [('source',case.sources),('entity',case.entities),('event',case.events),
                         ('observation',case.observations),('claim',case.claims),('anomaly',anomalies)]:
        for row in records:
            identifier=getattr(row,f'{kind}_id')
            label=getattr(row,'name',getattr(row,'statement',getattr(row,'publisher',getattr(row,'detector',identifier))))
            nodes[(kind,identifier)]=GraphNode(node_id=f'{kind}:{identifier}',record_id=identifier,kind=kind,label=label)
    def add(source_kind,source,target_kind,target,kind,status,source_ids,explanation):
        if (source_kind,source) not in nodes or (target_kind,target) not in nodes: return
        source=f'{source_kind}:{source}';target=f'{target_kind}:{target}'
        edge_id='edge:'+hashlib.sha256(f'{source}|{target}|{kind}'.encode()).hexdigest()
        edges[edge_id]=GraphEdge(edge_id=edge_id,source=source,target=target,kind=kind,
            evidence_status=status,source_ids=sorted(set(source_ids)),explanation=explanation)
    for rows in [case.entities,case.events,case.observations,case.claims,anomalies]:
        for row in rows:
            identifier=getattr(row, f'{type(row).__name__.lower()}_id')
            for source_id in row.provenance.source_ids+row.provenance.corroborating_source_ids:
                add(type(row).__name__.lower(),identifier,'source',source_id,'reported_by',row.evidence_status,[source_id],'Declared source provenance; not independent verification')
    for row in case.observations:
        add('observation',row.observation_id,'entity',row.entity_id,'records_for',row.evidence_status,row.provenance.source_ids,'Measurement record for declared entity')
    for row in case.claims:
        for target_kind,targets in [('observation',row.observation_ids),('event',row.event_ids)]:
          for target in targets:
            add('claim',row.claim_id,target_kind,target,'claim_refers_to',row.evidence_status,row.provenance.source_ids,'Declared claim reference')
        for target in row.counterevidence_claim_ids:
            add('claim',row.claim_id,'claim',target,'counterevidence','disputed',row.provenance.source_ids,'Declared counterevidence; do not hide disagreement')
    for row in case.relations:
        add('entity',row.source_entity_id,'entity',row.target_entity_id,'declared_relation',row.evidence_status,row.provenance.source_ids,row.relation_type)
    for row in anomalies:
        for target in row.observation_ids:
            add('observation',target,'anomaly',row.anomaly_id,'supports','inferred',row.provenance.source_ids,'Measurement used in uncalibrated detector candidate')
    for a,b in candidates:
        add('entity',a.entity_id,'entity',b.entity_id,'candidate_cooccurrence','inferred',a.provenance.source_ids+b.provenance.source_ids,
            'Sourced points near in space/time; no movement, intent or causal inference')
    # Candidate edges first ensure bounded graphs still retain the declared candidate topology.
    ordered=sorted(edges.values(),key=lambda e:({'candidate_cooccurrence':0,'reported_by':1,'supports':2}.get(e.kind,3),e.edge_id))
    selected=ordered[:edge_budget]
    referenced={identifier for edge in selected for identifier in (edge.source,edge.target)}
    return EvidenceGraph(nodes=sorted([n for n in nodes.values() if n.node_id in referenced],key=lambda n:n.node_id),edges=selected,limited=len(ordered)>edge_budget)
