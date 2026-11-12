"""Additive nv-ontology/2.0 contract; canonical CaseBundle remains unchanged.

Adapted from the user's v3.2 handoff. Structural validation and cross-record
validation run together. This module has no network, storage or UI dependency.
"""
from datetime import timedelta
from typing import Annotated, Literal, Self
from urllib.parse import urlsplit

from pydantic import BaseModel, BeforeValidator, ConfigDict, Field, JsonValue, model_validator

from .canonical import Hash, UTCDateTime

ObjectID = Annotated[str, Field(min_length=3, max_length=256, pattern=r'^[A-Za-z][A-Za-z0-9:._@-]+$')]
Text = Annotated[str, Field(min_length=1, max_length=5000, pattern=r'\S')]
Number = Annotated[float, Field(strict=True, allow_inf_nan=False)]
Nonnegative = Annotated[Number, Field(ge=0)]
Status = Literal['observed', 'documented', 'reported', 'inferred', 'scenario', 'refuted', 'unresolved']
Kind = Literal['event', 'vessel', 'aircraft', 'satellite_scene', 'camera', 'facility',
               'organization', 'location', 'person_public', 'document', 'anomaly']
SourceIDs = Annotated[list[ObjectID], Field(min_length=1, max_length=500)]
Coordinate = Annotated[
    tuple[Annotated[Number, Field(ge=-180, le=180)], Annotated[Number, Field(ge=-90, le=90)]],
    BeforeValidator(lambda value: tuple(value) if isinstance(value, list) else value),
]
Ring = Annotated[list[Coordinate], Field(min_length=4)]


class Contract(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True, validate_default=True, allow_inf_nan=False)


def check_position(p: list[float]) -> None:
    if not (-180 <= p[0] <= 180 and -90 <= p[1] <= 90):
        raise ValueError('invalid_wgs84_coordinate')


def check_polygon(rings: list[list[list[float]]]) -> None:
    for ring in rings:
        if ring[0] != ring[-1]:
            raise ValueError('unclosed_polygon_ring')
        for p in ring:
            check_position(p)


class Point(Contract):
    type: Literal['Point']
    coordinates: Coordinate

    @model_validator(mode='after')
    def geometry(self) -> Self:
        check_position(self.coordinates)
        return self


class Polygon(Contract):
    type: Literal['Polygon']
    coordinates: Annotated[list[Ring], Field(min_length=1)]

    @model_validator(mode='after')
    def geometry(self) -> Self:
        check_polygon(self.coordinates)
        return self


class MultiPolygon(Contract):
    type: Literal['MultiPolygon']
    coordinates: Annotated[list[Annotated[list[Ring], Field(min_length=1)]], Field(min_length=1)]

    @model_validator(mode='after')
    def geometry(self) -> Self:
        for polygon in self.coordinates:
            check_polygon(polygon)
        return self


Geometry = Annotated[Point | Polygon | MultiPolygon, Field(discriminator='type')]


class OntologyEntity(Contract):
    entity_id: ObjectID
    kind: Kind
    display_name: Annotated[str, Field(min_length=1, max_length=300)]
    status: Status
    privacy_class: Literal['public', 'restricted', 'non_sensitive_public_context']
    attributes: dict[str, JsonValue]
    source_ids: list[ObjectID]
    aliases: list[Annotated[str, Field(max_length=300)]] = Field(default_factory=list)
    created_at_utc: UTCDateTime | None = None


class OntologyIdentifier(Contract):
    identifier_id: ObjectID
    entity_id: ObjectID
    namespace: Annotated[str, Field(min_length=1, max_length=50)]
    value: Annotated[str, Field(min_length=1, max_length=255)]
    valid_from_utc: UTCDateTime | None
    valid_to_utc: UTCDateTime | None
    source_ids: SourceIDs
    status: Status


class OntologyObservation(Contract):
    observation_id: ObjectID
    entity_id: ObjectID
    provider_id: Text
    observed_at_utc: UTCDateTime | None
    acquired_at_utc: UTCDateTime | None
    recorded_at_utc: UTCDateTime | None
    source_ids: SourceIDs
    status: Status
    geometry: Geometry | None
    geometry_source_id: ObjectID | None
    precision_m: Nonnegative | None
    geometry_role: Literal['measured_position', 'provider_reported_position', 'scene_footprint', 'catalog_location', 'unlocated']
    visibility_policy: Literal['public', 'restricted', 'delayed_public', 'aggregated_only']
    measurements: dict[str, JsonValue]
    quality_notes: list[str] = Field(default_factory=list)


