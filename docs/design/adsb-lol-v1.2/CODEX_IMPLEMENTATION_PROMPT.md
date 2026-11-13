# CODEX IMPLEMENTATION DIRECTIVE — NV adsb.lol 24/7 + Power Reserve v1.2

## Role and mandatory reconnaissance

Implement, **do not merely recommend**, a bounded production-ready change into `hexagon0401/Night-Vision-A`, one reviewable phase at a time. Read:

- `AGENTS.md`, `README.md`, `docs/design/nv2-handoff/NV2_CODEX_HANDOFF.md`
- `docs/features/GLOBAL_TRAFFIC.md`, `docs/features/TRAFFIC_DAILY_PACING.md`, `docs/features/POWER_RESERVE.md`
- `services/cloudflare/{worker.js,traffic-hub.js,traffic-schedule.js,traffic-delta.js}`
- `frontend/nv-visualize/src/monitor/{ais-live.ts,power-reserve.ts,layers.ts}`
- `frontend/nv-visualize/src/map/traffic-classification.mjs`, `frontend/nv-visualize/wrangler.json`

Check for newer code on the actual branch; adapt rather than overwrite. Never alter historic archives or assume fake positions. No deployment without explicit owner approval.

## Mission

The owner reports OpenSky unusable. Replace it as the default **aircraft live-collection provider** with adsb.lol for owner-configured regional collection **24 hours per day**, via existing Cloudflare Durable Object Alarm and shared persistent quota counters. Keep AISstream, main map, icons, data contracts, ontology, Power Reserve, and existing public `GET /api/v2/traffic?type=aircraft|vessels` API. Keep OpenSky code behind rollback toggle, but make sure the OpenSky scheduled fetch **does not run** when `NV_AIRCRAFT_PROVIDER=adsb_lol`.

Important: DO alarms wake the service when due; do NOT build an infinite loop, a permanently running Worker, `setInterval` in a Worker, a second DO, a second cron, or a fee-bearing always-on VM. Cloudflare has **one Alarm per DO**; extend existing `TrafficHub.arm()` rather than overwrite its AIS/legacy alarm. Ensure best-effort, idempotent, persisted scheduling and no missed-slot catch-up.

## Hard account limits (owner's authenticated dashboard)

| window | provider hard | local integration policy |
| --- | ---: | ---: |
| 30s | 20 calls | 18 and >=30s between calls |
| 1min | 120 | 100 |
| 1h | 1000 | 900 |
| 1d UTC | 1000 / 1GB | 300 attempts / 850MB |
| 1w UTC Monday | 5000 | 4700 |
| 1mo UTC 1st | 10000 / 4GB | 9500 / 3.4GB |

These are *account-wide* limits; DO counters only see NV. Another consumer of the same key may affect actual availability. 429 always honors persisted `Retry-After`; repeated 429 can revoke free key: after two consecutive provider 429s stop and require owner review. Request count includes failed attempts. No paid fallback.

## Prescribed baseline and focus modes

- `base`: **every 6 minutes, UTC-slot-aligned,** exactly one circular region per due slot, rotating through a **persisted owner-configured list** of 1–8 geographic circles (1–250 NM). Nominal 240 calls/day, 7,200/30d or 7,440/31d. If 2 regions, each receives a sample roughly every 12 minutes; NEVER imply world completeness. An empty watchlist is `setup_required`, **not** automatic global scan.
- `focus`: explicitly enabled, scoped to one `ICAO24` or one circle, **90-second** cadence, 60 calls/day local maximum = up to 90 min/day (while spare quota/bandwidth exists). It takes priority over baseline; skip coincident baseline slots, never burst to catch up. On expiry/disable, stop; do not keep tracking unrequested targets.
- Combined maximum: 240 nominal baseline + 60 focused = 300/day, but **manual calls also count**. If manual usage or data volume leaves insufficient capacity, decrease frequency or skip; don't bypass provider caps.
- Bandwidth-aware baseline: use the moving estimate of downloaded response bytes, current month's measured bytes and time to next UTC-month reset to **increase** baseline interval above 6 minutes when 3.4GB/month would otherwise be exceeded. Hard-stop at local byte cap; manual/other key usage may force provider stop earlier. Use response body sizes, not guessed per-plane usage.
- Store exactly the **latest** normalized regional/focus snapshot (chunked + atomic pointer swap); no trajectory DB, no replayed source points, no historical source claims. API snapshot is not exhaustive. Expired observations must be removed from *live* output after 120 seconds. Don't retain stale objects as 'live'.
- Never add `/v2/all` or `re-api` global fetch in this mode. Official adsb.lol documentation distinguishes full-world snapshot entitlement. If later authorized, add a separate entitlement-checked mode with traffic/bandwidth tests; do not assume this key has it.

## Phase A — backend adapter, already tested offline

