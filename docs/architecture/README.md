# NV2 boundaries and roadmap

Phase 0 established package boundaries. PR 1 adds canonical contracts, validation and an optional snapshot store; PR 2 adds bounded adapters and offline replay; no operational intelligence pipeline is claimed.

1. PR 1: canonical objects (Source, Observation, Event, Entity, Relation, Claim, Hypothesis, Anomaly, Narrative, NarrativeStep), UTC/WGS84 provenance validation, synthetic fixtures, schema generation and API/TS contracts. Implemented with content-addressed CaseBundle snapshots and an initial Alembic migration (see ADR 0002).
2. PR 2 (implemented): GDELT/UCDP/FIRMS/RSS adapters, bounded retries/cache/pacing, versioned source policies, persistent dedup and synthetic replay. Live providers remain disabled by default; see ADR 0003.
3. PR 3 (implemented): prior-only median/MAD, two-sided CUSUM, sourced-point clusters and evidence graph, with synthetic false-positive checks. Real historical calibration is outstanding.
4. PR 4 (implemented): offline MapLibre/deck.gl Explore, real Natural Earth basemap, synthetic candidate markers and contextual evidence. Trace is delivered in PR 5.
5. PR 5 (implemented): deterministic source-linked scenes, pause/seek/skip, KO/EN subtitles, camera/arc/evidence synchronization.
6. PR 6 (implemented): detached validated CSV ZIP, lineage/link tables, typed schema, CLI, authenticated bounded jobs and static demo downloads; no Foundry account needed.
7. PR 7 (implemented): archived USGS Taiwan-region Alpha, pinned runtime dependencies, non-root deployment images, operational limits and isolated static preview. Production calibration/live multi-user service remains outside Alpha.

No WorldMonitor code imported. PostgreSQL/PostGIS and optional queue/cache services are deferred until their interfaces are implemented. License, bounded first case and private-data scope remain product decisions. The supplied concept imagery is synthetic and never GIS evidence.
