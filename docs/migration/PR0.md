# refactor: establish NV2 workspace and preserve legacy assets

Move historical extensions, prompt packs, directives and example datasets into explicit versioned/archive locations so executable engine, API and frontend development can proceed independently. All 68 original tracked files are preserved byte-for-byte and recorded in the path/SHA-256 manifest.

Add an installable Python engine boundary, FastAPI health endpoint with schema validation, a separate flat-black TypeScript/Vite shell using supplied branding, package tests, and CI commands. No live collector, map, Trace or exporter is included.

Validation: migration inventory and 7 archive CRC checks; 2 pytest tests; 1 Vitest test; TypeScript and production build; real API/asset HTTP requests; relative-link and whitespace checks. Browser screenshot validation remains incomplete due to headless runtime timeout. See VALIDATION.md for limitations and existing data defects.

Next PR: canonical provenance schemas and synthetic contract fixtures. Project licensing and the first bounded real case remain owner decisions before affected implementation phases.
