# PR 5 — Deterministic evidence Trace

Generate five source-linked scenes per detector candidate: observation, deviation, source/family context, registered counterevidence (or an explicit gap), and unknown-confidence synthesis. Preserve real observation camera points and never invent sources, corroboration, physical tracks or predictions. Generated co-occurrence relations are inferred. Case output passes the canonical validator and repeated generation is idempotent.

Add a standalone animation-clock player, camera stopping, deterministic previous/next, skip-to-complete, language switching and evidence references. Trace only opens after user action; Explore remains uncluttered. Pause freezes both reveal and camera; reduced motion shows static relations and disables camera transitions. Curved paths are screen-space conceptual relationships, with shortest antimeridian wrap and status-specific styles, never fabricated movement tracks. Trace exits to the same case/candidate.

Validation includes backend invariants, a fake-clock player test, the existing regression suites and real browser playback/pause/seek/language/evidence/Explore interaction. No LLM or independent factual verification is implied. Source-backed narratives remain constrained by available claims and counterevidence. No exports or deployment are added by this phase.
