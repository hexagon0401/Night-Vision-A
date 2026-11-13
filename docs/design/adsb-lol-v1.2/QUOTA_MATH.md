# Quota arithmetic for 24-hour operation

The owner supplied the **actual logged-in key dashboard** on 2026-11-13:

| window | provider hard cap |
| --- | ---: |
| 30s / 1min / 1h | 20 / 120 / 1,000 requests |
| day (UTC midnight) | 1,000 requests / 1GB |
| week (Mon 00:00 UTC) | 5,000 requests |
| month (1st 00:00 UTC) | 10,000 requests / 4GB |

Local NV guardrails are stricter: 18/30s; 100/min; 900/hour; **300/day**; **4,700/week**; **9,500/month**; **850MB/day**, **3.4GB/month**, >=30sec between upstream attempts. Count all attempts and use `Retry-After` when 429. A free key may be revoked for repeated 429. All calls from scheduler, focus, owner/manual share ONE durable budget. Owner dashboard includes other API consumers, so may stop earlier.

## Request count is NOT aircraft count

One `/v2/point/{lat}/{lon}/{radius}` counts **one request**, however many received aircraft it returns. The `radius` is **nautical miles**, max250. One `/v2/hex/{icao24}` counts one request and generally targets one ICAO24. Any filtering/coverage is limited by upstream receiver coverage. No authorized global-all entitlement has been confirmed.

## Basic 24h cadence

- Every 6 min: 60/6 = 10 requests/hour = **240 requests/day**. One circle per slot (not all circles).
- 30-day month: 7,200 baseline requests; 31-day month: 7,440.
- Focus at 90sec: 40 requests/hour. Hard cap 60 focused calls per UTC day = up to **90 minutes** of additional focused sampling/day (assuming no coincident slot skips/other usage).
- Combined nominal hard daily cap 240+60=300. 30-day maximum 9,000; 31-day maximum 9,300, both below local 9,500 and provider 10,000. Owner/manual calls consume the same 300/day and may preempt focus or baseline.
- 7-day count at full 300/day: 2,100 requests, under weekly 4,700 and upstream 5,000.

## Why 6 min does not guarantee smooth movement

Existing `PowerReserve` accepts fresh aircraft observations <=120sec old, and interpolates only if two observations for one ICAO24 are <=120sec apart. Six-minute baseline adjacent samples are 360sec apart, so **no interpolation**. Power Reserve creates playback delay (default180sec, max600sec), **not** new real coordinates or additional upstream quota. Even at 120sec continuous sampling: 720 requests/day, 21,600–22,320/month; count cap fails. At 90sec continuous sampling: 960/day, 28,800–29,760/month; count cap fails. Sparse global-looking 24h animation would be misleading.

### Region count trade-off

At 6-minute baseline: 1 region -> each sampled every6min; 2 regions -> each every12min; 4 regions -> ~24min. A circle is not all-world coverage. For actual frequent interpolation, use **focus**, constrained by reserved requests and monthly bytes.

## Bandwidth usually becomes the binding cap

The owner dashboard also has **4GB/month**; local guard is 3.4GB/month. At 240 baseline requests/day over 30 days (7,200 responses), an average response must be <=about **472KB** to stay under the local 3.4GB budget, assuming zero focus requests. Reserve 10% of available monthly bytes for focus: average baseline target becomes ~**425KB** per request before further safety margin. At 500KB each, 7,200 baseline responses = **3.6GB** (too high for the local 3.4GB limit), so the scheduler MUST lengthen its interval. At 1MB/response, 240/day consumes 7.2GB/30d, far above 4GB. At 100KB/response, 7,200 requests use ~720MB; the request limit then dominates.

Example with 500KB average response and 10% reserved for focus: total baseline byte allocation ~3.06GB -> no more than 6,120 calls/30d -> baseline cadence **~7.1 minutes or slower** before added safety factor. Cadence is responsive to current month usage and time until month end. It is neither a guaranteed fixed 240 calls/day nor a promise to use the full allowance.

The reference scheduler's `adaptiveInterval` uses an EMA from measured upstream response bytes, the *remaining* local monthly budget and remaining UTC-month duration; it lengthens the 6-minute interval when necessary and caps it at one hour. The provider's own byte-accounting may differ from downloaded response length. When local limits approach, stop calls instead of promising sustained updates. Never attempt 429 retries immediately.

## Source and platform constraints

- Provider primary docs: https://www.adsb.lol/docs/open-data/api
- Provider whole-world entitlement distinctions: https://www.adsb.lol/sponsor and https://www.adsb.lol/docs/feeders-only/re-api
- Cloudflare DO alarms: https://developers.cloudflare.com/durable-objects/api/alarms/
