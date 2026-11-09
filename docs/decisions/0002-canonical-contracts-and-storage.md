# ADR 0002 — Canonical contracts and immutable case snapshots

## Decision

Pydantic models in nv_engine.models are the source of truth for the ten canonical types and CaseBundle (schema version 2.0.0). API transport imports them; the engine does not import API or frontend code. JSON Schema, OpenAPI and TypeScript are generated rather than maintained independently.

Use optional SQLAlchemy/Alembic storage for content-addressed CaseBundle snapshots. Revision = SHA-256 of canonical UTF-8 JSON (sorted object keys, array order preserved, UTC normalized, defaults materialized). Duplicate retries are idempotent; changes create a new revision and never overwrite the previous one through this adapter. Loads revalidate content and its hash. The caller owns the transaction. No automatic migrations, collector startup or fixture import occurs.

The first Alembic migration creates case_snapshots with revision primary key, indexed case_id, schema_version, complete JSON payload and created_at_utc. All claim/source, geometry and counterevidence links remain lossless inside the validated payload. This is an intentionally bounded snapshot store, not a claim that normalized entity tables or spatial indexing already exist. Readiness time, source retrieval time and observation time remain separate.

SQLite is the tested local backend; the SQL and conflict clauses also target PostgreSQL. PostgreSQL migration SQL can be generated offline, but a live PostgreSQL/PostGIS service, cross-process concurrency and PostGIS queries are not validated in PR 1. Future normalized tables and PostGIS indexes require new additive migrations; never reinterpret raw legacy CSVs as verified records. A hash is an integrity check, not a source-authenticity attestation, cryptographic signature or database access-control mechanism. Privileged direct SQL can still alter a table; the adapter exposes no overwrite operation.

## Validation boundary

- Timestamps require explicit timezones; offsets normalize to UTC. Naive datetimes, epoch coercion and non-finite metrics are rejected.
- Location is either null or a complete WGS84 point. Verified points require a source ID; symbolic anchors need a note and cannot imply accuracy or become event/observation locations.
- Foreign references, per-type ID uniqueness, source provenance, relation intervals, anomaly windows and narrative step IDs are checked across a bundle.
- Publisher families are declared source-registry metadata. Corroboration references must use distinct declared families; this cannot prove real-world editorial independence. Confidence is never raised just by counting sources. Source quality, confidence, anomaly severity and impact remain separate fields.
- Relations and narrative steps cannot promote non-direct evidence to observed/documented status.
- JSON Schema and TypeScript enforce structure only. Cross-record reference, temporal-window and evidence-promotion rules require the Python validator; TypeScript types are not runtime verification.
- POST /api/v2/contracts/validate performs stateless validation only. It does not establish factual truth, publish a case, fetch a URL or save data. No production deployment, authentication policy or public-ingestion readiness is claimed.

## Deferred

Geometry beyond points, track models/H3, provider-specific rights checks, collector deduplication, calibrated confidence/detection, generated narrative logic, public-case queries and export are later phases. Unknown dates/coordinates remain null; no centroids or source values are fabricated to fill gaps.
