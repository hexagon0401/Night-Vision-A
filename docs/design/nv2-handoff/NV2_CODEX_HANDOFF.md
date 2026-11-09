# Night Vision 2.0 — Codex Implementation Handoff

**Status:** architecture / UX specification; no repository mutations authorized or performed in this planning pass  
**Date:** 2026-11-09 (Asia/Seoul)  
**Repository:** https://github.com/hexagon0401/Night-Vision-A  
**Audited base commit:** `19e6b81a4ce228f3ce9318ef60e668781981b274` (`main`)  
**Reference:** https://github.com/koala73/worldmonitor (AGPL-3.0-only)

## 한국어 요약

- **기존 확장판 보존:** Claude V1–V3과 NV Alpha 글로벌/중국 특화 프롬프트를 `extensions/`에 버전별로 정리한다.
- **NV Engine 2.0 신설:** 기존 Markdown 분석 지침을 실제 실행 가능한 Python 수집·탐지·검증·내러티브 엔진으로 구현한다.
- **프론트 완전 분리:** `frontend/nv-visualize/`에서 MapLibre + deck.gl로 전체 화면 지도 중심 UI를 개발한다.
- **선택형 정보 UI:** 평소에는 지도만 크게 보여주고, 사건을 선택할 때만 요약 팝업·증거 창이 나타난다. 사이드바는 사용자가 고정할 수 있다.
- **최종 승인 방향 — Flat Black:** 순수한 검정 배경, 흰색의 가느다란 지도 윤곽선, 최소한의 회색 보조정보, Apple형 pill 버튼, 단색 도형을 사용한다. **그라데이션·네온·발광·복잡한 지형 음영·쨍한 강조색은 금지**한다.
- **자막형 Trace:** 첨부 이미지처럼 지도에 국기·관계선이 단계적으로 나타나고 하단 자막이 사건을 설명한다.
- **NV 아이콘:** 4구 야시경이 장착된 FAST 헬멧의 단순하고 둥근 마스코트. `assets/night-vision-logo.png`는 투명 배경 PNG이며, 앱 아이콘·파비콘·웹 헤더에 공통 사용한다.
- **Foundry 내보내기:** 출처·좌표·시간·관계·검증 상태를 보존한 CSV 묶음과 스키마/검증 보고서를 ZIP으로 내보낸다.
- **안전한 Git 재편:** `git mv`로 이동하고 해시·파일 수를 검사한다. 기존 ZIP, CSV, 연구 자료를 임의 삭제하지 않는다.
- **개발 우선순위:** 먼저 폴더 재정리와 프로젝트 골격을 작은 PR로 완료한 후, 백엔드 → 지도 → Trace → Foundry exporter 순서로 구현한다.

## 0. Codex executive instruction

Build **Night Vision 2.0**, a map-first, source-traceable geopolitical anomaly intelligence web application. Preserve all current extension, prompt and Foundry historical versions by moving them to organized folders. Introduce a **real executable NV Engine 2.0** as a Python package, and a **separately bounded NV Visualize** frontend. Add an independent Foundry export adapter that produces validated, provenance-preserving CSV bundles without requiring a Foundry account.

**Do not merely restyle the old UI.** The primary feature is a narrative trace: an anomaly is detected, connected to related observed data, verified or disputed by sources, and replayed as progressively drawn map relations with focused subtitles. **Map first, evidence on demand.** The three PNGs in `assets/` are design targets—not true geography, real events, or datasets. Do not use generated map pixels as GIS data.

The first Codex implementation task is **Phase 0 repository migration + minimal workspace scaffolding**, executed on a new branch after inspection. Do not jump directly into a huge full-stack rewrite; deliver reviewable PRs.

## 1. Verified repository findings / limitations

The existing repository is primarily Markdown directives, Claude extension/skill packages, Foundry mapping guidance and CSV case files. The reviewed main tree contained 95 entries and did not show a running collector, executable anomaly engine, frontend app or automated tests. The README calls the pipeline “automated”; this is a design intention, **not proof of currently running automation**.

Confirmed groups:

