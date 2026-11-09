import hashlib,json
from pathlib import Path
from nv_engine.models import CaseBundle
from nv_engine.collect.state import json_bytes
ROOT=Path(__file__).resolve().parents[2]

def test_real_archive_hashes_event_anchors_and_magnitude_scales():
    raw=(ROOT/'data/alpha/usgs-response.json').read_bytes();meta=json.loads((ROOT/'data/alpha/capture.json').read_text())
    assert hashlib.sha256(raw).hexdigest()==meta['sha256']
    data=json.loads((ROOT/'frontend/nv-visualize/public/demo/alpha-case.json').read_text())
    case=CaseBundle.model_validate(data['case']);assert case.data_origin=='source_backed'
    features=json.loads(raw)['features'];assert len(features)==135
    hashes={hashlib.sha256(json_bytes(row)).hexdigest() for row in features}
    assert {s.content_hash for s in case.sources}<=hashes
    main=next(row for row in features if row['id']=='us7000m9g4')
    assert main['properties']['mag']==7.4
    observations=[o for o in case.observations if o.source_record_id=='us7000m9g4']
    assert len(observations)==1 and observations[0].unit=='mww'
    assert observations[0].location.longitude==main['geometry']['coordinates'][0]
    assert any(a.window_end_utc==observations[0].observed_at_utc and a.detector=='median-mad' for a in case.anomalies)
    assert {o.unit for o in case.observations}=={'mb','mww','mwr'}
    assert data['analysis']['calibration']=='uncalibrated' and case.narratives


def test_alpha_export_preserves_real_event_times_and_lineage():
    import io,zipfile,csv
    from nv_engine.export.foundry.bundle import export_bundle
    case=CaseBundle.model_validate(json.loads((ROOT/'frontend/nv-visualize/public/demo/alpha-case.json').read_text())['case'])
    with zipfile.ZipFile(io.BytesIO(export_bundle(case))) as archive:
        events=list(csv.DictReader(io.StringIO(archive.read('events.csv').decode())))
        assert len(events)==135 and any(row['event_time_utc'].startswith('2024-04-02') for row in events)
        assert json.loads(archive.read('manifest.json'))['data_origin']=='source_backed'
        assert json.loads(archive.read('validation_report.json'))['structurally_valid']


def test_bounded_worker_runs_offline_end_to_end_without_overwriting(tmp_path):
    import subprocess,sys,zipfile
    command=[sys.executable,str(ROOT/'services/worker/run.py'),'--manifest',str(ROOT/'configs/sources/gdelt.json'),'--state-dir',str(tmp_path/'state'),'--output-dir',str(tmp_path/'out'),'--replay',str(ROOT/'data/fixtures/providers/gdelt.json'),'--acquired-at','2026-01-01T05:00:00Z']
    result=subprocess.run(command,capture_output=True,text=True);assert result.returncode==0,result.stderr
    entry=json.loads(result.stdout);folder=Path(entry['output'])
    assert zipfile.ZipFile(folder/'foundry.zip').testzip() is None
    second=subprocess.run(command,capture_output=True,text=True);assert second.returncode==0
    assert json.loads(second.stdout)['output']==entry['output']


def test_graph_supports_are_tied_to_their_actual_measurement_sources():
    from nv_engine.detect.analysis import analyze
    from nv_engine.detect.contracts import DetectionConfig
    case=CaseBundle.model_validate(json.loads((ROOT/'frontend/nv-visualize/public/demo/alpha-case.json').read_text())['case'])
    report=analyze(case,DetectionConfig(scale_floor=.1));nodes={n.node_id:n for n in report.graph.nodes}
    observations={o.observation_id:o for o in case.observations}
    supports=[e for e in report.graph.edges if e.kind=='supports'];assert supports
    for edge in supports:
        record=observations[nodes[edge.source].record_id]
        assert set(edge.source_ids)==set(record.provenance.source_ids+record.provenance.corroborating_source_ids)
