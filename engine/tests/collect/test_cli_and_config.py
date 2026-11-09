import json
from pathlib import Path
import subprocess
import sys
import pytest
from pydantic import ValidationError
from nv_engine.sources.config import Manifest

ROOT = Path(__file__).resolve().parents[3]


def cli(tmp_path,provider='gdelt',*,output='out',custom_manifest=None):
    extension={'gdelt':'json','ucdp':'json','firms':'csv','rss':'xml'}[provider]
    return subprocess.run([
        sys.executable,'-c','from nv_engine.cli import main; main()', 'replay',
        '--manifest',str(custom_manifest or ROOT/f'configs/sources/{provider}.json'),
        '--input',str(ROOT/f'data/fixtures/providers/{provider}.{extension}'),
        '--state-dir',str(tmp_path/'state'),'--output-dir',str(tmp_path/output),
        '--acquired-at','2026-01-01T05:00:00Z'],capture_output=True,text=True,cwd=ROOT)


@pytest.mark.parametrize('provider',['gdelt','ucdp','firms','rss'])
def test_cli_offline_replay_writes_a_synthetic_contract(tmp_path,provider):
    result=cli(tmp_path,provider)
    assert result.returncode==0,result.stderr
    bundle=json.loads((tmp_path/'out/case.json').read_text())
    report=json.loads((tmp_path/'out/collection.json').read_text())
    assert bundle['data_origin']=='synthetic'
    assert report['report']['accepted']>0
    assert report['report']['input_mode']=='replay'


def test_cli_idempotence_does_not_overwrite_outputs(tmp_path):
    first=cli(tmp_path)
    assert first.returncode==0
    before=(tmp_path/'out/case.json').read_bytes()
    conflict=cli(tmp_path)
    assert conflict.returncode==1 and 'FileExistsError' in conflict.stderr
    assert (tmp_path/'out/case.json').read_bytes()==before
    second=cli(tmp_path,output='out2')
    assert second.returncode==0
    assert json.loads(second.stdout)['newly_stored']==0
    assert (tmp_path/'out2/case.json').read_bytes()==before


def test_partial_replay_exit_code_is_distinct_and_keeps_report(tmp_path):
    data=json.loads((ROOT/'configs/sources/gdelt.json').read_text())
    data['max_records']=1
    config=tmp_path/'limited.json';config.write_text(json.dumps(data))
    result=cli(tmp_path,custom_manifest=config)
    assert result.returncode==2
    assert json.loads((tmp_path/'out/collection.json').read_text())['report']['limited']


def test_live_cli_disabled_by_default(tmp_path):
    result=subprocess.run([sys.executable,'-c','from nv_engine.cli import main; main()',
        'collect','--manifest',str(ROOT/'configs/sources/firms.json'),
        '--state-dir',str(tmp_path/'state'),'--output-dir',str(tmp_path/'out')],capture_output=True,text=True)
    assert result.returncode==1 and 'live_collection_disabled' in result.stderr
    assert not (tmp_path/'out').exists()


@pytest.mark.parametrize('changes',[
    {'endpoint':'http://api.gdeltproject.org/'},
    {'endpoint':'https://user:password@api.gdeltproject.org/'},
    {'endpoint':'https://elsewhere.example.invalid/'},
    {'credential_env':'FIRMS_MAP_KEY'},
    {'params':{'token':'not-a-real-token'}},
    {'max_attempts':100}, {'max_records':1000}, {'max_workers':100},
    {'publisher_families':{'news.example.invalid':'UpperCase Not A Registry ID'}},
])
def test_manifest_rejects_bad_destinations_credentials_and_bounds(manifest,changes):
    with pytest.raises(ValidationError):
        manifest(**changes)
