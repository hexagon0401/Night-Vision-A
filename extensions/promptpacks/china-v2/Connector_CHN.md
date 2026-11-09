# CONNECTOR_CHN.MD v1.0 — China Intelligence Fusion & Inference (Patch)
# Extends Connector.md — load Connector.md FIRST, then apply this patch
# Scope: PRC-specific inference patterns, Korea-China nexus, PLA analysis
# Token rule: Load only relevant section. English only.

---

## LOAD ORDER
```
1. Connector.md (base fusion/inference logic)
2. Source_Finetuned_CHN.md (CHN source registry)
3. Connector_CHN.md (this file — CHN-specific patterns and inference)
```

---

## CHN INFERENCE TEMPLATES (extends Connector.md Stage 2)

### CI-01: PRC FYP Trajectory Analysis
```
PURPOSE: Detect acceleration, deceleration, or pivot in PRC strategic priorities

INPUTS:
  policy_docs  = CG01-CG06 (FYP texts, Chinese) + G03-G08 (English summaries)
  us_response  = G27 (NSS 2022) + G28 (NDS 2022) + G11 (AI Action Plan)

EXTRACTION:
  per_plan: [plan_id, period, gdp_target, key_tech_sectors, military_civil_fusion_note]

LOGIC:
  1. Build time-series: 10th→11th→12th→13th→14th→15th FYP
  2. Calculate delta per sector (tech, military, social)
  3. Flag sectors with >2x emphasis increase across 2 consecutive plans
  4. Cross-map flagged sectors against G28 NDS threat priorities
  5. IF PRC priority matches US threat concern → infer: strategic competition axis confirmed

CONFIDENCE: High (A-tier primary + A-tier cross on both sides)
OUTPUT COLUMNS (append to D1 CSV): trajectory_delta, us_response_indicator, axis_confirmed
```

### CI-02: PLA Purge → Capability Degradation Model
```
PURPOSE: Assess PLA operational readiness impact from anti-corruption purges

INPUTS:
  purge_data  = T17 (CSIS PLA Purges DB) — extract: unit, rank, date, domain
  baseline    = T06 (2024) + T07 (2023) DoD reports

LOGIC:
  1. Count purges per domain: Rocket Force / Navy / Air Force / CMC per quarter
  2. Apply degradation model:
     Rocket Force purge → delayed nuclear readiness (12-18 month lag)
     Navy CMC purge    → carrier group exercise disruption (6-12 month lag)
     Air Force purge   → J-20 squadron command disruption (3-6 month lag)
  3. Cross-check: DoD report language shift (T06 vs T07) on readiness assessment
  4. IF purge_count[domain] > 3 in 6 months → flag: readiness_risk: true

HARD CONSTRAINT: NEVER assert specific readiness % — output as POSSIBLE/SPECULATIVE only
CONFIDENCE: Medium (single B-tier T17 + A-tier T06 commentary)
OUTPUT COLUMNS: domain_purge_count, readiness_risk, lag_window_months, confidence_level
```

### CI-03: PRC Maritime Coercion Escalation Score
```
PURPOSE: Score current ECS/SCS escalation level using multi-indicator model

INPUTS:
  incidents   = CT04 (Diplomat 2024 frequency) + T21 (CFR timeline) + T09 (AMTI)
  facility    = T31 (structure installation) + S03 (AMTI map)
  legal_claim = G09 (defense white paper) + T22 (ECS energy)
  japan_data  = T40 (JIIA) + CT03 (JIIA 2025 bargaining)

SCORING MATRIX (0-5 per indicator, max total 20):
  Intrusion frequency vs baseline (CT04) : 0-5
  New facility construction (T31+S03)     : 0-5
  Legal/diplomatic provocation (T22+T40)  : 0-5
  Military asset deployment (T06+T09)     : 0-5

THRESHOLD:
  ≤7  → LOW (monitoring only)
  8-12 → MEDIUM (elevated watch)
  13-16 → HIGH (escalation probable)
  17-20 → CRITICAL (conflict risk)

OUTPUT COLUMNS: escalation_score, score_breakdown, primary_driver, timeframe_assessment
CONFIDENCE: inherited from lowest-tier input source used in scoring
```

