# Confirmed account Usage — supplied by Night Vision owner (2026-11-13)

The following figures are **the owner's authenticated adsb.lol dashboard**. They supersede generic public tier descriptions in the original v1.0 handoff. We did **not** log into the account, retrieve a key, or verify Cloudflare settings.

| UTC window | Provider request cap | Provider data cap | reset |
|---|---:|---:|---|
| 30 seconds | 20 | — | every 30s |
| minute | 120 | — | every minute |
| hour | 1,000 | — | every hour |
| day | 1,000 | 1 GB | 00:00 UTC |
| week | 5,000 | — | Monday 00:00 UTC |
| month | 10,000 | 4 GB | first of month 00:00 UTC |

These are **account-wide/provider counters**. The Night Vision Durable Object cannot query their exact usage. If the same key is used elsewhere, DO-local usage **underestimates** consumption.

## Recommended Night Vision self-imposed limits

| Local boundary | Default rule | Why |
|---|---|---|
| Per-request | Up to 3 MB received; stop oversize | limit memory and prevent large unexpected transfers |
| 30 seconds | at most 1 upstream request (30s gap) | avoid any pressure on the 20/30s provider cap |
| minute, hour | explicit counters, guardrails 100/min and 900/hour | no bypass via concurrency |
| day | **300 upstream attempts** by default, configurable at most 950 | 300 × 31 = 9,300 before monthly cap; 950 only with month/week caps |
| week | at most 4,700 attempts | headroom under 5,000 |
| month | at most **9,500 attempts** | headroom under 10,000 |
| day data | stop before 850 MB measured | headroom under 1 GB |
| month data | stop before 3.4 GB measured | headroom under 4 GB |
| available bandwidth | reserve 3 MB of headroom before each request; charge bytes read after response | block before the measured local data cap |

**Data quota is material.** A request yielding 3 MB × 300/day × 31 days would be **27.9 GB/month**, not 2.79 GB. So the independent 3.4 GB local monthly byte guard may stop calls well before 9,500 requests. Conversely, small targeted requests can permit considerably more calls.

Bytes counted by this module are the HTTP response body bytes the Worker reads, **not confirmed identical** to the upstream provider's charged `data` counter. Compression and other key consumers can differ; leave ample headroom and consult the dashboard. No monitor can guarantee never seeing a 429 when other clients share this key.

## On any HTTP 429

1. Do **not** retry automatically. Parse `Retry-After` (seconds or HTTP-date) and persist `blockedUntil` in the existing TrafficHub Durable Object.
2. Until the cooldown expires, reject even requests for different regions; repeated upstream 429s may revoke a free key.
3. Two consecutive provider 429s trigger `provider_paused` requiring **manual operator review** (no self-reset endpoint). A provider 401/403 or oversized response similarly pauses until reviewed.
4. Correct a suspected wrong key binding or provider entitlement **without revealing or copying the secret**. The owner can inspect Cloudflare Worker Secret names, but not their values.
5. Never run synthetic tests against the live provider; mock HTTP 429 and schema failures instead.

## Existing Cloudflare key

Owner says the key is **already uploaded to Cloudflare**. The integration should use that existing Worker secret, not replace or re-enter it by default. Code expects the binding name `ADSB_LOL_API_KEY`:

```bash
cd frontend/nv-visualize
npx wrangler secret list
```

This lists secret **names**. If the existing secret name differs, use the actual name in server-side `env.<binding>`, **or** rename it via the Cloudflare dashboard under owner control (no key in Git/chat). Cloudflare environments and deployed Worker names may be different; verify the secret belongs to the `nightvision` Worker/environment that runs `/api/v2/adsb`.

The `mode=status` endpoint should return `configured: true` once deployed and logged in via GitHub, without making a provider call.

The free key examples provided by the owner are available via `x-api-key` for `/v2/mil`, `/v2/hex/...`, and document a separate re-api query surface. This kit intentionally implements the fixed `https://api.adsb.lol/v2/...` allowlist; it does not assume the separate `re-api.adsb.lol` query host accepts this key or shares identical accounting without a successful operator smoke test.
