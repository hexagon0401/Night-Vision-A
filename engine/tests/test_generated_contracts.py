import json
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
import pytest
from jsonschema.exceptions import ValidationError
from nv_engine.models import CaseBundle

ROOT = Path(__file__).resolve().parents[2]


def test_json_schema_matches_models_and_validates_roundtrip_fixture(payload):
    schema = json.loads((ROOT / 'schemas/case-bundle.schema.json').read_text())
    assert schema == CaseBundle.model_json_schema()
    Draft202012Validator.check_schema(schema)
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    validator.validate(CaseBundle.model_validate(payload).model_dump(mode='json'))
    payload['observations'][0]['observed_at_utc'] = 'not-a-time'
    with pytest.raises(ValidationError):
        validator.validate(payload)
