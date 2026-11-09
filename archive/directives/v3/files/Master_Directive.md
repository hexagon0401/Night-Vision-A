# MASTER_DIRECTIVE.MD v2 — Global Intelligence Extraction System
# Scope: Global geopolitics, defense, and security (not China-exclusive)
# For AI consumption. Written in English.
# OUTPUT TO USER: translate final deliverables to Korean.

---

## FILE DEPENDENCY MAP

```
MASTER_DIRECTIVE.MD  ← read first, always
├── Source.md        → Source registry (G/T/U/S/Q/W/M IDs, tiers)
├── Relation.md      → Domain mapping + CSV schemas (DOMAIN-0 ~ DOMAIN-11)
└── TO_Foundry.md    → Foundry ingestion rules + Python transforms
```

## TOKEN EFFICIENCY RULES
- Load only the relevant SECTION of each subfile — not entire files
- Source.md: load only the CAT-* block relevant to the actor/region
- Relation.md: load only the DOMAIN-* section matching the request
- TO_Foundry.md: §1-3 for schema; §5 for transforms; §8-10 for errors
- Do NOT re-read already-loaded sections within the same task session

---

## STANDARD OPERATING PROCEDURE (OODA)

```
[OBSERVE]  → Parse command: topic, actor/country, geography, time range, output format
[ORIENT]   → Check Source.md for matching registered sources
             IF found → identify DOMAIN in Relation.md
             IF NOT found → escalate to DOMAIN-0 (OSINT Fallback)
[DECIDE]   → Select sources by tier (A > B > C > D > E > W)
             Min 2 sources for STAT/GEO data
             Single A-tier acceptable for LEGAL/official records
[ACT]      → Extract → format CSV → validate → Foundry upload
```

Repeat loop if data is insufficient or sources contradict each other.

---

## CRITICAL: SCOPE & HALLUCINATION RULES (v2 REVISED)

### What "hallucination prevention" means:
- NEVER fabricate coordinates, statistics, or entity data from memory
- NEVER generate data not traceable to a source
- NEVER fill gaps with estimated values without marking them

### What "hallucination prevention" does NOT mean:
- It does NOT mean refusing topics outside the pre-registered source list
- It does NOT mean blocking requests about US bases, Russia, Iran, etc.
- The registered source list is a STARTING POINT, not a hard boundary

### Out-of-Registry Protocol (MANDATORY):
```
IF a topic is not covered by Source.md registered sources:
  → Do NOT refuse the request
  → Do NOT say "this is outside system scope"
  → Instead: escalate to DOMAIN-0 (Relation.md)
  → Perform live web search using W-tier sources from Source.md CAT-OSINT
  → Extract data from found sources
  → Assign W-tier source_id + record source_url
  → Set confidence_level = "Medium" (single W) or "High" (W02-W04 + crosscheck)
  → Proceed with CSV formatting
```

---

## LANGUAGE PROTOCOL

1. Internal processing: **English** (lower token cost)
2. AI-to-AI file reads: **English**
3. Final output to user: **Korean**
   - Keep CSV column headers in English (Foundry compatibility)
   - Translate summaries, narratives, and analysis to Korean
   - Translate confidence notes and caveats to Korean

---

## CASE-BASED EXECUTION GUIDE

---

### CASE A | Military Facility / Base Location [ANY COUNTRY]
> Trigger: "기지 위치", "base coordinates", "facility data for [country]", "미군 기지", "중국 해외기지"

```
OODA:
  OBSERVE → target_country, operator_country, facility_type
  ORIENT  → Relation.md DOMAIN-3
  DECIDE  →
    PRC facilities:   T10, T09, T31 (CSIS AMTI) + T06 (DoD) confirmation
    US facilities:    U01 (DoD Base Structure) + U02-U05 (combatant commands)
    Other countries:  U08 (Stimson) + W06 (GlobalSecurity) + W09 (IISS)
    Coordinates:      S03 (AMTI) for Asia; S09 (Google Earth) for crosscheck
    NOT in registry:  W06 GlobalSecurity.org → live search "[country] military base"
  ACT:
    1. Retrieve facility_name, lat, lng from primary source
    2. Crosscheck coordinates with secondary source
    3. Record accuracy_m; mark "pending_verification" if unconfirmed
    4. Format per DOMAIN-3 schema (TO_Foundry.md §6: us_allied_posture or facilities_geo)
    5. Validate via TO_Foundry.md §9
    6. Map to MilitaryFacility or USPosture ontology object
  OUTPUT → CSV + Korean facility summary
```

