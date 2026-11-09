from copy import deepcopy
from datetime import timedelta
import json
from pathlib import Path
import subprocess
import sys
import pytest
from nv_engine.models import CaseBundle
from nv_engine.detect.analysis import analyze, haversine
from nv_engine.detect.contracts import DetectionConfig

ROOT=Path(__file__).resolve().parents[2]

@pytest.fixture
def case():
    return CaseBundle.model_validate_json((ROOT/'data/fixtures/detection/case.json').read_text())


def test_reproducible_spike_shift_and_spatial_candidates_preserve_source_truth(case):
    before=case.model_dump_json()
    result=analyze(case)
    assert {a.detector for a in result.anomalies}=={'median-mad','cusum','spatial-component'}
    assert result==analyze(case)
    reversed_case=case.model_copy(update={'observations':list(reversed(case.observations))})
    assert result==analyze(reversed_case)
    assert case.model_dump_json()==before
    assert all(a.confidence.value=='unknown' and a.impact.value=='unknown' and a.evidence_status.value=='inferred' for a in result.anomalies)
    assert result.calibration=='uncalibrated'
    ids={node.node_id for node in result.graph.nodes}
    assert all(e.source in ids and e.target in ids for e in result.graph.edges)
    assert all(e.evidence_status.value=='inferred' for e in result.graph.edges if e.kind=='candidate_cooccurrence')


def test_constant_and_small_noise_series_have_no_temporal_false_positives(case):
    for i,row in enumerate(case.observations): row.value=10+(i%3-1)*.1
    assert not [a for a in analyze(case).anomalies if a.detector!='spatial-component']


def test_future_values_do_not_change_earlier_temporal_decisions(case):
    cutoff=case.observations[42].observed_at_utc
    earlier=case.model_copy(deep=True)
    for row in earlier.observations:
        if row.observed_at_utc>cutoff: row.value=1000.0
    first=[a for a in analyze(case).anomalies if a.detector!='spatial-component' and a.window_end_utc<=cutoff]
    second=[a for a in analyze(earlier).anomalies if a.detector!='spatial-component' and a.window_end_utc<=cutoff]
    assert first==second and first


def test_duplicates_conflicts_null_and_scenarios_are_not_baseline_samples(case):
    duplicate=case.observations[0].model_copy(update={'observation_id':'duplicate:exact'})
    conflict=case.observations[1].model_copy(update={'observation_id':'duplicate:conflict','value':999.0})
    case.observations.extend([duplicate,conflict])
    case.observations[2].value=None
    from nv_engine.models import EvidenceStatus
    case.observations[3].evidence_status=EvidenceStatus.SCENARIO
    result=analyze(case)
    assert result.counts['duplicates']==1 and result.counts['conflicts']==2
    assert result.counts['excluded']==2
    assert 'conflicting_same_time_measurements_excluded' in result.warnings


def test_seasonal_cohorts_avoid_daily_cycle_false_positives(case):
    original=case.observations[0]
    rows=[original.model_copy(update={'observation_id':f'seasonal:{i}','observed_at_utc':original.observed_at_utc+timedelta(hours=i),'value':float(10 if i%24<12 else 30)}) for i in range(240)]
    case.observations=rows;case.claims=[]
    config=DetectionConfig(min_history=4,seasonality='hour_of_day_utc')
    assert not [a for a in analyze(case,config).anomalies if a.detector!='spatial-component']
    assert any(a.detector=='median-mad' for a in analyze(case,DetectionConfig(min_history=4)).anomalies)


def test_insufficient_history_and_unlocated_records_remain_gaps(case):
    case.observations=case.observations[:3];case.claims=[]
    for row in case.observations: row.location=None
    report=analyze(case)
    assert not report.anomalies and 'insufficient_comparable_history' in report.warnings


def test_spatial_scan_respects_units_and_explicit_budget(case):
    report=analyze(case,DetectionConfig(spatial_point_budget=3,graph_edge_budget=16))
    assert report.graph.limited and len(report.graph.edges)==16
    case.observations[-1].unit='different_units'
    assert not [a for a in analyze(case).anomalies if a.detector=='spatial-component']


def test_antimeridian_distance_is_not_a_world_spanning_route():
    from nv_engine.models import Location
    a=Location(latitude=0.0,longitude=179.95,role='symbolic',note='Synthetic distance fixture')
    b=Location(latitude=0.0,longitude=-179.95,role='symbolic',note='Synthetic distance fixture')
    assert 10<haversine(a,b)<12


def test_input_budget_and_invalid_configuration_are_actionable(case):
    from nv_engine.detect.contracts import AnalysisRequest
    from pydantic import ValidationError
    with pytest.raises(ValidationError): DetectionConfig(min_history=20,history_window=8)
    case.observations=case.observations*20
    with pytest.raises(ValueError,match='budget'): analyze(case)


def test_analyze_cli_writes_valid_enriched_case_and_refuses_overwrite(tmp_path):
    command=[sys.executable,'-c','from nv_engine.cli import main; main()','analyze','--input',str(ROOT/'data/fixtures/detection/case.json'),'--output-dir',str(tmp_path/'out')]
    run=subprocess.run(command,capture_output=True,text=True)
    assert run.returncode==0,run.stderr
    enriched=CaseBundle.model_validate_json((tmp_path/'out/case.json').read_text())
    assert len(enriched.anomalies)==3
    again=subprocess.run(command,capture_output=True,text=True)
    assert again.returncode==1 and 'FileExistsError' in again.stderr
