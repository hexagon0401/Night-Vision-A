# RELATION.MD v2 — Source-to-Data Extraction Mapping
# Scope: Global intelligence (not China-exclusive)
# For AI consumption.

## Role Code Definitions
| Code | Meaning | Foundry Object Type |
|------|---------|---------------------|
| INS | Insight/direction/inference (narrative) | PolicyNode / EventContext |
| STAT | Direct quantitative statistics (CSV-ready) | DataPoint |
| GEO | Location/coordinate data (lat/lng) | GeoPoint / FacilityNode |
| LEGAL | Treaty/sanction/legal document | LegalRecord |
| PROFILE | Person/org entity profile | EntityNode |
| IMG | Satellite image / interactive map | MediaAsset |

## Priority: [P1]=always extract | [P2]=domain-relevant | [P3]=optional supplement

## SCOPE RESOLUTION RULE (read first)
```
IF topic is covered by registered source IDs → use registered source (DOMAIN-1 ~ DOMAIN-11)
IF topic NOT covered by registered sources  → escalate to DOMAIN-0 (OSINT Fallback)
NEVER refuse a request solely because a specific source is not pre-registered.
Hallucination prevention applies to DATA FABRICATION, not to web search use.
```

---

## DOMAIN-0: OSINT Web Search Fallback [UNIVERSAL]

**Purpose**: Handle any intelligence topic not covered by registered sources.
**Trigger**: Source.md has no matching registered source for the requested topic/country/event.

### Fallback Protocol
```
Step 1: Identify topic category (military / energy / economic / political / conflict)
Step 2: Select appropriate W-tier source from Source.md CAT-OSINT
Step 3: Perform live web search using query:
        "[topic] [country] site:[W-source domain] [year]"
        OR "[topic] [country] [year] filetype:pdf"
Step 4: Extract data per standard schemas below
Step 5: Assign source_id = "W##" + record URL in source_url column
Step 6: Set confidence_level = "Medium" (single W-tier) or "High" (W02-W04 + cross-check)
Step 7: Proceed with CSV formatting per TO_Foundry.md
```

### Minimum quality bar for OSINT sources
- Must be publicly accessible URL (not paywalled)
- Must have institutional affiliation (not anonymous blog)
- Must be published within relevant time window for the topic
- Cross-verify with at least one additional source when using tier D/E

### OSINT CSV Schema (universal fallback)
```
record_id, topic_domain, subject_country, data_type, value_or_description,
date_of_info, source_id, source_url, source_tier, confidence_level, notes
```

---

## DOMAIN-1: PRC Strategy & Policy Direction

**Purpose**: Baseline for predicting PRC behavior. → PolicyNode

| Source ID | Extract Columns | Role | Priority |
|-----------|----------------|------|----------|
| G03, G04 | target_sector, tech_priority, gdp_growth_target, military_note, plan_period | INS+STAT | P1 |
| G05–G08 | plan_period, start_year, end_year, key_industry, gdp_target | STAT | P2 |
| G09 | strategic_objective, threat_perception, a2ad_doctrine_text | INS+LEGAL | P1 |
| G27, G28 | us_threat_priority, alliance_framework, tech_posture | INS | P1 |
| T08 | standard_domain, global_target, implementation_year | INS | P2 |
| T03 | us_policy_debate_axis, china_counter_narrative | INS | P2 |

**Output CSV schema**:
```
plan_id, plan_period, start_year, end_year, gdp_growth_target_pct,
key_tech_focus, military_civil_fusion_note, source_id, confidence_level
```

---

## DOMAIN-2: Military Assets & Order of Battle [ANY COUNTRY]

**Purpose**: Quantify any country's military capability. → MilitaryAsset

| Source ID | Use For | Extract Columns | Role | Priority |
|-----------|---------|----------------|------|----------|
| T06, T07 | PLA | pla_force_type, unit_count, warship_count, nuclear_warhead_est | STAT | P1 |
| U09 (IISS) | ANY | country, force_branch, personnel_count, major_equipment | STAT | P1 |
| Q08 (SIPRI) | ANY | country, year, defense_spending_usd_bn, pct_gdp | STAT | P1 |
| Q09 (GFP) | ANY | country, power_index, active_personnel, aircraft, naval | STAT | P2 |
| T51, T52 | Russia | unit_type, equipment_loss_est, frontline_position | STAT+INS | P1 |
| T58 | Iran | missile_type, range_km, stockpile_est, nuclear_program_status | STAT+INS | P1 |
| W09, W10 | ANY | order_of_battle, equipment_type, unit_count | STAT | P2 |

