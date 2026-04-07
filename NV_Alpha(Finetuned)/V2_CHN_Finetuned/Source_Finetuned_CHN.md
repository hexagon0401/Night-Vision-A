# SOURCE_FINETUNED_CHN.MD v1.0 — China-Specialized Intelligence Source Registry
# Extends Source.md v2 — DO NOT duplicate existing IDs
# Scope: PRC strategy, PLA, maritime, Korea-China, PRC proxy/influence
# For AI consumption. English only.

## HOW TO USE
- This file EXTENDS Source.md — load in addition to, not instead of, Source.md
- All original IDs (G/T/U/S/Q/W/M) remain valid from Source.md
- New IDs in this file use CHN-prefix to avoid collision
- Priority: Source.md registered sources → CHN-prefix sources → W-tier OSINT

---

## DELTA ANALYSIS: Source.md Coverage vs. 중국_데이터.md

### Already Registered in Source.md (confirmed coverage)
```
G01-G09, G14-G19, G21-G25, G27-G30     — all confirmed present
T01-T25, T29-T33, T37-T41              — all confirmed present
T34 (Columbia SIPA / Power of Siberia 2) — confirmed
S01-S02, S05                            — confirmed
Q01-Q08, Q05-Q06                        — confirmed (Q01 has new 2024-2025 waves)
M01-M20                                 — all confirmed present
```

### NEW Sources Identified in 중국_데이터.md (not in Source.md)
See CAT-CHN-KOR, CAT-CHN-GOV, CAT-CHN-THINK below.

---

## CAT-CHN-KOR: Korean Perspective on China (NEW)

| ID | Short Title | Institution | URL | Topic Domain | Tier |
|----|-------------|-------------|-----|-------------|------|
| K01 | KDI: Korean Public Anti-China Sentiment Study | KDI Korea | eiec.kdi.re.kr | Korea public perception of China, urban diplomacy | B |
| K02 | KIET: Korean Firms China Withdrawal Analysis | KIET (ii.re.kr) | ii.re.kr | Korean FDI withdrawal from China, reshoring | B |
| K03 | CASS: China-Korea Trade 30 Years | Chinese Academy of Social Sciences | niis.cass.cn | China-Korea bilateral trade historical | C |
| K04 | KDI: Korea Opportunities from China Structural Change | KDI Korea | kdi.re.kr/research | China structural shift → Korea industry | B |
| K05 | KIEP: China 11th FYP Analysis for Korea | KIEP Korea | kiep.go.kr | China FYP → Korea economic impact | B |

**Note**: K01 is distinct from T29 (structural change) and Q07 (industrial impact).
K01 covers sentiment/perception; T29/Q07 cover economic statistics.

---

## CAT-CHN-GOV: PRC Government Extended Sources (NEW)

| ID | Short Title | Issuer | URL | Topic Domain | Tier |
|----|-------------|--------|-----|-------------|------|
| CG01 | 10th FYP Full Text (Chinese) | PRC State Council | gov.cn/gongbao/2001 | PRC 10th FYP original text | A |
| CG02 | 11th FYP Full Text (Chinese) | PRC State Council | gov.cn/gongbao/2006 | PRC 11th FYP original text | A |
| CG03 | 12th FYP Full Text (Chinese) | PRC State Council | zh.wikisource.org | PRC 12th FYP original text | A |
| CG04 | 13th FYP Full Text (Chinese) | PRC State Council | gov.cn/xinwen/2016 | PRC 13th FYP original text | A |
| CG05 | 14th FYP Full Text (Chinese) | PRC State Council | gov.cn/xinwen/2021 | PRC 14th FYP original Chinese | A |
| CG06 | 15th FYP CPC Proposal (Chinese) | CPC Central | gov.cn/zhengce/202510 | 15th FYP full Chinese text | A |
| CG07 | PRC Defense White Paper 2019 (English) | PRC State Council | english.www.gov.cn | Full English text defense white paper | A |
| CG08 | PRC Cross-Border Gambling Crackdown Notice | PRC State Council | gov.cn/zhengce/2020 | PRC law enforcement, border crime | A |
| CG09 | PRC MOFCOM Hanwha Countermeasures Statement | PRC MOFCOM | english.mofcom.gov.cn | PRC sanctions ROK defense industry | A |

**Usage note**: CG01-CG06 are PRIMARY LANGUAGE sources for FYP analysis.
When cross-referencing G05-G08 (English summaries) in Source.md, use CG01-CG06 for verbatim PRC text.

