# NIGHT_VISION — Output Templates & Tag Reference

---

## STANDARD ANALYSIS REPORT TEMPLATE

Use this template for every `/night-vision` and `/RandomTopic` output.

```markdown
---
# NIGHT_VISION REPORT
**Topic:** [Event / Claim / Policy]
**Date:** YYYY-MM-DD
**Iteration:** [n / 3]
**Loop Status:** [ACTIVE | COMPLETE | NULL RESULT]
**Command:** [/night-vision | /RandomTopic]
---

## PLANNER SPEC
- Core Phenomenon: [1 sentence]
- Official Narrative: [L2-CLAIM tagged]
- Hypotheses to Test: H1, H2, (H3)
- Scope: [time range | actors | geography]
- Blind Spots Declared: [analyst bias risks]

---

## L0 — FRAME AUDIT
**Persona: Frame Auditor**

- **Official Narrative:** [L2-CLAIM: actor, date, source_type]
- **Analytical Object:** [what is actually being examined, separate from the narrative]
- **Analyst Priors:** [declared assumptions to be stress-tested]
- **L1-Knowledge Baseline:** [established historical/structural consensus on this domain]
- **Framing Actor:** [who set the frame, institutional incentive to do so]

*L0 Evaluator Score: [x/8] — [PASS | PARTIAL | FAIL per criterion]*

---

## L1 — DECONSTRUCTION
**Persona: Deconstruction Analyst**

### Claims Inventory
- [L2-CLAIM: actor, date, source_type]
- [L2-CLAIM: actor, date, source_type]

### Cui Bono Matrix
| Actor | Benefit if Believed | Time Horizon |
|-------|---------------------|--------------|
| [actor] | [benefit] | Short/Med/Long |

### 90-Day Timing Audit
[What changed in the 90-day window preceding this event? Why now?]

### Hypotheses
**H1:** [Actor] did [X]
- NOT because: [L2 official reason]
- BUT because: [structural reason]
- EVIDENCED BY: [data intersection]
- FALSIFICATION: This fails if [specific testable condition]

**H2:** [...]
- NOT because: [...]
- BUT because: [...]
- EVIDENCED BY: [...]
- FALSIFICATION: [...]

### Eureka Candidates
- [EUREKA CANDIDATE: "conventional view" vs. "structural finding"] ← if found
- L3 check performed — no divergence found ← if not found

*L1 Evaluator Score: [x/12] — [PASS | PARTIAL | FAIL per criterion]*

---

## L2 — SOURCE ARCHAEOLOGY
**Persona: Source Archaeologist**

### Source Chain: H1
- Hop 1 (Media): [source] → Claims: [...] | Added: [...] | Lost: [...]
- Hop 2 (Institutional): [source] → Claims: [...] | Added: [...] | Lost: [...]
- Hop 3 (Primary): [SOURCE: institution, date, document title] → Ground truth: [...]

### Source Chain: H2
[Same structure]

### Actor Structural Map
**Actor: [Name]**
- Classification: State | Non-state | Intermediary | Gray Zone
- Structural Pressure: [survival condition forcing this behavior]
- Path Dependency: [EVENT: actor, year, outcome — historical lock-in]
- Policy Gap: [stated position vs. observed behavior]
- Structural Essence: "This actor behaves this way because [structural condition], not because of [stated intention]."
- [L2-BIAS: low/medium/high — reason]

### L2 Source Bias Notes
| Source | Bias Level | Institutional Interest |
|--------|------------|----------------------|
| [source] | [L2-BIAS: H/M/L] | [what they gain from this narrative] |

### Flags
- [DATA GAP: reason] ← if primary doc unavailable
- [UNVERIFIED: reason] ← plausible but unconfirmed

*L2 Evaluator Score: [x/10] — [PASS | PARTIAL | FAIL per criterion]*

---

## L3 — TEMPORAL & ADAPTIVE ANALYSIS
**Persona: Temporal Strategist**

### Three-Scale Time Map
| Scale | Timeframe | Finding |
|-------|-----------|---------|
| Short-term | 1–3 yr | [direct trigger — what changed recently] |
| Medium-term | 10–30 yr | [institutional/policy formation context] |
| Long-term | 50+ yr | [structural geopolitical force] |

**Pattern Signal:** [Does behavior repeat across ≥2 scales? → structural force CONFIRMED / NOT CONFIRMED]

### Adaptive Loop
**Cycle 1:**
- Pressure: [external pressure on actor]
- Response: [actor's adaptation]
- New Equilibrium: [resulting state]

**Cycle 2:**
- Pressure: [new pressure from equilibrium]
- Response: [next adaptation]
- New Equilibrium: [resulting state]

**Actor Evolution Direction:** [more capable | more desperate | more entrenched]
**Hypothesis Reinforcement:** [does this loop support or contradict L2 structural hypothesis?]

### Interest Vector Map
| Actor | Strategic Goal | Intensity | Time Horizon |
|-------|---------------|-----------|--------------|
| [actor] | [goal direction] | H/M/L | Short/Med/Long |

**Intersection Zones (cooperation likely):**
- [actors] share interest in [goal]

**Collision Zones (conflict likely):**
- [actors] are zero-sum on [issue]

### L3 Conventional vs. Historical Pattern
- [L3-EUREKA: "what L2 says" vs. "what historical pattern shows"] ← if divergence found
- Pattern consistent with L2 narrative ← if no divergence

*L3 Evaluator Score: [x/10] — [PASS | PARTIAL | FAIL per criterion]*

---

## L4 — SYNTHESIS & MACRO INSIGHT
**Persona: Synthesis Critic**

### Falsification Test
- **Counterargument:** [strongest challenge to H1]
- **Evidence for counterargument:** [what supports this alternative]
- **Verdict:** SURVIVED / FAILED / MODIFIED
  - Reason: [why hypothesis holds, fails, or needs modification]

*(If FAILED → loop back to L1. Iteration [n/3].)*

### Scenario Matrix
| Scenario | Core Claim | Evidence Weight | Probability |
|----------|------------|-----------------|-------------|
| A: L2 Mainstream | [official explanation] | [sources] | x% |
| B: L1/L3 Structural | [structural explanation] | [sources] | y% |
| C: Black Swan | [low-prob, high-impact alternative] | [sources] | z% |
| Unknown | — | — | [remainder]% |

**[INSIGHT: structural explanation outperforms official narrative — reason]** ← if B > A in evidence weight

### Effect Chain
- **Intended (1st order):** [what actor aimed for]
- **Actual 1st order:** [what directly resulted]
- **2nd order:** [unintended structural change — must differ from 1st]
- **3rd order:** [systemic shift / tipping point] [SPECULATIVE]

### Eureka Signal Verdicts
| Signal | Status | Reason |
|--------|--------|--------|
| [EUREKA CANDIDATE from L1] | VALIDATED / INVALIDATED / UNRESOLVED | [evidence] |
| [L3-EUREKA from L3] | VALIDATED / INVALIDATED / UNRESOLVED | [evidence] |

### Macro Question
> If [structural force identified at L3] continues at its current trajectory,
> what tipping point emerges in [X] years,
> and what are the 3 earliest warning signal indicators?
>
> **Early signal indicators:**
> 1. [indicator]
> 2. [indicator]
> 3. [indicator]

*L4 Evaluator Score: [x/12] — [PASS | PARTIAL | FAIL per criterion]*

---

## EVALUATOR VERDICT (Aggregate)

| Layer | Score | Status | Notes |
|-------|-------|--------|-------|
| L0 | /8 | PASS/PARTIAL/FAIL | |
| L1 | /12 | PASS/PARTIAL/FAIL | |
| L2 | /10 | PASS/PARTIAL/FAIL | |
| L3 | /10 | PASS/PARTIAL/FAIL | |
| L4 | /12 | PASS/PARTIAL/FAIL | |
| **TOTAL** | **/16*** | | *Normalized to /16 |

**Threshold:** ≥13/16 → Loop Complete | <13 → Identify weakest layer and revise

---

## RETRO REPORT
**Persona: Meta-Analyst**

- **Loop:** [n] | **Hypothesis:** [SURVIVED / FAILED / MODIFIED]
- **Weakest Layer:** [layer] — [specific reason it was weakest]
- **Open Flags:** [DATA GAP count: n] | [UNVERIFIED count: n]
- **Eureka Signals:** VALIDATED [n] | INVALIDATED [n] | UNRESOLVED [n]
- **Data That Would Change Most:** [specific source, dataset, or document — actionable]
- **Framework Note:** [optional — was any Sprint Contract criterion misleading or insufficient?]

---
*End of Report | NIGHT_VISION for Claude v2.0*
```

