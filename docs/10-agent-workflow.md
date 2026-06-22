# 10 — Agent Workflow

How the AI agent roster for Liquid Glass Studio is organized, which model each uses
and why, and the standard request → plan → build → docs → QA flow. Agent definitions
live in `.claude/agents/*.md`; working rules live in `CLAUDE.md`.

## 10.1 Roster overview

| Agent                   | Lane / Owns                                              | Writes code?    | Model  |
|-------------------------|----------------------------------------------------------|-----------------|--------|
| `orchestrator`          | Planning & delegation (tech lead)                        | No (plans only) | Opus   |
| `svg-engine-engineer`   | `src/lib/liquidGlass.ts` (refraction engine)             | Yes             | Opus   |
| `css-exporter-engineer` | `src/lib/exporters.ts` (CSS/SCSS/SASS output)            | Yes             | Sonnet |
| `react-ui-engineer`     | hook, `src/components/*`, `src/styles.css`, `index.html` | Yes             | Sonnet |
| `docs-writer`           | `docs/*.md`, `CLAUDE.md`, `README.md`                    | Docs only       | Haiku  |
| `qa-reviewer`           | Verification against `docs/08`                           | No (read-only)  | Sonnet |

These lanes mirror the architecture boundaries in `CLAUDE.md` (Part C). The split
keeps the engine framework-agnostic and the exporters DOM/React-free, so the engine
stays extractable as a standalone package later.

## 10.2 Model choices and rationale

Principle: **spend the expensive model where errors cascade or reasoning is hardest;
save cost where work is mechanical.**

- **Opus — `orchestrator`:** planning/decomposition mistakes cascade into every
  downstream agent. Highest-leverage place for the top model.
- **Opus — `svg-engine-engineer`:** the hardest reasoning in the project (SVG filter
  chains, displacement math, channel encoding, performance subtleties). Numeric and
  spatial reasoning is where Opus pays off most.
- **Sonnet — `css-exporter-engineer`:** detail-heavy string templating that must
  mirror the engine exactly. Reliable, but not deeply algorithmic.
- **Sonnet — `react-ui-engineer`:** standard React 19 + plain CSS work; Sonnet's
  sweet spot.
- **Sonnet — `qa-reviewer`:** strong critical review without Opus cost on every pass.
  Consider upgrading to Opus for milestone/release audits where a missed issue is
  expensive.
- **Haiku — `docs-writer`:** mostly mechanical (translate diffs into prose, keep docs
  in sync). Cheap and fast. Bump to Sonnet if budget allows and doc quality matters
  more on a given task.

Net allocation: 2× Opus, 3× Sonnet, 1× Haiku. Adjust `model:` in each agent file to
taste; removing the line inherits the main session model.

## 10.3 Read-only vs. writing agents

- **Read-only (no Edit/Write):** `orchestrator`, `qa-reviewer`. This keeps planning
  and verification from blurring into implementation and preserves accountability.
- **Writing:** the three engineers (in their lanes only) and `docs-writer` (docs
  only, never `src/**`).

## 10.4 Standard workflow

```
1. orchestrator        → clarify, decompose, sequence, define gates (read-only plan)
2. svg-engine-engineer → engine changes first (others depend on its API)
3. css-exporter +      → exporter and UI work in parallel once the engine API is set
   react-ui-engineer
4. docs-writer         → reconcile /docs + CLAUDE.md with shipped behavior
5. qa-reviewer         → read-only acceptance pass against docs/08 §8.1
```

- Demo scenes (`docs/09`) are post-MVP: schedule them only after the core
  customizer (docs 01–08) passes QA. They reuse the engine and add no new
  refraction logic.
- The standing verification gate for every coding step is `npm run build` passing
  (strict TS) plus the relevant `docs/08` criteria.
- The final step is ALWAYS a `qa-reviewer` pass before declaring "done".

## 10.5 Hand-off contracts (cross-lane APIs)

When work crosses lanes, name the contract explicitly so agents don't drift:

- **Engine → Exporter:** `LiquidGlass` instance fields `w`, `h`, `radius`, `id`,
  `opts`, and the `mapURIs(edgePct)` helper. Renaming these requires updating the
  exporter and flagging `docs/03` + `docs/05`.
- **Engine → React:** the `LiquidGlass` constructor + `refresh()` / `update()` /
  `destroy()` API consumed by `useLiquidGlass`.
- **App → Exporter / Preview:** `opts` (visual params) + `geo` (`radius`, `width`,
  `height`) must be passed to BOTH the preview and the exporter so generated code
  matches the preview exactly.

## 10.6 Orchestrator output format (reference)

```
GOAL: <one line>
ASSUMPTIONS: <if any>  | OPEN QUESTIONS: <if any — stop if blocking>

PLAN
1. [agent] <task> → verify: <check> (deps: ...)
2. ...
N. [qa-reviewer] full acceptance pass → verify: docs/08 §8.1 met (deps: all)

HAND-OFF CONTRACTS: <APIs/fields/types crossing lanes>
RISKS: <perf, browser-support, scope creep>
```

## 10.7 Practical notes

- **Delegation reality:** subagent-to-subagent spawning is not guaranteed in all
  Claude Code setups; often the main session invokes subagents. The `orchestrator`
  is therefore a planner that emits a delegation plan — the main thread (or you)
  executes it. This works regardless of the installed version's delegation support.
- **Docs sync is not optional:** any intentional behavior change documented in
  `/docs` triggers a `docs-writer` task in the same unit of work, so specs never lag
  the code.
- **When to escalate models:** if `qa-reviewer` (Sonnet) repeatedly misses subtle
  refraction/perf regressions, run a milestone audit on Opus. If the engine work is
  routine wiring (not new SVG math), Opus is optional — use judgment.
- **Tooling:** MCP servers (chrome-devtools, context7) and Skills
  (svg-filter-refraction, liquid-glass-aesthetics, react19-patterns) augment the
  agents — see `docs/11` for what each agent should use.

## 10.8 Adding or changing agents

- Agent files are project-level in `.claude/agents/` (checked into the repo, shared
  with collaborators).
- Each file needs YAML frontmatter (`name`, `description`, `tools`, `model`) and a
  focused system prompt that (a) names its lane, (b) lists required reading, and
  (c) restates only the non-negotiable rules relevant to that lane.
- Keep prompts lean; point to `CLAUDE.md` and the relevant `docs/*.md` rather than
  duplicating large sections.
- If you add a new lane, update §10.1, the hand-off contracts in §10.5, and the
  `orchestrator`'s team list.
