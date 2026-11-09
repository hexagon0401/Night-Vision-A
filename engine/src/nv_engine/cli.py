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
    args = parser.parse_args()
    if not args.command:
        parser.print_help()
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
