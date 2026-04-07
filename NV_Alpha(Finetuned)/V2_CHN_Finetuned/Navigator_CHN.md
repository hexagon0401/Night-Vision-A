# NAVIGATOR_CHN.MD v1.0 — China Intelligence Search Routing (Patch)
# Extends Navigator.md — load Navigator.md FIRST, then apply this patch
# Scope: PRC-specific search paths, Korean perspective, PRC proxy behavior
# Token rule: Load only relevant section. English only.

---

## LOAD ORDER
```
1. Navigator.md (base routing logic)
2. Source_Finetuned_CHN.md (CHN source registry)
3. Navigator_CHN.md (this file — CHN-specific overrides and additions)
```

---

## CHN-SPECIFIC CLASSIFY OVERRIDES

When topic matches below, OVERRIDE the base Navigator.md CLASSIFY step:

```
PRC FYP / policy text (Chinese original)
  → PRIMARY: CG01-CG06 (gov.cn full text) + G03-G08 (English summaries)
  → Do NOT rely on G05-G08 alone for verbatim PRC policy wording

PRC military (current)
  → PRIMARY: T06 (2024 DoD report) — supersedes T07 for current figures
  → SECONDARY: T17 (CSIS Purge DB) for internal political health
  → TERTIARY: T23, T24, T25 for doctrine/structure analysis

PRC maritime behavior (ECS/SCS)
  → PRIMARY: T09, T21, T31, S03 (AMTI)
  → EXTEND: CT03 (JIIA 2025 bargaining strategy) + CT04 (Diplomat 2024 activity record)
  → If SCS: T09 + S03 (AMTI interactive map)
  → If ECS/Senkaku: T09 + T22 + T40 + CT03 + CT04 + G23

Korea-China relations
  → ECONOMIC: T29, Q07, K04, K05
  → SENTIMENT: Q01, QC01, QC02, K01
  → SECURITY: T05, T37, CT05
  → FDI/INDUSTRY: K02, K04
  → SANCTIONS: G14, CG09

PRC transnational crime (SE Asia)
  → PRIMARY: CT01 (Jason Tower testimony) + CT02 (USCC 2025 report)
  → LEGAL: G19 (OFAC) + G25 (DOJ)
  → CASE: T04, T39, M11-M13, G15, CG08
  → CONFIDENCE: CT01+CT02 = High (B+B cross-validated)

China-Iran-DPRK nexus
  → PRIMARY: T02, T03 (USCC)
  → SANCTIONS: G16, G17 (Iran) + G18 (DPRK)
  → NUCLEAR: G42 (IAEA)
  → STRATEGY: T58 (RAND Iran)

PRC BRI / debt trap
  → SOUTH ASIA: T35 (Nepal-IDSA) + T36 (CESIF) + M19 + M20
  → GENERAL: T34 (energy BRI) + W01 (CSIS search)

PRC arms exports
  → PRIMARY: Q02 (SIPRI) + T06 (DoD China Military)
  → EXTEND: QC03 (SIPRI 2024 fact sheet) for latest transfer trend
  → CASE: M02 (Thai-Cam weapons), M03 (PH shipyard)
```

---

## CHN SEARCH QUERY TEMPLATES

```
PRC FYP analysis:
  "[FYP number] five year plan GDP target [sector]"
  site:gov.cn OR site:ndrc.gov.cn

PLA order of battle:
  "PLA [branch] strength [year]" site:defense.gov
  "China military power [year]" site:media.defense.gov

PLA purges:
  "China PLA purge [name/unit] [year]" site:chinapower.csis.org

ECS incidents (recent):
  "Senkaku China [year]" site:thediplomat.com OR site:amti.csis.org

Korea-China trade/FDI:
  "Korea China FDI withdrawal [year]" site:kdi.re.kr OR site:kiep.go.kr

PRC scam centers / TOC:
  "China scam center Southeast Asia [year]" site:uscc.gov
  "China transnational crime [country] [year]" site:uscc.gov

PRC maritime legal claims:
  "China ECS SCS [year]" site:cfr.org/timeline OR site:amti.csis.org

China public opinion (Korea/global):
  "China favorability [country] [year]" site:pewresearch.org
```

