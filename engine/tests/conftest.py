import json
from pathlib import Path
import pytest

@pytest.fixture
def payload():
    path = Path(__file__).resolve().parents[2] / 'data/fixtures/synthetic/contract-case.json'
    return json.loads(path.read_text())