class OntologySource(Contract):
    source_id: ObjectID
    url: str | None
    publisher: str | None
    content_hash: Hash | None
    original_or_derived: Literal['original', 'derived', 'unknown']
    derived_from_source_id: ObjectID | None
    independence_group: str | None
    published_at_utc: UTCDateTime | None
    indexed_at_utc: UTCDateTime | None
    acquired_at_utc: UTCDateTime | None
    license_status: Literal['approved', 'metadata_only', 'pending', 'prohibited', 'unknown']
    access_status: Literal['opened', 'metadata_only', 'failed', 'restricted', 'not_fetched']
    title: str | None = None
    quote_span: str | None = None

    @model_validator(mode='after')
    def safe_url(self) -> Self:
        if self.url is not None:
            u = urlsplit(self.url)
            if u.scheme not in ('http', 'https') or not u.hostname or u.username or u.password:
                raise ValueError('invalid_source_url')
        return self


class OntologyClaim(Contract):
    claim_id: ObjectID
    statement: Text
    language: str | None
    source_ids: SourceIDs
    status: Status
    event_from_utc: UTCDateTime | None
    event_to_utc: UTCDateTime | None
    limitations: list[str]
    review_state: Literal['not_reviewed', 'proposed', 'human_reviewed', 'source_verified', 'rejected']
    quote_span: str | None = None


class EvidenceLink(Contract):
    evidence_link_id: ObjectID
    claim_id: ObjectID
    source_id: ObjectID
    role: Literal['SUPPORTS', 'CONTRADICTS', 'MENTIONS', 'DERIVED_FROM', 'UNVERIFIED_MATCH']
    quote_span: str | None
    status: Status


class OntologyRelation(Contract):
    relation_id: ObjectID
    subject_id: ObjectID
    predicate: Literal['REPORTED_IN', 'OBSERVED_AT', 'OPERATED_BY', 'LOCATED_AT', 'MENTIONED_IN',
                       'RELATED_TO', 'CITES', 'DERIVED_FROM', 'CONTRADICTS', 'CORROBORATES',
                       'POSSIBLY_SAME_AS', 'REPORTED_INVOLVED_IN']
    object_id: ObjectID
    source_ids: SourceIDs
    status: Status
    valid_from_utc: UTCDateTime | None
    valid_to_utc: UTCDateTime | None
    resolution_state: Literal['proposed', 'accepted', 'rejected']


class OntologyAnomaly(Contract):
    candidate_id: ObjectID
    entity_id: ObjectID | None
    metric: Text
    detector: Text
    baseline: dict[str, JsonValue]
    score: Number | None
    calibration: Literal['uncalibrated', 'calibrated_with_validation']
    source_ids: SourceIDs
    observation_ids: Annotated[list[ObjectID], Field(min_length=1)]
    status: Status
    review_state: Literal['candidate', 'reviewed', 'rejected']


class ExecutionReceipt(Contract):
    tool_name: Text
    tool_call_id: Text
    completed_at_utc: UTCDateTime


class ModuleRun(Contract):
    module_run_id: ObjectID
    case_id: ObjectID
    module: Text
    status: Literal['completed', 'partial', 'blocked', 'not_executed']
    executor: Literal['deterministic_adapter', 'inline_skill', 'mcp_remote_verified', 'not_executed']
    started_at_utc: UTCDateTime | None
    completed_at_utc: UTCDateTime | None
    input_hash: Hash | None
    result_hash: Hash | None
    receipt: ExecutionReceipt | None


