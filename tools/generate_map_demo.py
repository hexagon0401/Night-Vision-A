"""A deterministic, explicitly synthetic map payload from the executable engine."""
import argparse
import json
from pathlib import Path
from nv_engine.models import CaseBundle
from nv_engine.detect.analysis import analyze
from nv_engine.narrative.build import attach_traces

ROOT=Path(__file__).resolve().parents[1]
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
    case=CaseBundle.model_validate_json((ROOT/'data/fixtures/detection/case.json').read_text())
    report=analyze(case)
    case=attach_traces(case,report)
    content=json.dumps({'case':case.model_dump(mode='json'),'analysis':report.model_dump(mode='json')},ensure_ascii=False,sort_keys=True,separators=(',',':'))+'\n'
    destination=ROOT/'frontend/nv-visualize/public/demo/synthetic-case.json'
    if args.check:
        if destination.read_text()!=content:raise SystemExit('Map demo is stale; regenerate with tools/generate_map_demo.py')
    else:
        destination.parent.mkdir(parents=True,exist_ok=True);destination.write_text(content)