### CI-04: Korea-China Economic Leverage Index
```
PURPOSE: Quantify PRC economic coercion capacity against ROK

INPUTS:
  trade_stats  = T29 (KDI structural), Q07 (KDI impact), K04 (opportunity analysis)
  fdi_exit     = K02 (Korean firm withdrawal analysis)
  sentiment    = K01 (anti-China sentiment), Q01/QC01/QC02 (Pew global)
  security_trigger = T05 (THAAD), G14 (Hanwha sanctions), CT05 (Carnegie perceptions)

LOGIC:
  1. Trade dependency score: Korea exports to China as % GDP (Q10 World Bank)
  2. FDI reversal score: Korean FDI in China delta (K02)
  3. Sentiment buffer: Public anti-China sentiment → political cover for decoupling (K01, QC02)
  4. Coercion precedent: Prior PRC economic retaliation cases (G14, T05)
  5. Leverage index = f(dependency, fdi_reversal, sentiment_buffer, precedent)

OUTPUT: leverage_index (1-10), decoupling_pace, coercion_risk_window
NOTE: IF leverage_index falls over time → PRC loses coercion tool → flag strategic shift
```

### CI-05: PRC Proxy/TOC-State Ambiguity Assessment
```
PURPOSE: Determine degree of PRC state direction in SE Asia TOC operations

INPUTS:
  uscc_reports = CT01 (Tower testimony) + CT02 (scam center report)
  legal_action = G19 (OFAC) + G25 (DOJ) + T04 (USCC general)
  field_report  = T39 (Humanity Consult Cambodia) + M11-M13 (RFA Prince Group)
  prc_law       = CG08 (PRC anti-gambling notice) + M16 (Xinhua) + G30

AMBIGUITY SCORING:
  State_Direction_Indicators:
    PRC law enforcement absent from compounds       → +2
    PRC nationals in management roles (CT01)        → +2
    Chinese language operations (CT02)              → +1
    PRC MoFA non-response to OFAC action (G19)      → +2
    Prior PRC crackdown then reversal (CG08+G15)    → +1
  
  State_Denial_Indicators:
    PRC domestic crackdown rhetoric (G30, M16)      → -1
    MOFCOM cooperation statements                    → -1

  Score > 5 → LIKELY state-tolerated (not necessarily directed)
  Score > 7 → LIKELY state-facilitated

OUTPUT: ambiguity_score, direction_evidence, denial_evidence, assessment_tier
HARD CONSTRAINT: Never assert "PRC government ordered" without A-tier evidence
```

### CI-06: BRI Dependency → Political Leverage Pathway
```
PURPOSE: Map BRI debt → PRC political leverage in target country

INPUTS (per country):
  project_data = T35/T36 (Nepal), M19/M20 (specific projects)
  debt_burden  = Q10 (World Bank debt stats) + Q03 (if Mongolia)
  trade_dep    = Q10 (trade openness)

PATHWAY MODEL:
  Stage 1: Project signed → investment_usd_bn recorded (T35/T36)
  Stage 2: Cost overrun / low utilization → debt accumulation (M19/M20)
  Stage 3: Debt-to-GDP ratio cross-check (Q10) → sustainability assessment
  Stage 4: IF debt_service > 15% export earnings → leverage_activated: true
  Stage 5: Map political decisions following leverage_activated (OSINT)

OUTPUT: project_id, leverage_stage, debt_sustainability, leverage_activated, political_outcome
```

---

## CHN PREDICTION TEMPLATES (extends Connector.md Stage 3)

