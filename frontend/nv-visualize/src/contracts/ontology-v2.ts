/* Generated from schemas/ontology-graph.v2.schema.json. Do not edit. */

export type JsonValue = unknown;
export type Calibration = 'uncalibrated' | 'calibrated_with_validation';
export type CandidateId = string;
export type Detector = string;
export type EntityId = string | null;
export type Metric = string;
/**
 * @minItems 1
 */
export type ObservationIds = [string, ...string[]];
export type ReviewState = 'candidate' | 'reviewed' | 'rejected';
export type Score = number | null;
/**
 * @minItems 1
 * @maxItems 500
 */
export type SourceIds = [string, ...string[]];
export type Status = 'observed' | 'documented' | 'reported' | 'inferred' | 'scenario' | 'refuted' | 'unresolved';
export type Anomalies = OntologyAnomaly[];
export type AsOfUtc = string | null;
export type ClaimId = string;
export type EventFromUtc = string | null;
export type EventToUtc = string | null;
export type Language = string | null;
export type Limitations = string[];
export type QuoteSpan = string | null;
export type ReviewState1 = 'not_reviewed' | 'proposed' | 'human_reviewed' | 'source_verified' | 'rejected';
/**
 * @minItems 1
 * @maxItems 500
 */
export type SourceIds1 = [string, ...string[]];
export type Statement = string;
export type Status1 = 'observed' | 'documented' | 'reported' | 'inferred' | 'scenario' | 'refuted' | 'unresolved';
export type Claims = OntologyClaim[];
export type Aliases = string[];
export type CreatedAtUtc = string | null;
export type DisplayName = string;
export type EntityId1 = string;
export type Kind =
  | 'event'
  | 'vessel'
  | 'aircraft'
  | 'satellite_scene'
  | 'camera'
  | 'facility'
  | 'organization'
  | 'location'
  | 'person_public'
  | 'document'
  | 'anomaly';
export type PrivacyClass = 'public' | 'restricted' | 'non_sensitive_public_context';
export type SourceIds2 = string[];
export type Status2 = 'observed' | 'documented' | 'reported' | 'inferred' | 'scenario' | 'refuted' | 'unresolved';
export type Entities = OntologyEntity[];
export type ClaimId1 = string;
export type EvidenceLinkId = string;
export type QuoteSpan1 = string | null;
export type Role = 'SUPPORTS' | 'CONTRADICTS' | 'MENTIONS' | 'DERIVED_FROM' | 'UNVERIFIED_MATCH';
export type SourceId = string;
export type Status3 = 'observed' | 'documented' | 'reported' | 'inferred' | 'scenario' | 'refuted' | 'unresolved';
export type EvidenceLinks = EvidenceLink[];
export type EntityId2 = string;
export type IdentifierId = string;
export type Namespace = string;
/**
 * @minItems 1
 * @maxItems 500
 */
export type SourceIds3 = [string, ...string[]];
export type Status4 = 'observed' | 'documented' | 'reported' | 'inferred' | 'scenario' | 'refuted' | 'unresolved';
export type ValidFromUtc = string | null;
export type ValidToUtc = string | null;
export type Value = string;
export type Identifiers = OntologyIdentifier[];
export type CaseId = string;
export type CompletedAtUtc = string | null;
export type Executor = 'deterministic_adapter' | 'inline_skill' | 'mcp_remote_verified' | 'not_executed';
export type InputHash = string | null;
export type Module = string;
export type ModuleRunId = string;
export type CompletedAtUtc1 = string;
export type ToolCallId = string;
export type ToolName = string;
export type ResultHash = string | null;
export type StartedAtUtc = string | null;
export type Status5 = 'completed' | 'partial' | 'blocked' | 'not_executed';
export type ModuleRuns = ModuleRun[];
export type AcquiredAtUtc = string | null;
export type EntityId3 = string;
export type Geometry = (Point | Polygon | MultiPolygon) | null;
/**
 * @minItems 2
 * @maxItems 2
 */
export type Coordinates = [unknown, unknown];
export type Type = 'Point';
/**
 * @minItems 1
 */
