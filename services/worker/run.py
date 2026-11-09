"""Explicit bounded worker. Defaults to one cycle; no imports start a poller."""
import argparse
from datetime import datetime,timezone
import hashlib,json,time
from pathlib import Path
from nv_engine.sources.config import Manifest
from nv_engine.collect.pipeline import Collector,to_bundle
from nv_engine.collect.state import CollectorState
from nv_engine.detect.analysis import analyze
from nv_engine.detect.contracts import DetectionConfig
from nv_engine.narrative.build import attach_traces
from nv_engine.export.foundry.bundle import export_bundle


def main():
    p=argparse.ArgumentParser();p.add_argument('--manifest',type=Path,required=True);p.add_argument('--state-dir',type=Path,required=True);p.add_argument('--output-dir',type=Path,required=True)
    p.add_argument('--detector-config',type=Path);p.add_argument('--cycles',type=int,default=1);p.add_argument('--interval',type=int,default=300)
    p.add_argument('--replay',type=Path);p.add_argument('--acquired-at')
    args=p.parse_args()
    if not 1<=args.cycles<=100 or args.interval<60:p.error('cycles 1..100; interval >=60 seconds')
    if args.replay and not args.acquired_at:p.error('replay requires explicit acquired-at')
    manifest=Manifest.model_validate_json(args.manifest.read_text());collector=Collector(CollectorState(args.state_dir))
    config=DetectionConfig.model_validate_json(args.detector_config.read_text()) if args.detector_config else DetectionConfig()
    try:
        for cycle in range(args.cycles):
            if args.replay:
                with args.replay.open('rb') as stream:body=stream.read(manifest.max_bytes+1)
                result=collector.replay(manifest,body,datetime.fromisoformat(args.acquired_at.replace('Z','+00:00')))
            else:result=collector.collect(manifest)
            if result.report.skipped or result.report.limited:raise ValueError('partial acquisition requires review before analysis publication')
            case=to_bundle(result)
            if case is not None:
                report=analyze(case,config);case=attach_traces(case,report);body=case.model_dump_json(indent=2).encode()
                folder=args.output_dir/hashlib.sha256(body).hexdigest()
                if folder.exists():
                    if (folder/'case.json').read_bytes()!=body:raise ValueError('output identity conflict')
                else:
                    folder.mkdir(parents=True,mode=0o700)
                    (folder/'case.json').write_bytes(body);(folder/'analysis.json').write_text(report.model_dump_json(indent=2))
                    (folder/'collection.json').write_text(result.model_dump_json(indent=2));(folder/'foundry.zip').write_bytes(export_bundle(case))
                print(json.dumps({'case_id':case.case_id,'origin':case.data_origin,'candidates':len(report.anomalies),'output':str(folder)}))
            else:print('{"records":0,"case_created":false}')
            if cycle+1<args.cycles:time.sleep(args.interval)
    finally:collector.close()

if __name__=='__main__':main()
