"""Source-linked scene plans. No invented corroboration, routes or predictions."""
import hashlib
from nv_engine.models import CaseBundle, Claim, Narrative, NarrativeStep, Provenance, Relation


def identifier(kind, value):
    return f'{kind}:' + hashlib.sha256(value.encode()).hexdigest()


def build_narrative(case: CaseBundle, anomaly_id: str) -> CaseBundle:
    case=CaseBundle.model_validate(case.model_dump(mode='json'))
    anomaly=next((a for a in case.anomalies if a.anomaly_id==anomaly_id),None)
    if anomaly is None: raise ValueError('unknown anomaly ID')
    rows=sorted([o for o in case.observations if o.observation_id in anomaly.observation_ids],key=lambda o:(o.observed_at_utc,o.observation_id))
    if not rows: raise ValueError('narrative needs evidenced observations')
    key=f'1.0.0:{anomaly_id}'
    claim_id=identifier('trace-claim',key)
    prov=Provenance(source_ids=anomaly.provenance.source_ids,extraction_method='nv:deterministic-narrative:1.0.0')
    claim=Claim(claim_id=claim_id,statement=f'Uncalibrated {anomaly.detector} candidate over {len(rows)} referenced measurements',
        assessment='Algorithmic interpretation; source count does not establish independence or cause',evidence_status='inferred',
        provenance=prov,observation_ids=[o.observation_id for o in rows])
    claims={c.claim_id:c for c in case.claims};claims[claim_id]=claim
    entities=sorted({o.entity_id for o in rows})
    relation_ids=[];relations={r.relation_id:r for r in case.relations}
    if anomaly.detector=='spatial-component':
        for source,target in zip(entities,entities[1:]):
            rid=identifier('trace-relation',key+source+target)
            relations[rid]=Relation(relation_id=rid,source_entity_id=source,target_entity_id=target,
                relation_type='candidate_cooccurrence',claim_ids=[claim_id],evidence_status='inferred',provenance=prov,
                valid_from_utc=anomaly.window_start_utc,valid_to_utc=anomaly.window_end_utc)
            relation_ids.append(rid)
    linked=[c for c in case.claims if set(c.observation_ids)&set(anomaly.observation_ids)]
    counter=sorted({cid for c in linked for cid in c.counterevidence_claim_ids})
    counter+=sorted({cid for h in case.hypotheses if set(h.claim_ids)&{c.claim_id for c in linked} for cid in h.disconfirming_claim_ids})
    counter=sorted(set(counter))
    family_count=len({s.publisher_family for s in case.sources if s.source_id in anomaly.provenance.source_ids})
    camera=rows[-1].location
    descriptions=[
      ('focus_location',f'관측 기록 {len(rows)}개에서 탐색을 시작합니다.','Start with the referenced observations.'),
      ('show_evidence',f'{anomaly.detector}의 미보정 후보 점수는 {anomaly.score:g}입니다.' if anomaly.score is not None else '후보 점수는 확인되지 않았습니다.','This is an uncalibrated detector candidate, not a probability.'),
      ('draw_relation' if relation_ids else 'show_evidence',f'출처 {len(anomaly.provenance.source_ids)}개, 발행 계열 {family_count}개입니다. 관계는 검토가 필요한 후보입니다.','Sources and publisher families remain distinct; relationships are candidates.'),
      ('show_counterevidence','등록된 반증 자료를 함께 확인합니다.' if counter else '독립적인 반증 자료가 아직 등록되지 않았습니다.','Review registered counterevidence.' if counter else 'Independent counterevidence has not been registered.'),
      ('summarize','신뢰도와 실제 영향은 미확정입니다. 원문과 대안 설명을 검증해야 합니다.','Confidence and real-world impact remain unknown; verify sources and alternatives.'),
    ]
    steps=[]
    for i,(scene,ko,en) in enumerate(descriptions):
        steps.append(NarrativeStep(step_id=identifier('trace-step',key+str(i)),scene_type=scene,duration_ms=4500,
            camera_target=rows[0].location if i==0 else camera,visible_entity_ids=entities,visible_relation_ids=relation_ids if i>=2 else [],
            subtitle_ko=ko,subtitle_en=en,evidence_claim_ids=counter if i==3 and counter else [claim_id],
            evidence_status='inferred',reduced_motion_fallback='Show complete static relations and the current subtitle without camera animation'))
    narrative=Narrative(narrative_id=identifier('narrative',key),anomaly_id=anomaly_id,title=f'{anomaly.detector} evidence trace',steps=steps)
    narratives={n.narrative_id:n for n in case.narratives};narratives[narrative.narrative_id]=narrative
    return CaseBundle.model_validate(case.model_copy(update={'claims':list(claims.values()),'relations':list(relations.values()),'narratives':list(narratives.values())}).model_dump(mode='json'))


def attach_traces(case: CaseBundle, report) -> CaseBundle:
    combined={a.anomaly_id:a for a in case.anomalies}
    combined.update({a.anomaly_id:a for a in report.anomalies})
    case=CaseBundle.model_validate(case.model_copy(update={'anomalies':list(combined.values())}).model_dump(mode='json'))
    for anomaly in report.anomalies: case=build_narrative(case,anomaly.anomaly_id)
    return case
