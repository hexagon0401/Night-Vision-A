import json
from pathlib import Path
from fastapi.testclient import TestClient
from nv_api.app import app

ROOT = Path(__file__).resolve().parents[3]

def fixture():
    return json.loads((ROOT / 'data/fixtures/synthetic/contract-case.json').read_text())


def test_validate_contract_without_publishing_a_case():
    client = TestClient(app)
    result = client.post('/api/v2/contracts/validate', json=fixture())
    assert result.status_code == 200
    assert result.json()['data_origin'] == 'synthetic'
    assert result.json()['counts']['sources'] == 2
    assert result.json()['counts']['narratives'] == 1
    assert client.get('/api/v2/cases').status_code == 404


def test_dangling_source_returns_actionable_422():
    data = fixture()
    data['entities'][0]['provenance']['source_ids'] = ['missing:source']
    response = TestClient(app).post('/api/v2/contracts/validate', json=data)
    assert response.status_code == 422
    assert 'unresolved source reference' in response.text


def test_openapi_uses_the_canonical_request_schema():
    doc = TestClient(app).get('/openapi.json').json()
    operation = doc['paths']['/api/v2/contracts/validate']['post']
    assert operation['requestBody']['content']['application/json']['schema']['$ref'].endswith('/CaseBundle')
    assert set(doc['components']['schemas']['EvidenceStatus']['enum']) == {'observed','documented','reported','inferred','scenario','disputed','unverified'}
