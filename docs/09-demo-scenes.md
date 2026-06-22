# 09 — Demo Scenes (showcase usage)

Optional but recommended. These scenes prove the Liquid Glass effect works in real
UI contexts, not just an isolated card. They are the strongest portfolio material.
Each scene REUSES the engine via `useLiquidGlass` / `GlassPreview` — no new
refraction logic. Build only after the MVP customizer (docs 01–08) works.

## 9.0 Shared rules

- Reuse the engine; do NOT reimplement filters. Each glass surface is just an
  element with a `ref` from `useLiquidGlass` (or a `GlassPreview`).
- All scenes sit over a vivid/animated background so refraction is visible.
- Every scene must honor the same fallbacks and accessibility rules as the MVP
  (Chromium-only refraction → blur fallback; `prefers-reduced-motion`;
  `prefers-reduced-transparency`).
- Multi-instance safety applies: each glass element is its own `LiquidGlass`
  instance with a unique filter id (the engine handles this).
- Keep scenes presentational and self-contained in `src/components/demos/`.

## 9.1 Placement & navigation

- Add a "Showcase" section below the customizer/output on the landing page, OR a
  simple in-page tab switcher (`Customizer` | `Showcase`). No router required.
- Each scene is a separate component under `src/components/demos/`:
- `DemoNavbar.tsx`, `DemoModal.tsx`, `DemoChatInput.tsx`.
- A `DemoStage` wrapper provides the shared colorful background + spacing.

## 9.2 Scene A — Glass navbar / dock

**Goal:** the instantly-recognizable Apple comparison.

- A horizontal bar pinned near the top (or a floating bottom dock) as a glass
  surface refracting the page content scrolling beneath it.
- Contents: a brand mark, 3–4 nav links, one primary action.
- Geometry: full-width (or wide), modest `border-radius` (e.g. 18–22px for a dock;
  smaller for a top bar). Engine reads the size; on viewport resize the
  ResizeObserver keeps the map fitted.
- Settings: subtle preset (refraction ~0.4, low aberration, small edge band).
- Provide scrollable content behind it so the refraction visibly bends moving
  content.

**Acceptance:** refraction tracks the bar's real width on resize; corners clean;
links remain legible; fallback shows a clean blur bar in Safari/Firefox.

## 9.3 Scene B — Glass modal / command palette

**Goal:** show glass as a focused overlay above busy content.

- A dimmed backdrop (`rgba(0,0,0,.4)`) over a colorful page, with a centered glass
  panel (modal or command-palette style with a fake search input + result rows).
- Open/close via a trigger button. Use the native `<dialog>` element or a simple
  state-toggled overlay; keep it dependency-free.
- Geometry: medium width (e.g. 420–520px), `border-radius` ~20px. Engine reads size.
- Settings: Apple/Frosted preset; ensure text contrast over the refracted backdrop.

**Acceptance:** panel refracts the content behind the dim layer; focus is trapped
while open (if using `<dialog>`); Escape/overlay-click closes; reduced-transparency
yields a more opaque panel; fallback = blurred panel.

## 9.4 Scene C — AI chat input (ties to original brief)

**Goal:** a glass chat composer — the project's origin idea.

- A bottom-anchored glass input bar (textarea + send button) over a colorful chat
  surface, optional fake message bubbles above it.
- Geometry: wide, pill-ish `border-radius` (e.g. 24–28px). Engine reads size; the
  bar may grow in height as the textarea expands → ResizeObserver refits the map.
- Settings: subtle refraction; gentle blur for readability of typed text.
- OPTIONAL "active/thinking" state: when focused or "sending", slightly raise
  `refraction` and `chromaticAberration` via `update()` for a tasteful emphasis.
  Keep it subtle; respect `prefers-reduced-motion` (no animated pulsing if set).

**Acceptance:** input refracts the chat behind it; typed text stays readable;
growing the textarea refits refraction without regenerating the map (only `edge`
changes trigger a rebuild — height change does not); fallback = blurred input bar.

## 9.5 Implementation notes

- These scenes use the SAME `LiquidGlassOptions`. Hardcode tasteful per-scene
  defaults (or reuse a preset from `presets.ts`); they do not need the full
  customizer controls.
- Do not duplicate the rim-light/tint CSS ad hoc — factor the shared glass surface
  styles so navbar/modal/chat all match the customizer preview exactly.
- No new runtime dependencies. Plain CSS + React state only.
- Keep each scene small and readable; these are demos, not products.

## 9.6 Out of scope (for these demos)

- No real chat/LLM integration in Scene C — it's a visual mock.
- No routing, no global state, no animation libraries.
- No backend, persistence, or network calls.

## 9.7 Acceptance (section-level)

- [ ] All three scenes render over a colorful background with visible refraction in
  Chromium.
- [ ] Each scene degrades to a clean blur in Safari/Firefox (no broken/invisible
  surfaces).
- [ ] Resizing the viewport/textarea refits refraction (no map regeneration except
  on `edge` change).
- [ ] Corners consistent; text legible in every scene.
- [ ] `prefers-reduced-motion` and `prefers-reduced-transparency` respected.
- [ ] No new dependencies added; scenes reuse the engine via `useLiquidGlass`.
