# NAVIGATOR.MD v1.0 — Source Routing & Search Logic Engine
# Role: Define optimal search paths using Source.md registry
# Token rule: Load ONLY sections relevant to active query. English only.

---

## CORE SEARCH ALGORITHM

```
INPUT: [topic] + [actor/country] + [data_type] + [time_range]

STEP 1 — CLASSIFY
  Military capability/OOB     → CAT-THINK (T06,T07,U09,Q08) + CAT-GOV (G09,G28)
  Facility/basing             → CAT-US (U01-U05) + CAT-THINK (T09,T10) + CAT-GEO (S03,S09)
  Active conflict             → CAT-THINK (T50,T52,T56) + CAT-STAT (Q12) + CAT-OSINT (W04,W08)
  Arms transfer               → CAT-STAT (Q02) + CAT-US (U11) + CAT-OSINT (W10)
  Sanctions/entity            → CAT-GOV (G16-G19,G40) + CAT-THINK (T04,T19)
  Space/satellite             → CAT-GEO (S01,S04) + CAT-THINK (T26)
  Energy/infrastructure       → CAT-THINK (T34,T61) + CAT-STAT (Q11)
  Strategy/policy             → CAT-GOV (G03-G09,G27,G28) + CAT-THINK (T01,T08)
  NOT IN REGISTRY             → CAT-OSINT (W01-W14) → OSINT_FALLBACK

STEP 2 — TIER SELECTION (strict priority order)
  A → B → C → D/E → W
  Minimum 2 sources for STAT/GEO data.
  Single A-tier acceptable for LEGAL/official records only.

STEP 3 — FETCH SEQUENCE
  3a. Pull primary source (highest tier available)
  3b. Extract target fields per Relation.md DOMAIN schema
  3c. Cross-validate with secondary source
  3d. Flag discrepancies → set confidence_level accordingly
  3e. If primary unavailable → escalate tier down OR trigger OSINT_FALLBACK

STEP 4 — ANTI-HALLUCINATION GATE (mandatory before output)
  [ ] Is every data point traceable to a source_id? → NO = NULL + "Unverified"
  [ ] Are coordinates from a registered/OSINT source? → NO = "pending_verification"
  [ ] Are numeric values retrieved, not estimated? → NO = null field
  [ ] Does confidence_level reflect actual cross-validation count? → enforce
  FAIL on any check → mark field null, log reason in notes column
```

---

## SOURCE PRIORITY MATRIX

| Data Need | Primary | Secondary | Fallback |
|-----------|---------|-----------|---------|
| PRC military | T06 (A) | T07, Q08 | W09, W10 |
| US bases (global) | U01 (A) | U02-U05 (A) | U08, U06 |
| Any country base | U06/U08 (B/C) | W06, W09 | Web search |
| Active conflicts | T50, Q12 (B) | T56, W08 | W04 |
| Russia-Ukraine | T52 (B) | Q12, G43 | W04 |
| Arms transfers | Q02 (A) | U11, W10 | W12 |
| Sanctions | G16-G19, G40 (A) | G25 | T04 |
| Nuclear/WMD | G42, T53, T59 (A/B) | T58 | W02 |
| Iran | T58, G16-G17 (A/B) | G42 | W04 |
| Africa | T60, U04 (B/A) | Q12 | W08 |
| Energy | Q11 (A), T34, T61 (B) | T14 | W01 |
| Space | S01, S04 (A/C) | T26 | S08 |

---

## OSINT FALLBACK PROTOCOL

```
TRIGGER: No registered source matches topic/country/event

QUERY CONSTRUCTION:
  "[subject] [country] [year] site:[W-source domain]"
  OR "[subject] [country] [year] filetype:pdf"

SOURCE SELECTION BY TOPIC:
  Military/defense   → W02(RAND), W06(GlobalSecurity), W09(IISS), W10(Jane's)
  Conflict/ops       → W04(ISW), W08(ACLED), W07(Diplomat)
  Strategy/policy    → W01(CSIS), W02(RAND), W03(CFR)
  Nuclear/WMD        → W02(RAND), W03(CFR)
  Energy             → Q11(EIA live), W01(CSIS)
  General geopolitics → W01, W02, W03

CONFIDENCE ASSIGNMENT:
  W02/W03/W04/W08/W09/W10 (single)    → "Medium"
  2+ W-tier cross-validated            → "High"
  W07/W11-W14 (single)                → "Low"
  No usable result                     → null rows + source_access: "failed"

OUTPUT: Assign source_id = W##, record source_url, proceed to Connector.md
```

---

## OODA SEARCH LOOP

```
OBSERVE  → Parse: topic + actor + region + time_range + output_type
ORIENT   → Run CLASSIFY → select DOMAIN (Relation.md) → select source tier
DECIDE   → If primary unavailable: cascade to next tier → if all fail: OSINT
ACT      → Extract → validate → anti-hallucination gate → pass to Connector.md

LOOP CONDITION: Repeat if:
  - Sources contradict → add third source for tiebreak
  - Data gap >30% of required fields → escalate to next source tier
  - Time range not covered → search for adjacent period + flag in notes
```

---

## SEARCH EFFICIENCY RULES

1. Load Source.md ONE category block at a time — never full file
2. Load Relation.md ONE DOMAIN section at a time
3. Cache source results within session — do not re-fetch same source
4. For multi-country queries: batch by region, not by source
5. Stop at 2 validated sources for STAT; 3 for high-stakes GEO/WMD data
6. Record all access attempts (success or fail) in source_access field
