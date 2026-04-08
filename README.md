# Night Vision — Global Intelligence Extraction & Visualization System

> OSINT-based geopolitical intelligence extraction, fusion, and visualization pipeline  
> designed for Palantir Foundry AIP integration.

---

## 1. Overview

Night Vision is an automated intelligence pipeline that extracts, validates, and structures geopolitically significant data from open sources, then routes it for visualization in Palantir Foundry's Ontology, Map, and Workshop layers.

The system covers military posture, conflict events, energy infrastructure, sanctions networks, arms transfers, and satellite assets across global theaters.

**Core Design Principles**
- **Anti-hallucination**: Every data point must be traceable to a `source_id`. Unverifiable coordinates are flagged `pending_verification` — never fabricated.
- **Source tiering**: Official government/UN documents (A) → Major think tanks (B) → OSINT web sources (W)
- **Full domain coverage**: 11 intelligence domains from military assets to global conflict monitoring

**Intelligence Domains**

| Domain | Coverage |
|--------|----------|
| D1–D2 | Strategy & Policy, Military Assets & OOB |
| D3–D4 | Military Facilities & Basing, Arms Transfers |
| D5–D6 | Conflict Events, Sanctions & Criminal Networks |
| D7–D8 | Satellite & Space Assets, Energy Infrastructure |
| D9–D11 | Public Opinion & Economics, US Posture, Global Conflict Monitor |
| D0 | OSINT Fallback — any unregistered topic |

---

## 2. Night Vision

The core pipeline from source routing to Foundry CSV ingestion.

```
OSINT Sources
    ↓
Navigator        ← Source tier selection + OSINT fallback protocol
    ↓
Master Directive ← CASE A–K classification + OODA loop execution
    ↓
Relation         ← Domain CSV schemas (D0–D11)
    ↓
TO_Foundry       ← Parser config · Ontology mapping · Map layer routing
    ↓
Palantir Foundry ← Ontology → Map → Workshop
```

**TO_Foundry Version History**

| Version | Key Changes |
|---------|-------------|
| v4 / v4.5 | Full Foundry Map coverage (28 sub-pages), layer decision tree |
| v5.0 | Geopoint string format, initial Track modeling |
| **v6.0** (current) | GeoJSON escaping fix, H3 dual-index, geotemporal Track architecture, CRS normalization |

**v6.0 Technical Standards**
- GeoJSON fields: internal quotes doubled (`""`), entire string wrapped in outer quotes
- H3: dual-column mandatory — `h3_cell_id` (render) + `h3_geojson` as `geoshape` (spatial search index)
- Track data: discrete rows per `object_id` + timestamp — never pre-merged into LineString
- Parser: `MULTILINE_CSV_PARSER` for all geospatial datasets
- Coordinate system: WGS 84 (EPSG:4326) input; Web Mercator (EPSG:3857) rendering

---

## 3. NV_Alpha (Finetuned)

Claude-based intelligence assistant that drives the Night Vision pipeline.  
Composed of a global base (V1) and a China-specific patch (V2).

**V1 — Global Intelligence Assistant**

Loads in order: MasterPrompt → Navigator → Connector. Handles all regions and domains.

- **Navigator**: Source tier prioritization and automatic OSINT fallback trigger
- **Connector**: Four-stage pipeline — Data Fusion → Inference → Prediction → Visualization
  - *Inference*: Capability-intent gap analysis, conflict escalation indicators, sanctions evasion network detection, strategic posture shift detection
  - *Prediction*: Three-tier probability output — LIKELY / POSSIBLE / SPECULATIVE (specific date prediction prohibited)

**V2 — China Finetuned Patch**

Layered on top of V1. Adds PRC-specific sources and inference templates.

| Template | Coverage |
|----------|----------|
| CI-01 | PRC Five-Year Plan trajectory analysis |
| CI-02 | PLA purge → combat readiness degradation model |
| CI-03 | ECS/SCS salami tactics escalation score |
| CI-04 | Korea-China economic leverage index |
| CI-05 | PRC proxy/TOC state ambiguity assessment |
| CI-06 | BRI debt → political leverage pathway model |

Extended source registry: Korean perspective (K01–K05), PRC government originals (CG01–CG09), think tank extensions (CT01–CT05), statistical extensions (QC01–QC03).
