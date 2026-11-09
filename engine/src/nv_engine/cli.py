"""Explicit one-shot collection and offline replay; never starts a background poller."""
import argparse
from datetime import datetime
from pathlib import Path
import sys
from nv_engine import __version__


def main():
    parser = argparse.ArgumentParser(description='NV Engine: bounded collection and synthetic replay')
    parser.add_argument('--version', action='version', version=f'%(prog)s {__version__}')
    sub = parser.add_subparsers(dest='command')
    for command in ('collect', 'replay'):
        child = sub.add_parser(command)
        child.add_argument('--manifest', type=Path, required=True)
        child.add_argument('--state-dir', type=Path, required=True)
        child.add_argument('--output-dir', type=Path, required=True)
        if command == 'replay':
            child.add_argument('--input', type=Path, required=True)
            child.add_argument('--acquired-at', required=True, help='Explicit timezone-aware synthetic acquisition time')
    analysis = sub.add_parser('analyze')
    analysis.add_argument('--input', type=Path, required=True)
    analysis.add_argument('--config', type=Path)
    analysis.add_argument('--output-dir', type=Path, required=True)
    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        return
    if args.command == 'analyze':
        import json
        from nv_engine.models import CaseBundle
        from nv_engine.detect.contracts import DetectionConfig
        from nv_engine.detect.analysis import analyze
        try:
            if any((args.output_dir/name).exists() for name in ('analysis.json','case.json')):
                raise FileExistsError('output_exists')
            with args.input.open('rb') as stream:
                data = stream.read(8000001)
            if len(data)>8000000:
                raise ValueError('analysis input size exceeded')
            case = CaseBundle.model_validate_json(data)
            config = DetectionConfig.model_validate_json(args.config.read_text()) if args.config else DetectionConfig()
            report = analyze(case, config)
            combined = {a.anomaly_id:a for a in case.anomalies}
            for candidate in report.anomalies:
                if candidate.anomaly_id in combined and combined[candidate.anomaly_id] != candidate:
                    raise ValueError('anomaly ID collision')
                combined[candidate.anomaly_id] = candidate
            enriched = CaseBundle.model_validate(case.model_copy(update={'anomalies':list(combined.values())}).model_dump(mode='json'))
            args.output_dir.mkdir(parents=True,exist_ok=True)
            for name,value in [('analysis.json',report),('case.json',enriched)]:
                with (args.output_dir/name).open('x') as stream:
                    stream.write(value.model_dump_json(indent=2)+'\n')
            print(json.dumps({'candidates':len(report.anomalies),'calibration':report.calibration,'warnings':report.warnings}))
        except Exception as error:
            print(f'analysis_failed:{type(error).__name__}',file=sys.stderr)
            raise SystemExit(1) from None
        return
    try:
        from nv_engine.sources.config import Manifest
        from nv_engine.collect.http import FetchError
        from nv_engine.collect.pipeline import Collector, to_bundle
        from nv_engine.collect.state import CollectorState
        manifest = Manifest.model_validate_json(args.manifest.read_text())
        result_file = args.output_dir / 'collection.json'
        bundle_file = args.output_dir / 'case.json'
        if result_file.exists() or bundle_file.exists():
            raise FileExistsError('output_exists')
        collector = Collector(CollectorState(args.state_dir))
        try:
            if args.command == 'replay':
                acquired = datetime.fromisoformat(args.acquired_at.replace('Z', '+00:00'))
                # Bound the read before loading the entire input into memory.
                with args.input.open('rb') as stream:
                    body = stream.read(manifest.max_bytes + 1)
                result = collector.replay(manifest, body, acquired)
            else:
                result = collector.collect(manifest)
            bundle = to_bundle(result)
            args.output_dir.mkdir(parents=True, exist_ok=True)
            with result_file.open('x') as stream:
                stream.write(result.model_dump_json(indent=2) + '\n')
            if bundle:
                with bundle_file.open('x') as stream:
                    stream.write(bundle.model_dump_json(indent=2) + '\n')
            print(result.report.model_dump_json())
            if result.report.skipped or result.report.limited:
                raise SystemExit(2)  # Partial output is reviewable, never disguised as complete.
        finally:
            collector.close()
    except ImportError:
        print('collector_dependencies_missing: install nv-engine[collect]', file=sys.stderr)
        raise SystemExit(1) from None
    except Exception as error:
        # Never print a Pydantic/HTTP exception containing credential or raw record values.
        safe = str(error) if isinstance(error, FetchError) else type(error).__name__
        print(f'collection_failed:{safe}', file=sys.stderr)
        raise SystemExit(1) from None
