# CONNECTOR.MD v1.0 — Intelligence Fusion, Inference & Visualization Engine
# Role: Take Navigator.md outputs → connect, reason, predict, visualize
# Input: validated CSV rows + source metadata from Navigator.md
# Token rule: Load only relevant SECTION per task. English only.

---

## CONNECTOR PIPELINE

```
[Navigator Output] → [DATA_FUSION] → [INFERENCE] → [PREDICTION] → [VISUALIZATION]
                                          ↓
                                   [KNOWLEDGE_GAP]
                                          ↓
                                  [OSINT_ESCALATE] → loop back
```

---

## STAGE 1: DATA FUSION

### Cross-Domain Linking
Connect datasets using shared key columns:
```
facility_id  → D3 ↔ D5 (facility ↔ event)
entity_id    → D6 ↔ D4 (sanctions ↔ arms transfer)
conflict_id  → D11 ↔ D5 (conflict ↔ event)
country      → D2 ↔ D10 (military OOB ↔ US posture)
actor1/actor2 → D5 ↔ D6 (conflict actor ↔ sanctioned entity)
```

### Fusion Validation Rules
- Linked records must share at least 1 common key column
- Time alignment: events must fall within ±6 months of asset/facility data vintage
- Conflicting values across domains → flag `data_conflict: true`, keep both rows
- Cross-domain confidence: inherit LOWER confidence of the two linked sources

### Minimum Fusion Threshold
| Link Type | Min Sources | Min Confidence |
|-----------|-------------|----------------|
| Facility ↔ Event | 2 | Medium |
| Entity ↔ Transfer | 2 (A-tier sanctions) | High |
| Conflict ↔ OOB | 2 | Medium |
| WMD milestone ↔ Policy | A-tier + B-tier | High |

---

## STAGE 2: INFERENCE ENGINE

### Pattern Templates (apply when data density sufficient)

**A. Capability-Intent Gap Analysis**
```
INPUTS: D2 (military assets) + D1 (strategy/policy) + D3 (facilities)
LOGIC:
  stated_intent = extract from D1 (policy docs)
  actual_capability = extract from D2 (OOB, equipment)
  basing_posture = extract from D3
  gap = delta(stated_intent, actual_capability)
  IF gap > threshold → infer: accelerated build-up OR strategic deception
OUTPUT: inference_type, evidence_sources, gap_magnitude, confidence_level
```

**B. Conflict Escalation Indicator**
```
INPUTS: D5 (events) + D2 (assets) + D4 (arms transfers) + D11 (conflict status)
SIGNALS:
  - Event frequency increase (>30% MoM from Q12/ACLED)
  - New weapons system delivery (D4) within 60 days pre-event spike
  - Facility activity increase at forward bases (D3 + S01/S09)
  - External power arms flows (D4 U11/Q02)
THRESHOLD: 3+ signals → HIGH escalation risk
OUTPUT: escalation_score (1-5), signal_list, confidence_level
```

**C. Sanctions Evasion Network**
```
INPUTS: D6 (sanctions) + D4 (arms) + D8 (energy)
LOGIC:
  flagged_entities = G16-G19, G40
  trace: flagged_entity → linked_entity_ids (pipe-separated)
  cross: linked entity appears in D4 or D8 as importer/buyer
  IF match → infer: active sanctions evasion route
OUTPUT: network_graph_edges, hub_entity_id, confidence_level
```

**D. Strategic Posture Shift Detection**
```
INPUTS: D10 (US posture) + D3 (facilities, any country) + D2 (OOB delta)
LOGIC:
  baseline = prior period record for same base_name
  delta = current personnel - baseline personnel
  new_bases = facilities with date_verified within 12 months
  IF delta > 20% OR new_bases > 0 → flag posture_shift: true
OUTPUT: posture_shift_type, region, magnitude, source_id
```

---

## STAGE 3: PREDICTION MODULE

### Prediction Protocols (source-grounded only)

**Rule: NO prediction without minimum evidence base**
```
prediction_allowed = (confidence_level IN ["Medium","High"])
                   AND (source_count >= 2)
                   AND (data_age_months <= 12)
```

