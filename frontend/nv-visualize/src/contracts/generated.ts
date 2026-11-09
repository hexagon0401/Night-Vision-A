/* Generated from schemas/case-bundle.schema.json. Do not edit. */

export type AnomalyId = string;
export type BaselineDescription = string;
export type Grade = 'unknown' | 'low' | 'medium' | 'high';
export type Detector = string;
export type DetectorVersion = string;
export type EvidenceStatus =
  'observed' | 'documented' | 'reported' | 'inferred' | 'scenario' | 'disputed' | 'unverified';
export type Grade1 = 'unknown' | 'low' | 'medium' | 'high';
/**
 * @minItems 1
 */
export type ObservationIds = [string, ...string[]];
export type CorroboratingSourceIds = string[];
export type EvidenceSpanHash = string | null;
export type ExtractionMethod = string;
/**
 * @minItems 1
 */
export type SourceIds = [string, ...string[]];
export type Score = number | null;
export type Grade2 = 'unknown' | 'low' | 'medium' | 'high';
export type WindowEndUtc = string;
export type WindowStartUtc = string;
export type Anomalies = Anomaly[];
export type CaseId = string;
export type Assessment = string;
export type ClaimId = string;
export type Grade3 = 'unknown' | 'low' | 'medium' | 'high';
export type CounterevidenceClaimIds = string[];
export type EventIds = string[];
export type ObservationIds1 = string[];
export type Statement = string;
export type Claims = Claim[];
export type DataOrigin = 'synthetic' | 'source_backed';
export type Grade4 = 'unknown' | 'low' | 'medium' | 'high';
export type EntityId = string;
export type EntityType = string;
export type AccuracyM = number | null;
export type Crs = 'EPSG:4326';
export type Latitude = number;
export type Longitude = number;
export type Note = string | null;
export type Role = 'verified' | 'symbolic';
export type SourceId = string | null;
export type Name = string;
export type Entities = Entity[];
export type Grade5 = 'unknown' | 'low' | 'medium' | 'high';
export type Description = string;
export type EntityIds = string[];
export type EventId = string;
export type EventTimeUtc = string | null;
export type EventType = string;
export type Events = Event[];
export type AlternativeTo = string[];
/**
 * @minItems 1
 */
export type ClaimIds = [string, ...string[]];
export type Grade6 = 'unknown' | 'low' | 'medium' | 'high';
export type Description1 = string;
export type DisconfirmingClaimIds = string[];
export type HypothesisId = string;
export type Status = 'open' | 'supported' | 'refuted';
export type Hypotheses = Hypothesis[];
export type AnomalyId1 = string;
export type NarrativeId = string;
/**
 * @minItems 1
 */
export type Steps = [NarrativeStep, ...NarrativeStep[]];
export type DurationMs = number;
/**
 * @minItems 1
 */
export type EvidenceClaimIds = [string, ...string[]];
export type ReducedMotionFallback = string;
export type SceneType =
  | 'focus_location'
  | 'show_entity'
  | 'draw_relation'
  | 'show_evidence'
  | 'compare_hypotheses'
  | 'show_counterevidence'
  | 'summarize';
export type StepId = string;
export type SubtitleEn = string;
export type SubtitleKo = string;
export type VisibleEntityIds = string[];
export type VisibleRelationIds = string[];
export type Title = string;
export type Narratives = Narrative[];
export type Grade7 = 'unknown' | 'low' | 'medium' | 'high';
export type EntityId1 = string;
export type Metric = string;
export type ObservationId = string;
export type ObservedAtUtc = string;
export type SourceRecordId = string;
export type Unit = string;
export type Value = number | null;
export type Observations = Observation[];
/**
 * @minItems 1
 */
export type ClaimIds1 = [string, ...string[]];
export type Grade8 = 'unknown' | 'low' | 'medium' | 'high';
export type RelationId = string;
export type RelationType = string;
export type SourceEntityId = string;
export type TargetEntityId = string;
export type ValidFromUtc = string | null;
export type ValidToUtc = string | null;
export type Relations = Relation[];
export type SchemaVersion = '2.0.0';
/**
 * @minItems 1
 */
export type Sources = [Source, ...Source[]];
export type Access = 'public' | 'restricted' | 'unknown';
export type ContentHash = string;
export type ExtractionMethod1 = string;
export type License = string;
export type PublishedAtUtc = string | null;
export type Publisher = string;
export type PublisherFamily = string;
export type Grade9 = 'unknown' | 'low' | 'medium' | 'high';
export type RetrievedAtUtc = string;
export type SourceId1 = string;
export type Url = string;
export type Title1 = string;