1. `Night Vision for Claude/V1`, `V2`, `V3`: Claude skill / extension history.
2. `NV_Alpha(Finetuned)/V1` and `V2_CHN_Finetuned`: global and China-specific prompt packs.
3. `Night Vision/V1` through `V6`: prior instruction and Foundry specification versions.
4. `Night Vision/Result/EPIC FURY PACKAGE(4.5)`: historical case CSVs/ZIP.
5. `TMP/`: experiments, older sample CSVs, RTF, PDF.
6. `00_Palantir_Foundry_Upload_Guide.md`, `README.md`.

Do not represent historical example datasets as verified intelligence. Treat every legacy CSV as unverified fixture until individual source provenance is audited. The reviewed tree has no clearly present `LICENSE` file, so choose a license explicitly before publishing imported third-party code.

## 2. Product definition and scope

**Product name:** Night Vision 2.0  
**Backend:** NV Engine  
**Frontend:** NV Visualize  
**Interoperability:** NV Bridge / Foundry CSV Exporter  
**Historical interfaces:** NV Extensions (versioned archive; old packages remain available)

Three core questions:

- **Detect:** What changed unusually against a legitimate baseline?
- **Connect:** Which observations, actors, events and locations are related, and by what evidence?
- **Explain:** What is observed, reported, inferred, disputed or unknown? Which alternatives remain?

### MVP invariant

One real, reproducible case must work end to end:

`upstream source → collector → normalized observation → detector → evidence graph → narrative scenes → map playback → Foundry-compatible CSV export`.

Start with publicly accessible GDELT, UCDP, NASA FIRMS and official-document/RSS feeds. AIS, aviation, CCTV and advanced multimodal matching are follow-on connectors subject to licensing, coverage and quality review. Do not build a “100% live global map” claim in Alpha.

## 3. Proposed repository organization

The user's priority is to **folderize current extensions and isolate engine and frontend** while retaining a single source repository for now.

```text
Night-Vision-A/
├── README.md                         # New bilingual product overview
├── AGENTS.md                         # Codex safety + build/test rules
├── .gitignore
├── .github/workflows/                # CI for engine/web/export
├── extensions/
│   ├── claude/
│   │   ├── v1/                      # existing Claude V1 intact
│   │   ├── v2/                      # existing Claude V2 intact
│   │   └── v3/                      # existing Claude V3 intact
│   └── promptpacks/
│       ├── global-v1/
│       └── china-v2/
├── engine/
│   ├── pyproject.toml                 # package version = 2.0.0
│   ├── src/nv_engine/
│   │   ├── models/                   # canonical observation/event/entity schemas
│   │   ├── sources/                  # source registry and provider adapters
│   │   ├── collect/                  # retries, concurrency, rate limits, caching
│   │   ├── normalize/                # geotime, identifiers, dedupe
│   │   ├── detect/                   # statistical / spatial / graph anomalies
│   │   ├── correlate/                # candidate links and source independence
│   │   ├── evaluate/                 # evidence grading, L0-L4, counterevidence
│   │   ├── narrative/                # replay scene generation
│   │   └── export/
│   │       └── foundry/             # CSV/manifest/validation
│   └── tests/
├── frontend/
│   └── nv-visualize/
│       ├── package.json
│       ├── public/
│       │   └── branding/            # logo PNG / favicon / app icons, licensed project-owned assets
│       ├── src/
│       │   ├── app/
│       │   ├── map/                  # MapLibre+deck.gl, geo overlays
│       │   ├── trace/                # narrative player / subtitles
│       │   ├── overlays/             # contextual popups / optional drawer
│       │   ├── cases/
│       │   ├── evidence/
│       │   └── styles/
│       └── tests/
├── services/
│   ├── api/                          # FastAPI transport, auth, export endpoints
│   └── worker/                       # scheduled ingestion / queues
├── schemas/                          # JSON Schema/OpenAPI contracts; generated TS types
├── configs/sources/                  # provider manifests with rights, TTL and limits
├── data/
│   ├── fixtures/                     # synthetic tests
│   └── legacy-cases/                 # old CSV cases, explicitly unverified
├── docs/
│   ├── architecture/
│   ├── migration/
│   ├── design/
│   ├── foundry/
│   └── decisions/                    # ADRs
└── archive/
    ├── directives/v1..v6/
    ├── foundry-guides/
    ├── packages/                     # old archives / .skill / ZIP
    └── miscellaneous/                # pending manual classification
```

