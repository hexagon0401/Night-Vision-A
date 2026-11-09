"""Collector output retains canonical models plus provider-specific lineage."""
from datetime import date
from typing import Literal
from pydantic import Field
from nv_engine.models import Claim, Entity, Event, Observation, Source
from nv_engine.models.canonical import Contract, Hash, UTCDateTime


class CollectedRecord(Contract):
    data_origin: Literal['synthetic', 'source_backed']
    record_key: Hash
    story_key: Hash
    provider_id: str
    provider_endpoint: str
    provider_parameters: dict[str, str]
    license_terms_url: str
    upstream_record_id: str
    response_hash: Hash
    payload_hash: Hash
    provider_seen_at_utc: UTCDateTime | None = None
    event_date_start: date | None = None
    event_date_end: date | None = None
    date_precision: Literal['instant', 'day', 'unknown'] = 'unknown'
    source: Source
    claim: Claim
    entity: Entity | None = None
    event: Event | None = None
    observation: Observation | None = None
    data_gaps: list[str] = Field(default_factory=list)


class CollectionReport(Contract):
    provider_id: str
    provider_endpoint: str
    provider_parameters: dict[str, str]
    license_terms_url: str
    rights_reviewed: bool
    redistribution: Literal['review_required', 'permitted', 'restricted']
    input_mode: Literal['replay', 'live']
    response_hash: Hash
    fetched_at_utc: UTCDateTime
    from_cache: bool
    considered: int
    accepted: int
    newly_stored: int
    duplicates: int
    skipped: int
    limited: bool
    next_page_available: bool = False
    skip_reasons: dict[str, int] = Field(default_factory=dict)


class CollectionResult(Contract):
    collector_schema_version: Literal['1.0.0'] = '1.0.0'
    report: CollectionReport
    records: list[CollectedRecord]
