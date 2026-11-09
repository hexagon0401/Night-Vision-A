# PR 2 — Bounded provider adapters and idempotent acquisition

Base: PR 1 commit d033a6e on feat/nv2-contracts. Branch: feat/nv2-collectors. No previous changes are reapplied, merged or deployed by this phase.

## Result

- Four provider adapters: GDELT DOC artlist, UCDP GED 26.1, FIRMS VIIRS CSV and RSS/Atom.
- Versioned manifests with named credential bindings, source-family mapping, rights/attribution metadata, TTL, timeout, response/record/retry limits and per-provider pacing.
- Conditional ETag/Last-Modified cache, bounded backoff, Retry-After seconds/date support and persistent long-delay deferral. Redirects are never followed.
- Local content-addressed raw/row snapshots, public request provenance and an SQLite dedup/quota/cache registry. Changed record content/policy is a new version; exact duplicates do not create new records.
- Explicit synthetic replay and opt-in one-shot live CLI. One batch supports at most 32 unique sources and 4 workers; individual failures do not discard successful providers.
- Source-manifest/collection-result JSON Schemas plus existing canonical/OpenAPI/TypeScript drift checks.

No scheduler, alert, detector, case publication endpoint, map, Trace, export or deployment is added. The frontend/API behavior and canonical CaseBundle version remain unchanged.

## Verification

- 100 Python tests passed, none skipped (58 collector-specific). Includes four adapters, RSS/Atom/hostile XML, malformed documents/rows, unknown clocks/locations, UCDP day ranges/coarse points, FIRMS measurement semantics, limits, idempotence, source-family handling, synthetic/live isolation, HTTP error/retry/cache/quota behavior and credential redaction.
- Installed nv-engine CLI replayed all four fixtures: GDELT 2 unique records from 3 rows, UCDP 1, FIRMS 1, RSS 2. Repeated GDELT replay stored zero new records and emitted a byte-identical synthetic case. Existing output files were preserved.
- Frontend test (1), TypeScript/build, contract drift check, pip check and updated document link checks passed.
- All 68 historical files still match baseline hashes; all 7 historical archives pass integrity checks.
- Current upstream Starlette TestClient/httpx deprecation warning remains; tests completed successfully. Hosted CI result is reported in the PR, not assumed by this document.

## Limits

Every provider fixture is handwritten synthetic data. Only official documentation pages were read; live authenticated data was not fetched, and optional UCDP_ACCESS_TOKEN/FIRMS_MAP_KEY are absent. All source manifests remain disabled and rights review incomplete by default. Provider API permission and data redistribution rights are separate checks, not implied by a successful HTTP response.

Source.content_hash hashes retained canonical provider-row JSON; it does not imply the original publisher article was fetched. Full response bytes, redacted endpoint/parameters and acquisition metadata are retained independently. GDELT seendate is indexing time, UCDP date ranges stay at day precision, and unknown timestamps/points remain null. A thermal detection does not establish an attack or cause.

Idempotence is by exact record identity/content/policy; different versions remain available. Story keys group registered editorial families and canonical URLs without pretending to solve unknown cross-domain syndication. Source counts never upgrade evidence confidence. CLI exit 2 explicitly reports record caps, continuation or skipped rows. Empty responses do not fabricate cases. See ADR 0003 and configs/sources/README.md for storage, rights, coverage and credential boundaries.

## Next phase

PR 3: baseline/change-point detectors and candidate evidence graphs with deterministic/false-positive fixtures. Do not call synthetic output a real Alpha case or enable a global live feed by default.