**Versioning decision:** Keep version-specific historical extensions in folders, but maintain the **new engine in one actively developed `engine/` directory** with package semantic version and Git tags. Avoid `engine/v2/`, `engine/v3/` source forks that later drift. Frontend and API are distinct bounded packages, not children of the extension. The monorepo can split into independent repos in the future only if release/deployment lifecycles justify it.

## 4. Exact legacy-to-new path migration map

| Current path | Proposed destination | Handling |
|---|---|---|
| `Night Vision for Claude/V1/**` | `extensions/claude/v1/**` | `git mv`, preserve contents |
| `Night Vision for Claude/V2/**` | `extensions/claude/v2/**` | `git mv`, preserve contents |
| `Night Vision for Claude/V3/**` | `extensions/claude/v3/**` | `git mv`, preserve contents |
| `NV_Alpha(Finetuned)/V1/**` | `extensions/promptpacks/global-v1/**` | preserve as prompt pack |
| `NV_Alpha(Finetuned)/V2_CHN_Finetuned/**` | `extensions/promptpacks/china-v2/**` | preserve China patch |
| `Night Vision/V1/**` ... `V6/**` | `archive/directives/v1/**` ... `v6/**` | preserve version-by-version |
| `Night Vision/Result/**` | `data/legacy-cases/**` | keep provenance status unverified |
| `TMP/V1/**`, `TMP/v0_test/**` | `data/fixtures/legacy/**` | manual classification before reuse |
| `TMP/Source.txt.rtf`, unrelated PDF | `archive/miscellaneous/**` | preserve; do not silently delete |
| `00_Palantir_Foundry_Upload_Guide.md` | `docs/foundry/legacy-upload-guide.md` | preserve and link from new guide |
| `.DS_Store` | not needed in repository | add ignore; remove from index only after reviewed diff |
| old duplicate ZIP/.skill | `archive/packages/**` or within version folder | preserve until checksum/parity verified |

### Migration execution sequence for Codex

1. Read current `README.md`, file tree, relevant directives and Git status; verify owner permissions.
2. Create new branch `refactor/nv2-foundation` from current `main`. Record exact base SHA. An optional `legacy-pre-nv2` tag is useful **only if user approves creating the tag**.
3. Generate a path manifest (`old_path,new_path,sha256,status`) **before changing files**. Produce a migration checklist in `docs/migration/MIGRATION_MAP.md`.
4. Use `git mv` for tracked files. Preserve original bytes. Avoid unzip/repack or dedupe in the first move PR.
5. Add `.gitignore` for `.DS_Store`, Python and web build artifacts; clean only reviewed tracked junk, never arbitrary folder deletion.
6. Add new root `README.md` (product/engine/frontend/archive links), but preserve the old README under `archive/README-pre-v2.md`.
7. Fix broken relative Markdown links and references; add extension compatibility entrypoints or documented import paths if old consumers rely on specific folder names.
8. Verify counts, checksums, archives, `git diff --summary`, `git status`, and link-check. Do not drop files whose new category is uncertain.
9. First PR should **only organize legacy + scaffold packages**. Implement engine logic in later PRs.
10. Do not force-push, delete history, remove old releases or publish a deployment during reorganization.

### First PR acceptance conditions

- 100% of pre-existing files accounted for in the migration manifest (explicitly mark any intentional index-only removals).
- All three Claude extension versions and both prompt packs remain accessible.
- All historical Foundry V6 instructions remain available.
- Old CSVs and ZIPs remain intact.
- Engine, frontend, API and schemas folders have buildable minimal scaffolds.
- Git diff shows no unrelated edits.

## 5. Engine 2.0 architecture and interface

```text
Provider APIs/RSS/Files
    ↓
Bounded parallel collectors (per-source quotas, ETag, Last-Modified)
    ↓
Raw immutable snapshot + provenance
    ↓
Normalize + entity resolution + deduplication
    ↓
Baseline / anomaly detectors
    ↓
Candidate correlation graph
    ↓
Evidence gate + disconfirming evidence search
    ↓
L0–L4 reasoner (selective LLM, not per-feed)
    ↓
Narrative scene plan + published case API
    ↓                        ↓
NV Visualize              Foundry Export Adapter
```

**Canonical domain objects:** `Source`, `Observation`, `Event`, `Entity`, `Relation`, `Claim`, `Hypothesis`, `Anomaly`, `Narrative`, `NarrativeStep`.