---

### CASE B | Weapons Transfer / Arms Trade [GLOBAL]
> Trigger: "무기 수출", "arms transfer", "weapons sold to [country]", "military aid"

```
OODA:
  OBSERVE → exporter, importer, weapon_category, year_range
  ORIENT  → Relation.md DOMAIN-4
  DECIDE  → Primary: Q02 SIPRI (tier A — globally authoritative TIV data)
            US aid:   U11 DoD Ukraine Fact Sheets + DSCA notifications
            Others:   W10 Jane's + W09 IISS Military Balance
  ACT:
    1. Extract from SIPRI Q02: year, exporter, importer, weapon_type, tiv_usd_millions
    2. Cross-check with DoD/DSCA for US-origin transfers
    3. Verify via press (tier D) — flag discrepancies
    4. Format per DOMAIN-4 schema
    5. Map to WeaponsTransfer ontology
  OUTPUT → CSV + Korean transfer table with confidence annotation
```

---

### CASE C | Conflict Event Timeline [GLOBAL]
> Trigger: "분쟁 타임라인", "conflict events", "war casualties", specific conflict name

```
OODA:
  OBSERVE → conflict_name_or_region, time_range, event_type
  ORIENT  → Relation.md DOMAIN-5 or DOMAIN-11
  DECIDE  →
    Any active conflict:  Q12 ACLED (tier B, real-time database)
    Russia-Ukraine:       T52 ISW + Q12 ACLED
    ECS/SCS incidents:    T21 CFR + T09 CSIS AMTI
    SE Asia:              T33 ASPI + M05 Al Jazeera
    Myanmar:              T41 UK Parliament + M01 Economist
    Middle East / Iran:   T58 RAND + W04 ISW + G42 IAEA
    Not in registry:      W08 ACLED Dashboard (live) + W04 ISW (live)
  ACT:
    1. Pull event list from ACLED [Q12/W08]: date, type, lat, lng, actors, fatalities
    2. Supplement with analytical context from think tank sources
    3. Format per DOMAIN-5 schema
    4. Map to ConflictEvent + GlobalConflict ontology objects
  OUTPUT → CSV + Korean chronological narrative
```

---

### CASE D | Sanctions / Criminal Network Analysis [GLOBAL]
> Trigger: "제재 네트워크", "sanctions data", "entity link analysis"

```
OODA:
  OBSERVE → target_entity, jurisdiction, crime_type
  ORIENT  → Relation.md DOMAIN-6
  DECIDE  → Primary: G16-G19 OFAC + G40 UN SC Resolutions
            DOJ:      G25 press releases
            Context:  T04 USCC, T19 RAND, W01 CSIS search
  ACT:
    1. Extract entity list from OFAC/UN SC: entity_name, nationality, sanction_date
    2. Build linked_entity_ids for graph edges
    3. Format per DOMAIN-6 schema
    4. Map to SanctionedEntity → link analysis graph
  OUTPUT → CSV + Korean entity network description
```

---

### CASE E | Satellite / Space Asset Tracking [GLOBAL]
> Trigger: "위성 추적", "orbital data", "LEO constellation", "space assets"

```
OODA:
  OBSERVE → satellite_name_or_NORAD_id, operator_country, time_range
  ORIENT  → Relation.md DOMAIN-7
  DECIDE  → Real-time: S01 N2YO (any satellite by NORAD ID)
            PRC context: T26 IFRI, S05 CircleID
            US comparison: S04 USSF Fact Sheets
  ACT:
    1. Retrieve TLE data from N2YO [S01]
    2. Record snapshot_time with lat_snap, lng_snap — MANDATORY
    3. Format per DOMAIN-7 schema
    4. Map to SpaceAsset ontology
  OUTPUT → CSV + Korean orbital summary
```

---

### CASE F | Energy Infrastructure & Pipeline [GLOBAL]
> Trigger: "에너지 파이프라인", "LNG deal", "BRI infrastructure", "energy dependency"

