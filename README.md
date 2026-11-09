# Night Vision 2.0

출처를 추적할 수 있는 지정학 이상징후 분석 체계. 공개정보를 검증하고 연결해 지도와 내러티브로 설명하는 프로젝트입니다.

A source-traceable geopolitical anomaly intelligence project: **Detect → Connect → Explain**.

## Current status / 현재 단계

PR 1 contracts implemented: ten canonical Python models, provenance/geotime/reference validation, stateless validation API, generated JSON Schema/OpenAPI/TypeScript contracts and explicit snapshot database migrations. The frontend remains a Phase 0 shell. PR 2 adds bounded GDELT/UCDP/FIRMS/RSS collectors, explicit synthetic replay, retry/cache/pacing and persistent deduplication. Live sources remain disabled by default. Anomaly detection, real maps, Trace playback and Foundry export are **not implemented**. The shell shows no live intelligence. Historical data is unverified, not a production feed.

## Workspace

- [NV Engine](engine/) — independent Python package, version 2.0.0.
- [NV Visualize](frontend/nv-visualize/) — separate TypeScript/Vite shell; future MapLibre + deck.gl interface.
- [API](services/api/) and [worker boundary](services/worker/).
- [Contracts](schemas/) and [source configuration boundary](configs/sources/).
- [Claude extensions v1–v3](extensions/claude/) and [global/China prompt packs](extensions/promptpacks/).
- [Historical directives v1–v6 (including v4.5)](archive/directives/), [old README](archive/README-pre-v2.md), [Foundry guide](docs/foundry/legacy-upload-guide.md).
- [Unverified case files](data/legacy-cases/) and [legacy experimental fixtures](data/fixtures/legacy/).
- [Exact migration map](docs/migration/MIGRATION_MAP.md), [architecture](docs/architecture/README.md), [approved handoff](docs/design/nv2-handoff/NV2_CODEX_HANDOFF.md).

## Develop

Python 3.12+ and Node 22+ are supported. No credentials or database are required for Phase 0.

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -e './engine[test,storage,collect]' -e './services/api[test]'
.venv/bin/python -m pytest engine/tests services/api/tests
.venv/bin/nv-engine --version
.venv/bin/python -m uvicorn nv_api.app:app --app-dir services/api/src --host 0.0.0.0 --port 8000
```

In a second terminal:

```sh
cd frontend/nv-visualize
npm ci
npm test
npm run build
npm run dev -- --host 0.0.0.0
```

Contracts: run `.venv/bin/python tools/generate_contracts.py --check` after `npm ci`. Local optional DB: `.venv/bin/alembic -c engine/alembic.ini upgrade head`, then `current`. No data is imported automatically. See [contract/storage decisions](docs/decisions/0002-canonical-contracts-and-storage.md) for limits.

API readiness: `GET /healthz` must return `status: ok`, `phase: foundation`. This is process/package readiness, not ingestion readiness. Frontend: a flat-black foundation screen with provided NV branding, an explicit no-feed state and no fabricated case/map. Run `python3 tools/verify_migration.py` to verify every legacy file and archive.

## Offline collector demo

```sh
.venv/bin/nv-engine replay --manifest configs/sources/gdelt.json --input data/fixtures/providers/gdelt.json --acquired-at 2026-01-01T05:00:00Z --state-dir .local/collector-demo --output-dir .local/gdelt-demo
```

Use a fresh output directory for each run. The first run accepts two fictional article records from three input rows. Replaying into another output directory with the same state stores zero new records. `collection.json` preserves provenance, missing fields and partial-coverage counts; `case.json` is explicitly synthetic. No network is used. [Source policies and live prerequisites](configs/sources/README.md) · [Acquisition design/limits](docs/decisions/0003-bounded-acquisition.md).

## Delivery and licensing

[Ordered roadmap](docs/architecture/README.md): canonical schemas/provenance (implemented) → bounded collectors (implemented) → PR 3 detectors → detectors → real map → Trace → exporter → Alpha deployment. No WorldMonitor code was imported. A project license remains undecided; do not assume permission to republish third-party code or datasets. No deployment or Foundry upload is included.