**Required common provenance:** stable ID, upstream URL, original publisher/organization, source family, original publish time, observation/event time, acquisition time, content hash, license/access metadata, extraction method, independent corroboration references, geometry source and accuracy if any.

All timestamps UTC ISO 8601; coordinates WGS84 with longitude/latitude fields; unknown coordinates `null`, never fabricated. An observation date and article publication date must remain separate. An actor's home-country centroid is only a symbolic map anchor and must not be treated as an asset location.

**Evidence status enums:** `observed`, `documented`, `reported`, `inferred`, `scenario`, `disputed`, `unverified`. Distinguish source quality, evidence confidence, anomaly severity and substantive real-world impact. They are not interchangeable.

**Detection MVP:**

1. Robust per-series baseline (median/MAD, seasonality; exclude bad records).
2. CUSUM/change-point detector for regime shifts.
3. Spatial clustering within sourced geometry / geotemporal windows.
4. Next phase: graph new-edge/motif anomalies, cross-source divergence, claim contradiction and multimodal matching.

Calibrate thresholds on held-out historical samples, not from intuition. Track false positives, precision@K, detection latency, source coverage, reproducibility and LLM tokens per published case. Show qualitative confidence until properly calibrated probabilities exist.

**Search cost policy:** structured provider API/RSS before general search; cheap rules and NER before LLM; use targeted search when a candidate survives baseline filters; deduplicate syndicated articles by original publisher family; cache keyed by content/model/prompt versions; define per-case token budget; LLM only on high-value ambiguous candidates. A government source is primary evidence of what that government **stated**, not automatic independent proof its claim is true.

**WorldMonitor integration:** Reimplement the relevant architectural patterns from `correlation-engine`, `dedup.mjs`, `cross-source-signals`, `entity-extraction`, `DeckGLMap`. Directly copying AGPL-3.0-only code into NV requires explicit licensing review; do not wholesale fork the 10k-file project or assume the upstream data provider API has redistribution rights.

## 6. Frontend: map-first Flat Black Trace (2026-11-09 revised approval)

### Reference visuals

- `assets/01-cinematic-overview.png` — **A: Explore / Default.** ~92–95% flat-black map, hairline white coastlines, two circular actors, one thin relation arc, bottom compact status bar. **No persistent subtitle in Explore.**
- `assets/02-contextual-evidence.png` — **B: Evidence On Demand.** ~85–90% map. One small source/evidence card opens near a clicked node. No fixed side panel, no blur-glass treatment.
- `assets/03-narrative-trace.png` — **C: Trace / Playback.** Minimal white map relations, two or more stepwise paths, black subtitle dock and tiny transport controls only while playback runs.
- `assets/night-vision-logo.png` — **Brand app icon.** Transparent PNG of a rounded FAST helmet with **four distinct NVG lenses**. Use at 512px and 1024px app-icon sizes; generate favicon sizes separately from the master image, not from the UI screenshot.
- `assets/night-vision-app-icon-512.png`, `assets/night-vision-app-icon-192.png` — resized PNG app icon deliverables. `NV2_DESIGN_PREVIEW.html` provides a local three-state gallery (open next to `assets/`).

These images are conceptual graphics, not geographic or historical evidence. Generated labels/positioning must be implemented from real map tiles and verified geometry, not traced blindly. Treat mockups as **interaction/style direction**, not as pixel-perfect maps or factual relationships.

### Product UI layout (final recommendation)

**Primary mode: Map / Explore**

- Full-bleed **uniform solid black** vector map (MapLibre GL JS). Coastlines and international borders are precise warm-white hairlines; keep land and sea visually near-black without relief, raster terrain, texture, or a blue tint. Administrative subdivisions and roads are off by default.
- Top overlay: small NV four-tube helmet icon + wordmark at left; minimal Search, Explore/Trace, Sources, Layers and case picker as small **pill/capsule controls**. Approx 48–56px high, not a solid full-width heavyweight navbar.
- Default map contains only ranked anomaly markers/clusters, not every feed or all headlines.
- Bottom **single-line opaque matte-black status bar** (approx 40–48px), 1px upper border; compact connection/freshness, source count, case ID, mode and small legend toggle. Do not make it a second dashboard.
- Click anomaly: contextual summary card appears **near the event**; click `Trace` to enter narrative mode.
- Optional pin action converts the small flat, bordered evidence popover into a **user-controlled drawer** (approx 300–360px), collapsible at any time. Drawers cannot open automatically in Explore.
- `Sources`, `Layers`, `Timeline`, `Expert` each opens on demand. Never expand multiple competing panels automatically.

