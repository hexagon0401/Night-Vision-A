"""Versioned, provider-independent contracts. No confidence is inferred from counts."""
from datetime import datetime, timezone
from enum import StrEnum
from typing import Annotated, Literal, Self

from pydantic import BaseModel, BeforeValidator, ConfigDict, Field, HttpUrl, model_validator

Identifier = Annotated[str, Field(pattern=r'^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$')]
Text = Annotated[str, Field(min_length=1, pattern=r'\S')]
Hash = Annotated[str, Field(pattern=r'^[a-f0-9]{64}$')]
Number = Annotated[float, Field(strict=True, allow_inf_nan=False)]


def utc(value):
    if isinstance(value, str):
        value = datetime.fromisoformat(value.replace('Z', '+00:00'))
    if not isinstance(value, datetime) or value.tzinfo is None or value.utcoffset() is None:
        raise ValueError('timestamp must be ISO 8601 with an explicit timezone')
    return value.astimezone(timezone.utc)


UTCDateTime = Annotated[datetime, BeforeValidator(utc)]


class Contract(BaseModel):
    model_config = ConfigDict(extra='forbid', validate_default=True)


class EvidenceStatus(StrEnum):
    OBSERVED = 'observed'
    DOCUMENTED = 'documented'
    REPORTED = 'reported'
    INFERRED = 'inferred'
    SCENARIO = 'scenario'
    DISPUTED = 'disputed'
    UNVERIFIED = 'unverified'


class Grade(StrEnum):
    UNKNOWN = 'unknown'
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'


class Source(Contract):
    source_id: Identifier
    url: HttpUrl
    publisher: Text
    publisher_family: Annotated[str, Field(pattern=r'^[a-z0-9][a-z0-9_.:-]{0,127}$')]
    published_at_utc: UTCDateTime | None  # Explicit null means unknown, not retrieval time.
    retrieved_at_utc: UTCDateTime
    content_hash: Hash
    license: Text
    access: Literal['public', 'restricted', 'unknown']
    extraction_method: Text
    quality: Grade = Grade.UNKNOWN


class Provenance(Contract):
    source_ids: Annotated[list[Identifier], Field(min_length=1)]
    corroborating_source_ids: list[Identifier] = Field(default_factory=list)
    extraction_method: Text
    evidence_span_hash: Hash | None = None

    @model_validator(mode='after')
    def distinct(self) -> Self:
        for values in (self.source_ids, self.corroborating_source_ids):
            if len(values) != len(set(values)):
                raise ValueError('duplicate provenance source reference')
        if set(self.source_ids) & set(self.corroborating_source_ids):
            raise ValueError('corroboration must reference separate source records')
        return self


class Location(Contract):
    latitude: Annotated[float, Field(strict=True, ge=-90, le=90, allow_inf_nan=False)]
    longitude: Annotated[float, Field(strict=True, ge=-180, le=180, allow_inf_nan=False)]
    crs: Literal['EPSG:4326'] = 'EPSG:4326'
    role: Literal['verified', 'symbolic']
    source_id: Identifier | None = None
    accuracy_m: Annotated[float, Field(strict=True, ge=0, allow_inf_nan=False)] | None = None
    note: Text | None = None

    @model_validator(mode='after')
    def sourced_or_symbolic(self) -> Self:
        if self.role == 'verified' and self.source_id is None:
            raise ValueError('verified coordinates require a geometry source')
        if self.role == 'symbolic' and (not self.note or self.accuracy_m is not None):
            raise ValueError('symbolic anchors need an explanation and cannot imply accuracy')
        return self


class EvidenceRecord(Contract):
    evidence_status: EvidenceStatus
    confidence: Grade = Grade.UNKNOWN
    provenance: Provenance


class Entity(EvidenceRecord):
    entity_id: Identifier
    entity_type: Text
    name: Text
    location: Location | None = None


class Event(EvidenceRecord):
    event_id: Identifier
    event_type: Text
    event_time_utc: UTCDateTime | None
    description: Text
    entity_ids: list[Identifier] = Field(default_factory=list)
    location: Location | None = None

    @model_validator(mode='after')
    def physical_location(self) -> Self:
        if self.location and self.location.role != 'verified':
            raise ValueError('event locations cannot be symbolic anchors')
        return self


