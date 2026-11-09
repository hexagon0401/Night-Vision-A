"""Ensure the bundled public-domain cartography matches the pinned upstream bytes."""
import hashlib
import json
from pathlib import Path
path=Path(__file__).resolve().parents[1]/'frontend/nv-visualize/public/geography/countries.geojson'
body=path.read_bytes()
assert hashlib.sha256(body).hexdigest()=='6866c877d39cba9c357620878839b336d569f8c662d3cfab4cb1dbe2d39c977f'
data=json.loads(body)
assert data['type']=='FeatureCollection' and len(data['features'])==177
print('Natural Earth v5.1.2 geography verified: 177 features, pinned hash.')