### CP-01: PRC Salami Tactics Escalation Prediction
```
PATTERN: P-01 from Source_Finetuned_CHN.md
EVIDENCE REQUIRED: CT04 intrusion frequency data + T31 new structure report + S03 AMTI confirmation
PROBABILITY TIERS:
  LIKELY:     3+ consecutive months intrusion increase + new facility construction confirmed
  POSSIBLE:   2 months increase OR new facility unconfirmed
  SPECULATIVE: Single data point, no facility change
TIMEFRAME: "within 3-6 months" for next escalation step
OUTPUT: prediction_type="maritime_coercion", probability_tier, evidence_list, next_step_indicator
```

### CP-02: PRC Economic Retaliation (Korea) Prediction
```
PATTERN: P-03 from Source_Finetuned_CHN.md
TRIGGER: Major ROK security decision (alliance, basing, weapons)
EVIDENCE REQUIRED: G14 + K02 precedent + K01 sentiment data
PREDICTION WINDOW: 30-90 days post-trigger
INDICATORS TO WATCH:
  - MOFCOM spokesperson statement (CG09 pattern)
  - Chinese tourism/cultural restrictions
  - Customs slowdowns at China-Korea ports
PROBABILITY TIERS:
  LIKELY:    Prior THAAD-type precedent confirmed (T05) + new trigger confirmed
  POSSIBLE:  Partial precedent match
  SPECULATIVE: New trigger type without precedent
```

### CP-03: PLA Capability Recovery Post-Purge
```
PATTERN: P-02 (inverse — recovery assessment)
EVIDENCE REQUIRED: T17 (purge slowdown) + T06 (DoD readiness language)
RECOVERY WINDOW: domain-specific lag (CI-02 lag table)
NOTE: Always SPECULATIVE unless T06/DoD explicitly assesses recovery
```

---

## CHN VISUALIZATION EXTENSIONS (extends Connector.md Stage 4)

```
ECS/SCS Intrusion Pattern → TIMELINE EVENT + CLUSTER (high-density point events)
  Columns: event_date, lat, lng, vessel_type, action_type, event_start_time
  Layer: CLUSTER at zoom-out, POINT at zoom-in

PRC FYP Trajectory → Non-geo time-series (D1 PolicyDocument)
  Columns: plan_period, sector, target_value, trajectory_delta
  Visualization: Table/chart (no map layer needed)

PLA Purge Map → CHOROPLETH (by PRC military region) + POINT (individual purge location)
  Columns: unit_location_lat, lng, purge_date, domain, severity
  Source: T17 CSIS DB — coordinates require S09 Google Earth crosscheck

Korea-China Trade Flows → LINE SEGMENT (Korea origin → China target, bidirectional)
  Columns: origin_lat/lng (Seoul), target_lat/lng (Beijing/Shanghai), year, trade_value_usd_bn
  Arrow: bidirectional → use two overlapping LINE SEGMENTs

BRI Project Map → POINT (project location) + LINE (pipeline/rail routes)
  Columns: project_lat, lng, investment_usd_bn, debt_stage, leverage_activated
  Styling: Value-based color by leverage_stage

PRC TOC Network → POINT (scam compound locations) + LINE SEGMENT (financial flow)
  Columns: compound_lat/lng, linked_entity_id, flow_direction
  Backend B required (network graph GeoJSON)
```

---

## CHN-SPECIFIC ANTI-HALLUCINATION ADDITIONS

```
CHN-H01: PLA warhead counts — use T06 ONLY; do not cite older estimates
CHN-H02: PRC GDP growth actuals vs targets — always distinguish target vs actual
          Target: CG0x/G0x | Actual: Q10 (World Bank) or Q08 (SIPRI defense share)
CHN-H03: ECS/SCS coordinates — ALWAYS verify against S03 (AMTI) or S09 (Google Earth)
          Never generate island/facility coordinates from memory
CHN-H04: PLA purge names — cite T17 database only; never fill names from memory
CHN-H05: Korea-China trade figures — cite year + source; post-2022 data in K02/K04
          T29 data ends ~2022; do not extrapolate forward
CHN-H06: PRC BRI debt figures — cite project-specific source (T35/T36/M19/M20)
          Never aggregate BRI debt to total without Q10 World Bank cross-check
```