export type Coordinates1 = [
  [[unknown, unknown], [unknown, unknown], [unknown, unknown], [unknown, unknown], ...[unknown, unknown][]],
  ...[[unknown, unknown], [unknown, unknown], [unknown, unknown], [unknown, unknown], ...[unknown, unknown][]][]
];
export type Type1 = 'Polygon';
/**
 * @minItems 1
 */
export type Coordinates2 = [
  [
    [[unknown, unknown], [unknown, unknown], [unknown, unknown], [unknown, unknown], ...[unknown, unknown][]],
    ...[[unknown, unknown], [unknown, unknown], [unknown, unknown], [unknown, unknown], ...[unknown, unknown][]][]
  ],
  ...[
    [[unknown, unknown], [unknown, unknown], [unknown, unknown], [unknown, unknown], ...[unknown, unknown][]],
    ...[[unknown, unknown], [unknown, unknown], [unknown, unknown], [unknown, unknown], ...[unknown, unknown][]][]
  ][]
];
export type Type2 = 'MultiPolygon';
export type GeometryRole =
  'measured_position' | 'provider_reported_position' | 'scene_footprint' | 'catalog_location' | 'unlocated';
export type GeometrySourceId = string | null;
export type ObservationId = string;
export type ObservedAtUtc = string | null;
export type PrecisionM = number | null;
export type ProviderId = string;
export type QualityNotes = string[];
export type RecordedAtUtc = string | null;
/**
 * @minItems 1
 * @maxItems 500
 */
export type SourceIds4 = [string, ...string[]];
export type Status6 = 'observed' | 'documented' | 'reported' | 'inferred' | 'scenario' | 'refuted' | 'unresolved';
export type VisibilityPolicy = 'public' | 'restricted' | 'delayed_public' | 'aggregated_only';
export type Observations = OntologyObservation[];
export type ObjectId = string;
export type Predicate =
  | 'REPORTED_IN'
  | 'OBSERVED_AT'
  | 'OPERATED_BY'
  | 'LOCATED_AT'
  | 'MENTIONED_IN'
  | 'RELATED_TO'
  | 'CITES'
  | 'DERIVED_FROM'
  | 'CONTRADICTS'
  | 'CORROBORATES'
  | 'POSSIBLY_SAME_AS'
  | 'REPORTED_INVOLVED_IN';
export type RelationId = string;
export type ResolutionState = 'proposed' | 'accepted' | 'rejected';
/**
 * @minItems 1
 * @maxItems 500
 */
export type SourceIds5 = [string, ...string[]];
export type Status7 = 'observed' | 'documented' | 'reported' | 'inferred' | 'scenario' | 'refuted' | 'unresolved';
export type SubjectId = string;
export type ValidFromUtc1 = string | null;
export type ValidToUtc1 = string | null;
export type Relations = OntologyRelation[];
export type SchemaVersion = 'nv-ontology/2.0';
export type AccessStatus = 'opened' | 'metadata_only' | 'failed' | 'restricted' | 'not_fetched';
export type AcquiredAtUtc1 = string | null;
export type ContentHash = string | null;
export type DerivedFromSourceId = string | null;
export type IndependenceGroup = string | null;
export type IndexedAtUtc = string | null;
export type LicenseStatus = 'approved' | 'metadata_only' | 'pending' | 'prohibited' | 'unknown';
export type OriginalOrDerived = 'original' | 'derived' | 'unknown';
export type PublishedAtUtc = string | null;
export type Publisher = string | null;
export type QuoteSpan2 = string | null;
export type SourceId1 = string;
export type Title = string | null;
export type Url = string | null;
export type Sources = OntologySource[];
export type Synthetic = boolean;

