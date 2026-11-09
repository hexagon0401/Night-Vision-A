"""Generate/check JSON Schema, OpenAPI and frontend types from executable models."""
import argparse
import json
from pathlib import Path
import subprocess

from nv_engine.models import CaseBundle
from nv_engine.sources.config import Manifest
from nv_engine.collect.types import CollectionResult
from nv_api.app import app
from nv_engine.export.foundry.bundle import ExportOptions
from nv_engine.detect.contracts import AnalysisReport, AnalysisRequest

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true', help='fail on drift; do not modify files')
    args = parser.parse_args()
    artifacts = {
        'schemas/case-bundle.schema.json': CaseBundle.model_json_schema(),
        'schemas/source-manifest.schema.json': Manifest.model_json_schema(),
        'schemas/collection-result.schema.json': CollectionResult.model_json_schema(),
        'schemas/analysis-report.schema.json': AnalysisReport.model_json_schema(),
        'schemas/analysis-request.schema.json': AnalysisRequest.model_json_schema(),
        'schemas/export-options.schema.json': ExportOptions.model_json_schema(),
        'schemas/openapi.json': app.openapi(),
    }
    stale = []
    for name, value in artifacts.items():
        content = json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + '\n'
        path = ROOT / name
        if args.check:
            if not path.exists() or path.read_text() != content:
                stale.append(name)
        else:
            path.write_text(content)
    if stale:
        raise SystemExit(f'Stale generated contracts: {stale}; run tools/generate_contracts.py')
    subprocess.run(['node', 'scripts/generate-contracts.mjs', *(['--check'] if args.check else [])],
                   cwd=ROOT / 'frontend/nv-visualize', check=True)
    print('Contracts checked.' if args.check else 'Contracts generated.')


if __name__ == '__main__':
    main()
