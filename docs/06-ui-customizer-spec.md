# 06 — UI / Customizer Spec

Plain CSS (file `src/styles.css`). Dark theme. No UI framework.

## 6.1 Layout
- **Hero** (top, centered): app title (gradient text), one‑line description, and the
  `SupportBadge`.
- **Studio** (two columns; stack to one column under 860px):
- **Stage** (left/main): a rounded container with an **animated colorful
  background** (`stage-bg`) and the **glass preview** centered on top.
- **Sidebar** (right, ~320px): the `Controls`.
- **Output** (full width below): heading + `ExportPanel`.
- **Footer**: short note about the technique and fallback.

## 6.2 Stage background
A vivid multi‑radial‑gradient background with a slow `drift` animation
(scale+rotate) so the refraction is visibly bending color. Respect
`prefers-reduced-motion` (disable the drift animation).

## 6.3 Controls component (`src/components/Controls.tsx`)
Props:
```ts
interface Geometry { radius: number; width: number; height: number; }
interface ControlsProps {
  opts: LiquidGlassOptions;
  geo: Geometry;
  onOpts: (o: Partial<LiquidGlassOptions>) => void;
  onGeo: (g: Partial<Geometry>) => void;
}
```
Sections and inputs:
- **Presets**: a button per preset (doc lists in `presets.ts`); clicking applies its
  partial options via `onOpts`.
- **Refraction**: sliders for Refraction (0–1, step .01), Chromatic aberration
  (0–1, .01), Edge band (4–45, step 1, suffix `%`), Blur (0–12, step .5, suffix
  `px`).
- **Geometry**: Corner radius (0–120 px), Width (160–520 px), Height (120–520 px).
- **Tint**: two text inputs for `tintTop` and `tintBottom` (accept any CSS color).

Implement a small reusable `Slider` subcomponent (label + value readout + range).

## 6.4 ExportPanel component (`src/components/ExportPanel.tsx`)
Props: `{ opts, w, h, radius }`. State: active `Format` tab + `copied` flag.
- Three tabs: CSS / SCSS / SASS. Active tab highlighted.
- `Copy` button (uses `navigator.clipboard.writeText`; show "Copied ✓" for ~1.2s).
- `Download` button (uses `downloadText` from exporters).
- A scrollable `<pre><code>` showing the generated code (memoized via `useMemo`
  keyed on `[tab, opts, w, h, radius]`).

## 6.5 SupportBadge component (`src/components/SupportBadge.tsx`)
Calls `supportsRefraction()`; shows a green "supported (Chromium)" pill or an amber
"falls back to blur" pill.

## 6.6 Presets (`src/lib/presets.ts`)
```ts
export interface Preset { name: string; opts: Partial<LiquidGlassOptions>; }
export const PRESETS: Preset[] = [
  { name: 'Apple (subtle)', opts: { refraction: 0.4,  blur: 2,   chromaticAberration: 0.15, edge: 13 } },
  { name: 'Frosted',        opts: { refraction: 0.25, blur: 8,   chromaticAberration: 0.08, edge: 18 } },
  { name: 'Crystal',        opts: { refraction: 0.7,  blur: 1,   chromaticAberration: 0.35, edge: 10 } },
  { name: 'Dramatic',       opts: { refraction: 1,    blur: 0.5, chromaticAberration: 0.6,  edge: 8  } },
];
```
## 6.7 Rim‑light + preview CSS (must match exporter output)
The `.glass-preview::before` rule in `styles.css` MUST use the same uniform
rim‑light as the exported CSS (doc 05.3) so the preview matches the copied code.

## 6.8 Accessibility
- Respect `prefers-reduced-motion` (no background drift).
- Respect `prefers-reduced-transparency` if set (reduce blur/refraction; show a
  more opaque surface).
- Ensure preview text remains legible; keep a minimum tint opacity.
- All sliders/inputs have associated `<label>`s.
