"""Prebuild account-free download artifacts for static UI cases, with auditable build time."""
import argparse
from datetime import datetime,timezone
import json,hashlib
from pathlib import Path
from nv_engine.models import CaseBundle
from nv_engine.export.foundry.bundle import export_bundle,ExportOptions

ROOT=Path(__file__).resolve().parents[1]
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--check',action='store_true');args=p.parse_args()
    folder=ROOT/'frontend/nv-visualize/public/exports';folder.mkdir(parents=True,exist_ok=True)
    metadata=folder/'build.json'
    info=json.loads(metadata.read_text()) if metadata.exists() else {}
    epochs=info.get('case_export_times',{})
    fingerprints=info.get('input_fingerprints',{})
    if 'exported_at_utc' in info and 'synthetic' not in epochs:epochs['synthetic']=info['exported_at_utc']
    for kind in ('synthetic','alpha'):
        path=ROOT/f'frontend/nv-visualize/public/demo/{kind}-case.json'
        if not path.exists():continue
        case=CaseBundle.model_validate(json.loads(path.read_text())['case'])
        fingerprint=hashlib.sha256(case.model_dump_json().encode()+(ROOT/'engine/src/nv_engine/export/foundry/bundle.py').read_bytes()).hexdigest()
        minimum=max(source.retrieved_at_utc for source in case.sources)
        if kind not in epochs or fingerprints.get(kind)!=fingerprint or datetime.fromisoformat(epochs[kind])<minimum:
            if args.check:raise SystemExit(f'Missing/invalid export epoch for {kind}')
            epochs[kind]=datetime.now(timezone.utc).isoformat()
            fingerprints[kind]=fingerprint
        epoch=epochs[kind]
        for scope,include in [('observed',False),('all',True)]:
            body=export_bundle(case,ExportOptions(include_inferred=include),datetime.fromisoformat(epoch))
            destination=folder/f'{kind}-{scope}.zip'
            if args.check:
                if not destination.exists() or destination.read_bytes()!=body:raise SystemExit(f'Stale export {destination.name}')
            else:destination.write_bytes(body)

    if not args.check:metadata.write_text(json.dumps({'case_export_times':epochs,'input_fingerprints':fingerprints,'note':'Reproducible export creation times per case, never earlier than its source acquisition'},indent=2)+'\n')
