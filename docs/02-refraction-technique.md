# 02 — The Refraction Technique (core knowledge)

> This is the most important document. The effect depends on details that are easy
> to get wrong. Implement exactly as specified, then tune.

## 2.1 Concept
"Liquid Glass" = a translucent surface that **refracts** (bends) the content behind
it, strongest near the edges/corners (like a thick lens rim) and nearly flat in the
center, with optional **chromatic aberration** (color fringing) and a subtle blur.

On the web this is achieved with an SVG filter applied to an element's **backdrop**:
```css
.glass {
  -webkit-backdrop-filter: url(#liquid-glass);
          backdrop-filter: url(#liquid-glass);
}
```
The filter warps the backdrop using `feDisplacementMap`, whose distortion is driven
by a **displacement map** image.

## 2.2 How feDisplacementMap reads the map
`feDisplacementMap` shifts each pixel of the input (`in`) using two color channels
of a second image (`in2`):

- **Red channel → horizontal (X)** displacement.
- **Green channel → vertical (Y)** displacement.
- Channel value **128 (mid‑gray) = zero displacement**.
- Values **< 128** push **left/up**; values **> 128** push **right/down**.
- The `scale` attribute sets the maximum displacement in pixels.

The displacement formula (per the SVG spec) is conceptually:
```text
P'(x, y) = P( x + scale * (Xchannel - 0.5),
              y + scale * (Ychannel - 0.5) )
```
## 2.3 Building a RESOLUTION‑INDEPENDENT vector map
Instead of a baked PNG (which pixelates and must be regenerated on resize), build
the map from **two SVG linear gradients** and combine them. This is the project's
signature technique.

- **X‑map (encodes Red):** a horizontal gradient.
- Left edge: `#000000` (R=0 → push left)
- Inner band start (`p%`) to end (`q% = 100 - p`): `#800000` (R=128 → neutral)
- Right edge: `#ff0000` (R=255 → push right)
- **Y‑map (encodes Green):** a vertical gradient.
- Top edge: `#000000` (G=0 → push up)
- Inner band: `#008000` (G=128 → neutral)
- Bottom edge: `#00ff00` (G=255 → push down)

`p` is the **edge band width as a percentage** (e.g. 14 means the refraction ramps
over the outer 14% on each side). Because stops are percentages and the SVG uses
`preserveAspectRatio='none'`, the map **stretches to any element size**.

### Reference SVG for each map (100×100 viewBox, stretched by feImage)
X‑map:
```xml
<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'
     viewBox='0 0 100 100' preserveAspectRatio='none'>
  <linearGradient id='g' x1='0' y1='0' x2='1' y2='0'>
    <stop offset='0%'   stop-color='#000000'/>
    <stop offset='P%'   stop-color='#800000'/>
    <stop offset='Q%'   stop-color='#800000'/>
    <stop offset='100%' stop-color='#ff0000'/>
  </linearGradient>
  <rect width='100' height='100' fill='url(#g)'/>
</svg>
```
Y‑map: identical but the gradient runs top→bottom (`x2='0' y2='1'`) and uses
`#000000 → #008000 → #008000 → #00ff00`.

> Replace `P` and `Q` with the numeric percentages (`Q = 100 - P`).

### Encoding the map as a data URI
The map SVGs are embedded into `feImage` via a data URI. Use
`encodeURIComponent` (NOT base64) so the markup stays readable:
```ts
const enc = (s: string) =>
  'data:image/svg+xml,' + encodeURIComponent(s.replace(/\s+/g, ' ').trim());
```
## 2.4 Combining X and Y maps
The two maps are fed into the filter as `feImage` results, then merged with
`feBlend mode="lighten"`. Because the X‑map only carries Red and the Y‑map only
carries Green, `lighten` cleanly produces a single map where Red=X and Green=Y.
Corners naturally get both channels off‑neutral, giving a diagonal (radial‑ish)
displacement that follows the rounded corner.

