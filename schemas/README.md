# Versioned contracts

Source of truth: `engine/src/nv_engine/models/canonical.py`. Current schema version: **2.0.0**.

- case-bundle.schema.json: JSON Schema for all ten canonical types, helper types and complete case bundles.
- openapi.json: generated from the actual FastAPI app, including the contract validation request/summary and standard 422 responses.
- source-manifest.schema.json and collection-result.schema.json: version 1.0.0 collector policies and bounded-acquisition outputs; no public ingestion endpoint is implied.
- health.schema.json: Phase 0 process-readiness contract, unchanged.
- ../frontend/nv-visualize/src/contracts/generated.ts: generated structural TypeScript types.

From the repository root, after installing Python test/storage dependencies and `npm ci` in frontend/nv-visualize:

```sh
.venv/bin/python tools/generate_contracts.py
.venv/bin/python tools/generate_contracts.py --check
```

Check mode exits nonzero without rewriting stale files. CI checks generation drift. Never edit generated JSON/TypeScript by hand. A deliberate incompatible model change must version the schema and add migration/compatibility handling.

The engine validates graph references, declared source-family independence, UTC normalization and evidence-status promotion. Those semantic checks are not expressible in these generated structural types; callers must run the Python validator (or POST /api/v2/contracts/validate). Validation does not verify source truth. See ADR 0002 for boundaries and storage decisions.