export interface CaseBundle {
  anomalies?: Anomalies;
  case_id: CaseId;
  claims?: Claims;
  data_origin: DataOrigin;
  entities?: Entities;
  events?: Events;
  hypotheses?: Hypotheses;
  narratives?: Narratives;
  observations?: Observations;
  relations?: Relations;
  schema_version?: SchemaVersion;
  sources: Sources;
  title: Title1;
}
export interface Anomaly {
  anomaly_id: AnomalyId;
  baseline_description: BaselineDescription;
  confidence?: Grade;
  detector: Detector;
  detector_version: DetectorVersion;
  evidence_status: EvidenceStatus;
  impact?: Grade1;
  observation_ids: ObservationIds;
  provenance: Provenance;
  score?: Score;
  severity: Grade2;
  window_end_utc: WindowEndUtc;
  window_start_utc: WindowStartUtc;
}
export interface Provenance {
  corroborating_source_ids?: CorroboratingSourceIds;
  evidence_span_hash?: EvidenceSpanHash;
  extraction_method: ExtractionMethod;
  source_ids: SourceIds;
}
export interface Claim {
  assessment: Assessment;
  claim_id: ClaimId;
  confidence?: Grade3;
  counterevidence_claim_ids?: CounterevidenceClaimIds;
  event_ids?: EventIds;
  evidence_status: EvidenceStatus;
  observation_ids?: ObservationIds1;
  provenance: Provenance;
  statement: Statement;
}
export interface Entity {
  confidence?: Grade4;
  entity_id: EntityId;
  entity_type: EntityType;
  evidence_status: EvidenceStatus;
  location?: Location | null;
  name: Name;
  provenance: Provenance;
}
export interface Location {
  accuracy_m?: AccuracyM;
  crs?: Crs;
  latitude: Latitude;
  longitude: Longitude;
  note?: Note;
  role: Role;
  source_id?: SourceId;
}
export interface Event {
  confidence?: Grade5;
  description: Description;
  entity_ids?: EntityIds;
  event_id: EventId;
  event_time_utc: EventTimeUtc;
  event_type: EventType;
  evidence_status: EvidenceStatus;
  location?: Location | null;
  provenance: Provenance;
}
export interface Hypothesis {
  alternative_to?: AlternativeTo;
  claim_ids: ClaimIds;
  confidence?: Grade6;
  description: Description1;
  disconfirming_claim_ids?: DisconfirmingClaimIds;
  evidence_status: EvidenceStatus;
  hypothesis_id: HypothesisId;
  provenance: Provenance;
  status: Status;
}
export interface Narrative {
  anomaly_id: AnomalyId1;
  narrative_id: NarrativeId;
  steps: Steps;
  title: Title;
}
export interface NarrativeStep {
  camera_target: Location | null;
  duration_ms: DurationMs;
  evidence_claim_ids: EvidenceClaimIds;
  evidence_status: EvidenceStatus;
  reduced_motion_fallback: ReducedMotionFallback;
  scene_type: SceneType;
  step_id: StepId;
  subtitle_en: SubtitleEn;
  subtitle_ko: SubtitleKo;
  visible_entity_ids?: VisibleEntityIds;
  visible_relation_ids?: VisibleRelationIds;
}
export interface Observation {
  confidence?: Grade7;
  entity_id: EntityId1;
  evidence_status: EvidenceStatus;
  location?: Location | null;
  metric: Metric;
  observation_id: ObservationId;
  observed_at_utc: ObservedAtUtc;
  provenance: Provenance;
  source_record_id: SourceRecordId;
  unit: Unit;
  value: Value;
}
export interface Relation {
  claim_ids: ClaimIds1;
  confidence?: Grade8;
  evidence_status: EvidenceStatus;
  provenance: Provenance;
  relation_id: RelationId;
  relation_type: RelationType;
  source_entity_id: SourceEntityId;
  target_entity_id: TargetEntityId;
  valid_from_utc?: ValidFromUtc;
  valid_to_utc?: ValidToUtc;
}
export interface Source {
  access: Access;
  content_hash: ContentHash;
  extraction_method: ExtractionMethod1;
  license: License;
  published_at_utc: PublishedAtUtc;
  publisher: Publisher;
  publisher_family: PublisherFamily;
  quality?: Grade9;
  retrieved_at_utc: RetrievedAtUtc;
  source_id: SourceId1;
  url: Url;
}