Start from `reference/adsb-lol.mjs` (v1.1 core). Copy to `services/cloudflare/adsb-lol.mjs`, adapt path imports only. Required behavior:

1. Fixed `https://api.adsb.lol` allowlisted paths, authenticated using **existing Worker secret** `env.ADSB_LOL_API_KEY` (or actual existing deployed secret NAME). `x-api-key` never reaches browser, logs, links or generated files.
2. GET `/v2/point/{lat}/{lon}/{radius}`, `/v2/hex/{hex}`, optional owner-only searches. `mil` is a globally filtered subset, not all aircraft; default off. Validate all path parameters; no arbitrary base URL or user-supplied query forwarding.
3. Normalize source `ac[].hex`, `lat`,`lon`,`seen_pos`,`t`,`type`, `track`,`gs`, observed timestamp = provider `now` minus `seen_pos` seconds. `t` is ICAO aircraft designator (for existing icon classifier), `type` is ADS-B location-report method. `seen` is NOT location age. Preserve genuine zero values. Reject invalid or old positions.
4. Durable Object **serialized** fetch queue; persist 30s/min/hour/day/week/month usage, byte counts, 429 cooldown, manual-review stop, fixed provider bounds, cache and hard size/time caps. DO's counters are not the upstream account dashboard.
5. Keep owner-only existing `GET /api/v2/adsb?mode=...`; `mode=status` is local quota/key readiness and costs zero upstream requests. Route after existing DB and `requireUser`, no anonymous quota spending.

## Phase B — new 24/7 autopilot reference, already tested offline

Copy `reference/adsb-autopilot.mjs` to `services/cloudflare/adsb-autopilot.mjs` and update its import from `./adsb-lol.mjs` correctly. Keep these exported primitives:

- `validateWatchRegions(regions)` validates 1–8 configured circles, 250NM max, IDs, duplicates, actual coordinate bounds.
- `configureAdsbAutopilot(hub,command)` validates and persists enabled state, region list, optional focus, due timestamps and counters. Only call from **authorized owner POST**.
- `nextAutopilotDue(cfg,now)` gives next alarm candidate (subject to provider backoff).
- `runAdsbAutopilot(hub)` consumes **at most one** due slot, persists its next due marker **before** network access, invokes the same `handleAdsbLolDO` and its shared budget, updates latest-only snapshot if successful and returns next due; skips late windows. Use one serialized queue across manual and scheduled calls.
- `readAdsbAutopilotSnapshot(hub)` gives fresh observations **without upstream requests**, for reuse by the existing public `/api/v2/traffic?type=aircraft` response formatter.

Set `NV_AIRCRAFT_PROVIDER=adsb_lol`, `ADSB_LOL_ENABLED=true` (after owner-reviewed staging), `ADSB_LOL_DAILY_LIMIT=300`. Do not set an unapproved default watch region. Persist this owner state in current TrafficHub DO storage, no D1 migration.

Integrate into `TrafficHub` carefully:

```js
import {handleAdsbLolDO} from './adsb-lol.mjs';
import {configureAdsbAutopilot, runAdsbAutopilot, readAdsbAutopilotSnapshot, nextAutopilotDue} from './adsb-autopilot.mjs';

// At TOP of TrafficHub.fetch, before checking legacy 'type':
// /adsb = existing owner-only direct request (all incoming routes validated by Worker)
// /adsb-auto-config = owner-only POST config; call configureAdsbAutopilot; then arm()
// /adsb-auto-status = owner-only metadata; NO external calls
// For all adsb upstream/scheduler calls reuse one serialized queue:
this.adsbQueue = (this.adsbQueue ?? Promise.resolve()).catch(()=>{})
  .then(() => /* manual or scheduled operation */);

// When existing / traffic?type=aircraft selected AND NV_AIRCRAFT_PROVIDER==='adsb_lol':
const payload = await readAdsbAutopilotSnapshot(this);
return format(payload); // preserve items/delta/cursor/snapshot contracts
// No this.aircraft() / OpenSky fetch in this branch.
```

In `TrafficHub.arm()` add the earliest `nextAutopilotDue` from `adsb:auto` storage when env selects adsb.lol, using **the same existing `state.storage.setAlarm`** and maintaining AIS schedules. In `TrafficHub.alarm()`, invoke `runAdsbAutopilot(this)` through the same queue, catch/record bounded failures, and always call existing `arm()` in finally. If a due call fails or raises 429, do not retry in a tight loop; respect persisted cooldown, skip missed slots. Confirm single alarm does not clobber AIS alarm and is rearmed across DO cold starts. Existing scheduled OpenSky logic should only run when `NV_AIRCRAFT_PROVIDER!=='adsb_lol'`.

**Important:** `configureAdsbAutopilot` starts the persisted schedule but DO alarm will only wake automatically after `arm()` has explicitly been called once from the authorized owner config endpoint; deployment alone doesn't initialize it. Disabling autopilot must not delete AIS alarms. Only pause this integration's state.

