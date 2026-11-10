# Monitoring and NIM recovery — 2026-11-10

## Diagnosed production state

The last scheduled monitor job was skipped, and the public service had no provider snapshots, runs or last successful analysis. Configured NIM keys did not imply working collection or model inference. A separate beta run failed on a length-truncated model response.

## Changes

- The main-branch scheduled workflow now runs unless `NV_MONITOR_ENABLED=false` explicitly disables it. Twelve daily slots remain the default; the hourly workflow skips non-due slots. Its Worker origin has the existing production URL as a default.
- Publication accepts GitHub OIDC for the exact `monitor.yml@refs/heads/main` workflow, pinned repository ID, main ref, schedule/manual events and `/monitor` audience. Beta and monitor tokens cannot authorize each other's routes. Existing shared ingest tokens remain supported. Workload tokens are obtained per request and never written to artifacts.
- UCDP is attempted when the Actions `UCDP_ACCESS_TOKEN` exists, unless explicitly disabled. No token is fabricated, copied from frontend settings or retrieved from chat. Missing credentials, backfill, authentication and upstream errors stay explicit. RSS enablement and terms review are still required; a failed terms-page request is not a completed license review.
- Successful data collection/statistical detection is recorded independently from AI availability. Each run records AI status; source failure retains the last published snapshot. A small run-status artifact records actual operation without secrets.
- The documented Nemotron 3.5 Lightning request template enables thinking by default. For bounded structured reports only, send `chat_template_kwargs: {enable_thinking:false}` to that exact model. Llama and unknown models retain provider defaults. No High claim or paid/model/key rotation is introduced. Reference: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b (official template inspected 2026-11-10).
- Ordinary summaries use compact JSON and 1,536 completion tokens; beta remains A 4,096/B 2,048 with short phase outputs. Cache prompt version changes so failed/older settings are not reused as new analysis. Global 40/day, beta 8 attempts/day (six major calls plus at most two retries), account 10/day and reviewer 3/day remain unchanged.
- Truncated responses are rejected, safe usage/finish metadata is retained, and incomplete beta steps can be resumed. Model health records expose status, model and usage, never response bodies, prompts, hidden reasoning or keys. Login/allowlist checks still protect user-triggered NIM.
- The monitor shows an always-visible collection-state control, last-run setup failures and model health. A public statistical summary remains available separately from cached AI, and an empty corpus is explicitly unknown coverage rather than zero real incidents. Uninitialized data never consumes scheduled NIM calls.

## Acceptance

Run Python tests, Worker/D1 integration, frontend tests/build and browser tests. Live monitoring and both NIM roles must be checked after deployment; passing mocks alone does not establish real source access. If no UCDP token exists in Actions, collection stays setup-required until the owner registers it. Do not label that state operational.

## Live follow-up

The first deployed monitor authenticated successfully and found the registered UCDP token, but stopped at its first unreleased monthly version. The official UCDP documentation currently lists 26.0.9 as latest while the calendar-based discovery probes 26.0.11 first. UCDP can return HTTP 400 for an unavailable monthly version. Discovery now prefers the bounded public official version index and confirms it through the API, falling back to calendar probes if the index is unavailable. Only version discovery treats HTTP 400 like a missing version and proceeds to older months; annual queries and authentication errors remain failures. Other failures retain the HTTP status code without retaining provider bodies or credentials. Reference: https://ucdp.uu.se/apidocs/ (checked 2026-11-10).

The actual NIM response no longer hit its length ceiling (finish `stop`, 1,748 completion tokens), but JSON parsing failed. Known A/B models now request JSON-object output and the parser trims whitespace before processing code fences or an empty reasoning delimiter. It never repairs malformed JSON or adopts hidden reasoning. Safe format flags and HTTP status aid diagnosis. Beta allows six major calls plus two retry attempts, still under the unchanged global 40/day and reviewer 3/day limits. Statistical counts are calculated in D1 without loading full case bodies, and resumed steps update the run's active state before inference.

## Configured model replacement

A second real Nemotron request with JSON-object mode again exhausted 4,096 tokens. When the configured Nemotron analyst's last health failure is specifically malformed/truncated structured output, use the already-configured `meta/llama-3.3-70b-instruct` reviewer model for analysis too. Analyst requests retain key A, reviewer requests retain key B; no key rotation or fallback on authentication/quota/payment errors. Requested model, actual model and fallback reason are saved. Both roles may share a model and their agreement is explicitly not independent verification. Existing global/user/reviewer budgets still apply. Unknown or newly configured models never silently enter this fallback.

UCDP's next attempt reached record processing but failed with a generic processing error. Normalize failures now expose only a stable missing-field/type/validation code; source values and credential-bearing exceptions are not published. A failed record still prevents committing an incomplete snapshot.
