# CLAUDE.md — Liquid Glass Studio

Behavioral guidelines to reduce common LLM coding mistakes, plus project‑specific
rules. Read this first, then follow `docs/00-README.md` for the full specifications.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

---

# Part A — General Working Guidelines

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

Project‑specific additions:

- Don't restructure folders or move files between the architecture boundaries below.
- Don't add dependencies, telemetry, or network calls.
- If you intentionally change documented behavior, update the relevant `/docs` file.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

For this project, the standing verification gate is: **`npm run build` passes (strict
TS, no errors/unused)** and the relevant boxes in `docs/08-acceptance-criteria.md` are
satisfied. Always run the build before declaring a task complete.

---

# Part B — Project Context

## What this project is

A Vite + React 19 + TypeScript landing page with a live customizer that generates
copy‑paste **CSS / SCSS / SASS** for an Apple‑style "Liquid Glass" **refraction**
effect built with SVG filters (`backdrop-filter: url(#filter)` + `feDisplacementMap`).

## Source of truth

- `/docs/*.md` is the authoritative specification. If code and docs disagree, the
  docs win — fix the code (or propose a doc change explicitly, don't silently drift).
- Reading/implementation order: `docs/00` → `01` → `02` → `03` → `04` → `05` → `06`
  → `07` → `08` (core MVP). `docs/09` (demo scenes) is optional/post‑MVP; `docs/10`
  is the agent‑workflow reference. **`docs/02-refraction-technique.md` is the
  critical one** — re‑read it before touching anything in the filter pipeline.

## Commands

```bash
npm install        # install deps
npm run dev        # dev server (Vite)
npm run build      # tsc -b + vite build (MUST pass before "done")
npm run preview    # preview production build
```

## Tech constraints (do not change without being asked)

- **React 19** + **react-dom 19**; `@types/react@^19`, `@types/react-dom@^19`.
-