---

## CHN TIER PRIORITY ADJUSTMENTS

| Data Type | Base Navigator | CHN Override |
|-----------|---------------|-------------|
| PRC FYP verbatim | G05-G08 (A) | CG01-CG06 (A) — Chinese original preferred |
| PLA current strength | T06+T07 (A+A) | T06 only (2024) — T07 is baseline only |
| ECS maritime 2024+ | T09, T21 | + CT04 mandatory for 2024+ incidents |
| Korea-China sentiment | Q01 | + K01 for Korea-specific granularity |
| China-Korea FDI | T29, Q07 | + K02 for post-2022 withdrawal data |
| USCC TOC China | T04 (general) | CT01+CT02 preferred (more granular 2025) |
| PRC arms exports | Q02 (A) | + QC03 (latest SIPRI fact sheet) |
| Pew China views | Q01 | + QC01 (2024) + QC02 (2025) for latest |

---

## CHN MULTI-SOURCE VALIDATION MATRIX

| Intelligence Type | Required Sources | Min Confidence |
|-------------------|-----------------|----------------|
| PRC FYP targets | CG0x (primary) + G0x (English cross) | High |
| PLA capability claim | T06 + one of (T23/T24/T25) | High |
| PLA purge impact | T17 + T06 assessment | Medium |
| ECS/SCS incident | S03/AMTI + CT04 + T21 | High |
| PRC sanctions (Korea) | G14 + CG09 (official PRC) | High |
| China TOC (SE Asia) | CT01 + CT02 (both required) | High |
| China-Iran link | T02 + T03 + G16/G17 | High |
| Korea anti-China | Q01 + K01 | Medium |
| BRI debt trap | T35/T36 + M19/M20 | Medium |

---

## CHN OODA LOOP (China-Specific)

```
OBSERVE → Parse: PRC actor + target country/domain + behavior type + time range
ORIENT  →
  IF behavior = military buildup/purge     → T06, T17, T23-T25
  IF behavior = maritime coercion          → T09, T21, T31, CT03, CT04, S03
  IF behavior = economic coercion (Korea)  → G14, CG09, K01, K02, T05, T37
  IF behavior = proxy/TOC operations       → CT01, CT02, G19, G25, T04
  IF behavior = energy leverage            → T14, T34, Q05, Q06
  IF behavior = BRI/infrastructure         → T35, T36, M19, M20
  IF behavior = space competition          → T26, S01, S05
  IF behavior = policy/FYP trajectory      → CG01-CG06, G03-G08, T08

DECIDE → Apply CHN Tier Priority table above
ACT    → Extract → cross-validate per CHN Validation Matrix → anti-hallucination gate
         → pass to Connector_CHN.md for pattern matching (P-01 through P-06)

LOOP: If confidence <Medium after 2 sources → escalate to W01/W02/W07 OSINT
```

---

## CHN KNOWLEDGE GAP FLAGS

Common gaps in China intelligence — always check these before output:

```
GAP-01: PRC FYP implementation delta
  What's missing: Actual implementation vs stated targets
  Recommended: Compare CG0x targets against Q08 (SIPRI defense spending) + Q10 (World Bank GDP)

GAP-02: PLA operational readiness post-purge
  What's missing: Post-purge exercise frequency data
  Recommended: T06 + T17 + W01/CSIS search "PLA exercise [year] after purge"

GAP-03: Real-time ECS intrusion data
  What's missing: Daily/weekly vessel tracking
  Recommended: S03 (AMTI) + S10 (AIS MarineTraffic) + CT04

GAP-04: Korea-China FDI post-2024
  What's missing: Latest FDI withdrawal figures
  Recommended: K02 + search site:kdi.re.kr "한국기업 중국 [year]"

GAP-05: PRC scam center financing network
  What's missing: Financial flows from scam compounds to PRC entities
  Recommended: CT01 + CT02 + M11-M13 (RFA Prince Group) + G19 (OFAC)
```