---

## CAT-CHN-THINK: China-Focused Think Tank Extensions (NEW)

| ID | Short Title | Institution | Topic Domain | Tier |
|----|-------------|-------------|-------------|------|
| CT01 | USCC: China-Linked TOC in SE Asia (Jason Tower) | USCC | China transnational crime, US national security | B |
| CT02 | USCC: China Exploitation of Scam Centers 2025 | USCC | PRC role in SE Asia scam compound economy | B |
| CT03 | JIIA: ECS Joint Development & China Bargaining 2025 | JIIA Japan | China-Japan maritime negotiation strategy | B |
| CT04 | Diplomat: China Record ECS Activity 2024 | The Diplomat | Senkaku/Diaoyu intrusion frequency data | D |
| CT05 | Carnegie: THAAD China-Korea-US Perceptions | Carnegie | Korea-China-US missile defense trilateral | B |

**Note**: CT01/CT02 are UPDATED/EXPANDED versions of T04.
CT01 is Jason Tower's congressional testimony (2025-03) with granular TOC data.
CT02 is the USCC institutional report (2025-07) separate from testimony.
Use CT01+CT02 together for maximum coverage; they cross-validate each other (B+B = High confidence).

---

## CAT-CHN-STAT: China-Specific Statistical Extensions (NEW)

| ID | Short Title | Source | Data Type | Tier |
|----|-------------|--------|-----------|------|
| QC01 | Pew 2024: China Impact on National Economy (35 countries) | Pew Research | China economic impact perception, 35-country | B |
| QC02 | Pew 2025: Views of China and Xi Jinping | Pew Research | China favorability + Xi Jinping approval 2025 | B |
| QC03 | SIPRI: International Arms Transfers 2024 (fact sheet) | SIPRI | Global arms transfer trends, PRC exports | A |

**Note**: QC01-QC02 EXTEND Q01 (Pew 2002-2025 database). Load Q01 for time-series baseline,
QC01/QC02 for latest survey wave details. Always cite specific survey year in source_id field.

---

## CHINA-SPECIFIC SOURCE ROUTING TABLE

### By Intelligence Need

| Need | Primary (Source.md) | CHN Extension | Confidence Ceiling |
|------|--------------------|--------------|--------------------|
| PRC FYP text (Chinese) | G05-G08 (English) | CG01-CG06 | High (A-tier) |
| PRC defense strategy | G09, T06, T07 | CG07 | High |
| PLA purges/internal politics | T17 | — | Medium |
| PLA military reform | T24 | T06, T07 | High |
| PLA Rocket Force | T23 | T06 | Medium-High |
| PRC maritime (ECS/SCS) | T09, T21, T31 | CT03, CT04 | High |
| PRC overseas basing | T10, T32 | — | Medium |
| China-Korea relations | T29, T30, T37, T05 | K01-K05, CT05 | High |
| Korea anti-China sentiment | Q01 | K01 | Medium |
| Korean FDI China withdrawal | T29, Q07 | K02 | Medium |
| PRC transnational crime | T04, G19, G25 | CT01, CT02 | High (B+B) |
| PRC gambling/cybercrime law | G15 | CG08 | High |
| China-Iran nexus | T02, T03, G16, G17 | — | High |
| PRC sanctions (ROK) | G14 | CG09 | High |
| China arms exports | Q02, T06 | QC03 | High |
| Public perception of China | Q01 | QC01, QC02 | High |
| China LEO/space | T26, S01, S05 | — | Medium |

---

## PRC BEHAVIOR PATTERN REGISTRY

> Pre-mapped pattern signatures for Connector.md inference engine.
> Add new patterns as they emerge — do not delete confirmed patterns.

### P-01: Salami Tactics (Maritime)
```
Indicators: ECS/SCS → incremental facility construction + ADIZ incursion frequency increase
Sources: T09, T31, CT03, CT04, S03
Trigger threshold: 3+ consecutive months of increased intrusion frequency (CT04)
Cross-reference: T21 CFR timeline for historical baseline
```

### P-02: PLA Purge → Readiness Degradation
```
Indicators: T17 purge count increase → 6-18 month lag → PLA exercise cancellation/delay
Sources: T17 (CSIS PLA Purges DB), T06/T07 (DoD China Military Report)
Logic: Purge in rocket force/navy → degraded command authority → reduced readiness
Note: Do NOT assume linear causation — flag as "POSSIBLE" minimum
```

