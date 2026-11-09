# Night Vision 2.0

출처를 추적할 수 있는 지정학 이상징후 분석 체계. 공개정보를 검증하고 연결해 지도와 내러티브로 설명하는 프로젝트입니다.

A source-traceable geopolitical anomaly intelligence project: **Detect → Connect → Explain**.

## Current status / 현재 단계

The engine provides ten canonical models, provenance/geotime/reference validation, versioned API/TypeScript contracts and optional snapshot migrations. Bounded GDELT/UCDP/FIRMS/RSS collectors support synthetic replay, retries, cache and dedup. Median/MAD, CUSUM and sourced-point candidate analysis produce an explicit evidence graph with uncalibrated scores.

NV Visualize provides a Flat Black MapLibre/deck.gl Explore map over real offline cartography, a clearly synthetic lab case and an archived USGS Taiwan-region Alpha. Sources, Layers, search and user-controlled evidence pinning open on demand.

Live sources remain disabled by default. Source-linked KO/EN Trace playback and audited Foundry CSV ZIP export are implemented. An archived, source-backed USGS Alpha case completes the demonstration pipeline. Historical data remains unverified; no live global intelligence feed or real historical detection accuracy is claimed.

## Workspace

- [NV Engine](engine/) — independent Python package, version 2.0.0.
- [NV Visualize](frontend/nv-visualize/) — TypeScript/Vite application with MapLibre + deck.gl Explore and Trace.
- [API](services/api/) and [worker boundary](services/worker/).
- [Contracts](schemas/) and [source configuration boundary](configs/sources/).
- [Claude extensions v1–v3](extensions/claude/) and [global/China prompt packs](extensions/promptpacks/).
- [Historical directives v1–v6 (including v4.5)](archive/directives/), [old README](archive/README-pre-v2.md), [Foundry guide](docs/foundry/legacy-upload-guide.md).
- [Unverified case files](data/legacy-cases/) and [legacy experimental fixtures](data/fixtures/legacy/).
- [Exact migration map](docs/migration/MIGRATION_MAP.md), [architecture](docs/architecture/README.md), [approved handoff](docs/design/nv2-handoff/NV2_CODEX_HANDOFF.md).

## Develop

Python 3.12+ and Node 22+ are supported. Offline development requires no service credentials or running database.

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -c requirements-runtime.txt -e './engine[test,storage,collect]' -e './services/api[test]'
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

API readiness: `GET /healthz` must return `status: ok`, `phase: foundation`. This is process/package readiness, not ingestion readiness. Frontend: a Flat Black Explore map using pinned real cartography and an explicitly synthetic case; Sources, Layers, search and evidence pinning open on demand. Run `python3 tools/verify_migration.py` to verify every legacy file and archive.

## Offline collector demo

```sh
.venv/bin/nv-engine replay --manifest configs/sources/gdelt.json --input data/fixtures/providers/gdelt.json --acquired-at 2026-01-01T05:00:00Z --state-dir .local/collector-demo --output-dir .local/gdelt-demo
```

Use a fresh output directory for each run. The first run accepts two fictional article records from three input rows. Replaying into another output directory with the same state stores zero new records. `collection.json` preserves provenance, missing fields and partial-coverage counts; `case.json` is explicitly synthetic. No network is used. [Source policies and live prerequisites](configs/sources/README.md) · [Acquisition design/limits](docs/decisions/0003-bounded-acquisition.md).

## Candidate analysis

```sh
.venv/bin/nv-engine analyze --input data/fixtures/detection/case.json --output-dir .local/detection-demo
```

Use a fresh output directory. `analysis.json` contains deterministic, uncalibrated candidates and provenance graph; `case.json` preserves the synthetic case with added candidates. POST `/api/v2/analysis` accepts `{case, configuration}` without persistence or network access. [Detection decisions](docs/decisions/0004-candidate-detection.md).

## Delivery and licensing

The next operational increment adds an OpenFreeMap detailed basemap and a public monitoring route at `/?view=monitor`. Its Cloudflare D1 data, GitHub OAuth and NIM capabilities remain setup-gated until the owner registers service credentials. See the deployed `/setup.html` guide and [monitoring operations](docs/implementation/NV3-operations.md). GitHub Actions monitoring defaults to 12 daily slots and must be enabled on the default branch; no paid plan is automatically activated.

[Ordered roadmap](docs/architecture/README.md): canonical schemas/provenance → bounded collectors → detectors → real map → Trace → exporter → source-backed Alpha. All seven implementation phases are delivered; see [release operations](deploy/README.md) for container and isolated static-preview deployment. No WorldMonitor code was imported. A project license remains undecided; do not assume permission to republish third-party code or datasets. Foundry enrollment upload and production operation remain outside the Alpha.

## Trace, export and deployment

Select a case and candidate, then Trace for evidence-linked scenes. Play/Pause, previous/next, skip animation, Evidence and KO/EN are available; Explore restores context. Export downloads the selected case's prebuilt scoped ZIP. Custom case/time/track exports use nv-engine export-foundry or the authenticated job API. See [release operations](deploy/README.md) and [actual Alpha source/method](data/alpha/README.md). No source credentials, Foundry account or live server is required for the public static demo.
