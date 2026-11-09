from datetime import datetime,timezone
import csv,hashlib,io,json,zipfile
from pathlib import Path
import pytest
from nv_engine.models import CaseBundle
from nv_engine.export.foundry.bundle import ExportOptions,ExportError,export_bundle

ROOT=Path(__file__).resolve().parents[2]
def fixture():
    payload=json.loads((ROOT/'frontend/nv-visualize/public/demo/synthetic-case.json').read_text())
    return CaseBundle.model_validate(payload['case'])


def test_zip_hashes_csv_roundtrip_inference_filters_and_lossless_case():
    case=fixture();case.claims[0].statement='한글, "quotes"\nsecond line'
    when=datetime(2026,1,1,tzinfo=timezone.utc)
    blob=export_bundle(case,ExportOptions(include_inferred=True),when)
    assert blob==export_bundle(case,ExportOptions(include_inferred=True),when)
    with zipfile.ZipFile(io.BytesIO(blob)) as z:
        manifest=json.loads(z.read('manifest.json'))
        for name,entry in manifest['files'].items():assert hashlib.sha256(z.read(name)).hexdigest()==entry['sha256']
        restored=CaseBundle.model_validate_json(z.read('case.json'));assert restored==case
        claims=list(csv.DictReader(io.StringIO(z.read('claims.csv').decode(),newline='')))
        assert claims[0]['statement']==case.claims[0].statement
        assert not json.loads(z.read('validation_report.json'))['foundry_ready']
        assert len(list(csv.DictReader(io.StringIO(z.read('tracks.csv').decode()))))==0
    with zipfile.ZipFile(io.BytesIO(export_bundle(case,exported_at=when))) as z:
        scoped=CaseBundle.model_validate_json(z.read('case.json'))
        assert not scoped.anomalies and not scoped.narratives and not scoped.relations
        assert json.loads(z.read('validation_report.json'))['skipped_records']


def test_time_scoping_cascades_claims_without_silently_deleting_counterevidence():
    case=fixture()
    data=export_bundle(case,ExportOptions(start_utc=datetime(2026,1,3,tzinfo=timezone.utc)))
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        filtered=CaseBundle.model_validate_json(z.read('case.json'))
        assert len(filtered.observations)==3 and not filtered.claims


def test_unknown_or_nontrack_entity_is_diagnostic_not_foundry_ready():
    with pytest.raises(ExportError):export_bundle(fixture(),ExportOptions(track_entity_ids=['unknown']))
    blob=export_bundle(fixture(),ExportOptions(track_entity_ids=['unknown'],diagnostic=True))
    with zipfile.ZipFile(io.BytesIO(blob)) as z:assert json.loads(z.read('validation_report.json'))['errors']


def test_track_samples_are_opt_in_and_conflicts_block_normal_export():
    case=fixture();entity=case.entities[0];entity.entity_type='vessel'
    ids=[entity.entity_id]
    blob=export_bundle(case,ExportOptions(track_entity_ids=ids))
    with zipfile.ZipFile(io.BytesIO(blob)) as z:
        tracks=list(csv.DictReader(io.StringIO(z.read('tracks.csv').decode())))
        assert len(tracks)==49 and tracks[0]['observed_at_utc']<tracks[-1]['observed_at_utc']
    conflict=case.observations[0].model_copy(deep=True);conflict.observation_id='conflict:track';conflict.location.latitude+=.5
    case.observations.append(conflict)
    with pytest.raises(ExportError,match='conflicting_track'):export_bundle(case,ExportOptions(track_entity_ids=ids))


def test_credential_bearing_source_url_never_enters_an_artifact():
    from pydantic import HttpUrl
    case=fixture();case.sources[0].url=HttpUrl('https://fixture-user:fixture-not-real@example.invalid/')
    with pytest.raises(ExportError,match='credential_bearing'):export_bundle(case)
