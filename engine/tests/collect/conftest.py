from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
import pytest
from nv_engine.sources.config import Manifest
from nv_engine.collect.state import CollectorState

ROOT = Path(__file__).resolve().parents[3]

class Clock:
    def __init__(self):
        self.time = datetime(2026, 1, 1, tzinfo=timezone.utc)
        self.waits = []
    def now(self):
        return self.time
    def sleep(self, seconds):
        self.waits.append(seconds)
        self.time += timedelta(seconds=seconds)
    def advance(self, seconds):
        self.time += timedelta(seconds=seconds)

@pytest.fixture
def clock():
    return Clock()

@pytest.fixture
def state(tmp_path):
    return CollectorState(tmp_path / 'state')

@pytest.fixture
def manifest():
    def make(provider='gdelt', live=False, **overrides):
        data = json.loads((ROOT / f'configs/sources/{provider}.json').read_text())
        if live:
            data['enabled'] = True
            data['rights']['reviewed'] = True
        data.update(overrides)
        return Manifest.model_validate(data)
    return make

@pytest.fixture
def provider_body():
    def read(provider):
        extension = {'gdelt':'json','ucdp':'json','firms':'csv','rss':'xml','atom':'xml'}[provider]
        return (ROOT / f'data/fixtures/providers/{provider}.{extension}').read_bytes()
    return read
