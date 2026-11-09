import json
from pathlib import Path
from fastapi.testclient import TestClient
from jsonschema import Draft202012Validator
from nv_api.app import app

ROOT = Path(__file__).resolve().parents[3]

def test_health_contract_and_no_fabricated_data_endpoints():
    client = TestClient(app)
    response = client.get("/healthz")
    assert response.status_code == 200
    schema = json.loads((ROOT / "schemas/health.schema.json").read_text())
    Draft202012Validator.check_schema(schema)
    Draft202012Validator(schema).validate(response.json())
    assert client.get("/api/v2/cases").status_code == 404
