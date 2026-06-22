---
name: react19-patterns
description: React 19 conventions and gotchas for Liquid Glass Studio. Use when writing or reviewing the useLiquidGlass hook, components, effect lifecycles, refs, or integrating the DOM/SVG engine with React. Trigger on tasks touching src/lib/useLiquidGlass.ts, src/components, or src/App.tsx.
metadata:
author: Liquid Glass Studio
version: "1.0.0"
tags: [ react, react19, hooks, effects, vite ]
allowed-tools: Read, Edit, Grep, Glob, Bash
---

# React 19 Patterns

Opinionated React 19 rules for this repo. For general/live API details, rely on the
Context7 MCP; this skill encodes OUR patterns and the engine-integration contract.
Authoritative spec: `docs/04-react-integration.md`.

## Core integration rule

The refraction engine (`src/lib/liquidGlass.ts`) touches `document` and owns SVG
nodes. React must only ever drive it through `useLiquidGlass`.

- Instantiate `new LiquidGlass(el, opts)` INSIDE `useEffect` (never during render).
- Keep the instance in a `useRef`; never in state.

## StrictMode double-invoke (the #1 trap)

Dev StrictMode runs effects setup -> cleanup -> setup. The create effect MUST return
a cleanup that calls `inst.destroy()` and nulls the ref, so the second setup builds a
clean instance. Failure symptom: duplicate `<filter>` nodes piling up in
`#lg-defs`. Always verify zero stale filters after a remount.

## Effect structure for the hook

- Effect 1 (deps `[]`): create on mount, `destroy()` on unmount.
- Effect 2 (deps `[options]`): push live param changes via `inst.update(options)`.
- Effect 3 (no deps): `inst.refresh()` after renders that may change size/radius.
  Keep update cheap so a fresh options object each render is fine.

## React 19 specifics

- **Refs as props:** function components accept `ref` as a normal prop in React 19.
  Do NOT add `forwardRef` unless there is a concrete reason.
- **Root:** `ReactDOM.createRoot(...).render(<StrictMode><App/></StrictMode>)` — keep
  StrictMode on.
- **SSR safety:** guard `window`/`document` access (e.g. `supportsRefraction()` must
  return false when `window` is undefined). The engine runs browser-only.

## State shape (App)

- `opts: LiquidGlassOptions` (visual params) and `geo: { radius, width, height }`.
- Pass `opts` to the hook/preview AND pass `opts`+`geo` to the exporter so generated
  code always matches the preview.

## Boundaries (do not cross)

- No React imports in `liquidGlass.ts` or `exporters.ts`.
- Components are presentational; they never manipulate SVG filters directly — only
  via the hook.
- Plain CSS only; no Tailwind/CSS-in-JS/UI kits.

## Review checklist

- [ ] Engine created in effect, not render?
- [ ] Cleanup calls `destroy()`; no stale `#lg-defs` filters after remount?
- [ ] No unnecessary `forwardRef`?
- [ ] `window` guarded for SSR?
- [ ] preview and export fed identical `opts`/`geo`?

## References

- `docs/04-react-integration.md` (hook + component contracts)
- `docs/03-engine-spec.md` (engine API consumed by the hook)