**Narrative mode: Trace / Play**

- Map zooms/pans to one focal entity or bounds of a relation; camera follows `NarrativeStep`.
- Flag-circle actor nodes with **thin white or gray rings** and short labels; no glow and no animated halo. Company imagery subject to rights review.
- Observed/documented relation = **solid warm-white line**; inferred = **dashed middle-gray line**; scenario = **dotted light-gray line**; disputed = **short cross-marker and textual CONTESTED tag**. Never depend on a neon palette; provide an explicit line-style legend and text/accessible annotations.
- Bottom **opaque solid-black**, center-aligned **subtitle capsule** appears **only during Trace** and contains 1–2 lines of narration (KO/EN). Below it: minimal 4–7 step timeline, play/pause, previous/next and accessible `Skip animation`; collapse on pause or exit if requested. Never overlay a large permanent subtitle during free browsing.
- Hover/tap node/line opens provenance and source card; user may pin evidence into optional drawer.
- When `Source` is unavailable, show DATA GAP; when a CCTV stream is unavailable or unlicensed, do not fake footage.
- User must be able to switch Trace → Explore without losing current case.

**Visual tokens — required flat system (do not replace with previous cyan/amber/blue theme):**

| Token | Value |
|---|---|
| Page/ocean/background | `#050505` (solid) |
| Land | `#080808` (solid; avoid visible terrain fill) |
| Coastlines / country borders | `#C9C9C9`, 0.6–1.1px at default zoom |
| Primary text | `#F2F2F0` |
| Muted text | `#929292` |
| Hairline dividers | `#343434` |
| Observed/documented line | `#ECECE8` (solid, 1.25–1.75px) |
| Inferred line | `#A7A7A7` (dashed 5/4) |
| Scenario line | `#797979` (dotted 1/5) |
| Disputed line | `#C1C1C1` + short cross-mark + CONTESTED label |
| Microaccent (optional) | `#A2B4A4` sage, **one tiny status dot only**; never for major route lines |
| Panel, popup and dock | solid `#101010`, **no translucency, blur, gradients** |
| Font | Geist Sans + Geist Mono, fallback Inter/system |
| Navbar buttons | solid `#171717`, 1px `#555555` outline, `border-radius: 9999px`, h=30–36px |
| Popover | `#101010`, 1px `#3B3B3B`, 12–16px radius, max-width 340px |
| Status bar | flat `#080808`, 1px top border `#303030`, 40–48px h |
| Map occupancy | target 90–95% default Explore; 85–90% with evidence popup |

**No-gradient implementation rule:** no CSS `linear-gradient`, `radial-gradient`, background-images used for color shading, SVG filters for glow, box-shadow halos, frosted glass, glint animations, semi-transparent blue map tiles, bright cyan/amber/red routing. Opacity solely for subdued secondary strokes is acceptable. Buttons are rounded **pills**; popup corners can be more modestly rounded. White linework must remain visually quiet, with thinner strokes at lower zoom.

### NV logo/app-icon integration

Use `assets/night-vision-logo.png` (master transparent PNG) as the current logo source. The subject is a high-cut **FAST helmet with one mounted 4-tube NVG cluster**, four clearly separated circular lens windows, rounded mascot silhouette, black/off-white/muted-sage restricted palette, no gradients. The app should derive `apple-touch-icon.png`, PWA 192/512px masks and favicon variants via image resizing/build step, preserving transparency and comfortable safe area. Ensure icon remains recognisable at 32px. The brand name `NIGHT VISION` is rendered in the frontend font, not baked into the icon. Store source and generated sizes in `frontend/nv-visualize/public/branding/` with an asset provenance note. If later replaced by vector artwork, do not alter the four-lens silhouette without design approval.

### Trace scene algorithm

```python
def build_narrative(anomaly, graph, evidence):
    # Pseudocode; only evidenced edges become observed claims
    anchor = select_main_event(anomaly, graph)
    candidates = retrieve_relevant_edges(anchor, time_window=anomaly.window)
    candidates = classify_by_evidence_status(candidates, evidence)
    scenes = order_as_explanation(
        ["observation", "deviation", "corroboration",
         "relationship", "alternatives", "synthesis"],
        candidates
    )
    return attach_source_ids_and_camera_targets(scenes)
```

