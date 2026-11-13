# NIGHT VISION × ADSB.LOL — 24/7 AUTOPILOT + POWER RESERVE v1.2

## Give this ZIP to Codex

**Copy to Codex:**

> Inspect `AGENTS.md`, the current NV checkout, and the attached `CODEX_IMPLEMENTATION_PROMPT.md`. Implement its reviewable phases. Replace failed OpenSky aircraft collection with an owner-enabled adsb.lol **region-scheduled** primary provider. Keep AIS, MapLibre, existing Power Reserve, and `GET /api/v2/traffic?type=aircraft|vessels` backward-compatible. Use the existing `TRAFFIC_HUB` Durable Object and its **single** Alarm for 24/7 collection without viewers. The adsb.lol API key is already in Cloudflare; verify only the secret **name**. Do not overwrite or reveal it. Use an actual region watchlist, not fictitious global coverage. Verify quotas, response bytes and `Retry-After`; do not fabricate aircraft movement. Run all tests; summarize deployment state accurately. Do not deploy without owner approval.

## Critical corrections vs v1.1

1. **OpenSky currently fails in the owner's deployment.** Make adsb.lol the primary provider behind `NV_AIRCRAFT_PROVIDER=adsb_lol`; stop spending CPU/alarms on OpenSky when switched, retain rollback ability. AIS remains independent.
2. **24/7 ≠ continuously running process.** Persist owner-enabled schedule in existing Cloudflare SQLite Durable Object and rearm its `alarm()`, even if no website visitors.
3. **6-minute baseline: 240 scheduled requests/UTC day** (one regional circle per request) + maximum 60 focused 90-second requests per UTC day. All owner/manual calls use the same shared local cap **300/day**, including failures. At max utilization this is <=9,300 requests over a 31-day month, under the user's provider 10k/mo and locally enforced 9,500/mo limit. Counts do not account for other key consumers.
4. **Monthly bandwidth is more restrictive than count for large responses.** Measured local cap 3.4GB/month against user-provided actual 4GB/month; adapt baseline upwards when response-byte budget cannot sustain 6-minute cadence. Hard-stop at account/DO limits. Provider dashboard is authoritative.
5. **Power Reserve is not a network scheduler** and cannot manufacture continuous animation from six-minute samples. Existing aircraft observation gap is 120sec, baseline delay 180sec, max playback delay 600sec. A 6-minute gap is **not interpolated**. Focus mode (90sec) can produce interpolation only when adjacent actual observations exist. No speed-based extrapolation or invented history.
6. **No free worldwide all-aircraft guarantee.** 24/7 default polls owner-configured circles (1–250 nautical miles), with explicitly partial receiver coverage. Official provider docs reserve whole-world snapshots to different entitlements. Never auto-call `/v2/all` or feeder-only `re-api` with an adhoc key.
7. **Existing Cloudflare secret:** verify deployed Worker secret binding name (`npx wrangler secret list`). No re-upload by default. Never put the key in a URL, repository or frontend.
8. **An operator must configure ≥1 real region and explicitly start autopilot after deployment**. The package includes an Amsterdam demonstration configuration only, NOT a deployment default. No upstream calls until enabled.

## Files

- `CODEX_IMPLEMENTATION_PROMPT.md` — exact phases, routes, migration-free integration instructions.
- `docs/24H_POWER_RESERVE.md` — honest time-series semantics, hot focus, browser behavior.
- `docs/CLOUDFLARE_INTEGRATION.md` — one-alarm DO wiring, start/stop/health, safe deployment.
- `docs/QUOTA_MATH.md` — exact math for 24h request and monthly bandwidth budgets.
- `reference/adsb-lol.mjs` — original v1.1 strict upstream adapter, shared persistent quota/cache.
- `reference/adsb-autopilot.mjs` — new reference scheduler + chunked latest-only snapshots + byte-aware cadence.
- `reference/adsb-lol.test.mjs`, `reference/adsb-autopilot.test.mjs` — 22 offline synthetic tests.
- `fixtures/owner-watchlist.example.json` — explicitly optional test region.
- Existing API command/schema docs retained from v1.1.

## Offline verification

```sh
bash scripts/check-local.sh
# or
node --test reference/adsb-lol.test.mjs reference/adsb-autopilot.test.mjs
```

The portable reference modules are **not automatically deployed** and do **not** modify your existing GitHub repository. Codex must adapt their imports and router wiring to the live checkout and run the repository's real tests and staging smoke checks. Nothing in this package confirms a live API request, binding name, deployment, or full-world coverage.
