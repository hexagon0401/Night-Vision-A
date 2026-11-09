"""Prebuild account-free download artifacts for static UI cases, with auditable build time."""
import argparse
from datetime import datetime,timezone
import json
from pathlib import Path
from nv_engine.models import CaseBundle
from nv_engine.export.foundry.bundle import export_bundle,ExportOptions

ROOT=Path(__file__).resolve().parents[1]
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--check',action='store_true');args=p.parse_args()
    folder=ROOT/'frontend/nv-visualize/public/exports';folder.mkdir(parents=True,exist_ok=True)
    metadata=folder/'build.json'
    if metadata.exists():epoch=json.loads(metadata.read_text())['exported_at_utc']
    elif args.check:raise SystemExit('Missing export build metadata')
    else:
        epoch=datetime.now(timezone.utc).isoformat();metadata.write_text(json.dumps({'exported_at_utc':epoch,'note':'Original reproducible export build timestamp, separate from source acquisition'},indent=2)+'\n')
    for kind in ('synthetic','alpha'):
        path=ROOT/f'frontend/nv-visualize/public/demo/{kind}-case.json'
        if not path.exists():continue
        case=CaseBundle.model_validate(json.loads(path.read_text())['case'])
        for scope,include in [('observed',False),('all',True)]:
            body=export_bundle(case,ExportOptions(include_inferred=include),datetime.fromisoformat(epoch))
            destination=folder/f'{kind}-{scope}.zip'
            if args.check:
                if not destination.exists() or destination.read_bytes()!=body:raise SystemExit(f'Stale export {destination.name}')
            else:destination.write_bytes(body)