Scene types: `focus_location`, `show_entity`, `draw_relation`, `show_evidence`, `compare_hypotheses`, `show_counterevidence`, `summarize`.

Each scene contains `step_id`, `duration_ms`, `camera_target` (verified bbox or symbolic anchor), `visible_nodes`, `visible_edges`, `subtitle_ko`, `subtitle_en`, `evidence_ids`, `status`, `reduced_motion_fallback`.

For a **conceptual relationship arc** between projected screen positions `P0`, `P1`, compute a quadratic Bezier `B(t)=(1−t)^2P0+2(1−t)tC+t^2P1`; let `C` be the midpoint displaced along the screen-space normal by a clamped distance. Recompute on zoom, handle antimeridian/world-wrap, avoid overlapping labels, reveal via line-length animation. **Do not** use this decorative Bezier as a physical movement track. Real AIS/ADS-B paths use timestamped sourced track samples only; do not interpolate through data gaps as established fact.

Camera: `fitBounds` for two geographic nodes or a verified polygon; smooth 650–1000ms transitions, optional 150ms evidence-card delay, reduce animation on `prefers-reduced-motion`. Pause must stop both subtitle and map animation. Sources overlay is always dismissed by Escape and has keyboard navigation.

### Frontend acceptance tests

- Open page: map dominates; no fixed dashboard clutter.
- Click anomaly: one relevant summary and no unrelated data.
- Start Trace: camera, arc, subtitle, source link change synchronously; moving backward is deterministic.
- Evidence toggling/pinning works; map resizing remains correct.
- Arc styling cannot accidentally render an inferred edge as confirmed.
- Mobile: bottom subtitle remains legible and controls do not obscure the map.
- Offline demo works with obvious `SYNTHETIC DATA` banner.

## 7. Foundry Bridge / enhanced CSV export

The user's previous `TO_Foundry_v6.0.md` is historical guidance, **not a substitute for validation against current official Palantir documentation**. The new exporter must be a **detached module** using canonical NV objects, not require Foundry credentials, and never make the frontend store secrets.

### UI / API

- Case view action: `Export → Foundry CSV Bundle` plus `GeoJSON` and `Raw CSV`.
- Choose case scope, time range, include inferred/scenario records (default OFF), source metadata level, coordinate precision.
- `POST /api/v2/exports/foundry` queues export; `GET /api/v2/exports/{id}` status; `GET /api/v2/exports/{id}/download` returns ZIP. Apply authorization/rate limits and short-lived download retention.
- No direct Foundry upload in MVP. Optional connection later, with explicit user credentials/authorization and platform permissions.

### Recommended bundle contents

```text
NV2_case_<id>_foundry.zip
├── entities.csv
├── events.csv
├── observations.csv
├── relations.csv
├── claims.csv
├── sources.csv
├── hypotheses.csv
├── tracks.csv
├── manifest.json
├── schema.json
├── validation_report.json
├── lineage.csv
└── IMPORT_GUIDE.md
```

**CSV header examples (exact English, versioned schema):**

- `entities.csv`: `entity_id,entity_type,name,iso_country,latitude,longitude,geopoint,geometry_source_id,verification_status`
- `events.csv`: `event_id,event_type,event_time_utc,latitude,longitude,source_id,evidence_status,description`
- `observations.csv`: `observation_id,object_id,observed_at_utc,metric,value,unit,source_id,source_record_id`
- `relations.csv`: `relation_id,source_entity_id,target_entity_id,relation_type,evidence_status,valid_from_utc,valid_to_utc,claim_id`
- `claims.csv`: `claim_id,statement,status,assessment,analyst_notes`
- `sources.csv`: `source_id,publisher,publisher_family,url,published_at_utc,retrieved_at_utc,license,content_hash`
- `hypotheses.csv`: `hypothesis_id,case_id,description,status,alternative_to,disconfirming_evidence_ids`
- `tracks.csv`: `object_id,observed_at_utc,latitude,longitude,source_id,location_accuracy_m`
- `lineage.csv`: `record_type,record_id,source_id,claim_id,evidence_span_hash,transform_version`

