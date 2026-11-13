# Tests and release gates — v1.2

## Verified portable reference tests (offline synthetic)

```sh
node --test reference/adsb-lol.test.mjs reference/adsb-autopilot.test.mjs
```

22 synthetic tests passed when this package was prepared (11 upstream/auth/quota tests + 11 new scheduler/Power Reserve-related policy tests). All network fetches are test doubles. This proves only these reference modules' behavior, not deployed integration.

## Required Codex integration checks

- Actual repo `AGENTS.md` and implementation read first. No new DO binding, D1 migration, framework rewrite or paid plan.
- `OpenSky` **not called** on public aircraft GET/DO alarm when `NV_AIRCRAFT_PROVIDER=adsb_lol`; AIS runs unchanged.
- 24h DO alarm works without browser visits after owner explicitly enables configured regions; one shared Alarm and one serialized adsb queue. NO fan-out cron/loop.
- 6-minute base request intervals persist across restart; late/missed slots skip without catch-up. Each source call counts once including failures; 240 scheduled/day nominal. Multiple watch regions rotate one/request with honest coverage.
- Focus at 90 seconds can interpolate two actual points separated <=120 seconds. A baseline 360-second gap **never** produces synthetic aircraft movement. Hidden browser does not spend upstream API calls.
- 15-second public reads cost **zero** adsb.lol upstream calls; `type=aircraft` delta/snapshot protocol unchanged. 100 concurrent public clients do not generate 100 upstream calls.
- Same DO quota for focus/base/manual; 30s/min/hour/day/week/month limits and bytes/month; 300/day shared cap, 3.4GB/month, 429 `Retry-After` and repeated 429 manual-review stop survive restart.
- January/month rollover, Monday week rollover and UTC midnight, no accidental monthly carryover; throttling when mean response size would exceed monthly data cap.
- Auth: unauthorized owner configuration or manual endpoint returns 401/403 and cannot hit adsb.lol; CSRF sameOrigin on POST. Public `traffic` read-only. Existing secret name verified; never log its value.
- Dataset normalization: real 0kt & 0°, ICAO designator `t` vs source `type`, `seen_pos`, provider `now`, missing location, fake future time, wrong hex; ODbL attribution.
- No misleading 'full-world' label for regional coverage; no stale positions counted as live after120sec. Source errors distinguish unavailable/coverage absence.
- Browser desktop/mobile: existing MapLibre layer, icons, selection popups, sources, AIS functional, no separate canvas; no remote call when tab hidden or map moves.
- Verify byte-size body guards, no upstream URL redirects, 8-sec timeout, no caller-controlled host.

## Required repository commands

```sh
.venv/bin/python -m pytest engine/tests services/api/tests
cd frontend/nv-visualize
npm ci
npm test
npm run build
cd ../..
node tools/verify_traffic_hub.mjs
python3 tools/verify_migration.py
```

Additional Miniflare DO simulated-alarm integration test must be written and executed by Codex. Above commands are not claimed to have passed in the target repository in this task.

## Live rollout (owner-approved only)

1. Stage route read-only; inspect existing `ADSB_LOL_API_KEY` secret **name** only.
2. Enable `NV_AIRCRAFT_PROVIDER=adsb_lol`, `ADSB_LOL_ENABLED=true` as an explicit owner action.
3. Owner sets real region and starts `POST /api/v2/adsb/admin/config` from authenticated same-origin session.
4. Verify next DO alarm and one source request after due. Check source timestamp, response length and actual dashboard usage. Do not test by forcing 429.
5. Verify no OpenSky calls and unchanged AIS; follow provider quota account and Cloudflare free usage.
6. Stop/rollback via admin config and vars; leave DO/AIS state intact.