**Output CSV schema**:
```
asset_id, country, force_branch, asset_type, quantity,
range_km, year_reported, source_id, confidence_level
```

---

## DOMAIN-3: Military Facilities & Basing [ANY COUNTRY]

**Purpose**: Geolocate military facilities globally — US, PRC, Russia, others.

### PRC Facilities
| Source ID | Extract Columns | Role | Priority |
|-----------|----------------|------|----------|
| T10, T32 | facility_name, country, lat, lng, facility_type, prc_involvement | GEO+STAT | P1 |
| T09, T22 | platform_name, lat, lng, operation_status, china_claim | GEO+STAT | P1 |
| T31 | structure_name, sea_area, lat, lng, installation_date | GEO | P1 |
| T06 | overseas_base_name, host_country, lat, lng, confirmed_or_suspected | GEO | P1 |

### US Facilities
| Source ID | Extract Columns | Role | Priority |
|-----------|----------------|------|----------|
| U01 (DoD Base Structure) | base_name, country, service_branch, personnel_count, base_type | STAT+GEO | P1 |
| U02 (INDOPACOM) | base_name, country, lat, lng, primary_mission | GEO+STAT | P1 |
| U03 (EUCOM) | base_name, country, lat, lng, primary_mission | GEO+STAT | P1 |
| U04 (AFRICOM) | base_name, country, lat, lng, primary_mission | GEO+STAT | P1 |
| U05 (CENTCOM) | base_name, country, lat, lng, primary_mission | GEO+STAT | P1 |
| U06 (GlobalSecurity) | base_name, country, lat, lng, description | GEO | P2 |
| U08 (Stimson) | base_name, country, personnel_count, agreement_type | STAT | P2 |

### Other Countries / Allied Facilities
| Source ID | Extract Columns | Role | Priority |
|-----------|----------------|------|----------|
| W06 (GlobalSecurity) | facility_name, country, type, lat, lng | GEO | P2 |
| W09 (IISS) | base_name, country, status, force_element | GEO+STAT | P2 |
| U12 (CRS Deployments) | deployment_name, country, personnel, legal_basis | STAT+LEGAL | P2 |

### Coordinate Acquisition Protocol (ALL facilities)
1. Primary: Official DoD/INDOPACOM/EUCOM publications (A-tier)
2. Secondary: CSIS AMTI [S03] for Asia-Pacific; GlobalSecurity [W06] for global
3. Crosscheck: Google Earth Pro [S09] / Bellingcat [W05] for OSINT verification
4. Record `accuracy_m` for every GEO coordinate
5. Mark `status: "pending_verification"` if crosscheck unavailable

**Output CSV schema**:
```
facility_id, facility_name, country, operator_country, facility_type,
lat, lng, accuracy_m, status, personnel_est, source_id, date_verified
```

---

## DOMAIN-4: Weapons Transfers & Arms Trade [GLOBAL]

**Purpose**: Track global weapons exports — PRC, US, Russia, others.