Represent many-to-many claim/source evidence associations in a separate `claim_evidence.csv` if the relational schema requires lossless mappings. Do **not** store a comma-joined list of IDs that will be mistaken for a scalar link property; if such a table is added, update the manifest and schema version.

### Foundry compatibility adapter

1. **CSV serialization:** RFC4180-compatible quoting/escaping via a CSV library, UTF-8, no unescaped newlines. Test round-trip parsing of commas, double-quotes, Korean text and line breaks.
2. **Geometry:** source-backed WGS84; geopoint/geoshape fields only in the specific official Foundry-expected string form; no invented coordinates. Store raw `latitude`/`longitude` too.
3. **Track:** preserve individual `object_id + observed_at_utc` records; sort by time and flag duplicates/conflicts. Never create fictional route vertices.
4. **H3:** generate real H3 IDs and matching geometry only if H3 calculations are implemented and validated; otherwise omit optional H3 fields. Do not fake cells.
5. **Ontology mapping:** `Entity`, `Event`, `Observation`, `Source`, `Claim` object types; relation link types; event time and geospatial properties typed explicitly. Export `IMPORT_GUIDE.md` mapping table and requirements.
6. **Validation:** required IDs, primary-key uniqueness, foreign-key resolution, parsable timestamps, finite numeric values, coordinate ranges, mutually exclusive statuses, source lineage, valid JSON/GeoJSON, missing locations, license flags, and duplicate track timestamps.
7. **Audit:** include source availability status, export timestamp, engine/adapter version, schema version, record counts, SHA-256 per file, skipped records and reasons. If validation fails, block “Foundry-ready” label but allow diagnostic bundle.
8. **Security:** make binary/video attachments opt-in and rights-audited; CSV contains evidence references and URLs, not unauthorized media.

**Important:** “Foundry-compatible CSV” means validated data files with an import/mapping guide. It does **not** mean successful upload, Ontology creation or map rendering until tested in an authorized Foundry enrollment.

Official sources checked:

- CSV parser: https://www.palantir.com/docs/foundry/dataset-preview/csv-parsing
- Geopoint/geoshape: https://www.palantir.com/docs/foundry/geospatial/ontology
- Map ontology & tracks: https://www.palantir.com/docs/foundry/map/integrate-objects
- Geospatial time series: https://www.palantir.com/docs/foundry/time-series/geospatial-time-series-use-case-map
- Manual upload: https://www.palantir.com/docs/foundry/compass/manually-upload-data

## 8. Deployment / licensing / operational policy

- **Frontend:** Vercel (or GitHub Pages for static-only preview).
- **Engine:** separately running Python worker process/container. Do not run permanent pollers inside GitHub Pages; Vercel Functions have execution constraints and are better for bounded requests/schedules.
- **API:** FastAPI exposing stable versioned endpoints; serve static public cases and authenticated exports separately.
- **Storage:** PostgreSQL + PostGIS for structured geospatial/event data; content-addressed object files for raw snapshots; Redis optional only when real workload justifies it.
- **Map:** MapLibre GL JS + deck.gl overlays; OpenFreeMap for initial tiles, PMTiles self-host later. Honor map attribution and provider terms.
- **Licensing:** WorldMonitor's AGPL-3.0-only code should be examined before any direct copying or derivative bundling; source datasets (news, CCTV, AIS) have independent reuse terms.
- **Legal/OSINT:** Use only authorized feeds and streams, store minimal personal data, honor rate limits/robots/applicable terms, never bypass access controls.
- **Scientific trust:** Preserve facts, reports, inference and scenario as separately queryable states. Source counts alone must never automatically become high confidence. Test against disconfirming evidence.

## 9. Delivery plan for Codex (ordered PRs)

| PR | Scope | Acceptance |
|---|---|---|
| 0 | Migration inventory, folder moves, new README/AGENTS, monorepo scaffolding | byte-preserving moves; all historical extensions visible; no data loss |
| 1 | Canonical Python schemas, DB migrations, source provenance/fixtures | unit tests + schema/contract generation |
| 2 | Collectors (GDELT/UCDP/FIRMS/RSS), idempotent fetch/dedup | offline fixture tests, rate limits/backoff |
| 3 | Robust and change-point detectors, evidence graph | deterministic candidates, false-positive fixture tests |
| 4 | Map-first UI + contextual evidence, source view | responsive map + no permanent clutter |
| 5 | Narrative scene builder + deterministic playback | arc styles, subtitles, camera/evidence sync |
| 6 | Foundry CSV ZIP exporter, schema/validation/guide | import-shaped files parse and pass round-trip validation |
| 7 | Deployment, docs, performance/security, Alpha case | source-backed example, reproducible build, rollback |

