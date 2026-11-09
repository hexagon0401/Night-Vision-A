"""Capture once with --fetch; rebuild the real, archived USGS case offline by default."""
import argparse
from datetime import datetime
import hashlib,json,tempfile
from pathlib import Path
from nv_engine.sources.config import Manifest
from nv_engine.sources.adapters import decode,normalize
from nv_engine.collect.state import CollectorState
from nv_engine.collect.http import Fetcher
from nv_engine.collect.types import CollectionResult,CollectionReport
from nv_engine.collect.pipeline import to_bundle
from nv_engine.detect.analysis import analyze
from nv_engine.detect.contracts import DetectionConfig
from nv_engine.narrative.build import attach_traces
ROOT=Path(__file__).resolve().parents[1]

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--fetch',action='store_true');parser.add_argument('--check',action='store_true');args=parser.parse_args()
    manifest=Manifest.model_validate_json((ROOT/'configs/sources/usgs-alpha.json').read_text())
    raw=ROOT/'data/alpha/usgs-response.json';meta=ROOT/'data/alpha/capture.json'
    if args.fetch:
        state=CollectorState(ROOT/'.local/alpha-fetch');fetcher=Fetcher(state)
        try:result=fetcher.fetch(manifest.model_copy(update={'enabled':True}))
        finally:fetcher.close()
        raw.write_bytes(result.body);meta.write_text(json.dumps({'endpoint':manifest.endpoint,'params':manifest.params,'acquired_at_utc':result.fetched_at.isoformat(),'sha256':result.body_hash,'capture_method':'Explicit bounded HTTPS GET via verified TLS/proxy; original response retained'},indent=2)+'\n')
    metadata=json.loads(meta.read_text());body=raw.read_bytes();assert hashlib.sha256(body).hexdigest()==metadata['sha256']
    assert metadata['endpoint']==manifest.endpoint and metadata['params']==manifest.params
    page=decode(manifest,body);assert not page.next_page and len(page.rows)<=manifest.max_records
    acquired=datetime.fromisoformat(metadata['acquired_at_utc'])
    with tempfile.TemporaryDirectory(prefix='nv-alpha-build-') as directory:
        state=CollectorState(Path(directory));response_hash=state.put_blob(body)
        records=[normalize(manifest,row,response_hash,acquired,state,'source_backed') for row in page.rows]
        report=CollectionReport(provider_id=manifest.source_id,provider_endpoint=manifest.endpoint,provider_parameters=manifest.params,license_terms_url=str(manifest.rights.terms_url),rights_reviewed=True,redistribution='permitted',input_mode='live',response_hash=response_hash,fetched_at_utc=acquired,from_cache=True,considered=len(records),accepted=len(records),newly_stored=len(records),duplicates=0,skipped=0,limited=False)
        case=to_bundle(CollectionResult(report=report,records=records))
    analysis=analyze(case,DetectionConfig.model_validate_json((ROOT/'configs/detection/usgs-alpha.json').read_text()))
    assert analysis.anomalies,'real source case did not yield a candidate; do not fake one'
    case=attach_traces(case,analysis)
    output=json.dumps({'case':case.model_dump(mode='json'),'analysis':analysis.model_dump(mode='json')},ensure_ascii=False,sort_keys=True,separators=(',',':'))+'\n'
    destination=ROOT/'frontend/nv-visualize/public/demo/alpha-case.json'
    if args.check:
        assert destination.read_text()==output,'Alpha payload drift'
    else:destination.write_text(output)
    print(f'Alpha: {len(records)} source records; {len(analysis.anomalies)} uncalibrated candidates; separate magnitude scales retained.')