class Observation(EvidenceRecord):
    observation_id: Identifier
    entity_id: Identifier
    observed_at_utc: UTCDateTime
    metric: Text
    value: Number | None
    unit: Text
    source_record_id: Text
    location: Location | None = None

    @model_validator(mode='after')
    def physical_location(self) -> Self:
        if self.location and self.location.role != 'verified':
            raise ValueError('observation locations cannot be symbolic anchors')
        return self


class Claim(EvidenceRecord):
    claim_id: Identifier
    statement: Text
    assessment: Text
    event_ids: list[Identifier] = Field(default_factory=list)
    observation_ids: list[Identifier] = Field(default_factory=list)
    counterevidence_claim_ids: list[Identifier] = Field(default_factory=list)


class Relation(EvidenceRecord):
    relation_id: Identifier
    source_entity_id: Identifier
    target_entity_id: Identifier
    relation_type: Text
    claim_ids: Annotated[list[Identifier], Field(min_length=1)]
    valid_from_utc: UTCDateTime | None = None
    valid_to_utc: UTCDateTime | None = None

    @model_validator(mode='after')
    def interval(self) -> Self:
        if self.valid_from_utc and self.valid_to_utc and self.valid_to_utc < self.valid_from_utc:
            raise ValueError('relation end precedes start')
        return self


class Hypothesis(EvidenceRecord):
    hypothesis_id: Identifier
    description: Text
    status: Literal['open', 'supported', 'refuted']
    claim_ids: Annotated[list[Identifier], Field(min_length=1)]
    alternative_to: list[Identifier] = Field(default_factory=list)
    disconfirming_claim_ids: list[Identifier] = Field(default_factory=list)


class Anomaly(EvidenceRecord):
    anomaly_id: Identifier
    observation_ids: Annotated[list[Identifier], Field(min_length=1)]
    detector: Text
    detector_version: Text
    baseline_description: Text
    window_start_utc: UTCDateTime
    window_end_utc: UTCDateTime
    severity: Grade
    impact: Grade = Grade.UNKNOWN
    score: Number | None = None

    @model_validator(mode='after')
    def interval(self) -> Self:
        if self.window_end_utc < self.window_start_utc:
            raise ValueError('anomaly window end precedes start')
        return self


class NarrativeStep(Contract):
    step_id: Identifier
    scene_type: Literal['focus_location', 'show_entity', 'draw_relation', 'show_evidence',
                        'compare_hypotheses', 'show_counterevidence', 'summarize']
    duration_ms: Annotated[int, Field(strict=True, ge=1, le=60000)]
    camera_target: Location | None
    visible_entity_ids: list[Identifier] = Field(default_factory=list)
    visible_relation_ids: list[Identifier] = Field(default_factory=list)
    subtitle_ko: Text
    subtitle_en: Text
    evidence_claim_ids: Annotated[list[Identifier], Field(min_length=1)]
    evidence_status: EvidenceStatus
    reduced_motion_fallback: Text


class Narrative(Contract):
    narrative_id: Identifier
    anomaly_id: Identifier
    title: Text
    steps: Annotated[list[NarrativeStep], Field(min_length=1)]


