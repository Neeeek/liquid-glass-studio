---
name: svg-filter-refraction
description: Expert knowledge for building and debugging the SVG backdrop-filter refraction pipeline used in Liquid Glass Studio. Use whenever working on feDisplacementMap, feImage displacement maps, chromatic aberration, the filter primitive chain, channel encoding, or diagnosing refraction/corner/edge artifacts. Trigger on tasks touching src/lib/liquidGlass.ts or the exported SVG filter.
metadata:
author: Liquid Glass Studio
version: "1.0.0"
tags: [ svg, filters, displacement, refraction, css ]
allowed-tools: Read, Edit, Grep, Glob, Bash
---

# SVG Filter Refraction

Deep reference for the refraction engine. The authoritative spec is
`docs/02-refraction-technique.md` and `docs/03-engine-spec.md` — read those first;
this skill adds the mental model, the exact math, and a debugging playbook.

## Mental model

A glass element applies `backdrop-filter: url(#id)`. The filter warps the backdrop
with `feDisplacementMap`, whose distortion is driven by a displacement map built
from SVG gradients (resolution-independent — no canvas/PNG).

## The fixed math (do not change)

- `base = refraction * 120` (max displacement in px).
- Channels: **Red -> X**, **Green -> Y**, value **128 = zero displacement**;
  `< 128` pushes left/up, `> 128` pushes right/down.
- Chromatic aberration = three displacement passes on the once-blurred backdrop:
- Red scale = `base * (1 + ca)`
- Green scale = `base`
- Blue scale = `base * (1 - ca)`
  then isolate each channel via feColorMatrix and recombine with `feBlend mode="screen"`.
- The two axis maps (X-map carries Red, Y-map carries Green) combine with
  `feBlend mode="lighten"`.
- Filter element: `color-interpolation-filters="sRGB"`,
  `primitiveUnits="userSpaceOnUse"`, region `x=-15% y=-15% width=130% height=130%`.

## The displacement map (vector, scalable)

Two tiny SVGs encoded via `encodeURIComponent` (NOT base64), each a single linear
gradient over a 100x100 viewBox with `preserveAspectRatio='none'` so it stretches to
any element size:

- **X-map** (horizontal gradient): `#000000` -> `#800000` (from `p%` to `q%`) -> `#ff0000`.
- **Y-map** (vertical gradient): `#000000` -> `#008000` (from `p%` to `q%`) -> `#00ff00`.
- `p` = edge band width as a percent; `q = 100 - p`.

The maps rebuild ONLY when the `edge` option changes. On resize, ONLY the `feImage`
width/height attributes update — never regenerate the map on resize.

## Geometry rule (single source of truth)

Read live size via `getBoundingClientRect()` and radius via
`getComputedStyle().borderTopLeftRadius`. The element edge, the rim-light, and the
displacement region must share ONE circular radius. No `corner-shape`/squircle.

## Debugging playbook (symptom -> cause -> fix)

- **"Nested-radius halo" at corners** -> the map/element radii disagree, OR a
  squircle edge over a circular map -> ensure single circular radius, geometry read
  from the element, no `corner-shape`.
- **Two opposite corners look "hot"/wrong (TL+BR or TR+BL)** -> a diagonal `135deg`
  sheen, NOT the refraction (the map is symmetric) -> replace with the uniform
  border-mask rim-light.
- **No refraction at all, just blur** -> non-Chromium browser (expected: Safari/
  Firefox fall back) OR `feImage href` not set / map width-height zero -> verify in
  Chromium; confirm `refresh()` ran and set width/height.
- **Refraction offset from the element box** -> filter region or `feImage` x/y wrong
  -> region `-15%/130%`, `feImage` x=0 y=0 width=w height=h.
- **Banding / weak color fringing** -> aberration too low or channels not isolated
  -> confirm the three feColorMatrix channel matrices and `screen` recombine.
- **Jank on resize** -> map regenerating per frame -> ensure rAF-debounced
  ResizeObserver and that only `edge` changes rebuild the data-URIs.

## Verification (use Chrome DevTools MCP)

After any pipeline change:

1. Open the dev server in Chrome; screenshot the preview at radius 0, 44, 120.
2. Confirm corners are uniform (no halo, no hot corners) and center is near-flat.
3. Crank refraction->1, aberration->0.6: expect heavy warp + visible fringing.
4. Record a performance trace while dragging the size slider; confirm no map
   regeneration and smooth frames.
5. Read the console for SVG/filter errors.

## Known tradeoff

Percentage gradient stops make the edge band a percent of the element, so extreme
aspect ratios show a thicker band on the long axis (see `docs/02` §2.9). Document,
don't "fix" silently.

## References

- `docs/02-refraction-technique.md` (authoritative technique, full primitive chain)
- `docs/03-engine-spec.md` (engine API)
- `docs/05-exporters-spec.md` (how the chain is serialized for export)
