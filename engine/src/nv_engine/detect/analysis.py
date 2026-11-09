"""Causal-in-time robust baselines, two-sided CUSUM and sourced-point clusters."""
from collections import defaultdict
from datetime import timedelta
import hashlib
import json
import math
from statistics import median

from nv_engine.models import Anomaly, CaseBundle, Provenance
from nv_engine.correlate.graph import build_graph
from .contracts import AnalysisReport, DetectionConfig, check_budget

VERSION = '1.0.0'


def stable_id(kind, value):
    payload = json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()
    return f'{kind}:' + hashlib.sha256(payload).hexdigest()


def clean_observations(case):
    slots = defaultdict(list)
    skipped = 0
    for record in sorted(case.observations, key=lambda o: o.observation_id):
        if record.value is None or record.evidence_status.value not in ('observed', 'documented', 'reported'):
            skipped += 1
            continue
        slots[(record.entity_id, record.metric, record.unit, record.observed_at_utc)].append(record)
    cleaned, duplicate, conflict = [], 0, 0
    for rows in slots.values():
        if len({r.value for r in rows}) != 1:
            conflict += len(rows)
        else:
            cleaned.append(rows[0])
            duplicate += len(rows) - 1
    return sorted(cleaned, key=lambda o: (o.observed_at_utc, o.observation_id)), skipped, duplicate, conflict


def make_anomaly(detector, observations, score, description, config):
    rows = sorted(observations, key=lambda o: (o.observed_at_utc, o.observation_id))
    source_ids = sorted({sid for row in rows for sid in row.provenance.source_ids + row.provenance.corroborating_source_ids})
    return Anomaly(
        anomaly_id=stable_id('anomaly', [VERSION, detector, config.model_dump(), [o.observation_id for o in rows]]),
        observation_ids=[o.observation_id for o in rows], detector=detector, detector_version=VERSION,
        baseline_description=description, window_start_utc=rows[0].observed_at_utc,
        window_end_utc=rows[-1].observed_at_utc, severity='medium', impact='unknown',
        score=float(score), evidence_status='inferred', confidence='unknown',
        provenance=Provenance(source_ids=source_ids, extraction_method=f'nv:{detector}:{VERSION}'),
    )


def haversine(a, b):
    latitude = math.radians(b.latitude - a.latitude)
    longitude = math.radians(b.longitude - a.longitude)
    h = math.sin(latitude/2)**2 + math.cos(math.radians(a.latitude))*math.cos(math.radians(b.latitude))*math.sin(longitude/2)**2
    return 6371.0088 * 2 * math.asin(math.sqrt(min(1.0, max(0.0, h))))


def analyze(case: CaseBundle, config: DetectionConfig | None = None) -> AnalysisReport:
    check_budget(case)
    case = CaseBundle.model_validate(case.model_dump(mode='json'))
    config = DetectionConfig.model_validate((config or DetectionConfig()).model_dump())
    rows, skipped, duplicates, conflicts = clean_observations(case)
    series = defaultdict(list)
    for row in rows:
        series[(row.entity_id, row.metric, row.unit)].append(row)
    anomalies, warnings = [], []
    insufficient = 0
    for key in sorted(series):
        history, upper, lower = [], 0.0, 0.0
        cooldown = 0
        for row in series[key]:
            cohort = [p for p in history if config.seasonality == 'none' or p.observed_at_utc.hour == row.observed_at_utc.hour][-config.history_window:]
            if len(cohort) >= config.min_history:
                center = median(p.value for p in cohort)
                spread = max(1.4826 * median(abs(p.value-center) for p in cohort), config.scale_floor)
                z = (row.value-center) / spread
                upper = max(0.0, upper + z - config.cusum_drift)
                lower = min(0.0, lower + z + config.cusum_drift)
                if cooldown == 0:
                    detector = 'median-mad' if abs(z) >= config.mad_threshold else 'cusum' if max(upper, -lower) >= config.cusum_threshold else None
                    if detector:
                        score = abs(z) if detector == 'median-mad' else max(upper, -lower)
                        anomalies.append(make_anomaly(detector, cohort+[row], score,
                            f'Prior-only rolling median={center:g}; robust scale={spread:g}; metric={key[1]}; unit={key[2]}; seasonality={config.seasonality}; uncalibrated candidate', config))
                        cooldown = config.cooldown_points
                        upper = lower = 0.0
                else:
                    cooldown -= 1
            history.append(row)
        if not any(len([p for p in series[key][:i] if config.seasonality=='none' or p.observed_at_utc.hour==o.observed_at_utc.hour]) >= config.min_history for i,o in enumerate(series[key])):
            insufficient += 1
    # Latest sourced observation per entity; repeated samples of one sensor are not many entities.
    located = [o for o in rows if o.location and o.location.role=='verified']
    candidates = []
    if located:
        cutoff = max(o.observed_at_utc for o in rows) - timedelta(seconds=config.spatial_window_seconds)
        latest = {}
        for row in located:
            if row.observed_at_utc >= cutoff:
                latest[row.entity_id] = row
        points = sorted(latest.values(), key=lambda o:o.observation_id)
        if len(points) > config.spatial_point_budget:
            warnings.append('spatial_budget_exceeded:no_cluster_scan')
        else:
            adjacency = {i:set() for i in range(len(points))}
            for i,a in enumerate(points):
                for j in range(i+1,len(points)):
                    b=points[j]
                    if a.metric != b.metric or a.unit != b.unit:
                        continue
                    if haversine(a.location,b.location) <= config.spatial_radius_km:
                        adjacency[i].add(j);adjacency[j].add(i)
            visited=set()
            for start in adjacency:
                if start in visited: continue
                stack, component = [start],set()
                while stack:
                    i=stack.pop()
                    if i in component: continue
                    component.add(i);stack.extend(adjacency[i]-component)
                visited.update(component)
                if len(component)>=config.spatial_min_entities:
                    members=[points[i] for i in sorted(component)]
                    anomalies.append(make_anomaly('spatial-component',members,len(members),
                        'Sourced-point connected component in configured time/radius; co-occurrence only, no causal claim',config))
                    for i in sorted(component):
                        for j in sorted(adjacency[i]):
                            if j>i: candidates.append((points[i],points[j]))
    if conflicts: warnings.append('conflicting_same_time_measurements_excluded')
    if insufficient: warnings.append('insufficient_comparable_history')
    graph = build_graph(case, anomalies, candidates, config.graph_edge_budget)
    if graph.limited: warnings.append('graph_edge_budget_reached')
    return AnalysisReport(case_id=case.case_id,data_origin=case.data_origin,configuration=config,
        anomalies=sorted(anomalies,key=lambda a:(a.window_end_utc,a.anomaly_id)),graph=graph,
        counts={'input_observations':len(case.observations),'eligible':len(rows),'excluded':skipped,
                'duplicates':duplicates,'conflicts':conflicts,'series':len(series),'insufficient_series':insufficient},
        warnings=sorted(warnings))