**Prediction Output Format**
```
prediction_id, prediction_type, subject_actor, target_region,
timeframe, probability_tier, evidence_basis, source_ids,
confidence_level, caveats
```

**Probability Tiers** (qualitative — no fake percentages)
| Tier | Meaning | Evidence Required |
|------|---------|-------------------|
| LIKELY | Strong pattern + intent signals | 3+ corroborating sources |
| POSSIBLE | Partial pattern, gaps exist | 2 sources, 1+ gap flagged |
| SPECULATIVE | Weak signal, low data density | 1 source, explicitly caveated |

**Prediction Types**
- `military_action`: attack, incursion, exercise escalation
- `capability_acquisition`: weapon system delivery, base construction
- `diplomatic_shift`: alliance change, sanctions, treaty
- `resource_competition`: energy, mineral, maritime

**Anti-Hallucination Rule for Predictions**
- Must cite specific evidence rows (event_id / facility_id / source_id)
- Must state what evidence is MISSING that would upgrade/downgrade tier
- Cannot predict specific dates — use timeframes: "within 6 months", "Q3 2026"

---

## STAGE 4: VISUALIZATION ROUTING

```
DATA TYPE → LAYER TYPE (per TO_Foundry.md §18)

Single location (base, facility, event) → POINT (icon)
Dense events same region               → CLUSTER
A→B transfer/flow (arms, forces)       → LINE SEGMENT + arrow
Multi-stop route (strike path, patrol) → GEOSHAPE LineString
Country-level aggregate (conflicts)    → CHOROPLETH (iso_alpha2)
Active conflict boundary               → POLYGON (geoshape)
Satellite position snapshot            → POINT (lat_snap, lng_snap)
Satellite orbit track                  → TRACK (time series dataset)
Time-bounded events                    → TIMELINE EVENT (event_start/end_time)
Network graph (sanctions/entity)       → POINT + LINE SEGMENT (origin/target entity)
Energy pipeline                        → GEOSHAPE LineString
```

### Visualization Priority Rules
1. Always render GEO data first (D3/D5/D10) — foundational spatial layer
2. Layer conflict events (D5) over facility layer (D3)
3. Add arms flow layer (D4) as LINE SEGMENT on top
4. Sanctions network (D6): render as point cluster + line segments
5. Prediction output: render as CIRCLE (radius = uncertainty zone)

### Foundry Path Assignment
```
D0  → /Compass/GlobalIntel/osint_fallback/
D1  → /Compass/GlobalIntel/policy_strategy/
D2  → /Compass/GlobalIntel/military_assets/
D3  → /Compass/GlobalIntel/facilities_geo/
D4  → /Compass/GlobalIntel/arms_transfers/
D5  → /Compass/GlobalIntel/conflict_events/
D6  → /Compass/GlobalIntel/sanctions_entities/
D7  → /Compass/GlobalIntel/space_assets/
D8  → /Compass/GlobalIntel/energy_infra/
D10 → /Compass/GlobalIntel/us_allied_posture/
D11 → /Compass/GlobalIntel/global_conflict_monitor/
```

---

## STAGE 5: KNOWLEDGE GAP HANDLER

```
IF required_field IS NULL for >30% of rows:
  → Log: gap_field, gap_count, domain
  → Escalate: Navigator.md OSINT_FALLBACK for that field
  → Do NOT interpolate or estimate

IF inference blocked by data gap:
  → Output: inference_blocked: true, missing_evidence_type, recommended_source
  → Suggest: specific W-tier source + search query to fill gap

IF prediction confidence = "Speculative":
  → Flag prominently in output
  → Do NOT include in CSV without explicit speculative_flag: true column
```

---

## OUTPUT STANDARD

Every Connector output must include:
```
- CSV: per Relation.md domain schema + inference/prediction columns appended
- Korean narrative: key findings, inference rationale, prediction caveats
- Source transparency block: list all source_ids used, tiers, access dates
- Gap log: fields that could not be filled + recommended next sources
```

### Appended Inference Columns (add to domain CSV)
```
inference_type, inference_output, escalation_score,
prediction_type, probability_tier, prediction_timeframe,
data_conflict, speculative_flag, gap_fields
```