class CaseBundle(Contract):
    schema_version: Literal['2.0.0'] = '2.0.0'
    case_id: Identifier
    title: Text
    data_origin: Literal['synthetic', 'source_backed']
    sources: Annotated[list[Source], Field(min_length=1)]
    entities: list[Entity] = Field(default_factory=list)
    events: list[Event] = Field(default_factory=list)
    observations: list[Observation] = Field(default_factory=list)
    claims: list[Claim] = Field(default_factory=list)
    relations: list[Relation] = Field(default_factory=list)
    hypotheses: list[Hypothesis] = Field(default_factory=list)
    anomalies: list[Anomaly] = Field(default_factory=list)
    narratives: list[Narrative] = Field(default_factory=list)

    @model_validator(mode='after')
    def graph_integrity(self) -> Self:
        groups = {
            'source': self.sources, 'entity': self.entities, 'event': self.events,
            'observation': self.observations, 'claim': self.claims, 'relation': self.relations,
            'hypothesis': self.hypotheses, 'anomaly': self.anomalies, 'narrative': self.narratives,
        }
        indexes = {}
        for kind, records in groups.items():
            ids = [getattr(record, f'{kind}_id') for record in records]
            if len(ids) != len(set(ids)):
                raise ValueError(f'duplicate {kind} ID')
            indexes[kind] = dict(zip(ids, records))

        def refs(kind, ids):
            if len(ids) != len(set(ids)):
                raise ValueError(f'duplicate {kind} references')
            for identifier in ids:
                if identifier not in indexes[kind]:
                    raise ValueError(f'unresolved {kind} reference: {identifier}')

        def location(value, provenance=None):
            if value and value.source_id:
                refs('source', [value.source_id])
                if provenance and value.source_id not in provenance.source_ids + provenance.corroborating_source_ids:
                    raise ValueError('geometry source must be included in record provenance')

        for kind, records in groups.items():
            if kind in ('source', 'narrative'):
                continue
            for record in records:
                prov = record.provenance
                refs('source', prov.source_ids + prov.corroborating_source_ids)
                primary_families = {indexes['source'][sid].publisher_family for sid in prov.source_ids}
                families = [indexes['source'][sid].publisher_family for sid in prov.corroborating_source_ids]
                if primary_families.intersection(families) or len(families) != len(set(families)):
                    raise ValueError('corroboration must use independent publisher families')
                location(getattr(record, 'location', None), prov)
        for record in self.events:
            refs('entity', record.entity_ids)
        for record in self.observations:
            refs('entity', [record.entity_id])
        for record in self.claims:
            refs('event', record.event_ids)
            refs('observation', record.observation_ids)
            refs('claim', record.counterevidence_claim_ids)
            if record.claim_id in record.counterevidence_claim_ids:
                raise ValueError('claim cannot counter itself')
        for record in self.relations:
            refs('entity', [record.source_entity_id])
            refs('entity', [record.target_entity_id])
            refs('claim', record.claim_ids)
            for cid in record.claim_ids:
                # Conservative: no inferred/scenario/unverified claim may be promoted by a link.
                status = indexes['claim'][cid].evidence_status
                if status not in (EvidenceStatus.OBSERVED, EvidenceStatus.DOCUMENTED) and record.evidence_status in (EvidenceStatus.OBSERVED, EvidenceStatus.DOCUMENTED):
                    raise ValueError('relation cannot promote a non-direct claim to direct evidence')
        for record in self.hypotheses:
            refs('claim', record.claim_ids)
            refs('claim', record.disconfirming_claim_ids)
            refs('hypothesis', record.alternative_to)
            if record.hypothesis_id in record.alternative_to:
                raise ValueError('hypothesis cannot be its own alternative')
        for record in self.anomalies:
            refs('observation', record.observation_ids)
            if any(not record.window_start_utc <= indexes['observation'][oid].observed_at_utc <= record.window_end_utc for oid in record.observation_ids):
                raise ValueError('anomaly observation falls outside its window')
        for record in self.narratives:
            refs('anomaly', [record.anomaly_id])
            ids = [step.step_id for step in record.steps]
            if len(ids) != len(set(ids)):
                raise ValueError('duplicate narrative step ID')
            for step in record.steps:
                refs('entity', step.visible_entity_ids)
                refs('relation', step.visible_relation_ids)
                refs('claim', step.evidence_claim_ids)
                location(step.camera_target)
                statuses = [indexes['claim'][cid].evidence_status for cid in step.evidence_claim_ids]
                statuses += [indexes['relation'][rid].evidence_status for rid in step.visible_relation_ids]
                if step.evidence_status in (EvidenceStatus.OBSERVED, EvidenceStatus.DOCUMENTED) and any(s not in (EvidenceStatus.OBSERVED, EvidenceStatus.DOCUMENTED) for s in statuses):
                    raise ValueError('narrative cannot promote non-direct evidence')
        return self
