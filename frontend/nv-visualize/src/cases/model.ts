import type { CaseBundle, Observation, Source } from "../contracts/generated";
import type { AnalysisReport, Anomaly } from "../contracts/analysis";

export interface CasePayload {
  map_context?: {id:string;lat:number;lon:number;precision:number}[];
  case: CaseBundle;
  analysis: AnalysisReport;
}
export type Point = [number, number];
export interface Candidate {
  anomaly: Anomaly;
  point: Point | null;
  points: Point[];
  name: string;
  sourceIds: string[];
}
export interface CandidateLink {
  id: string;
  points: Point[];
  status: import("../contracts/generated").EvidenceStatus;
  explanation: string;
}

export function readPayload(value: unknown): CasePayload {
  const payload = value as CasePayload;
  if (
    !payload?.case ||
    !payload.analysis ||
    payload.case.case_id !== payload.analysis.case_id ||
    !["synthetic", "source_backed"].includes(payload.case.data_origin) ||
    payload.analysis.data_origin !== payload.case.data_origin ||
    !Array.isArray(payload.analysis.anomalies) ||
    !Array.isArray(payload.case.sources)
  ) {
    throw new Error("Invalid synthetic demo contract");
  }
  return payload;
}

function pointOf(row: Observation): Point | null {
  const location = row.location;
  return location?.role === "verified" &&
    !!location.source_id &&
    [
      ...row.provenance.source_ids,
      ...(row.provenance.corroborating_source_ids ?? []),
    ].includes(location.source_id) &&
    Number.isFinite(location.longitude) &&
    Number.isFinite(location.latitude) &&
    Math.abs(location.longitude) <= 180 &&
    Math.abs(location.latitude) <= 90
    ? [location.longitude, location.latitude]
    : null;
}

export function candidates(payload: CasePayload): Candidate[] {
  const observations = new Map(
    payload.case.observations?.map((row) => [row.observation_id, row]),
  );
  const names: Record<string, string> = {
    "median-mad": "기준선 이탈",
    cusum: "지속 변화",
    "spatial-component": "시공간 동시 관측",
  };
  return payload.analysis.anomalies
    .map((anomaly) => {
      const rows = anomaly.observation_ids
        .map((id) => observations.get(id))
        .filter((r): r is Observation => !!r)
        .sort(
          (a, b) =>
            a.observed_at_utc.localeCompare(b.observed_at_utc) ||
            a.observation_id.localeCompare(b.observation_id),
        );
      const located = rows
        .map(pointOf)
        .filter((point): point is Point => point !== null);
      // Representative is an existing sourced observation, never an invented centroid.
      const latest = rows.at(-1);
      return {
        anomaly,
        point: latest ? pointOf(latest) : null,
        points: located,
        name: `${names[anomaly.detector] ?? anomaly.detector}${payload.case.data_origin === "source_backed" && latest ? ` · ${latest.value ?? "?"} ${latest.unit}` : ""}`,
        sourceIds: anomaly.provenance.source_ids,
      };
    })
    .sort(
      (a, b) =>
        b.anomaly.window_end_utc.localeCompare(a.anomaly.window_end_utc) ||
        a.anomaly.anomaly_id.localeCompare(b.anomaly.anomaly_id),
    );
}

export function candidateLinks(payload: CasePayload): CandidateLink[] {
  const nodes = new Map(
    payload.analysis.graph.nodes.map((node) => [node.node_id, node]),
  );
  const observations = payload.case.observations ?? [];
  const latestPoint = (entityId: string) => {
    const rows = observations
      .filter((row) => row.entity_id === entityId)
      .sort((a, b) => a.observed_at_utc.localeCompare(b.observed_at_utc));
    return rows.length ? pointOf(rows.at(-1)!) : null;
  };
  return payload.analysis.graph.edges
    .filter(
      (edge) =>
        edge.kind === "candidate_cooccurrence" &&
        edge.evidence_status === "inferred",
    )
    .flatMap((edge) => {
      const a = nodes.get(edge.source),
        b = nodes.get(edge.target);
      if (a?.kind !== "entity" || b?.kind !== "entity") return [];
      const start = latestPoint(a.record_id),
        end = latestPoint(b.record_id);
      return start && end
        ? [
            {
              id: edge.edge_id,
              points: [start, end],
              status: "inferred" as const,
              explanation: edge.explanation,
            },
          ]
        : [];
    });
}

export function evidenceSources(
  payload: CasePayload,
  candidate: Candidate,
): Source[] {
  return payload.case.sources.filter((source) =>
    candidate.sourceIds.includes(source.source_id),
  );
}

export function safeSourceUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export function sceneLinks(
  payload: CasePayload,
  ids: string[],
): CandidateLink[] {
  const entities = new Map(
    payload.case.entities?.map((row) => [row.entity_id, row]),
  );
  return (payload.case.relations ?? [])
    .filter((row) => ids.includes(row.relation_id))
    .flatMap((row) => {
      const a = entities.get(row.source_entity_id)?.location,
        b = entities.get(row.target_entity_id)?.location;
      if (a?.role !== "verified" || b?.role !== "verified") return [];
      return [
        {
          id: row.relation_id,
          points: [
            [a.longitude, a.latitude],
            [b.longitude, b.latitude],
          ] as Point[],
          status: row.evidence_status,
          explanation: row.relation_type,
        },
      ];
    });
}