**Do not attempt all PRs in one unreviewed commit.**

### Hard acceptance criteria for Alpha

- One real, traceable anomaly case; every displayed factual claim has source references.
- Inferred lines never display as direct observations.
- Geolocation is null or clearly symbolic if not verified.
- Map occupies most of the default interface; contextual popovers only as needed.
- **Flat-black UI compliance:** no gradients, neon, luminous outlines, permanently split dashboards or unsolicited drawers; #050505 base, thin white borders, 9999px pill controls, a one-line bottom status bar, circular country nodes, clean arc semantics.
- The four-lens FAST-helmet icon displays correctly as transparent PNG, app icon and header mark across light/dark backgrounds, including 32px favicon recognizability check.
- Korean subtitles + English labels are supported, and reduced-motion accessibility works.
- Saved case replay is deterministic when source data remains unchanged.
- Export ZIP includes validation report and source lineage; CSV round-trip parser succeeds.
- No unlicensed live CCTV republishing; no passwords/secrets in the frontend.
- Both `pytest` and frontend test/build CI pass.

## 10. Codex kickoff instruction (copy into first task)

> You are implementing Night Vision 2.0 in `hexagon0401/Night-Vision-A`. Read this handoff end to end. First perform a read-only inspection of current main, verify commit/hash and working-tree status, and produce a migration manifest. Then create a new feature branch for PR 0 only: safely organize existing Claude extension and prompt-pack version folders, archive historical directives and Foundry guidance, add `engine/`, `frontend/nv-visualize/`, `services/`, `schemas/`, `docs/` scaffolding, and update the root README with links. Use `git mv`; preserve existing bytes, historical ZIPs and CSVs; never delete unclassified user files. Verify path manifest and diffs before any commit. Do not implement live scraping or send alerts in PR 0. Do not copy WorldMonitor AGPL code without licensing review. After PR 0, report exact moved files, unresolved categorization and a proposal for PR 1. **For all subsequent UI PRs use the revised FLAT BLACK design in Section 6 and the provided FAST four-lens helmet PNG branding: absolutely no gradients, neon, bloom, navy map textures or permanently crowded panels.** The three attached concept PNGs specify target UI behavior, not real GIS data.

## 11. Remaining product decisions

1. Public open-source license for NV 2.0: choose before importing third-party code.
2. Full repository move now vs dual compatibility paths: recommend moves with documented compatibility, and avoid duplicate active source.
3. First canonical data theater: recommend one bounded region/case, not all-world realtime.
4. Whether Foundry export initially supports only public data (recommended) or controlled private datasets.
5. Whether pinned drawer state persists between visits: not essential for Alpha.

## 12. Evidence links

- Night Vision repository README: https://github.com/hexagon0401/Night-Vision-A/blob/main/README.md
- WorldMonitor architecture: https://github.com/koala73/worldmonitor/blob/main/ARCHITECTURE.md
- WorldMonitor correlation engine: https://github.com/koala73/worldmonitor/blob/main/src/services/correlation-engine/engine.ts
- WorldMonitor news dedup: https://github.com/koala73/worldmonitor/blob/main/server/worldmonitor/news/v1/dedup.mjs
- WorldMonitor license: https://github.com/koala73/worldmonitor/blob/main/LICENSE
- MapLibre: https://maplibre.org/maplibre-gl-js/docs/
- deck.gl MapLibre integration: https://deck.gl/docs/api-reference/maplibre/overview
- OpenFreeMap: https://openfreemap.org/
- Protomaps PMTiles: https://github.com/protomaps/PMTiles
- UCDP API: https://ucdp.uu.se/apidocs/
- NASA FIRMS API: https://firms.modaps.eosdis.nasa.gov/api/
- GDELT DOC API: https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
- GNU AGPLv3: https://www.gnu.org/licenses/agpl-3.0.en.html

**Confidence note:** Repository tree and named files were inspected directly; implementation choices are recommendations, not already executed code. Map graphics are synthetic AI visualizations. Foundry integration was researched from official docs but not live-tested in an enrollment.
