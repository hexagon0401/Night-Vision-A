# ADR 0001 — Bounded Phase 0

Keep one repository and one active engine/ source tree with semantic version 2.0.0. Use Python package + separate FastAPI transport and a TypeScript/Vite frontend shell. MapLibre/deck.gl dependencies arrive with the real map in PR 4. Preserve all 68 existing tracked files (including .DS_Store) rather than deleting metadata without a reviewed diff. Do not select an open-source license on the owner’s behalf. No upstream AGPL code imported.
