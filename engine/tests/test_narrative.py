from pathlib import Path
import pytest
from nv_engine.models import CaseBundle
from nv_engine.detect.analysis import analyze
from nv_engine.narrative.build import attach_traces,build_narrative

ROOT=Path(__file__).resolve().parents[2]

def test_scenes_retain_evidence_do_not_invent_corroboration_and_are_idempotent():
    case=CaseBundle.model_validate_json((ROOT/'data/fixtures/detection/case.json').read_text())
    original=case.model_dump_json();result=attach_traces(case,analyze(case))
    assert len(result.narratives)==3 and all(len(n.steps)==5 for n in result.narratives)
    assert result==attach_traces(result,analyze(case))
    assert case.model_dump_json()==original
    for n in result.narratives:
        assert '1개' in n.steps[2].subtitle_ko
        assert '아직 등록되지' in n.steps[3].subtitle_ko
        assert all(step.evidence_status.value=='inferred' and step.evidence_claim_ids for step in n.steps)
    assert all(r.evidence_status.value=='inferred' for r in result.relations)
    assert CaseBundle.model_validate_json(result.model_dump_json())==result
    with pytest.raises(ValueError):build_narrative(case,'not-present')
