# adsb.lol regional autopilot

## Scope and approval boundary

Implements the owner's `NightVision_ADSB_Lol_Codex_Kit_v1.2_2026-11-13.zip` in the existing TrafficHub, without a new binding, migration, daemon, paid plan, or changes to AIS collection. The supplied instructions are retained under `docs/design/adsb-lol-v1.2/`; their historical verification statements describe the kit author, not a live provider test by this implementation.

The kit's START_HERE explicitly says **“Do not deploy without owner approval.”** The owner approved GitHub publication and production deployment on 2026-11-13. Runtime availability can be enabled for the owner controls; selecting actual watch regions and starting automatic collection remain explicit owner actions. No live source request is made by deployment. No default watchlist is shipped. The example region from the ZIP is not deployed.

Read-only Cloudflare inspection (2026-11-13): account token is active; `nightvision` exists, `TRAFFIC_HUB` is bound, the existing secret is named **`ADSB_API-KEY`**. Its value was not read, logged or overwritten. The new provider flags were not yet present on the operating Worker. Builds trigger metadata could not be read with this token (401); branch push may trigger preview builds; publication/deployment was held until the owner approval recorded above. R2 access credentials are unnecessary for this change.

## Behavior

- `NV_AIRCRAFT_PROVIDER=adsb_lol` selects the new source and prevents old OpenSky fetches on public reads and alarms. The code retains OpenSky for explicit rollback.
- After deployment approval, repository release defaults are: new provider selected, `ADSB_LOL_ENABLED=true`, daily cap 300, global filters disabled. This flag permits owner controls, not automatic collection. Deployment alone cannot start collection. Existing runtime keys remain untouched (`keep_vars`).
- A real owner configures 1–8 circles, each 1–250 nautical miles, then explicitly starts collection. One circle is sampled per six-minute UTC slot (nominal 240/day). With N regions each is sampled about every 6N minutes; this is **not worldwide all-aircraft coverage**. Delayed alarms make one current attempt and skip missed slots.
- Explicit ICAO24 or regional focus runs every 90 seconds, at most 60 attempts/UTC day, for 1–90 minutes per activation. Expiry/disable removes the focus target; editing targets does not refill the day's allowance. Focus wins coincident base slots. Request errors consume the same budget as successful calls.
- One persistent SQLite Durable Object, one existing alarm, one serialized manual/configuration/scheduled queue. Alarm rearming preserves AIS and skips OpenSky while the new provider is selected. No visitor is necessary after the owner starts the schedule.
- All calls share 300/day, 4,700/week (UTC Monday), 9,500/month, >=30s gap and conservative short-window caps. Bytes are measured: 850MB/day and 3.4GB/month; reserve space for a maximum 3MB response before sending. Request timeout 8s; redirects are not followed. Monthly byte pressure lengthens base interval up to one hour. These counters see NV only; the provider dashboard is authoritative for account-wide usage.
- Retry-After persists; two consecutive 429s, auth rejection or excessive response size pause the integration for owner review. Reconfiguration never erases quotas or review/cooldown state. There is deliberately no public reset endpoint. After review, maintenance may clear the review flag while preserving usage and Retry-After; do not rotate keys or reset counters to evade a limit.
- Latest regional snapshots use two storage banks and an atomic pointer; chunks have at most 250 rows **and <110KB** (Cloudflare values must be <128KiB). At most 5,000 observations/source response and 10,000 merged aircraft. No trajectory database. Partially written snapshots are not published.
- Public `/api/v2/traffic?type=aircraft` reads stored snapshots only; 15s polling and camera moves cost zero source calls. Existing snapshot/delta/cursor semantics remain intact. Source-observed positions older than 120s leave live output. Individual region sample times and fresh counts are visible.
- Power Reserve remains display-only: aircraft gaps <=120s can interpolate real endpoints. Six-minute gaps cannot. No extrapolation by speed/heading. Provider changes clear the previous observation epoch; a same-provider reconnect retains genuine samples.
- Per-aircraft popup shows registration, ICAO designator, ADS-B location method, zero speed/heading where observed, original observation and replay times, and adsb.lol ODbL attribution. The layer is labelled aircraft, without claiming every reported aircraft is a verified civilian flight.

## Owner controls and endpoints

GitHub owner session is required for all of these routes (numeric allowlist, existing OAuth):

- `GET /api/v2/adsb/admin/status`: readiness, **secret name only**, config, quota/bytes, pause reason, per-region freshness, next collection and shared alarm; no upstream call.
- `POST /api/v2/adsb/admin/config`: JSON <=4,000 bytes, same-origin, `{enabled,regions:[{id,label,lat,lon,radius_nm}],focus}`. Focus is null/off, or `{enabled:true,mode:'hex',value,expires_at}` / `{enabled:true,mode:'point',lat,lon,radius_nm,expires_at}`. `expires_at` is UTC epoch milliseconds, <=90 minutes from now. Runtime must be selected/enabled and key present before starting.
- `GET /api/v2/adsb?mode=status`: no source request. `mode=point&lat=...&lon=...&radius_nm=...` or `mode=hex&value=...`: owner-only **and explicit same-origin Origin header** to avoid cross-site quota spending; same queue/budget. No free-form URLs/hosts and no `/v2/all` or `re-api`.

