# ADR 0003 — Bounded collectors and synthetic replay

## Decision

Add provider-specific parsing/normalization for GDELT DOC articles, UCDP GED pages, FIRMS VIIRS CSV and RSS/Atom. Collection is explicit and one-shot. Shipped policies keep live collection disabled until access and rights are reviewed; no service/scheduler is introduced in PR 2.

A CollectionResult (schema 1.0.0) carries normalized canonical records plus provider lineage, gaps and a count/coverage report. Source manifests have their own versioned schema. CaseBundle remains schema 2.0.0; the canonical API is unchanged. Empty valid responses never invent a case. Invalid documents fail; invalid records are counted with safe reasons. Truncation and next-page availability are explicit. `collect_many` limits the batch/workers and isolates source failures.

## Provenance and clocks

Retain exact response bytes and canonical extracted provider-row JSON as separate content-addressed blobs. Source.content_hash refers to the retained canonical row JSON, **not a downloaded original news article**. The source URL points to the original article or provider landing page; each collected record also preserves provider endpoint (credential placeholder only), query parameters, upstream record ID, response hash and terms URL. Fetch history retains the public manifest and original acquisition time. Evidence is provider-reported, never auto-verified or auto-upgraded by article count.

GDELT seendate is provider indexing time, not publication or event time. RSS published/pubDate is publication time; Atom updated is not substituted. Unknown clocks remain null. UCDP start/end dates retain day resolution in CollectionResult, while canonical Event instant stays null rather than inventing midnight UTC. Those day ranges are not yet represented by a new canonical event-time range model: consumers must retain collection lineage alongside CaseBundle. UCDP coarse location precision is kept in the raw record and not silently rendered as an exact point. FIRMS exposes sourced satellite measurement time/point/brightness in K; it does not establish an attack, ignition or cause. The canonical location role verified means a sourced point, not independent ground verification.

## Cache and idempotence

CollectorState is private, local acquisition state, separate from the PR 1 snapshot database. It automatically initializes its small SQLite registry plus hash-named blobs. This is not a normalized production intelligence DB. Source data is append-only through the adapter; no automatic purge, upgrade or historical fixture import occurs. Retention/backup/quotas need an operational policy before a scheduler is added. Do not share a state directory between operators/credential bindings with different access scopes (especially proxy placeholders).

Exact provider-record duplicates are idempotent across runs. A changed payload, extraction/publisher/rights policy or synthetic/live origin creates a new record version. Duplicate sightings retain the first normalized acquisition and add response fetch history. Same-family canonical article URLs share a story key across feeds; content/title similarity alone never deletes evidence or claims editorial independence. Unknown syndication across unregistered families is not solved by this phase. Different content versions are preserved, not collapsed into one mutable row. Canonical bundle ordering is deterministic.

The cache is keyed by request and a one-way credential-scope digest; it stores no credential value or actual FIRMS key-bearing URL. TLS verification and inherited proxy/CA settings remain enabled. Requests do not follow redirects. Known credential echoes are rejected before persistence, raw HTTP exceptions are sanitized, and HTTPX path logs redact the active key. Never put secret values in manifest parameters or enable raw wire/header logging. Credential presence, HTTP success or two source records do not establish redistribution rights or factual truth.

## Bounds and limitations

Bound response bytes, parsed records, per-provider request pace, attempts, retry waits and worker count. Numeric/date Retry-After is respected, including persisted deferral for waits longer than automatic policy allows. No silent stale fallback after HTTP errors. UCDP continuation URLs are reported, never automatically followed. GDELT DOC only returns its bounded query window. State directories need durable storage for cross-run idempotence; removing one resets cache/dedup/pacing history.

Offline synthetic tests and mocked HTTP are the acceptance path. Documentation endpoints were checked, but live authenticated UCDP/FIRMS data was not fetched because keys are absent. No live-provider SLA, global coverage, calibrated detector, factual verification, production storage/auth, automatic raw-to-snapshot publication or public ingestion endpoint is claimed. Provider adapters remain independent from API/frontend. PR 3 will consume these records for baselines and evidence graphs.