```
OODA:
  OBSERVE → project_name, countries, data_type (capacity/investment/status)
  ORIENT  → Relation.md DOMAIN-8
  DECIDE  → Analysis: T34 Columbia SIPA, T14 CSIS, T61 Atlantic Council
            Data: Q05/Q06 (Russia-China), Q11 EIA (global production stats)
            BRI: T35/T36 for debt burden
  ACT:
    1. Extract project stats from T34/T14
    2. Verify deal values cross-source
    3. Format per DOMAIN-8 schema
    4. Map to EnergyInfrastructure ontology
  OUTPUT → CSV + Korean project brief
```

---

### CASE G | PRC Strategy / Policy Comparison
> Trigger: "중국 전략", "5개년 계획", "PRC 2035", "policy trajectory"

```
OODA:
  OBSERVE → plan_period, policy_domain, comparison_scope
  ORIENT  → Relation.md DOMAIN-1
  DECIDE  → PRC: G03-G08 FYP texts, G09 defense white paper
            US response: G27 NSS, G28 NDS
            Analysis: T08 CSIS, T01 USCC
  ACT:
    1. Extract gdp_growth_target, key_tech_focus per FYP period
    2. Compare trajectory across G05-G04
    3. Map US strategic response from G27/G28
    4. Format as time-series CSV per DOMAIN-1 schema
    5. Map to PolicyDocument ontology
  OUTPUT → CSV time-series + Korean policy trajectory analysis
```

---

### CASE H | US & Allied Military Posture [NEW]
> Trigger: "미군 기지", "US overseas bases", "INDOPACOM forces", "NATO posture", "미국 전방 배치"

```
OODA:
  OBSERVE → combatant_command OR region, force_type, time_range
  ORIENT  → Relation.md DOMAIN-10
  DECIDE  →
    Base count/type:  U01 DoD Base Structure Report (tier A)
    INDOPACOM:        U02 official fact sheets
    EUCOM/NATO:       U03 + G41 NATO communiqués
    AFRICOM:          U04
    CENTCOM:          U05
    Detailed analysis: U06 GlobalSecurity + U08 Stimson Center
    Coordinates:      U06 GlobalSecurity.org → live search if needed
    Strategic context: U07 RAND, U12 CRS
  ACT:
    1. Retrieve base_name, host_country, personnel, mission from U01/U02-U05
    2. Crosscheck coordinates via U06 GlobalSecurity or S09 Google Earth
    3. Add strategic context from U07/U08
    4. Format per DOMAIN-10 schema (TO_Foundry.md §6: us_allied_posture)
    5. Map to USPosture ontology object
  OUTPUT → CSV + Korean base posture summary by region
```

---

### CASE I | Global Conflict Monitor [NEW]
> Trigger: "현재 전쟁 현황", "active conflicts", "global security situation", "분쟁 지도"

```
OODA:
  OBSERVE → scope (global / regional), metric (events / casualties / territory)
  ORIENT  → Relation.md DOMAIN-11
  DECIDE  → Overview: T50 CSIS Tracker + T56 CFR Tracker
            Real-time events: Q12 ACLED + W08 ACLED Dashboard
            Russia-Ukraine: T52 ISW daily
            Iran: T58 RAND + G42 IAEA
            Others: W04 ISW + W01-W04 OSINT
  ACT:
    1. Pull active conflict list from T50/T56
    2. Enrich with event stats from ACLED Q12
    3. Add latest assessment from ISW T52 for Russia-Ukraine
    4. Format per DOMAIN-11 schema
    5. Map to GlobalConflict ontology
  OUTPUT → CSV conflict registry + Korean global situation summary
```

---

### CASE J | Out-of-Registry OSINT Escalation [NEW — UNIVERSAL FALLBACK]
> Trigger: topic not covered by any registered source | AI responded "outside scope"

```
OODA:
  OBSERVE → identify topic: [subject] + [country/region] + [data_type]
  ORIENT  → Source.md CAT-OSINT (W01-W14) — select best-fit W sources
  DECIDE  →
    Military/defense:  W02 RAND, W06 GlobalSecurity, W09 IISS, W10 Jane's
    Conflict events:   W04 ISW, W08 ACLED, W07 Diplomat
    Strategy/policy:   W01 CSIS, W02 RAND, W03 CFR
    Energy:            Q11 EIA (live), T61 Atlantic Council
    General:           Web search → [topic] site:[W-source domain] [year]
  ACT:
    1. Perform web search: "[topic] [country] [year] [W-source domain]"
    2. Retrieve article / report
    3. Extract relevant data per universal DOMAIN-0 schema (Relation.md)
    4. Assign source_id = W##, record source_url in CSV
    5. Set confidence_level per number of cross-sources
    6. Format per TO_Foundry.md §6: osint_fallback path
    7. Map to OSINTRecord ontology object
  NOTE: This case replaces "outside scope" refusals entirely.
        Any refusal must be justified by data quality, not topic category.
  OUTPUT → CSV + Korean data summary with source transparency notes
```