### P-03: PRC Economic Coercion (Korea Pattern)
```
Indicators: G14 (MOFCOM sanctions) + K02 (FDI withdrawal pressure) + T05 (THAAD-type response)
Sources: G14, T05, K01 (sentiment), K02 (economic), T37, CT05
Trigger: Major ROK security decision (US missile defense, alliance exercise)
Expected response window: 30-90 days post-trigger
```

### P-04: China-Iran Sanctions Evasion
```
Indicators: G16-G17 (OFAC Iran) + T02 (USCC China-Iran) + T03 (Axis of Autocracy)
Sources: G16, G17, T02, T03, G18 (if DPRK triangle involved)
Cross-domain: D4 arms transfer + D6 sanctions entity links
```

### P-05: PRC SE Asia Crime Proxy Network
```
Indicators: CT01+CT02 (USCC TOC reports) + G19 (OFAC cybercrime) + M11-M13 (RFA Prince Group)
Sources: CT01, CT02, G19, G25, T04, T39
Pattern: PRC state ambiguity → plausible deniability for scam center operations
```

### P-06: BRI Debt Trap / Infrastructure Leverage
```
Indicators: T35 (Nepal-IDSA) + T36 (CESIF) + M19 (Pokhara) + M20 (Budhi Gandaki)
Sources: T35, T36, M19, M20
Pattern: Overpriced BRI project → debt accumulation → political leverage
```

---

## URL REGISTRY (CHN-specific, verified)

```
gov.cn FYP full texts:
  10th: https://www.gov.cn/gongbao/content/2001/content_60699.htm
  11th: https://www.gov.cn/gongbao/content/2006/content_268766.htm
  13th: https://www.gov.cn/xinwen/2016-03/17/content_5054992.htm
  14th: https://www.gov.cn/xinwen/2021-03/13/content_5592681.htm
  15th: https://www.gov.cn/zhengce/202510/content_7046052.htm

DoD China Military Reports:
  2024: https://media.defense.gov/2024/Dec/18/2003615520/-1/-1/0/MILITARY-AND-SECURITY-DEVELOPMENTS-INVOLVING-THE-PEOPLES-REPUBLIC-OF-CHINA-2024.PDF
  2023: https://media.defense.gov/2023/Oct/19/2003323409/-1/-1/1/2023-MILITARY-AND-SECURITY-DEVELOPMENTS-INVOLVING-THE-PEOPLES-REPUBLIC-OF-CHINA.PDF

USCC 2025:
  Executive Summary: https://www.uscc.gov/sites/default/files/2025-11/2025_Executive_Summary.pdf
  TOC Testimony: https://www.uscc.gov/sites/default/files/2025-03/Jason_Tower_Testimony.pdf
  Scam Centers: https://www.uscc.gov/sites/default/files/2025-07/Chinas_Exploitation_of_Scam_Centers_in_Southeast_Asia.pdf
  China-Iran: https://www.uscc.gov/sites/default/files/2021-06/China-Iran_Relations.pdf
  THAAD: https://www.uscc.gov/sites/default/files/Research/Report_China%27s%20Response%20to%20THAAD%20Deployment%20and%20its%20Implications.pdf

Pew 2024-2025:
  2024 economy impact: https://www.pewresearch.org/global/2024/07/09/
  2025 Xi Jinping: https://www.pewresearch.org/global/2025/07/15/views-of-china-and-xi-jinping-2025/

CSIS China Power (PLA Purges):
  DB: https://chinapower.csis.org/data/chinese-pla-military-purges/
  Analysis: https://chinapower.csis.org/china-pla-military-purges/
```

---

## ANTI-HALLUCINATION NOTES (CHN-specific)

1. PRC FYP targets: ALWAYS cite specific plan period + gov.cn source (CG01-CG06)
   Do NOT cite GDP targets from memory — they change between plans
2. PLA order of battle: T06 (2024) is primary; do not use T07 (2023) for current figures
3. CSIS PLA Purge DB: Live database — always note access date; counts change
4. Pew favorability: Use Q01 for time-series; QC01/QC02 for latest wave
   Note: 2025 survey wave covers different countries — do not extrapolate
5. Korea-China trade: K02/K04 cover recent FDI withdrawal trends not captured in T29
   T29 covers structural change up to ~2022; K02 covers post-THAAD FDI exit
6. PRC maritime incidents: CT04 (Diplomat 2024) covers record intrusion frequency
   Do not cite T21 CFR timeline for 2024+ incidents — use CT04 + S03 (AMTI)
