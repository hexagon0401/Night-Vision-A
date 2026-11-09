# Run, deploy and roll back

## Cloudflare Workers static deployment

The public Alpha can also run as Worker static assets. Connect `feat/nv2-alpha-release`, set root directory to `frontend/nv-visualize`, build with `npm ci && npm run build`, and deploy with `npx wrangler deploy --name nightvision --assets ./dist`. Set build variables `NODE_VERSION=22` and `NV_BASE_PATH=/`. Keep preview builds disabled initially. `wrangler.json` explicitly enables the Worker's workers.dev route and disables version preview URLs; it publishes only the built public assets, with no Python API or private export jobs.

The Cloudflare account must have a workers.dev subdomain registered. If it does not, register one in the account's Workers & Pages settings before retrying deployment. The actual URL is shown by Cloudflare after successful deployment; do not assume the account subdomain matches the GitHub username. A Git push triggers the connected build but does not prove that Cloudflare has completed it. Verify build logs and the published URL separately.

## Local development

Use the root README for frozen npm installation and Python dependencies. Production/runtime versions tested in this session are pinned in requirements-runtime.txt; regenerate deliberately with tools/lock_runtime.py. Rebuild artifacts using tools/generate_contracts.py, tools/generate_map_demo.py, tools/build_alpha.py and tools/build_demo_exports.py. All --check paths are offline. Only tools/build_alpha.py --fetch performs an explicit public-source acquisition.

## Containers

From the root on Linux, docker compose up --build serves the static frontend on loopback port 8080 and API on loopback port 8000. Both run as non-root users with read-only filesystem/tmpfs/no-new-privileges settings. Exports default to disabled unless NV_API_TOKEN is injected through a secure runtime secret/environment facility. Never bake that value into an image, frontend build, source file or chat. NV_ALLOWED_HOSTS defaults to localhost/127.0.0.1/testserver; set exact deployment hostnames behind a TLS reverse proxy. CORS is not opened globally. Single API worker is intentional: export jobs are a bounded ephemeral registry, not a distributed queue or durable storage service.

In the managed cloud, builds need the current CA via BuildKit secret: docker build --secret id=build_ca,src=/etc/ssl/certs/ca-certificates.crt -f deploy/Dockerfile.api -t nv2-api:alpha . (same for Dockerfile.web). Compose uses the combined host CA bundle by default (override its public path with NV_BUILD_CA_BUNDLE on other systems); prebuilt nv2-web:alpha/nv2-api:alpha images can run with docker compose up --no-build. TLS verification stays enabled; the CA is not copied into image layers. A runtime collector needing outbound proxy trust requires the platform-supported read-only CA mount and inherited proxy settings; default web/API processes perform no background collection.

Readiness: /healthz checks process/package liveness only. Validate a case with /api/v2/contracts/validate, analysis with /api/v2/analysis, and source-linked scenes with /api/v2/narratives. For private dynamic exports POST /api/v2/exports/foundry with Authorization: Bearer supplied securely, then poll status/download. Limits: 8 MB HTTP bodies, 2048 observations/4096 canonical records for analysis, 120 requests/minute per socket client, 5 export submissions/minute, 16 retained jobs, 2 workers, 5-minute artifact lifetime. Proxy X-Forwarded-For is not blindly trusted. Public production auth/tenant quotas/durable queues need a separate deployment design.

## Static Alpha preview

GitHub Pages can host the compiled public/synthetic demo without API credentials. Build with NV_BASE_PATH=/Night-Vision-A/ npm run build from frontend/nv-visualize. All application/geography/demo/export URLs honor that base path. Publishing uses a separate immutable preview branch, preserving source PR review and main history. Public artifacts contain no raw API token or private job. The original natural-earth and production dependency notices ship with the site.

Rollback by selecting the previous known-good preview branch in repository Settings → Pages, or rebuilding the previous reviewed source commit. Source PRs stay stacked for review; do not confuse preview hosting with merged main or a production live intelligence deployment. For backend rollback, deploy the prior image digest, stop new job submissions and let in-flight bounded jobs finish; expired/pending jobs are not recoverable after restart. Snapshot DB migrations are explicit and separate; never run downgrade against a non-disposable data store without a backup.

## Operational limits

The real Alpha is an archived official seismic catalog example, not an always-on global OSINT service. No provider credentials are needed for it. GDELT/UCDP/FIRMS/RSS manifests remain opt-in with their access/rights requirements. Detector scores are uncalibrated; operational precision/recall, source independence and substantive impact are not certified. Foundry export is local format/lineage validation; upload, Ontology mapping and map rendering require an authorized enrollment. No unlicensed media, CCTV or AGPL WorldMonitor code is imported. Project source licensing remains the owner's decision.

A bounded worker is available at services/worker/run.py (default one cycle, explicit source rights/enabled gates, persistent dedup state and content-addressed results). The included offline replay smoke never starts a network poller. Provide a reviewed live manifest and metric-unit detector configuration before opting into repeat cycles.

After source CI is green and the working tree is clean, tools/publish_preview.py builds the subpath deployment, enforces artifact budgets and pushes only compiled public assets to an immutable pages/nv2-alpha-<source SHA> branch using the existing Git proxy/auth. It refuses an unrelated existing Pages site and never force-pushes/merges main. GitHub Pages setup requires repository Pages administration access; deployment status and URL must be verified after the asynchronous build.
