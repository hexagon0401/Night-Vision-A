import io,json,time,zipfile
from pathlib import Path
from fastapi.testclient import TestClient
from nv_api.app import app
from nv_api import exports

ROOT=Path(__file__).resolve().parents[3]
def test_authenticated_export_lifecycle_and_disabled_default(monkeypatch):
    data=json.loads((ROOT/'frontend/nv-visualize/public/demo/synthetic-case.json').read_text())['case']
    client=TestClient(app);monkeypatch.delenv('NV_API_TOKEN',raising=False)
    assert client.post('/api/v2/exports/foundry',json={'case':data}).status_code==503
    monkeypatch.setenv('NV_API_TOKEN','SYNTHETIC-LOCAL-TEST-ONLY')
    assert client.post('/api/v2/exports/foundry',json={'case':data}).status_code==401
    auth={'Authorization':'Bearer SYNTHETIC-LOCAL-TEST-ONLY'}
    response=client.post('/api/v2/exports/foundry',json={'case':data},headers=auth)
    assert response.status_code==202;key=response.json()['job_id']
    for _ in range(100):
        state=client.get(f'/api/v2/exports/{key}',headers=auth).json()
        if state['state']=='complete':break
        time.sleep(.01)
    artifact=client.get(f'/api/v2/exports/{key}/download',headers=auth)
    assert artifact.status_code==200
    assert zipfile.ZipFile(io.BytesIO(artifact.content)).testzip() is None
    assert client.get('/api/v2/exports/../download',headers=auth).status_code==404
    exports.registry().jobs[key]['expires']=0
    assert client.get(f'/api/v2/exports/{key}',headers=auth).status_code==404
    exports.registry().close();exports._registry=None


def test_request_body_and_host_budgets_are_enforced():
    client=TestClient(app)
    response=client.post('/api/v2/contracts/validate',content=b'x'*8000001,headers={'Content-Type':'application/json'})
    assert response.status_code==413
    assert client.get('/healthz',headers={'Host':'untrusted.example.invalid'}).status_code==400
