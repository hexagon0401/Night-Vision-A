# Free-tier monitoring implementation

## Architecture and configuration

MapLibre/deck.gl retain the flat-black map and add runtime OpenFreeMap vector tiles (roads, labels and coastlines), original source attributions and explicit offline fallback. No AGPL WorldMonitor implementation is imported. WorldMonitor served as architectural reference only. Verify actual upstream tile access in the hosted browser before declaring detailed-map availability.

Cloudflare Worker provides public data routes and GitHub OAuth/NIM/internal routes. D1 is a named free-plan binding `DB` / `nv-monitor`. Wrangler 4 supports provisioning a named D1 binding without an ID; the account's build token must allow D1 creation/edit. First API access installs only the initial idempotent schema. Existing databases can be pinned by their real `database_id` in wrangler.json. This does not upgrade billing. For deployment errors, inspect Cloudflare's build log rather than changing to a paid plan.

GitHub Actions runs the existing Python engine. The hourly minute-17 trigger gates itself to `MONITOR_RUNS_PER_DAY` slots (default 12, max 24); manual dispatch runs immediately. Scheduling is best effort. The workflow must exist on the repository default branch for cron/manual discovery; a feature branch push alone does not activate cron. Public-repo inactivity can disable schedules. No external alerts are sent.

UCDP uses a persistent checkpoint cache and a central D1 atomic daily 500-request budget, including failed requests/discovery probes. Cache loss causes bounded re-fetching, not quota reset. Annual and latest available monthly Candidate records merge by upstream ID, preserving payload hashes and previous annual hash on revision. Missing Candidate is not fabricated. Source requests never follow upstream paging URLs/redirects. Partial backfill saves the cursor and retains the last committed snapshot. Independent RSS failure cannot discard UCDP results, or vice versa.

The public source snapshot is switched atomically only after all expected records and generated cases/ZIPs have uploaded. Repeating unchanged publication does no bulk writes. Daily aggregate rows update only when content changes. Source-date intervals and low/best/high fatality estimates are retained; approximate coordinates are visibly approximate and unknown points remain absent. Raw views retain up to 90 days/20,000 records; aggregates retain 13 months. Each country's canonical analysis is bounded to 90 daily buckets. Zeroes exist only in known completed source coverage; gaps between annual and Candidate releases are excluded. Bucket UTC midnight is a derived aggregation boundary, never a reported event time. All scores remain uncalibrated.

## Secrets and activation

Use the Korean `/setup.html` guide on the deployed site. Secrets are entered by the owner in service settings, never in browser bundles or Git. Runtime templates are in frontend/nv-visualize/.dev.vars.example and are not frontend build-time variables.

- Cloudflare runtime secrets: NVIDIA_API_KEY_A, optional NVIDIA_API_KEY_B, GITHUB_CLIENT_SECRET. Legacy aliases remain supported; NV_INGEST_TOKEN is now an optional operator alternative to workload identity.
- Runtime non-secret values: GITHUB_CLIENT_ID, GITHUB_ALLOWED_USER_IDS (default 82876856, verified GitHub ID for hexagon0401), NIM_ENABLED=true after verifying free API entitlement; NIM_MODEL and NIM_REVIEW_MODEL are configurable.
- GitHub Actions secret: UCDP_ACCESS_TOKEN. Monitor publication normally uses short-lived GitHub OIDC; no duplicated ingest key is required. An existing NV_INGEST_TOKEN still works.
- Actions defaults: existing nightvision Worker origin, monitor enabled unless NV_MONITOR_ENABLED=false, UCDP attempted with its token unless NV_UCDP_ENABLED=false, MONITOR_RUNS_PER_DAY=12. Match the runtime frequency setting. RSS remains opt-in.
- Optional UN News metadata: NV_RSS_ENABLED=true and NV_RSS_RIGHTS_REVIEWED=true after checking UN terms. Headlines/links only; no full-text/media scraping or invented event coordinates. Subsequent optional providers remain GDELT then FIRMS.

GitHub OAuth needs a separate OAuth App, with callback `<origin>/api/auth/github/callback`; it requests read:user, never repository write. Hash-only opaque session tokens expire after seven days; one-use state expires after ten minutes and is bound to a Secure HttpOnly SameSite cookie plus PKCE verifier. User IDs, not mutable usernames, enforce the allowlist. AI/diagnostic/logout POST requires same origin.

NIM only receives server-selected evidence. Cache identity includes prompt/model/role/evidence and is checked before charging. Global 40/day and direct-user 10/day quotas reserve atomically; scheduled calls have a 30/day ceiling, sufficient for 24 summaries plus three primary candidate analyses and three second-model reviews. The reviewer receives the primary interpretation alongside the same cited evidence. Inputs are capped at 18,000 characters and ordinary output at 1,536 tokens (beta A/B 4,096/2,048). The documented Nemotron model disables thinking for bounded JSON; other models use provider defaults. There is no paid fallback. Model/access/quota failures pause new calls for that model until next UTC day (09:00 KST). Cached results and normal data remain available. Review agreement is not independent corroboration. Unknown citations/added fields/links/coordinate pairs are rejected; natural-language entailment is not certified, so AI text remains inferred and cannot create canonical facts.

## Interfaces

- GET /api/v2/status, /overview, /events?country=&from=&to=, /cases, /cases/:id, /cases/:id/export?scope=observed|all, /monitor-summary.
- GET /api/auth/github, /api/auth/github/callback, /api/auth/me; POST /api/auth/logout.
- POST /api/v2/ai/analyze `{case_id}`; GET /api/v2/admin/setup; POST /api/v2/admin/nim-test.
- Bearer-protected POST /api/internal/start, /batch, /case, /publish, /aggregates, /run, /ucdp-permit, /monitor-ai.

Public event pages cap at 500 records and expose `limited`; internal batches cap at 50 records. Prepared SQL, streamed body bounds and source/case validation apply. Secrets and raw upstream exception bodies are never returned. Worker errors return stable codes. Missing binding, OAuth or NIM configuration is a disabled/setup state, not a successful ingestion claim.

## Verification and limits

Python tests cover UCDP pagination resume, request budgets, revision precedence, uncertainty, invalid records and aggregation clock semantics. Vitest covers map style preservation and invalid AI citations/records. Real Miniflare/D1 integration covers schema installation, atomic publication, export, OAuth state replay/allowlist/session/CSRF, NIM cache/provider pause and concurrent quota reservations. Playwright covers actual WebGL and desktop/mobile monitoring interactions using explicitly synthetic HTTP fixtures. Live UCDP/NIM/OAuth acceptance needs owner-supplied settings and is recorded separately.

Cloudflare must remain on Workers/D1 free plans; those service limits remain authoritative and may stop requests. No code can turn a provider's paid account into a free account. Reaching D1 storage/write limits retains the last published data and reports unavailability; monitoring is not a production SLA, completeness claim, seismic/geopolitical predictor or independently calibrated risk score.

Runtime key aliases: NVIDIA_API_KEY_A is preferred for primary analysis and NVIDIA_API_KEY_B for review. Legacy NVIDIA_API_KEY and NVIDIA_SECONDARY_API_KEY remain supported; A/B take precedence when both conventions exist. With only A, review uses A under the same global budget. Key selection never rotates keys to evade quotas.

See [monitor and AI recovery](monitor-ai-recovery.md) for scoped workload authentication, independent statistical fallback, safe response diagnostics and production acceptance requirements.