---

### CASE K | Multi-Domain Intelligence Fusion [EXPANDED]
> Trigger: complex scenario requiring 3+ domains or 3+ countries

```
OODA (expanded):
  OBSERVE → decompose into sub-topics; identify domains (max 5 per session)
  ORIENT  → load each relevant DOMAIN from Relation.md independently
  DECIDE  → apply tier selection per domain; map cross-domain linkages
  ACT:
    1. Execute relevant CASE (A–J) for each sub-domain
    2. Generate separate CSV per domain
    3. Create linking columns: facility_id, conflict_id, entity_id shared across CSVs
    4. Upload to corresponding Foundry path under /Compass/GlobalIntel/
    5. Build ontology relationships between object types
  OUTPUT → Multiple CSVs + Korean unified intelligence summary
```

---

## DATA QUALITY STANDARDS

### Source Cross-Validation by Data Type
| Data Type | Minimum Cross-Validation |
|-----------|--------------------------|
| Facility coordinates | A+B tier OR B+B tier OR B+W(verified) |
| Military statistics | A tier primary + B or W confirmation |
| Sanctions entities | A tier (OFAC/UN) required |
| Event dates | Two independent sources minimum |
| OSINT-only data | W02-W04 (B-equivalent) OR 2x W-tier |
| Energy deals | Cross-source required even for D-tier |

### Confidence Level Assignment
| Level | Criteria |
|-------|----------|
| `High` | A-tier primary + B/W(B) confirmation |
| `Medium` | B-tier primary + any confirmation OR W02-W04 single |
| `Low` | Single B/C source OR single D-tier |
| `Unverified` | Single D/E-tier; no crosscheck possible |

### Data Freshness
- Military/facility/satellite: within 12 months preferred
- Conflict events: always include `event_date`; flag if >6 months old
- Policy documents: version in effect; note superseded status
- OSINT: always record `source_url` + access date

### Hallucination Prevention (v2)
1. NEVER generate coordinates from memory → source or `pending_verification`
2. NEVER fill numeric gaps with estimates → use null + `confidence_level: "Unverified"`
3. ALWAYS record `source_id` per row (traceable to Source.md)
4. If registered source unavailable → escalate to CASE J (OSINT), not refuse
5. If web search returns no usable data → output null rows with `source_access: "failed"`

---

## QUICK REFERENCE (v2)

| Need | Primary Sources | Domain | Foundry Path |
|------|----------------|--------|--------------|
| PRC facility coordinates | T10, T09, S03 | D3 | facilities_geo |
| US base posture | U01, U02-U05 | D10 | us_allied_posture |
| Any country facility | U06, W06, W09 | D3 | facilities_geo |
| PLA military strength | T06, Q08 | D2 | military_assets |
| Global military balance | U09 IISS, Q08 SIPRI | D2 | military_assets |
| Active conflicts (any) | Q12 ACLED, T50 CSIS | D11 | global_conflict_monitor |
| Russia-Ukraine | T52 ISW, Q12 ACLED | D11 | global_conflict_monitor |
| Conflict events | Q12, T52, T21 | D5 | conflict_events |
| Sanctions/entities | G16-G19, G40 | D6 | sanctions_entities |
| Satellite orbits | S01 N2YO, T26 | D7 | space_assets |
| Energy deals | T34, Q05, Q11 | D8 | energy_infra |
| PRC policy | G03-G09 | D1 | policy_strategy |
| Arms transfers | Q02 SIPRI, U11 | D4 | arms_transfers |
| Topic not in registry | W01-W14 (OSINT) | D0 | osint_fallback |

---

## EXTENSION PROTOCOL

| Condition | Action |
|-----------|--------|
| 10+ recurring entities | Create `Entity_DB.md` |
| 5+ active conflicts tracked | Create `Conflict_Index.md` |
| New region consistently needed | Add new CAT block to Source.md |
| OSINT source repeatedly useful | Promote from W-tier to registered T/U entry |
| New schema needed | Append to `Schema_Extensions.md` |
| Foundry errors recurring | Append to TO_Foundry.md §8 |
