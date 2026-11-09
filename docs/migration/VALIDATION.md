# Phase 0 validation — 2026-11-09 Asia/Seoul

- Base main verified against origin: 19e6b81a4ce228f3ce9318ef60e668781981b274. Started with clean working tree; branch refactor/nv2-foundation.
- All 68 legacy tracked files accounted for; original Git blob hashes match migrated bytes. All 7 historical ZIP/.skill archives pass CRC validation.
- Python editable package installation and pip check passed. Installed nv-engine CLI reports 2.0.0.
- pytest: 2 tests passed (installed package/CLI and API health JSON Schema contract). One upstream Starlette TestClient/httpx deprecation warning remains.
- npm ci passed using a project-local cache configured in .npmrc (default home cache was not writable).
- Vitest: 1 frontend shell test passed. TypeScript check and Vite production build passed.
- API started using documented uvicorn command; real HTTP /healthz returned status ok, phase foundation, engine_version 2.0.0. OpenAPI exposes only /healthz.
- Vite dev server started using documented command; served logo bytes match supplied PNG exactly.
- New and historical relative Markdown links: 18 checked, none broken.
- Authored-code whitespace check passed. Byte-preserved archived README and supplied handoff retain their original Markdown hard-break spaces; they are excluded from that check. GitHub Actions jobs were added; hosted CI has not run.
- Headless Chromium screenshot attempts did not complete in this sandbox (D-Bus/read-only cache errors in logs; second attempt used a separate profile, local-only connection and a 25-second timeout). No browser visual-pass claim is made. DOM rendering is covered by Vitest/jsdom; desktop/mobile visual review remains outstanding.

These checks demonstrate the foundation only. No map rendering, ingestion, detector, Trace, Foundry exporter, authorized Foundry import, live research or deployment has been tested or implemented. Historical data defects remain unchanged. No commits, remote PR, tag or deployment were created by this phase.
