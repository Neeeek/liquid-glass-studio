# Liquid Glass Studio — Build Documentation

This `/docs` folder is the complete specification for **Liquid Glass Studio**: a
landing page with a live customizer that generates copy‑paste **CSS / SCSS / SASS**
for an Apple‑style "Liquid Glass" **refraction** effect, powered by SVG filters.

These documents are written so an AI coding agent (or a human) can implement the
project end‑to‑end **without any other source material**.

## Reading order

1. `01-product-spec.md` — what we are building and why.
2. `02-refraction-technique.md` — **read this carefully**; it is the non-obvious core.
3. `03-engine-spec.md` — the framework-agnostic engine (the heart of the app).
4. `04-react-integration.md` — React 19 wrapper (hook + component).
5. `05-exporters-spec.md` — the code generators.
6. `06-ui-customizer-spec.md` — the landing page UI.
7. `07-tooling-setup.md` — build tooling and configuration.
8. `08-acceptance-criteria.md` — definition of done + known limitations.
9. `09-demo-scenes.md` — optional showcase scenes (navbar / modal / AI chat input). Post-MVP.
10. `10-agent-workflow.md` — agent roster, model choices, and the build flow.
11. `11-tooling-mcp-skills.md` — installed MCP servers, Skills, and per-agent usage.

## Implementation principles

- **TypeScript everywhere.** `strict` mode on. No `any` except the documented
  vendor‑prefix style escape hatch.
- **The engine is framework‑agnostic.** React only consumes it. Keep all DOM/SVG
  logic in `src/lib/`, free of React imports, so it can be published standalone later.
- **Single source of truth for geometry.** The displacement effect must always
  read the live element's size and computed `border-radius`. Never hardcode size.
- **Progressive enhancement.** True refraction is Chromium‑only. Every output and
  the live preview must degrade gracefully to a blur fallback elsewhere.
- **No heavy dependencies.** No animation libraries, no UI kit. Plain CSS for the site.

## Target stack

- React 19, Vite 6, TypeScript 5.
- No CSS framework (plain CSS). Tailwind is explicitly out of scope unless requested.

## Final directory layout (target)

```
liquid-glass-studio/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── docs/                      (these files)
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── styles.css
    ├── lib/
    │   ├── liquidGlass.ts      (engine — see 03)
    │   ├── exporters.ts        (generators — see 05)
    │   ├── useLiquidGlass.ts   (React hook — see 04)
    │   └── presets.ts
    └── components/
      ├── Controls.tsx
      ├── ExportPanel.tsx
      ├── GlassPreview.tsx
      ├── SupportBadge.tsx
      └── demos/              (optional, post-MVP — see docs/09)
          ├── DemoStage.tsx
          ├── DemoNavbar.tsx
          ├── DemoModal.tsx
          └── DemoChatInput.tsx
```