## 2.5 Chromatic aberration (channel split)
To create color fringing, run the displacement **three times** at slightly
different scales — one per color channel — then recombine:

1. Blur the backdrop once (`feGaussianBlur` on `SourceGraphic`).
2. Displace the blurred result three times:
- Red channel at `scale = base * (1 + ca)`
- Green channel at `scale = base`
- Blue channel at `scale = base * (1 - ca)`
  where `base = refraction * 120` and `ca = chromaticAberration` (0–1).
3. Isolate each color with an `feColorMatrix`, then recombine with
   `feBlend mode="screen"` (additive for disjoint channels).

## 2.6 The exact filter primitive chain (reference)
Filter element attributes:
- `color-interpolation-filters="sRGB"`
- `primitiveUnits="userSpaceOnUse"`
- Filter region: `x="-15%" y="-15%" width="130%" height="130%"`

Primitives in order:
```xml
<feImage class="lg-mx" result="mx" preserveAspectRatio="none" x="0" y="0" width="0" height="0"/>
<feImage class="lg-my" result="my" preserveAspectRatio="none" x="0" y="0" width="0" height="0"/>
<feBlend mode="lighten" in="mx" in2="my" result="map"/>

<feGaussianBlur class="lg-blur" in="SourceGraphic" stdDeviation="2" result="b"/>

<feDisplacementMap class="lg-r" in="b" in2="map" scale="0"
   xChannelSelector="R" yChannelSelector="G" result="dr"/>
<feColorMatrix in="dr" type="matrix" result="cr"
   values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/>

<feDisplacementMap class="lg-g" in="b" in2="map" scale="0"
   xChannelSelector="R" yChannelSelector="G" result="dg"/>
<feColorMatrix in="dg" type="matrix" result="cg"
   values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"/>

<feDisplacementMap class="lg-b" in="b" in2="map" scale="0"
   xChannelSelector="R" yChannelSelector="G" result="db"/>
<feColorMatrix in="db" type="matrix" result="cb"
   values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"/>

<feBlend mode="screen" in="cr" in2="cg" result="rg"/>
<feBlend mode="screen" in="rg" in2="cb"/>
```
At runtime the engine sets:
- `feImage` `width`/`height` = the element's pixel size (the maps stretch to fit).
- The three `feDisplacementMap` `scale` values (from refraction + aberration).
- `feGaussianBlur` `stdDeviation` = blur px.
- Rebuilds the two `feImage` `href` data URIs only when the **edge band %** changes.

## 2.7 The dynamic geometry rule (prevents the corner bug)
Three things draw the corner: the element's CSS `border-radius`, the rim‑light
(`::before`, which uses `border-radius: inherit`), and the displacement map. They
must agree. The engine therefore **reads the element's computed `border-radius`**
and the displacement region matches the element box. Never bake a different radius
into the map than the element uses.

## 2.8 Browser support (critical)
- **`backdrop-filter: url(#svgFilter)` with `feDisplacementMap` works only in
  Chromium** (Chrome, Edge, Brave).
- **Safari and Firefox** restrict `backdrop-filter` to built‑in functions; the SVG
  refraction will not render there.
- Therefore the effect MUST be feature‑detected and MUST fall back to a plain
  `backdrop-filter: blur(...)`. See `05-exporters-spec.md` and
  `08-acceptance-criteria.md`.

Feature detection:
```ts
export function supportsRefraction(): boolean {
  if (typeof window === 'undefined') return false; // SSR guard
  return (
    CSS.supports('backdrop-filter', 'url(#x)') ||
    CSS.supports('-webkit-backdrop-filter', 'url(#x)')
  );
}
```
## 2.9 Known tradeoff (document it in the UI / README)
Because gradient stops are **percentages**, the edge band is a percentage of the
element, not a fixed pixel width. On extreme aspect ratios the band looks thicker
on the longer axis. This is the resolution‑independence vs. uniform‑edge tradeoff.
(A future enhancement could compute per‑axis percentages to equalize pixel
thickness.)
