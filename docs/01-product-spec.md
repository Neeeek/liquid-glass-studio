# 01 — Product Spec

## Vision
A single‑page web app ("Liquid Glass Studio") where a developer can interactively
design an Apple‑inspired **Liquid Glass** surface (real light **refraction**, not
just a frosted blur) and copy ready‑to‑use **CSS, SCSS, or SASS** into their own
project.

## Why it's interesting (portfolio framing)
- It uses cutting‑edge SVG filtering (`backdrop-filter: url(#filter)` driving an
  `feDisplacementMap`) to genuinely bend the background behind an element.
- The displacement map is built from **vector gradients**, making it
  **resolution‑independent** — it scales to any element size with no recompute.
- It demonstrates senior‑level engineering judgement: feature detection, graceful
  fallbacks for non‑Chromium browsers, performance awareness, and accessibility.

## Target users
Front‑end developers who want the effect quickly without learning SVG filters.
They tune sliders, pick a format tab, and copy.

## Core features (MVP)
1. **Live preview** of a glass card over an animated, colorful background so the
   refraction is clearly visible.
2. **Customizer controls**:
- Refraction strength (0–1)
- Chromatic aberration (0–1)
- Edge band width (% of element)
- Backdrop blur (px)
- Corner radius (px)
- Preview width / height (px)
- Glass tint (top color, bottom color)
3. **Presets** (one click): Apple (subtle), Frosted, Crystal, Dramatic.
4. **Export panel** with three tabs — **CSS / SCSS / SASS** — showing generated
   code, plus a **Copy** button and a **Download file** button.
5. **Browser support badge** that detects whether the visitor's browser supports
   true refraction or will see the fallback.

## Non‑goals (MVP)
- No account system, no persistence/back end.
- No image upload for custom backgrounds.
- Squircle (`corner-shape`) is **not** used in MVP — see note below.

## Important product decisions (locked)
- **Default look = realistic ("Option A")**: subtle, edge‑weighted refraction with
  faint aberration. The sliders allow pushing toward a dramatic look.
- **Squircle disabled.** During prototyping, mixing a CSS squircle
  (`corner-shape: superellipse`) edge with a circular displacement map caused a
  "nested radius halo" at the corners. MVP uses a single **circular**
  `border-radius` shared by the element edge, the rim‑light, and the displacement
  map. (A future enhancement may reintroduce squircles by making the map match.)
- **Rim‑light, not diagonal sheen.** The glossy highlight must be a uniform
  border‑thickness rim‑light (brighter top/bottom, symmetric left/right). A
  diagonal `135deg` sheen biases two corners and must not be used.

## Stretch features (post‑MVP, optional)
- "Download project zip" of a minimal standalone snippet.
- Additional demo scenes (navbar, modal, AI chat input) showcasing real usage.
- A high‑quality Tier‑2 fallback styling for Safari/Firefox.
- Shareable URL state (encode settings in query string).