UI: **지도 레이어 → 항공기 수집 관리 · 소유자** (collapsed, appears only after authenticated status succeeds). Edit actual regions, save stopped or confirm start; status and stop are separate controls. Empty coordinate fields are intentional. Focus selection/expiry is explicit. Status refresh never spends provider requests.

## Release and rollback

After owner approval: review commits, publish PR, allow required CI and any preview build, merge/deploy to main. Confirm deployed version and preserved secret binding name; set runtime `NV_AIRCRAFT_PROVIDER=adsb_lol`, `ADSB_LOL_ENABLED=true`, `ADSB_LOL_DAILY_LIMIT=300`, `ADSB_LOL_ALLOW_GLOBAL_FILTERS=false`. Owner supplies real regions through the UI and confirms start. Check next alarm and one ordinary due source request, source timestamps, bytes and actual dashboard usage. Do not force a rate-limit response in production.

Stop via owner UI first. Set `ADSB_LOL_ENABLED=false` to disable source collection. Explicit `NV_AIRCRAFT_PROVIDER=opensky` restores the prior provider, subject to its existing credential/network failure; old data, DO namespace and AIS remain. No force push, resource deletion, key replacement or quota reset.

Free-plan limits still apply to Worker/DO requests, CPU duration and storage. Browser reads cost zero **provider** calls but are not free of Cloudflare usage; 100 always-open 15s pollers can exceed free daily platform request allowances. No automatic billing upgrade or assertion of continuous global service. Check Cloudflare usage before increasing visitors/regions. ODbL attribution is shown; review obligations before bulk combined-database redistribution.

## Reproducible validation (synthetic, no live collection)

- `node --test services/cloudflare/tests/*.test.mjs`: adapter/reference plus quota, expiry, chunk atomicity and rollover regressions.
- `node tools/verify_adsb_hub.mjs`: actual Miniflare SQLite DO, production Worker/D1 auth, one real alarm handler, idempotence, shared concurrent queue, 100 read-only clients, delta responses, 120s expiry, persisted retry/review state across actual runtime restart, and AIS alarm isolation.
- `.venv/bin/python -m pytest engine/tests services/api/tests`
- `cd frontend/nv-visualize && npm ci && npm test && npm run build`
- `node scripts/worker-integration.mjs` includes legacy and new traffic integrations.
- `NV_BROWSER_PATH=/usr/bin/chromium npm run test:e2e`: desktop/mobile controls, decoded existing icons, popup sources/zero values, no refresh on zoom, anonymous gating and existing regressions. No provider images or aircraft in these fixtures are claimed real.
- `WRANGLER_SEND_METRICS=false npx wrangler deploy --dry-run --outdir /tmp/nv-adsb-worker`
- `python3 tools/verify_migration.py` and existing contract/geography/export/release checks.

Live source schema/entitlement, deployed owner login/control, actual alarm cadence, dashboard usage and real receiver coverage remain unverified until the approved rollout. Tests do not prove live regional inventory.

## Pre-release validation — 2026-11-13 (KST)

| Check | Actual result |
| --- | --- |
| Adapter/autopilot/hardening | 31/31 passed, mocked source only |
| Frontend unit tests | 142/142 passed |
| Python engine/API tests | 193/193 passed; existing Starlette deprecation warning |
| Chromium desktop/mobile | 21/21 passed (42.7s), synthetic network fixtures |
| Production Worker integration | D1/auth/OAuth/AI/ontology + legacy traffic + new SQLite ADS-B checks passed |
| Cold runtime | Config/quota/review pause/shared alarm preserved after Miniflare dispose/recreate using persistent SQLite |
| Build | TypeScript/Vite passed; existing MapLibre chunk-size advisory remains |
| Wrangler | Initial **dry-run** passed with the then-disabled runtime flag; release deployment is separately owner-authorized |
| Preservation | 68 original files byte-identical; seven historical archives intact |
| Contracts/geography/exports | Existing generation and integrity checks passed |
| Operational source | **Not called**; actual aircraft inventory/entitlement unverified |
| Production at initial validation | Unchanged; no region configuration or autopilot activation |

The first full browser run found a mobile popup overlap and two tests still referencing the old civilian-aircraft label. The popup stacking and fixtures were corrected, then the complete 21-test suite passed. The durable restart test initially used obsolete Miniflare persistence settings; it now uses the installed runtime's `resourcePersistencePath` and verifies actual persisted state. Wrangler's initial local config-directory error was resolved by pointing `XDG_CONFIG_HOME` to `/tmp/nv-wrangler-config`; the subsequent dry-run passed. These were local test/setup corrections, not production failures.