class OntologyGraph(Contract):
    model_config = ConfigDict(title='NV Ontology Graph v2', json_schema_extra={
        '$schema': 'https://json-schema.org/draft/2020-12/schema',
        '$id': 'https://nightvision.hexagon0401.workers.dev/schemas/ontology-graph.v2.schema.json',
    })
    schema_version: Literal['nv-ontology/2.0']
    synthetic: bool
    entities: list[OntologyEntity]
    identifiers: list[OntologyIdentifier]
    observations: list[OntologyObservation]
    sources: list[OntologySource]
    claims: list[OntologyClaim]
    evidence_links: list[EvidenceLink]
    relations: list[OntologyRelation]
    anomalies: list[OntologyAnomaly]
    module_runs: list[ModuleRun]
    as_of_utc: UTCDateTime | None = None

    @model_validator(mode='after')
    def graph_integrity(self) -> Self:
        indexes = {}
        for group, key in [('entities', 'entity_id'), ('identifiers', 'identifier_id'),
                           ('observations', 'observation_id'), ('sources', 'source_id'),
                           ('claims', 'claim_id'), ('evidence_links', 'evidence_link_id'),
                           ('relations', 'relation_id'), ('anomalies', 'candidate_id'),
                           ('module_runs', 'module_run_id')]:
            records = getattr(self, group)
            index = {getattr(r, key): r for r in records}
            if len(index) != len(records):
                raise ValueError('duplicate_ids:' + group)
            indexes[group] = index

        def refs(group, ids):
            if len(ids) != len(set(ids)):
                raise ValueError('duplicate_references:' + group)
            for identifier in ids:
                if identifier not in indexes[group]:
                    raise ValueError('unknown_reference:' + group + ':' + identifier)

        def interval(start, end):
            if start is not None and end is not None and end < start:
                raise ValueError('reverse_interval')

        for e in self.entities:
            refs('sources', e.source_ids)
        for s in self.sources:
            if s.original_or_derived == 'derived' and s.derived_from_source_id is None:
                raise ValueError('missing_derived_from:' + s.source_id)
            seen = {s.source_id}
            parent = s.derived_from_source_id
            while parent is not None:
                refs('sources', [parent])
                if parent in seen:
                    raise ValueError('cyclic_source_lineage')
                seen.add(parent)
                parent = indexes['sources'][parent].derived_from_source_id
        for i in self.identifiers:
            refs('entities', [i.entity_id]); refs('sources', i.source_ids)
            interval(i.valid_from_utc, i.valid_to_utc)
        for o in self.observations:
            refs('entities', [o.entity_id]); refs('sources', o.source_ids)
            if o.geometry is None:
                if o.geometry_source_id is not None or o.geometry_role != 'unlocated' or o.precision_m is not None:
                    raise ValueError('invalid_null_geometry:' + o.observation_id)
            elif o.geometry_role == 'unlocated' or o.geometry_source_id not in o.source_ids:
                raise ValueError('geometry_source_missing:' + o.observation_id)
            entity = indexes['entities'][o.entity_id]
            if entity.privacy_class == 'restricted' and o.visibility_policy != 'restricted':
                raise ValueError('restricted_entity_public_observation')
            if entity.kind == 'person_public' and o.geometry is not None and o.visibility_policy != 'restricted':
                raise ValueError('person_location_not_public')
            if o.observed_at_utc and o.acquired_at_utc and o.observed_at_utc > o.acquired_at_utc + timedelta(minutes=10):
                raise ValueError('observation_in_future')
            if o.acquired_at_utc and o.recorded_at_utc and o.acquired_at_utc > o.recorded_at_utc + timedelta(minutes=10):
                raise ValueError('acquisition_after_recording')
        for c in self.claims:
            refs('sources', c.source_ids); interval(c.event_from_utc, c.event_to_utc)
            if c.review_state == 'source_verified' and c.status in ('inferred', 'scenario'):
                raise ValueError('inference_is_not_source_verified')
        for link in self.evidence_links:
            refs('claims', [link.claim_id]); refs('sources', [link.source_id])
            if link.source_id not in indexes['claims'][link.claim_id].source_ids:
                raise ValueError('evidence_link_source_outside_claim')
        for r in self.relations:
            refs('entities', [r.subject_id]); refs('entities', [r.object_id]); refs('sources', r.source_ids)
            interval(r.valid_from_utc, r.valid_to_utc)
            if r.subject_id == r.object_id:
                raise ValueError('self_relation_not_supported')
            if r.predicate == 'POSSIBLY_SAME_AS' and r.resolution_state == 'accepted':
                raise ValueError('unverified_merge_relation')
            if r.status in ('inferred', 'scenario', 'unresolved') and r.resolution_state == 'accepted':
                raise ValueError('unreviewed_relation_promotion')
        for a in self.anomalies:
            refs('sources', a.source_ids); refs('observations', a.observation_ids)
            if a.entity_id is not None:
                refs('entities', [a.entity_id])
                if any(indexes['observations'][oid].entity_id != a.entity_id for oid in a.observation_ids):
                    raise ValueError('anomaly_entity_mismatch')
            if a.calibration == 'calibrated_with_validation' and a.review_state != 'reviewed':
                raise ValueError('uncorroborated_calibration')
        for run in self.module_runs:
            interval(run.started_at_utc, run.completed_at_utc)
            if run.executor == 'not_executed' and run.status in ('completed', 'partial'):
                raise ValueError('false_module_completion')
            if run.executor == 'mcp_remote_verified' and run.receipt is None:
                raise ValueError('missing_execution_receipt')
            if run.status == 'completed' and (run.started_at_utc is None or run.completed_at_utc is None or run.input_hash is None or run.result_hash is None):
                raise ValueError('missing_completed_run_provenance')
            if run.receipt and run.completed_at_utc != run.receipt.completed_at_utc:
                raise ValueError('execution_receipt_time_mismatch')
        return self
