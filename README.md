# Night Vision 2.0

출처를 추적할 수 있는 지정학 이상징후 분석 체계. 공개정보를 검증하고 연결해 지도와 내러티브로 설명하는 프로젝트입니다.

A source-traceable geopolitical anomaly intelligence project: **Detect → Connect → Explain**.

## Current status / 현재 단계

Phase 0 foundation only. Engine package, API health endpoint, frontend shell, and schema envelope are executable. Collectors, anomaly detection, real maps, Trace playback and Foundry export are **not implemented**. The shell shows no live intelligence. Historical data is unverified, not a production feed.

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
.venv/bin/python -m pip install -e './engine[test]' -e './services/api[test]'
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

API readiness: `GET /healthz` must return `status: ok`, `phase: foundation`. This is process/package readiness, not ingestion readiness. Frontend: a flat-black foundation screen with provided NV branding, an explicit no-feed state and no fabricated case/map. Run `python3 tools/verify_migration.py` to verify every legacy file and archive.

## Delivery and licensing

[Ordered roadmap](docs/architecture/README.md): PR 1 canonical schemas/provenance → collectors → detectors → real map → Trace → exporter → Alpha deployment. No WorldMonitor code was imported. A project license remains undecided; do not assume permission to republish third-party code or datasets. No deployment or Foundry upload is included.
