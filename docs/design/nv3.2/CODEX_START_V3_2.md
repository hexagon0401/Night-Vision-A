# CODEX START — NIGHT VISION 3.2 INCREMENTAL UPGRADE

You are editing the user's `hexagon0401/Night-Vision-A` repository, not this ZIP. This archive preserves the earlier v3.1 handoff and adds v3.2 implementation references. **Do NOT overwrite files wholesale.** Read the existing `AGENTS.md`, inspect the actual branch and status, and run current tests first.

## Minimal execution objective

Add a source-traceable ontology graph and consistent object inspector for publicly observable, non-sensitive aircraft/vessel/satellite/camera/event context; preserve existing map and monitoring; keep actual source/claim states separate from model inference. Improve UI without replacing the current MapLibre/deck.gl stack.

## Task gating and role allocation

1. **PR0 (main agent, no subagents):** check HEAD, AGENTS.md, current tests, and current deployed/provider statuses; produce a short redacted fact vs hypothesis log. Identify uncommitted changes and do not overwrite them. Stop if actual repository schema is incompatible with the package proposal.
2. **Contract freeze (main agent + ontology builder as needed):** compare `schemas/v3_2/ontology-graph.v2.schema.json` to current `schemas/`; choose canonical IDs/field names, backward compatibility, privacy and event semantics. Commit schema/tests as one PR. No UI/provider coding until contract is frozen.
3. **PR2: UI object selection and dossier** — use `docs/v3_2/09_UI_LAYOUT.md`; integrate `code/v3_2/ts/selection-controller.ts` as reference into existing `monitor/view.ts`, `nearby.ts`, map renderer, and event inspector. Keep fallback paths for old events.
4. **PR3: provider normalization** — add data-provider -> ontology adapter, stable ICAO24 / MMSI-scoped IDs, dates, license/coverage states. DO NOT assert historical routes from short snapshots.
5. **PR4: evidence graph and NV2 adapter** — adapt source/claim/relation records and Maplizer layers only with source-backed geometry; never write model-suggested facts into canonical data without review.
6. **PR5: test + staged rollout** — verify synthetic fixtures, migrations on a disposable DB, type checks, existing e2e and build. Feature flag OFF by default; observability dashboard before enablement.

## Subagent decision

Use **zero agents** for small edits or sequential contract design. For independent large tasks, use **at most TWO concurrent** subagents, selected from `.codex/agents/`. Recommended phases: scout read-only in PR0 only if exploration is large; ontology architect for schema when contract work is sizeable; UI and data-source agents can run together *only after contract freeze*, because their write scopes are disjoint. Validation reviewer may inspect in parallel when it saves integration time. Parent agent always integrates, runs tests, commits, and reports.

Each task sent to a subagent MUST contain: explicit objective, allowed paths, forbidden paths, specific frozen contract version, acceptance tests, output length cap, and whether to edit code. Every worker must return `agents/contracts/agent-result.example.json` shape; summary <= 350 words, no full-file dumps. Parent must never duplicate the delegated work.

## File rules

- `docs/v3_2/11_IMPLEMENTATION_MAP.md` enumerates original actual paths and proposed additive modules.
- `.codex/agents/*.toml` are templates to copy **after checking for existing agent definitions**; never clobber `.codex/config.toml` or the repo's current `AGENTS.md`.
- Production secrets, workflows, deployment, paid API subscriptions, origin permissions, external monitors, and migrations require separate owner approval.
- A test fixture is synthetic; never publish its people, vessels or routes as factual evidence.
- Preserve namespaced source lineage, status (`observed/documented/reported/inferred/scenario/refuted/unresolved`), event/observation/published/indexed/ingested timestamps and null geometry.
- Publicly available persons must NOT receive covert movement histories; sensitive real-time tracking and targeting maps are prohibited.

## Deliverable for each PR

A) changed file paths, B) acceptance scenarios executed and actual results, C) unexecuted verification with reason, D) risks/rollback path, E) short next-step plan. Do not say "tested" unless a command really ran. Make small reviewable commits and stop at each PR gate when asked.

## First user-facing task for Codex

`Implement PR0 and PR1 only. Verify existing repository and tests first; reconcile ontology v2 schema with existing contracts. Do not build the entire app in one turn. Summarize proposed edits before changing migrations. Don't spawn agents unless the task meets the independent-work threshold.`