| Source ID | Extract Columns | Role | Priority |
|-----------|----------------|------|----------|
| Q02 (SIPRI) | year, exporter, importer, weapon_category, quantity, tiv_usd_millions | STAT | P1 |
| T06, T07 | prc_weapons_sold, recipient_country, deal_value_usd_mn, year | STAT | P1 |
| U11 (DoD Ukraine) | weapon_type, quantity, value_usd_mn, delivery_date | STAT | P1 |
| W10 (Jane's) | weapon_system, exporter, importer, contract_value, year | STAT | P2 |
| M02 | weapon_type, conflict_context, delivery_year | STAT+INS | P2 |

**Output CSV schema**:
```
transfer_id, year, exporter, importer, weapon_type,
quantity, tiv_usd_millions, deal_confirmed, source_id
```

---

## DOMAIN-5: Conflict Events & Incidents [GLOBAL]

**Purpose**: Event database for any active conflict globally.

| Source ID | Use For | Extract Columns | Role | Priority |
|-----------|---------|----------------|------|----------|
| Q12 (ACLED) | ANY | event_date, event_type, country, admin1, lat, lng, actor1, actor2, fatalities | STAT+GEO | P1 |
| T52 (ISW) | Russia-Ukraine | event_date, frontline_change, location, action_type | INS+GEO | P1 |
| T50 (CSIS Tracker) | ANY | conflict_name, country, start_date, status, fatality_est | STAT | P1 |
| T56 (CFR Tracker) | ANY | conflict_name, parties, type, start_date | INS | P2 |
| T21 | ECS | incident_date, sea_zone, vessel_type, action_type | STAT | P1 |
| T09 | ECS/SCS | incident_date, lat, lng, china_justification | GEO+STAT | P1 |
| T33, M05 | SE Asia | event_date, lat, lng, casualty_est, weapon_used | STAT+GEO | P1 |
| T41, M01 | Myanmar | event_date, armed_group, territorial_change | INS+STAT | P2 |
| W04 (ISW) | ANY | daily assessment, location, unit, action | INS | P2 |
| W08 (ACLED) | ANY | real-time conflict events | STAT+GEO | P1 |

**Output CSV schema**:
```
event_id, event_date, event_type, conflict_name, location_name,
country, lat, lng, actors_involved, fatalities_est, weapon_category,
external_involvement, source_id, source_tier, confidence_level
```

---

## DOMAIN-6: Sanctions & Criminal Networks [GLOBAL]

**Purpose**: Entity resolution + link analysis.

| Source ID | Extract Columns | Role | Priority |
|-----------|----------------|------|----------|
| G16–G19 | entity_name, entity_type, nationality, sanction_date, reason_code | LEGAL+PROFILE | P1 |
| G25 | defendant_name, charge_type, money_laundered_usd, network_node_country | PROFILE+LEGAL | P1 |
| T04, T19 | org_name, country_of_operation, crime_type, est_revenue_usd | PROFILE+INS | P1 |
| M11–M13 | entity_name, offshore_entity, transaction_type, red_flag | PROFILE | P2 |
| G40 (UN SC) | sanctioned_entity, resolution_number, sanction_type, date | LEGAL | P1 |

**Output CSV schema**:
```
entity_id, entity_name, entity_type, nationality,
sanction_date, sanctioning_body, reason_code,
linked_entity_ids, source_id, source_url
```
`linked_entity_ids` = pipe-separated for graph edge construction

---

## DOMAIN-7: Satellite & Space Assets [GLOBAL]

**Purpose**: Track space capabilities — PRC, US, Russia, others.

| Source ID | Extract Columns | Role | Priority |
|-----------|----------------|------|----------|
| S01 (N2YO) | satellite_id, norad_id, operator, orbit_type, altitude_km, snapshot_time, lat_snap, lng_snap | GEO+STAT | P1 |
| T26 (IFRI) | constellation_name, planned_count, target_orbit, launch_timeline | STAT+INS | P1 |
| S04 (USSF) | us_asset_type, capability_domain, operational_status | STAT | P2 |
| S05 | constellation_name, satellites_launched, frequency_band | STAT | P2 |

**Output CSV schema**:
```
satellite_id, norad_id, satellite_name, operator_country,
orbit_type, altitude_km, inclination_deg, launch_date,
status, snapshot_time, lat_snap, lng_snap, source_id
```

---

## DOMAIN-8: Energy & Infrastructure [GLOBAL]

**Purpose**: Map energy dependency and strategic infrastructure.

| Source ID | Extract Columns | Role | Priority |
|-----------|----------------|------|----------|
| T34, T14 | project_name, country_a, country_b, capacity_bcm, status, investment_usd_bn | STAT+GEO | P1 |
| M07, Q05, Q06 | deal_date, volume_bcm, contract_duration_yr, payment_currency | STAT | P1 |
| T35, T36 | project_name, host_country, investment_usd_bn, debt_burden | STAT+INS | P2 |
| Q11 (EIA) | country, energy_type, production_mbpd, consumption_mbpd, year | STAT | P2 |
| T61 (Atlantic Council) | energy_route, strategic_risk, dependency_pct | INS | P2 |

**Output CSV schema**:
```
infra_id, project_name, project_type, country_a, country_b,
capacity_bcm_or_mw, status, investment_usd_bn, completion_year,
primary_stakeholder_country, source_id
```

---

## DOMAIN-9: Public Opinion & Economic Indicators

| Source ID | Extract Columns | Role | Priority |
|-----------|----------------|------|----------|
| Q01 | survey_year, country, favorable_pct, unfavorable_pct | STAT | P2 |
| T29, T30 | year, korea_china_trade_pct, industry, impact_direction | STAT | P2 |
| Q10 (World Bank) | country, year, gdp_usd_bn, trade_openness_pct | STAT | P2 |
| T38 | asean_country, tariff_pct, gdp_impact_pct | STAT | P3 |

---

## DOMAIN-10: US & Allied Military Posture [NEW]

**Purpose**: Map US and allied force posture globally — independent of PRC context.

| Source ID | Extract Columns | Role | Priority |
|-----------|----------------|------|----------|
| U01 | base_name, host_country, service_branch, personnel, base_category | STAT | P1 |
| U02–U05 | combatant_command, country, base_name, primary_mission, force_size | STAT+GEO | P1 |
| U06 (GlobalSecurity) | facility_name, country, lat, lng, description | GEO | P2 |
| U07 (RAND) | basing_rationale, strategic_function, cost_bn, political_risk | INS | P2 |
| U08 (Stimson) | country, us_personnel, base_count, agreement_type, year | STAT | P1 |
| U09 (IISS) | country, us_force_element, quantity, location | STAT | P1 |
| U12 (CRS) | deployment_name, legal_authority, personnel, duration | STAT+LEGAL | P2 |
| G41 (NATO) | article_invoked, member_state, commitment, year | LEGAL+INS | P2 |

**Output CSV schema**:
```
posture_id, combatant_command, country, base_name, base_type,
lat, lng, us_personnel_est, primary_mission, host_nation_agreement,
status, source_id, date_verified, confidence_level
```

---

## DOMAIN-11: Global Conflict Monitor [NEW]

**Purpose**: Track any active or emerging conflict globally, not limited to China-adjacent.

| Source ID | Use For | Extract Columns | Role | Priority |
|-----------|---------|----------------|------|----------|
| T50 (CSIS Tracker) | ALL | conflict_name, country, start_date, conflict_type, status | INS+STAT | P1 |
| T56 (CFR Tracker) | ALL | conflict_name, parties, type, casualties_est | INS+STAT | P1 |
| Q12 (ACLED) | ALL | event_date, country, lat, lng, actor1, actor2, fatalities | STAT+GEO | P1 |
| T52 (ISW) | Russia-Ukraine | daily_assessment, frontline_km_change, location | INS+GEO | P1 |
| T58 (RAND Iran) | Iran | nuclear_milestone, military_action, date | INS+STAT | P1 |
| W04 (ISW web) | ANY | real-time campaign assessment | INS | P2 |
| W08 (ACLED web) | ANY | real-time events, real-time fatalities | STAT+GEO | P1 |
| G42 (IAEA) | Iran/DPRK | enrichment_level_pct, facility_name, inspection_date | STAT+LEGAL | P1 |

**Output CSV schema**:
```
conflict_id, conflict_name, primary_country, secondary_countries,
conflict_type, start_date, status, fatality_est_total,
external_powers_involved, latest_development_date, source_id
```

---

## Source-to-Domain Quick Map (v2)

```
DOMAIN-0  (OSINT Fallback)    → W01-W14 [any topic not in registry]
DOMAIN-1  (PRC Strategy)      → G03-G09, G27, G28, T08, T03
DOMAIN-2  (Military OOB)      → T06,T07, U09, Q08, Q09, T51, T58, W09,W10
DOMAIN-3  (Facilities/Basing) → T09-T10,T31 [PRC]; U01-U08 [US]; W06 [others]
DOMAIN-4  (Arms Transfers)    → Q02, T06, U11, W10
DOMAIN-5  (Conflict Events)   → Q12, T52, T50, T21, T09, T33
DOMAIN-6  (Sanctions)         → G16-G19, G25, G40
DOMAIN-7  (Space)             → S01, T26, S04, S05
DOMAIN-8  (Energy)            → T34, T14, Q05, Q06, Q11
DOMAIN-9  (Opinion/Econ)      → Q01, T29, T30, Q10
DOMAIN-10 (US Posture)        → U01-U09, U12, G41
DOMAIN-11 (Global Conflicts)  → T50, T56, Q12, T52, T58, W04, W08, G42
```
