# NIGHT_VISION — Framework Reference
> Full L0–L4 Layer Instructions, Sprint Contracts, Evaluator Rubrics

---

## TABLE OF CONTENTS
1. [LAYER 0 — Frame Setting](#l0)
2. [LAYER 1 — Deconstruction](#l1)
3. [LAYER 2 — Source Archaeology](#l2)
4. [LAYER 3 — Temporal & Adaptive Analysis](#l3)
5. [LAYER 4 — Synthesis & Macro Insight](#l4)
6. [Evaluator Master Rubric](#rubric)

---

## LAYER 0 — Frame Setting {#l0}
**Persona: Frame Auditor**
**Purpose:** Eliminate analyst bias before touching any data.

### Generator Tasks
- Identify who framed this event as "important" and why
- Separate: Official Narrative (`[L2-CLAIM]`) vs. Analytical Object (what is actually being examined)
- Declare analyst's prior assumptions explicitly — these will be stress-tested
- State the L1-Knowledge baseline: what is the established, historically-grounded consensus on this domain?

### Sprint Contract
| Criterion | Pass Condition |
|-----------|---------------|
| Narrative source identified | Named actor/institution credited |
| Analyst priors declared | ≥1 explicit assumption listed |
| L1-Knowledge baseline stated | Established consensus articulated |
| Framing motive examined | Cui bono check attempted |

### Evaluator Rubric
```
PASS / FAIL / PARTIAL per criterion:
- Analyst conflates [L2-CLAIM] with fact → FAIL (block L1 entry)
- No bias declaration → FAIL (block L1 entry)
- No L1-Knowledge baseline → PARTIAL (flag; allow continuation)
- Framing motive is "unknown" without attempt → PARTIAL
```

**Hallucination Guard:** All named sources at L0 → tag as `[L2-CLAIM: actor, date]`. No source is "fact" at this stage.

**Structured Output to L1:**
```json
{
  "official_narrative": "[L2-CLAIM tagged statements]",
  "analyst_priors": ["prior_1", "prior_2"],
  "L1_baseline": "established domain understanding",
  "framing_actor": "who set the frame and why"
}
```

---

## LAYER 1 — Deconstruction {#l1}
**Persona: Deconstruction Analyst**
**Purpose:** Dismantle official narrative; generate falsifiable hypotheses; apply 3-knowledge-layer thinking.

### Generator Tasks

**1-A. Official Narrative Inventory**
Tag ALL public statements:
```
[L2-CLAIM: actor, date, source_type (media/gov/NGO/think-tank)]
```

**1-B. Cui Bono Matrix**
```
For each claim:
  Actor → Benefit if believed → Time Horizon (short/medium/long)
```

**1-C. Timing Audit**
Examine the 90-day window before this event:
- What policy, economic, or geopolitical change occurred?
- Why this moment specifically? What pressure or opportunity existed?

**1-D. Data Intersection → Hypothesis Formation**
Find ≥2 independent variables whose overlap creates a hypothesis:
```
Hypothesis Template:
H[n]: [Actor] did [X]
      NOT because of: [L2 official reason]
      BUT because of: [structural reason from L1/L3 knowledge]
      EVIDENCED BY: [data intersection of ≥2 variables]
      FALSIFICATION: This hypothesis fails if [specific, testable condition]
```

**1-E. Layer 3 First-Principles Check**
Ask: Does any hypothesis contradict what "everyone knows" (L2-Knowledge)?
- If YES → flag: `[EUREKA CANDIDATE: "conventional view" vs. "structural finding"]`
- If NO → document: "L3 check performed — no divergence found"

### Sprint Contract
| Criterion | Pass Condition |
|-----------|---------------|
| All claims tagged [L2-CLAIM] with actor+date | 100% labeled |
| Cui bono completed for each claim | ≥1 beneficiary per claim |
| ≥1 falsifiable hypothesis | Must include explicit falsification condition |
| Data intersection documented | ≥2 independent variables crossed |
| 90-day timing audit completed | Window examined with specific findings |
| L3 first-principles check documented | Performed and result recorded |

### Evaluator Rubric
```
- Any untagged claim present → FAIL
- Hypothesis has no falsification condition → FAIL
- Timing audit absent → PARTIAL
- L3 check skipped (not just "no Eureka found") → PARTIAL
- [DATA GAP] declared where data unavailable → ACCEPTABLE (do not penalize)
```

**Structured Output to L2:**
```json
{
  "hypotheses": [
    {"id": "H1", "claim": "...", "evidence": "...", "falsification": "..."}
  ],
  "L2_claims": ["[L2-CLAIM: ...]"],
  "cui_bono_map": {"actor": "benefit"},
  "timing_audit": "90-day finding",
  "eureka_candidates": ["[EUREKA CANDIDATE: ...]"]
}
```

---

## LAYER 2 — Source Archaeology {#l2}
**Persona: Source Archaeologist**
**Purpose:** Trace every hypothesis to primary documents; expose actor structural pressures.

### Generator Tasks

**2-A. Source Chain (3-hop minimum)**
For each hypothesis, trace:
```
Hop 1: News article / blog post / social media
  → What did they claim?
  → What was ADDED in translation from the source?
  → What was LOST or distorted?

Hop 2: Institutional report / think-tank / academic paper
  → Same questions

Hop 3: Primary document (government report, dataset, legal filing, treaty text, SEC filing, UN document)
  → This is the ground truth. Cite: [SOURCE: institution, date, document title]
```
If primary document unreachable → `[DATA GAP: specific reason — document classified / paywalled / not yet public]`

**2-B. Actor Structural Map**
For each key actor:
```
Classification: State | Non-state | Intermediary | Gray Zone
Structural Pressure: What SURVIVAL CONDITION forces this behavior?
  (Must be structural/incentive-based — "they wanted to" is INVALID)
Path Dependency: What historical lock-in constrains their options?
  Cite: [EVENT: actor, year, outcome that created the constraint]
Policy Gap: Official stated position vs. observed behavior — what is the delta?
Structural Essence: "This actor behaves this way because [structural condition],
                    NOT because of [stated intention]."
```

**2-C. L2 Source Scrutiny**
For EVERY Layer 2 source used:
- Institutional bias: What is this organization's funding model and ideological alignment?
- Self-interest: Does this source benefit from the narrative it promotes?
- Pattern fit: Does this source's claim align with or contradict L1-Knowledge patterns?
- Tag bias level: `[L2-BIAS: low/medium/high — reason]`

**2-D. Structural Essence Statement**
One definitive sentence per key actor:
> "This actor behaves this way because [structural condition], not because of [stated intention]."
This statement must be derivable from the source chain, not from inference alone.

### Sprint Contract
| Criterion | Pass Condition |
|-----------|---------------|
| Source chain: ≥3 hops per hypothesis | Hops documented with info delta |
| Primary document found | ≥1 per hypothesis; [DATA GAP] if unavailable |
| Actor structural pressure identified | Structural, not intentional |
| L2 bias examined for all sources | Each major source has `[L2-BIAS]` tag |
| Path dependency cited | ≥1 historical precedent with `[EVENT: actor, year]` |
| Structural essence stated | One sentence per key actor |

### Evaluator Rubric
```
- Hypothesis supported only by secondary journalism → FAIL
- Actor motive stated as intention ("they wanted to") → FAIL
- L2 source used without bias examination → PARTIAL
- Primary source found but not connected to hypothesis → PARTIAL
- [UNVERIFIED] / [DATA GAP] tags present → ACCEPTABLE (preserve; flag for human review)
```

**Structured Output to L3:**
```json
{
  "verified_sources": [{"claim": "...", "source": "[SOURCE: ...]", "hops": 3}],
  "actor_map": [{"actor": "...", "structural_pressure": "...", "essence": "..."}],
  "L2_bias_notes": [{"source": "...", "bias": "[L2-BIAS: ...]"}],
  "unverified_flags": ["[UNVERIFIED: ...]"],
  "data_gaps": ["[DATA GAP: ...]"]
}
```

---

## LAYER 3 — Temporal & Adaptive Analysis {#l3}
**Persona: Temporal Strategist**
**Purpose:** Place event on time axis; trace adaptive loops; map interest vectors.

### Generator Tasks

**3-A. Three-Scale Time Placement**
Place the event on all three scales — none may be omitted:
```
SHORT  (1–3 years):   Direct trigger
  What changed recently? What pressure or opportunity arose?
  [This is typically L2-Knowledge territory — verify against L1]

MEDIUM (10–30 years): Institutional/policy formation context
  What policy, alliance, or economic structure was built in this period?
  [L1 + L2 intersection]

LONG   (50+ years):   Structural geopolitical force
  What civilizational, systemic, or balance-of-power dynamic is at work?
  [Pure L1-Knowledge — historical precedent and structural force]
```

**Pattern Signal:**
If the same actor behavior repeats across ≥2 time scales → structural force confirmed (not circumstantial event).
If behavior only appears at SHORT scale → may be opportunistic rather than structural.

**3-B. Adaptive Loop Mapping**
Trace ≥2 full iterations of the pressure-response cycle:
```
Cycle 1: [External pressure] → [Actor response] → [New equilibrium]
Cycle 2: [New pressure from equilibrium] → [Adapted response] → [New equilibrium]
...
```
After mapping: What direction is the actor evolving?
- More capable (strengthening position)
- More desperate (deteriorating position)
- More entrenched (locked into path dependency)

Does this adaptive trajectory reinforce or contradict the structural hypothesis from L2?

**3-C. Interest Vector Map**
For each major actor (≥3 required):
```
Actor: [name]
Vector direction: [strategic goal]
Intensity: High / Medium / Low
Time horizon: Short / Medium / Long
```
Then identify:
```
Intersection zones: Where ≥2 actors' vectors align → cooperation likely
Collision zones: Where actors' vectors are zero-sum → conflict likely
```

**3-D. Conventional Narrative vs. Historical Pattern Check**
Ask: Does the historical pattern (L1-Knowledge) support or contradict the Layer 2 mainstream explanation?
- If SUPPORT → note consistency
- If CONTRADICT → `[L3-EUREKA: "what L2 says" vs. "what historical pattern shows"]`

### Sprint Contract
| Criterion | Pass Condition |
|-----------|---------------|
| All 3 time scales addressed | None may be omitted |
| Adaptive loop: ≥2 full iterations | Each cycle fully documented |
| Interest vectors: ≥3 actors | Both intersection and collision zones identified |
| Pattern repetition check | Explicit yes/no with cited evidence |
| L3-Eureka check documented | Result recorded even if no divergence found |

### Evaluator Rubric
```
- Only short-term analysis present → FAIL (structural depth missing)
- Adaptive loop has <2 iterations → PARTIAL
- Interest map missing collision zones → PARTIAL
- Historical claim without [EVENT: actor, year] → FAIL (hallucination risk)
- L3-Eureka check skipped entirely → PARTIAL
```

**Structured Output to L4:**
```json
{
  "time_map": {
    "short": "1-3yr trigger",
    "medium": "10-30yr context",
    "long": "50+yr structural force"
  },
  "pattern_confirmed": true/false,
  "adaptive_loop": [{"cycle": 1, "pressure": "...", "response": "...", "equilibrium": "..."}],
  "actor_evolution_direction": "more capable / more desperate / more entrenched",
  "interest_vectors": [{"actor": "...", "vector": "...", "intensity": "H/M/L"}],
  "intersection_zones": ["..."],
  "collision_zones": ["..."],
  "eureka_signals": ["[L3-EUREKA: ...]"]
}
```

---

## LAYER 4 — Synthesis & Macro Insight {#l4}
**Persona: Synthesis Critic**
**Purpose:** Cross-validate; surface 2nd/3rd order effects; generate the macro question.

### Generator Tasks

**4-A. Falsification Test**
State the single strongest counterargument to the main hypothesis:
```
Counterargument: [what would most effectively disprove H1?]
Evidence for counterargument: [what supports this alternative?]
Verdict:
  - SURVIVED: hypothesis holds despite counterargument because [reason]
  - FAILED: counterargument is stronger → LOOP BACK TO L1 with revised hypothesis
  - MODIFIED: hypothesis survives in modified form → state the modification
```
If FAILED → return to L1. Max 3 iterations. After 3 failed iterations → `[NULL RESULT: reason]`

**4-B. Scenario Matrix**
```
| Scenario           | Core Claim                        | Evidence Weight | Probability |
|--------------------|-----------------------------------|-----------------|-------------|
| A: L2 Mainstream   | Official/conventional explanation | [sources]       | x%          |
| B: L1/L3 Structural| Structural/historical explanation | [sources]       | y%          |
| C: Black Swan      | Low-probability, high-impact alt  | [sources]       | z%          |

Constraint: sum of probabilities ≤ 100%. Remainder = explicitly acknowledged unknown.
```

**Evaluator flag:** If Scenario A > 70% probability → re-examine for overconfidence.
**[INSIGHT] trigger:** If Scenario B evidence weight > Scenario A → flag `[INSIGHT: structural explanation outperforms official narrative — reason]`

**4-C. Effect Chain Analysis**
```
Intended effect (1st order):  What the actor aimed to achieve
Actual 1st order result:      What directly happened
2nd order consequence:        Unintended structural change — MUST differ from 1st order
3rd order consequence:        Systemic shift or tipping point candidate
  → Tag as [SPECULATIVE] if beyond 5-year horizon
```
The most powerful insights emerge at 2nd and 3rd order.

**4-D. Macro Question**
Analysis ends with a better question, not a final answer:
```
Template:
"If [structural force identified at L3] continues at its current trajectory,
what tipping point emerges in [5 / 10 / 20] years,
and what are the 3 earliest warning signal indicators?"
```
The macro question must reference a structural force — not just the event itself.

**4-E. Eureka Signal Resolution**
Every `[EUREKA CANDIDATE]` and `[L3-EUREKA]` flag from earlier layers must receive a verdict:
- VALIDATED: evidence from L2+L3 confirms divergence from mainstream
- INVALIDATED: counterargument was stronger; conventional explanation holds
- UNRESOLVED: insufficient data → note what data would resolve it

### Sprint Contract
| Criterion | Pass Condition |
|-----------|---------------|
| Falsification attempted | Strongest counterargument named and evaluated |
| Scenario matrix: ≥3 scenarios | Probabilities assigned; sum ≤100% |
| 2nd order effect identified | Distinct from 1st order |
| 3rd order / tipping point | Present, even if tagged [SPECULATIVE] |
| Macro question posed | References structural force, not just the event |
| All Eureka signals resolved | Each gets VALIDATED / INVALIDATED / UNRESOLVED |

### Evaluator Rubric
```
- No falsification counterargument attempted → FAIL
- All scenario probabilities clustered >70% → FAIL (overconfidence)
- 2nd order effect is restated 1st order effect → FAIL
- Macro question is about the event, not the underlying structure → PARTIAL
- Any Eureka signal from L1–L3 left unresolved without noting why → PARTIAL
```

---

## EVALUATOR MASTER RUBRIC {#rubric}

Apply after each layer. Score PASS (2) / PARTIAL (1) / FAIL (0) per criterion.

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Structural Depth | High | Reaches structural cause — not actor intent |
| Source Integrity | High | All claims traceable to primary docs |
| L2 Scrutiny | High | Layer 2 sources examined for institutional bias |
| Temporal Scope | Medium | All 3 time scales addressed (L3 only) |
| First-Principles Check | High | L3 reasoning attempted; Eureka signals logged |
| Internal Consistency | High | L0–L4 form coherent causal chain |
| Falsifiability | High | Main hypothesis is disprovable |
| Completeness | Medium | No silent unknowns — gaps declared explicitly |

**Aggregate threshold:** ≥13/16 to proceed to next layer.
Below threshold → layer is rejected; Generator revises before moving forward.

---

*Read references/output.md for the complete report template.*
