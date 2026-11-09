# PR 1 — Canonical contracts, provenance validation and snapshot migrations

Base: Phase 0 commit 903f80d on refactor/nv2-foundation. Branch: feat/nv2-contracts. This is a stacked change over the foundation, not a combined migration/full-stack rewrite.

## Behavior

Introduce the ten canonical model types and versioned CaseBundle. All evidence records carry source references and extraction provenance; publication, event/observation and retrieval clocks remain separate. Reject duplicate IDs, dangling references, invalid timezone/geometry/metric values, reversed windows and promotion of non-direct evidence. Distinct declared publisher families are required for corroboration; source counts never upgrade confidence.

POST /api/v2/contracts/validate accepts a bundle and returns its identity/origin/counts, or 422 validation details. It does no collection, persistence, factual certification or publication. JSON Schema, OpenAPI and TypeScript contracts are generated from executable Python models; CI checks drift.

An optional snapshot adapter and Alembic migration store complete validated bundles without losing many-to-many provenance, counterevidence, unknown locations or timestamps. Content-addressed revisions make identical retries idempotent and changes append new snapshots. Caller transactions remain effective. See ADR 0002 for why normalized tables/PostGIS are deferred.

## Validation

- Python: 42 tests passed, none skipped. Covers model/graph failures, timezone normalization, geometry source rules, source-content hashes, JSON Schema formats, snapshot round-trip/idempotence/rollback/tamper detection and migration upgrade/downgrade/re-upgrade.
- Frontend: npm ci, 1 Vitest test, TypeScript structural-contract assertions and production build passed.
- Contract generator --check passed; JSON Schema/OpenAPI/TS snapshots are synchronized.
- Actual HTTP smoke: readiness, synthetic validation success, dangling-source 422 and exact OpenAPI response checked against snapshot.
- Documented SQLite CLI migration applied successfully; current revision is 0001_case_snapshots. PostgreSQL migration SQL generated offline; no live PostgreSQL/PostGIS validation claimed.
- Legacy manifest: all 68 files still match original bytes; 7 archives remain valid.
- pip check passed. An upstream Starlette TestClient/httpx deprecation warning remains; tests still execute successfully. Hosted CI has not run.

## Boundaries and next step

All fixture data is explicitly synthetic, with reserved example.invalid URLs and retained hashed synthetic text. Nothing here is real intelligence. UI/map/Trace behavior remains unchanged from Phase 0, and no deployment is performed. Semantic cross-record validation requires Python; generated JSON Schema and TS types alone cannot prove graph integrity or source truth.

PR 2: bounded collector adapters and source manifests, offline fetch/dedup fixtures, retries/cache/rate limits and provider licensing/access metadata. Do not enable live feeds or label the fixture as a real Alpha case by default.
