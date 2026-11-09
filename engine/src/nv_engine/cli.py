"""Package readiness entrypoint; intentionally does not ingest data."""
import argparse
from nv_engine import __version__

def main():
    parser = argparse.ArgumentParser(description="NV Engine foundation (no live ingestion)")
    parser.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    parser.parse_args()
    parser.print_help()
