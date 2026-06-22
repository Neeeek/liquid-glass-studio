# 11 — Tooling: MCP Servers & Skills

What augmentation is installed for the agent workflow, why, and how each agent should
use it. MCP servers add live capabilities (browser, docs); Skills add packaged
knowledge that auto-loads when a task matches its description.

## 11.1 Installed MCP servers

| Server              | Purpose                                                                                | When to use                                                                                                                                                                                                                   |
|---------------------|----------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **chrome-devtools** | Drives a real Chrome via CDP: screenshots, DOM/console inspection, performance traces. | **Verify the visual effect** — refraction renders, corners clean, no halo/hot corners — and profile `backdrop-filter` performance. The effect is Chromium-only and visual, so seeing it matters more than reasoning about it. |
| **context7**        | Injects up-to-date library docs (React 19, Vite 6, CSS APIs) into context.             | Before writing/reviewing React or build code, to avoid deprecated React-18-era patterns and API hallucinations on a bleeding-edge stack.                                                                                      |

Config lives in `.mcp.json` at the repo root:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest"
      ]
    },
    "context7": {
      "command": "npx",
      "args": [
        "@context7/mcp-server"
      ]
    }
  }
}
```

> Chrome DevTools MCP needs a Chrome instance with remote debugging available; `npx`
> servers need network access on first run. Both are optional — the project builds
> without them — but they materially raise quality on a visual, cutting-edge project.

(Playwright MCP is a planned addition for the QA/testing pass; not required for MVP.)

## 11.2 Installed Skills

Skills live in `.claude/skills/<name>/SKILL.md` and auto-activate when a task matches
their `description`. They reference `/docs` rather than duplicating it (progressive
disclosure).

| Skill                       | Domain                               | Auto-triggers on                                                                                                   |
|-----------------------------|--------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| **svg-filter-refraction**   | Core SVG/refraction math + debugging | Work on `src/lib/liquidGlass.ts`, the filter chain, displacement maps, aberration, or refraction/corner artifacts. |
| **liquid-glass-aesthetics** | Visual design / polish               | Tuning glass appearance, rim-light, tint, presets, contrast/legibility, or visual review.                          |
| **react19-patterns**        | React 19 conventions                 | Work on `useLiquidGlass`, components, effect lifecycles, refs, or engine↔React integration.                        |

## 11.3 Skill vs. MCP overlap (intentional)

- `react19-patterns` (Skill) encodes OUR opinionated patterns; **context7** (MCP)
  supplies general live React/Vite docs. Use both: skill for "how we do it here",
  Context7 for "what the current API is".
- `svg-filter-refraction` (Skill) holds the math/debugging playbook;
  **chrome-devtools** (MCP) lets the agent visually confirm the fix.

## 11.4 Recommended pairing per agent

| Agent                 | Lean on Skills                            | Lean on MCP                                     |
|-----------------------|-------------------------------------------|-------------------------------------------------|
| svg-engine-engineer   | svg-filter-refraction                     | chrome-devtools (verify corners/perf)           |
| css-exporter-engineer | svg-filter-refraction                     | chrome-devtools (verify pasted snippet renders) |
| react-ui-engineer     | react19-patterns, liquid-glass-aesthetics | context7, chrome-devtools                       |
| docs-writer           | (whichever matches the changed area)      | —                                               |
| qa-reviewer           | all three (as relevant)                   | chrome-devtools (visual + perf), context7       |
| orchestrator          | — (delegates)                             | —                                               |

## 11.5 Usage norms

- **Verify, don't assume:** after any change to the refraction pipeline or styling,
  use chrome-devtools to screenshot the preview at radius 0/44/120 and confirm clean
  corners before declaring done.
- **Check the API is current:** before adding React/Vite code, consult context7 for
  React 19 / Vite 6 specifics rather than relying on training memory.
- **Skills auto-load**, but if one fails to trigger on a clearly relevant task,
  sharpen its `description` keywords (the description is the trigger condition).