---

## TAG QUICK REFERENCE

| Tag | Meaning | When |
|-----|---------|------|
| `[L2-CLAIM: actor, date]` | Unverified official/media statement | L0 + L1: all claims |
| `[SOURCE: inst, date, doc]` | Verified primary source | L2: all statistics |
| `[EVENT: actor, year, outcome]` | Historical claim | L2–L3: all history |
| `[L2-BIAS: H/M/L — reason]` | Source bias level | L2: per source |
| `[DATA GAP: reason]` | Data unavailable | Any layer |
| `[UNVERIFIED: reason]` | Plausible but unconfirmed | Any layer |
| `[EUREKA CANDIDATE: …]` | L1 divergence from mainstream | L1-E |
| `[L3-EUREKA: …]` | L3 historical pattern contradicts L2 | L3-D |
| `[INSIGHT: reason]` | Structural > mainstream in evidence | L4 scenario |
| `[SPECULATIVE]` | 3rd order / long-horizon claim | L4-C |
| `[NULL RESULT: reason]` | Hypothesis failed all 3 iterations | Loop end |

---

## /RandomTopic OUTPUT HEADER

When executing `/RandomTopic`, prepend this block before the standard report:

```markdown
---
# NIGHT_VISION — RandomTopic
**CSIS Source:** [URL of fetched page]
**Fetch Date:** YYYY-MM-DD
**Headlines Considered:**
1. [headline 1]
2. [headline 2]
3. [headline 3]
4. [headline 4]
5. [headline 5]

**Selected:** [headline n]
**Selection Rationale:** [Why this one — what makes it analytically rich?
  Prefer: active geopolitical tension, technology-military-economic intersection,
  multilateral agreement stress, or structural power shift]
---
[Standard report follows]
```
