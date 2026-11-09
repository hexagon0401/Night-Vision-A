# NV development rules

- Use the existing isolated checkout; do not create a worktree unless explicitly requested.
- Read the root README and the approved handoff in docs/design/nv2-handoff/NV2_CODEX_HANDOFF.md. Deliver one phase per reviewable change.
- Preserve historical bytes and packages. Never treat legacy CSVs as verified intelligence. Run tools/verify_migration.py after migration-related changes.
- Keep engine, API, worker, frontend and Foundry adapter bounded. Engine must not import the frontend or API.
- No fabricated sources, coordinates, tracks, H3 cells or confidence. Preserve observed/documented/reported/inferred/scenario/disputed/unverified states.
- For subsequent UI work use the flat-black design and supplied four-lens PNG: no gradients, neon, glow, terrain textures or automatic permanent drawers. No screenshot pixels as GIS data.
- No live collection, alerts, deployment or AGPL code import in Phase 0. Review licensing before importing third-party code.
- Checks: python -m pytest engine/tests services/api/tests; frontend: npm ci, npm test, npm run build; python3 tools/verify_migration.py. Keep credentials out of files and logs.