export interface NVOntologyGraphV2 {
  anomalies: Anomalies;
  as_of_utc?: AsOfUtc;
  claims: Claims;
  entities: Entities;
  evidence_links: EvidenceLinks;
  identifiers: Identifiers;
  module_runs: ModuleRuns;
  observations: Observations;
  relations: Relations;
  schema_version: SchemaVersion;
  sources: Sources;
  synthetic: Synthetic;
}
export interface OntologyAnomaly {
  baseline: Baseline;
  calibration: Calibration;
  candidate_id: CandidateId;
  detector: Detector;
  entity_id: EntityId;
  metric: Metric;
  observation_ids: ObservationIds;
  review_state: ReviewState;
  score: Score;
  source_ids: SourceIds;
  status: Status;
}
export interface Baseline {
  [k: string]: JsonValue;
}
export interface OntologyClaim {
  claim_id: ClaimId;
  event_from_utc: EventFromUtc;
  event_to_utc: EventToUtc;
  language: Language;
  limitations: Limitations;
  quote_span?: QuoteSpan;
  review_state: ReviewState1;
  source_ids: SourceIds1;
  statement: Statement;
  status: Status1;
}
export interface OntologyEntity {
  aliases?: Aliases;
  attributes: Attributes;
  created_at_utc?: CreatedAtUtc;
  display_name: DisplayName;
  entity_id: EntityId1;
  kind: Kind;
  privacy_class: PrivacyClass;
  source_ids: SourceIds2;
  status: Status2;
}
export interface Attributes {
  [k: string]: JsonValue;
}
export interface EvidenceLink {
  claim_id: ClaimId1;
  evidence_link_id: EvidenceLinkId;
  quote_span: QuoteSpan1;
  role: Role;
  source_id: SourceId;
  status: Status3;
}
export interface OntologyIdentifier {
  entity_id: EntityId2;
  identifier_id: IdentifierId;
  namespace: Namespace;
  source_ids: SourceIds3;
  status: Status4;
  valid_from_utc: ValidFromUtc;
  valid_to_utc: ValidToUtc;
  value: Value;
}
export interface ModuleRun {
  case_id: CaseId;
  completed_at_utc: CompletedAtUtc;
  executor: Executor;
  input_hash: InputHash;
  module: Module;
  module_run_id: ModuleRunId;
  receipt: ExecutionReceipt | null;
  result_hash: ResultHash;
  started_at_utc: StartedAtUtc;
  status: Status5;
}
export interface ExecutionReceipt {
  completed_at_utc: CompletedAtUtc1;
  tool_call_id: ToolCallId;
  tool_name: ToolName;
}
export interface OntologyObservation {
  acquired_at_utc: AcquiredAtUtc;
  entity_id: EntityId3;
  geometry: Geometry;
  geometry_role: GeometryRole;
  geometry_source_id: GeometrySourceId;
  measurements: Measurements;
  observation_id: ObservationId;
  observed_at_utc: ObservedAtUtc;
  precision_m: PrecisionM;
  provider_id: ProviderId;
  quality_notes?: QualityNotes;
  recorded_at_utc: RecordedAtUtc;
  source_ids: SourceIds4;
  status: Status6;
  visibility_policy: VisibilityPolicy;
}
export interface Point {
  coordinates: Coordinates;
  type: Type;
}
export interface Polygon {
  coordinates: Coordinates1;
  type: Type1;
}
export interface MultiPolygon {
  coordinates: Coordinates2;
  type: Type2;
}
export interface Measurements {
  [k: string]: JsonValue;
}
export interface OntologyRelation {
  object_id: ObjectId;
  predicate: Predicate;
  relation_id: RelationId;
  resolution_state: ResolutionState;
  source_ids: SourceIds5;
  status: Status7;
  subject_id: SubjectId;
  valid_from_utc: ValidFromUtc1;
  valid_to_utc: ValidToUtc1;
}
export interface OntologySource {
  access_status: AccessStatus;
  acquired_at_utc: AcquiredAtUtc1;
  content_hash: ContentHash;
  derived_from_source_id: DerivedFromSourceId;
  independence_group: IndependenceGroup;
  indexed_at_utc: IndexedAtUtc;
  license_status: LicenseStatus;
  original_or_derived: OriginalOrDerived;
  published_at_utc: PublishedAtUtc;
  publisher: Publisher;
  quote_span?: QuoteSpan2;
  source_id: SourceId1;
  title?: Title;
  url: Url;
}
