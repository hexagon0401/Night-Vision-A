/* Generated from schemas/analysis-report.schema.json. Do not edit. */

export type AnalysisVersion = '1.0.0';
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
export type Calibration = 'uncalibrated';
export type CaseId = string;
export type CooldownPoints = number;
export type CusumDrift = number;
export type CusumThreshold = number;
export type GraphEdgeBudget = number;
export type HistoryWindow = number;
export type MadThreshold = number;
export type MinHistory = number;
export type ScaleFloor = number;
export type Seasonality = 'none' | 'hour_of_day_utc';
export type SpatialMinEntities = number;
export type SpatialPointBudget = number;
export type SpatialRadiusKm = number;
export type SpatialWindowSeconds = number;
export type DataOrigin = 'synthetic' | 'source_backed';
export type EdgeId = string;
export type Explanation = string;
export type Kind =
  | 'reported_by'
  | 'records_for'
  | 'supports'
  | 'claim_refers_to'
  | 'declared_relation'
  | 'candidate_cooccurrence'
  | 'counterevidence';
export type Source = string;
export type SourceIds1 = string[];
export type Target = string;
export type Edges = GraphEdge[];
export type Limited = boolean;
export type Kind1 = 'source' | 'entity' | 'event' | 'observation' | 'claim' | 'anomaly';
export type Label = string;
export type NodeId = string;
export type RecordId = string;
export type Nodes = GraphNode[];
export type Warnings = string[];

export interface AnalysisReport {
  analysis_version?: AnalysisVersion;
  anomalies: Anomalies;
  calibration?: Calibration;
  case_id: CaseId;
  configuration: DetectionConfig;
  counts: Counts;
  data_origin: DataOrigin;
  graph: EvidenceGraph;
  warnings: Warnings;
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
export interface DetectionConfig {
  cooldown_points?: CooldownPoints;
  cusum_drift?: CusumDrift;
  cusum_threshold?: CusumThreshold;
  graph_edge_budget?: GraphEdgeBudget;
  history_window?: HistoryWindow;
  mad_threshold?: MadThreshold;
  min_history?: MinHistory;
  scale_floor?: ScaleFloor;
  seasonality?: Seasonality;
  spatial_min_entities?: SpatialMinEntities;
  spatial_point_budget?: SpatialPointBudget;
  spatial_radius_km?: SpatialRadiusKm;
  spatial_window_seconds?: SpatialWindowSeconds;
}
export interface Counts {
  [k: string]: number;
}
export interface EvidenceGraph {
  edges: Edges;
  limited: Limited;
  nodes: Nodes;
}
export interface GraphEdge {
  edge_id: EdgeId;
  evidence_status: EvidenceStatus;
  explanation: Explanation;
  kind: Kind;
  source: Source;
  source_ids: SourceIds1;
  target: Target;
}
export interface GraphNode {
  kind: Kind1;
  label: Label;
  node_id: NodeId;
  record_id: RecordId;
}
