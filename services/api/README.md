# NV API contracts

Run from the repository root:

```sh
.venv/bin/python -m uvicorn nv_api.app:app --app-dir services/api/src --host 0.0.0.0 --port 8000
```

- GET /healthz: package/process readiness only (phase remains foundation).
- POST /api/v2/contracts/validate: canonical CaseBundle JSON; 200 returns case ID, schema version, data origin and record counts. Invalid structure, dangling references or semantic violations return FastAPI 422 details. This endpoint neither fetches nor persists anything.
- GET /openapi.json: executable request/response contract; its snapshot is generated into schemas/openapi.json.

There are no public case, collection or export endpoints, and no production auth or ingestion claim. The optional snapshot store is a library API, not an unauthenticated HTTP write endpoint.
