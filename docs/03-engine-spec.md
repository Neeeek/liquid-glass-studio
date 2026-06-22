# 03 — Engine Spec (`src/lib/liquidGlass.ts`)

A framework‑agnostic TypeScript module. **No React imports.** It owns all DOM/SVG
manipulation. React (doc 04) only wraps it.

## 3.1 Public types
```ts
export interface LiquidGlassOptions {
  refraction: number;          // 0..1  (maps to displacement base = refraction * 120 px)
  blur: number;                // px, backdrop blur (stdDeviation)
  chromaticAberration: number; // 0..1  (per-channel scale spread)
  edge: number;                // edge band as % of element (1..49)
  tintTop: string;             // CSS color for top of glass tint gradient
  tintBottom: string;          // CSS color for bottom of glass tint gradient
}

export const DEFAULTS: LiquidGlassOptions = {
  refraction: 0.45,
  blur: 2,
  chromaticAberration: 0.18,
  edge: 14,
  tintTop: 'rgba(255,255,255,.12)',
  tintBottom: 'rgba(255,255,255,.05)',
};
```
## 3.2 Exported helpers
```ts
// Returns { x, y } data-URIs for the X-map and Y-map (see 02.3). Pure function.
export function mapURIs(edgePct: number): { x: string; y: string };

// Chromium feature check (see 02.8). SSR-safe.
export function supportsRefraction(): boolean;
```
## 3.3 The `LiquidGlass` class
Attaches the effect to a single element.

### Constructor
```ts
new LiquidGlass(el: HTMLElement, options?: Partial<LiquidGlassOptions>)
```
On construction it MUST:
1. Merge `options` over `DEFAULTS`.
2. Generate a **unique filter id** (e.g. `lg-1`, `lg-2`, …) using a module counter,
   so multiple instances never collide.
3. Ensure a single shared hidden `<svg id="lg-defs">` container exists in
   `document.body` (create it once if missing); append this instance's `<filter>`
   to it.
4. Build the filter primitive chain from doc 02.6 (set the unique id on `<filter>`).
5. Set `el.style.backdropFilter` and `el.style.webkitBackdropFilter` to
   `url(#<id>)`.
6. Build the maps (`buildMaps`), read geometry (`refresh`), apply params (`update`).
7. Observe the element with a `ResizeObserver` to keep geometry in sync.

### Methods
```ts
refresh(): void
```
Reads `getBoundingClientRect()` for width/height and `getComputedStyle().
borderTopLeftRadius` for radius; stores them on the instance; sets both `feImage`
`width`/`height` to the pixel size. Cheap — call on every resize.
```ts
update(options?: Partial<LiquidGlassOptions>): void
```
Merges options if given; recomputes the three `feDisplacementMap` scales:
- `base = refraction * 120`
- Red scale  = `base * (1 + chromaticAberration)`
- Green scale = `base`
- Blue scale  = `base * (1 - chromaticAberration)`
  Sets `feGaussianBlur stdDeviation = blur`. If `edge` changed, calls `buildMaps()`.
```ts
destroy(): void
```
Disconnects the `ResizeObserver`, cancels any pending rAF, removes the `<filter>`
from the defs container, and clears the element's backdrop‑filter inline styles.

### Private behavior
- `buildMaps()` calls `mapURIs(opts.edge)` and assigns the two data‑URIs to the
  `feImage` `href` attributes. Tracks the last edge value to avoid redundant work.
- `ResizeObserver` callback must be **rAF‑debounced** (store a flag/handle; only one
  `refresh()` per frame) to avoid thrash during continuous resize.

### Instance fields (read by exporters)
Expose `w: number`, `h: number`, `radius: number`, `id: string`, and `opts` so the
export layer (doc 05) can read the current geometry.

## 3.4 SSR / safety notes
- The class touches `document` and is intended to run only in the browser. React
  callers must instantiate it inside `useEffect` (never during render).
- Use `href` attribute for `feImage` (modern). Optionally also set the legacy
  `xlink:href` for safety, but `href` is sufficient in Chromium.

## 3.5 Performance requirements
- Map data‑URIs are tiny (~0.3 KB each) and only rebuilt when `edge` changes.
- Resizing must NOT regenerate maps — only update `feImage` width/height attributes.
- No per‑pixel canvas work anywhere in the engine (the vector approach replaces it).
