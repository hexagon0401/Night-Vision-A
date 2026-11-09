# NV2 boundaries and roadmap

Phase 0 establishes package boundaries, not an operational intelligence pipeline.

1. PR 1: canonical objects (Source, Observation, Event, Entity, Relation, Claim, Hypothesis, Anomaly, Narrative, NarrativeStep), UTC/WGS84 provenance validation, synthetic fixtures, schema generation and API/TS contracts. Storage and migration strategy follows these contracts.
2. PR 2: bounded provider adapters with retries, cache, licensing metadata and offline fixtures.
3. PR 3: baselines/change-point detection and evidence graph, with false-positive checks.
4. PR 4: MapLibre + deck.gl map-first interface and contextual evidence.
5. PR 5: deterministic Trace, subtitles and camera/evidence synchronization.
6. PR 6: detached Foundry CSV ZIP adapter, validation, lineage and import guide; no account needed.
7. PR 7: source-backed Alpha case, deployment and operations review.

No WorldMonitor code imported. PostgreSQL/PostGIS and optional queue/cache services are deferred until their interfaces are implemented. License, bounded first case and private-data scope remain product decisions. The supplied concept imagery is synthetic and never GIS evidence.
