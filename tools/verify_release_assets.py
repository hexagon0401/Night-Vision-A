"""Measured static artifact budgets, not unverified production latency claims."""
import gzip
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
folder=ROOT/'frontend/nv-visualize/dist'
files=list((folder/'assets').glob('*.js'));assert files,'Build the frontend first'
size=sum(len(gzip.compress(path.read_bytes(),mtime=0)) for path in files)
assert size<800000,f'JS gzip budget exceeded: {size}'
assert (folder/'demo/alpha-case.json').stat().st_size<2000000
assert (folder/'geography/countries.geojson').stat().st_size<1100000
assert (folder/'THIRD_PARTY_NOTICES.txt').exists()
print(f'Production assets: {len(files)} JS files, {size} bytes gzip total (<800000 budget).')
