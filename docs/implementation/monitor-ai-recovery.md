# Operational recovery — 2026-11-10

## Verified failures

- The old map painted land and ocean the same color. See map-reliability.md for the single-context, 18-layer repair and real browser acceptance.
- Monitoring skipped by default and depended on a duplicated ingest key. Main-scoped GitHub OIDC now publishes successfully without that duplicate secret.
- Calendar-only UCDP discovery requested unpublished versions. The bounded public official release index currently identifies 26.0.9; the API confirms it before acquisition. Bounded calendar probes remain a fallback. Only monthly discovery treats HTTP 400 as unavailable; authentication and annual-query errors remain failures.
- Real UCDP records included negative/inconsistent death estimates. Preserve usable events, original low/best/high and hash; mark all three canonical estimates unknown. Never swap bounds or substitute zero. Event counts remain analyzable; affected death-count buckets and the UI carry quality warnings. Missing IDs, invalid dates or geography still block incomplete snapshots.
- The Nemotron API responded, but strict JSON generation could exhaust the completion limit. The configured Llama 3.3 70B endpoint returned 410 (NVIDIA's notice says support ended 2026-08-25). A catalog-listed Mistral migration target returned 404 for the current account/path, so catalog presence alone is not accepted as proof of usable access.

## Current model policy

Keep the configured `nvidia/nemotron-3.5-lightning-30b-a3b` analyst. Migrate the exact retired Llama reviewer ID to that same first-party model, using the existing B key. Analyst requests retain A, reviewer requests retain B. Two roles using one model are not independent corroboration; requested/actual models and replacement reasons are recorded.

Use documented `enable_thinking=false` and prompt-framed JSON for Nemotron, without forced JSON decoding. Trim framing and discard any delimited reasoning/preface; accept one complete JSON object only, then apply the existing schema/source-ID validation. Never repair truncated JSON, create missing fields or publish private reasoning. Length-truncated, ambiguous and malformed answers are rejected. Ordinary responses use four compact arrays (1,536 tokens); beta uses all eight phases, three A/B iterations, A 4,096/B 2,048. Actual live model acceptance is separate from mocked tests.

No key rotation, paid fallback or automatic plan upgrades. Access/payment/quota failures stop calls. Limits remain global 40/day, account 10/day, shared reviewer 3/day; beta permits six major calls plus at most two retries. One new beta experiment per UTC day. Failed steps preserve source input and safe generation metadata; completed steps are idempotent. A beta-specific limit does not overwrite provider health.

## Source publication and operating state

The hourly minute-17 workflow gates itself to 12 slots/day by default (1–24 configurable), and runs unless explicitly disabled. Production defaults to the existing nightvision Worker URL. Source credentials stay in Actions; NIM/GitHub secrets stay at Worker runtime. Short-lived OIDC is pinned to repository ID, main ref, exact monitor workflow, schedule/manual event, signature/issuer/audience/expiry and allowed ingest routes. Beta tokens cannot publish general monitoring data or bypass user login.

Validate before publishing snapshots. Source failures retain the last good publication. Record setup/backfill/error/AI status separately from successful statistical detection, and save a small secret-free run artifact. Rejected estimates remain unknown in aggregations. Aggregate upserts skip unchanged bodies; retention runs after a successful monitoring cycle, rather than scanning the whole table after each 50-row batch. Statistical summary totals run in D1 without loading full case bodies.

Public map/statistics remain usable independently of AI. An always-visible monitor control distinguishes initial collection from zero real incidents. The panel shows last success, coverage, provider errors, model health and separate statistical/AI summaries. Empty source data does not consume scheduled inference. GitHub login/allowlist and same-origin checks still protect user-triggered AI.

## Evidence and limits

The repaired source cycle published 1,764 recent UCDP records and 116 uncalibrated candidates. Counts are dataset observations/candidates, not verified threats or detector accuracy. UCDP publication lag remains distinct from check time. RSS is still opt-in pending terms review; no external notifications, permanent server or GPU were added. Free provider/Workers/D1 limits remain authoritative.

References inspected: https://ucdp.uu.se/apidocs/ · https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b · https://build.nvidia.com/meta/llama-3_3-70b-instruct · https://integrate.api.nvidia.com/v1/models.