## Phase C — secure owner control plane + browser

In `services/cloudflare/worker.js` add `GET /api/v2/adsb/admin/status` and `POST /api/v2/adsb/admin/config` **after** existing `await initialize(env.DB)`. Both `await requireUser(request,env)` and check `env.TRAFFIC_HUB`; POST additionally `sameOrigin(request)` + `body(request,4000)` before forwarding to DO internal paths. Do not create an unauthenticated path that can configure or trigger upstream calls. Include `adsb_lol:!!env.ADSB_LOL_API_KEY` as boolean readiness in admin setup.

The existing public `GET /api/v2/traffic?type=aircraft&format=delta` MUST remain read-only for adsb.lol: it reads published latest-only DO snapshots, filters out observations >120s, returns `provider:'adsb.lol'`, `coverage:'selected_regions_only_receiver_dependent'`, `schedule` status, and updates existing `TrafficDelta`; it **must not call the provider on each browser poll**. 15-second UI polling may continue without spending API calls. Public `type=vessels` must remain identical.

Add a small owner-only status/control in existing monitor layers (flat-black, no new permanent drawer) with `Start/Stop`, explicit watch-region editor, focus toggle, last successful source snapshot, next scheduled call, today/month requests/bytes and pause reason. Use existing GitHub session; non-owner users can view published read-only aircraft but cannot configure/poll source. Reject malformed operator config and show confirmation before enabling 24h consumption.

Existing `PowerReserve` and `liveAis` must be reused, not replaced. Unchanged hard invariant: aircraft interpolation only if two **real** points from the same aircraft are within **120s**. Baseline 6-minute circles do **not** qualify. Do not set a larger gap solely to make sparse snapshots appear animated and do not extrapolate by gs/track. For 6-minute baseline show a precise `last observed at` and explicit `waiting/no fresh observation` state; if a separate last-known marker view is desired, it must be clearly marked historical, opt-in, non-live and not injected into PowerReserve. Focus at 90s can interpolate actual adjacent observations at 180s playback delay.

In `ais-live.ts`, replace hard-coded `OpenSky` source label/link with per-sample `provider`/`source_url`, show `position_source`, original observation timestamp and the replay timestamp. Deduplicate by `aircraft:<icao24>` and preserve later observations; if switching the backend provider, reset old OpenSky cursor/generation correctly on first snapshot, without interpolating across different observation epochs or producing mixed-source jumps. Render with the existing ICAO `t` icon classification; keep `type` from source solely as location method. No new canvas, SVG assets, or unverified path lines.

## Phase D — tests and release gates

Run:

```sh
node --test reference/adsb-lol.test.mjs reference/adsb-autopilot.test.mjs
.venv/bin/python -m pytest engine/tests services/api/tests
cd frontend/nv-visualize && npm ci && npm test && npm run build && cd ../..
node tools/verify_traffic_hub.mjs
python3 tools/verify_migration.py
```

Adapt reference tests into repository conventions and add an actual Miniflare DO integration test: one shared serialized queue, persisted schedule/counters/cold restarts, real alarm invocation with no viewers, once-per-slot idempotency, 6-minute default/240 nominal calls/day, max60 focus/day, 90sec gap, byte pressure slowing baseline, month rollover, 429 Retry-After, pause after second 429, fresh/snapshot bounds, legacy AIS and delta fallback. DO not actually execute 240 live calls in tests; fake clock and fake provider.

Test **no OpenSky outbound calls** in the new provider mode, **zero adsb.lol calls** on ordinary public UI polling, no key leak, wrong-session auth 401, no API requests when disabled, missed slots skipped, and source errors never converted into fabricated real-time locations. Verify provider runtime/no deployment first. Flag Cloudflare DO daily budget and storage billing considerations; never automatically opt into paid plans.

For deployment, display the actual applied `NV_AIRCRAFT_PROVIDER`, secret **name** present, owner watch regions, next alarm and budget. One conservative **live** key request only after owner approval. Actual API plan may not support unspecified paths: no `/v2/all`, no `re-api` global on adhoc; graceful 403. Validate ODbL attribution and redistributions.

## Definitions of done

(1) Owner can configure a watchlist and explicitly start a viewer-independent 24/7 scheduled regional feed. (2) All quota gates shared by background, focus and manual calls. (3) Browser traffic uses snapshots; no upstream request per visitor. (4) Genuine Power Reserve interpolation only from supported real observations. (5) Status shows which area was observed and when; not world coverage. (6) OpenSky outbound disabled while adsb primary, AIS preserved. (7) Tests green; logs do not expose key. (8) Rollback is flag + operator stop, no data destruction or new migration.

See `docs/CLOUDFLARE_INTEGRATION.md`, `docs/QUOTA_MATH.md`, `docs/24H_POWER_RESERVE.md`, `docs/TEST_AND_RELEASE.md` for details and exact expectations.
