# v1.2 provider scope note

The owner now uses adsb.lol as primary because OpenSky currently fails. `api.adsb.lol` regional queries are the planned 24/7 source. **Do not assume the free adhoc key authorizes full-world snapshots**; see https://www.adsb.lol/sponsor and https://www.adsb.lol/docs/feeders-only/re-api . The owner dashboard quota below takes priority over generic tier descriptions.

---

# Fact check and source references (inspected 2026-11-13)

**ACCOUNT-SPECIFIC OVERRIDE**: The owner has provided their authenticated Usage page showing 20/30s, 120/min, 1000/h, 1000/day, 5000/week, 10000/month, 1GB/day, 4GB/month. Use [`ACCOUNT_LIMITS_2026-11-13.md`](ACCOUNT_LIMITS_2026-11-13.md) as the primary source for **their account**; public tier numbers below are generic background, not guaranteed current account entitlements.

## Primary provider documentation

1. **adsb.lol / API** — https://www.adsb.lol/docs/open-data/api
   - Base: `https://api.adsb.lol`, schema / interactive docs at `/docs`.
   - Send `x-api-key: <key>` in HTTP request header.
   - Daily quotas as published: no key 500/IP/day, free adhoc key 1,000/day, feeder 7,200/day and 20 GB/month, sponsor tiers may vary.
   - HTTP 429 includes `Retry-After`, daily window resets **00:00 UTC**.
   - License listed as **ODbL 1.0**.

2. **adsb.lol / provider code** — https://github.com/adsblol/api/blob/main/src/adsb_api/utils/api_v2.py
   - Registered endpoints include `/v2/point/{lat}/{lon}/{radius}`, alias `/v2/lat/{lat}/lon/{lon}/dist/{radius}`, `/v2/closest/{lat}/{lon}/{radius}`.
   - The code caps circle radius at 250 (nautical miles per common v2-compatible documentation).
   - Query endpoints: `hex`, `icao`, `callsign`, `reg`, `registration`, `type`, `squawk`, `sqk`, `mil`, `pia`, `ladd`.
   - This code may be an earlier version than the deployed API: real response compatibility requires a keyed smoke test.

3. **adsb.lol / feeder-only re-api** — https://www.adsb.lol/docs/feeders-only/re-api
   - Separate `https://re-api.adsb.lol` raw readsb API; documented as feeder service with station IP restrictions. Whole-world snapshot access described for eligible feeders, not an automatic entitlement of a free ad hoc key. **Not used by this kit.**

4. **adsb.lol / privacy and license** — https://www.adsb.lol/docs/privacy-license
   - Provider disclaims warranties of accuracy/completeness. Public API page specifies ODbL, while privacy page mentions CC0 **for data uploaded to the feeder**, not a blanket public-API licensing replacement.
   - User-facing Night Vision views should show `Data: adsb.lol — ODbL 1.0` with source link. Check ODbL derived-database/share-alike obligations before releasing bulk fused databases/exports. This is implementation guidance, not a legal opinion.

5. **Provider API response compatibility** — https://github.com/adsblol/api/blob/main/src/adsb_api/utils/models.py and https://github.com/adsblol/api/blob/main/tests/test_api.py
   - `ac` records, `now`, possible `seen_pos` / `hex`, aircraft characteristics, etc. No field is guaranteed to be present. Treat missing values as unknown.

## Project files verified

- https://github.com/hexagon0401/Night-Vision-A/blob/main/AGENTS.md
- https://github.com/hexagon0401/Night-Vision-A/blob/main/docs/features/GLOBAL_TRAFFIC.md
- https://github.com/hexagon0401/Night-Vision-A/blob/main/docs/features/TRAFFIC_DAILY_PACING.md
- https://github.com/hexagon0401/Night-Vision-A/blob/main/services/cloudflare/traffic-hub.js
- https://github.com/hexagon0401/Night-Vision-A/blob/main/services/cloudflare/worker.js
- https://github.com/hexagon0401/Night-Vision-A/blob/main/frontend/nv-visualize/src/monitor/ais-live.ts
- https://github.com/hexagon0401/Night-Vision-A/blob/main/frontend/nv-visualize/src/map/traffic-classification.mjs

## Verification limits

- The live OpenAPI `https://api.adsb.lol/openapi.json` endpoint was **unavailable** through our browsing route while preparing this kit (`no healthy upstream`).
- The user supplied an authenticated account Usage table and confirmed Cloudflare key installation, but **we did not test the actual key, inspect Cloudflare bindings, or make a live request**. Provider HTTP status, schema compatibility and current remaining quota are unverified.
- The key itself is never included in the ZIP. We tested a mock provider and synthetic fixture only.
- Do not confuse adsb.lol's official **2026** quota page with older provider repository README that says API keys may be required “in the future.” Use the latest official usage page for quotas.
