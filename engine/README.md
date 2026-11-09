# NV Engine 2.0

Provider-independent canonical models and optional snapshot persistence. Engine imports neither the API nor frontend.

Install from the root: `.venv/bin/python -m pip install -e './engine[test,storage,collect]'`.

```python
from nv_engine.models import CaseBundle
bundle = CaseBundle.model_validate_json(open('data/fixtures/synthetic/contract-case.json').read())
assert bundle.data_origin == 'synthetic'
```

## Local database

Explicitly initialize the ignored SQLite database with:

```sh
.venv/bin/alembic -c engine/alembic.ini upgrade head
.venv/bin/alembic -c engine/alembic.ini current
```

The default URL is sqlite:///nv2.local.sqlite3, relative to the command working directory; run from the repository root. No automatic migrations run at package import or API startup. A fresh database is empty; the synthetic fixture is never silently loaded. `downgrade base` drops the snapshot table and destroys its contents; use it only for disposable test databases. SQLAlchemy connections passed to save_snapshot/load_snapshot are caller-owned, with explicit transactions. Store validated CaseBundle snapshots rather than unverified legacy CSV rows. See ADR 0002 for PostgreSQL and normalization limits.

Run `.venv/bin/python -m pytest engine/tests services/api/tests` and `.venv/bin/python tools/generate_contracts.py --check` from the root. Bounded collectors and offline replay are implemented; uncalibrated candidate detectors and evidence graphs are implemented in PR 3; reasoning, narrative generation, export and worker scheduling remain later phases. See the root collector demo and configs/sources/README.md.
