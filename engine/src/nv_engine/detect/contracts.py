"""Deterministic analysis contracts; scores are not probabilities."""
from typing import Annotated, Literal
from pydantic import Field, model_validator
from nv_engine.models import Anomaly, CaseBundle, EvidenceStatus
from nv_engine.models.canonical import Contract


class DetectionConfig(Contract):
    min_history: Annotated[int, Field(ge=4, le=128)] = 8
    history_window: Annotated[int, Field(ge=4, le=256)] = 64
    mad_threshold: Annotated[float, Field(gt=0, le=100, allow_inf_nan=False)] = 6.0
    scale_floor: Annotated[float, Field(gt=0, allow_inf_nan=False)] = 1.0
    cusum_drift: Annotated[float, Field(gt=0, le=10, allow_inf_nan=False)] = 0.5
    cusum_threshold: Annotated[float, Field(gt=0, le=100, allow_inf_nan=False)] = 8.0
    cooldown_points: Annotated[int, Field(ge=1, le=128)] = 8
    seasonality: Literal['none', 'hour_of_day_utc'] = 'none'
    spatial_radius_km: Annotated[float, Field(gt=0, le=500, allow_inf_nan=False)] = 25.0
    spatial_window_seconds: Annotated[int, Field(ge=1, le=86400)] = 3600
    spatial_min_entities: Annotated[int, Field(ge=3, le=20)] = 3
    spatial_point_budget: Annotated[int, Field(ge=3, le=512)] = 256
    graph_edge_budget: Annotated[int, Field(ge=16, le=2048)] = 512

    @model_validator(mode='after')
    def window(self):
        if self.history_window < self.min_history:
            raise ValueError('history_window must cover min_history')
        return self


class GraphNode(Contract):
    node_id: str
    record_id: str
    kind: Literal['source', 'entity', 'event', 'observation', 'claim', 'anomaly']
    label: str


class GraphEdge(Contract):
    edge_id: str
    source: str
    target: str
    kind: Literal['reported_by', 'records_for', 'supports', 'claim_refers_to',
                  'declared_relation', 'candidate_cooccurrence', 'counterevidence']
    evidence_status: EvidenceStatus
    source_ids: list[str]
    explanation: str


class EvidenceGraph(Contract):
    nodes: list[GraphNode]
    edges: list[GraphEdge]
    limited: bool


class AnalysisReport(Contract):
    analysis_version: Literal['1.0.0'] = '1.0.0'
    calibration: Literal['uncalibrated'] = 'uncalibrated'
    case_id: str
    data_origin: Literal['synthetic', 'source_backed']
    configuration: DetectionConfig
    anomalies: list[Anomaly]
    graph: EvidenceGraph
    counts: dict[str, int]
    warnings: list[str]


class AnalysisRequest(Contract):
    case: CaseBundle
    configuration: DetectionConfig = Field(default_factory=DetectionConfig)

    @model_validator(mode='after')
    def budget(self):
        check_budget(self.case)
        return self


def check_budget(case: CaseBundle):
    collections = ('sources', 'entities', 'events', 'observations', 'claims', 'relations', 'hypotheses', 'anomalies', 'narratives')
    if len(case.observations) > 2048 or sum(len(getattr(case, name)) for name in collections) > 4096:
        raise ValueError('analysis input budget exceeded')
