# 08 — Acceptance Criteria & Known Limitations

## 8.1 Definition of done (MVP)
- [ ] `npm install && npm run dev` starts with no type errors.
- [ ] `npm run build` completes (strict TS) with no errors.
- [ ] Live preview shows clear **refraction** in Chromium (background bends near the
  edges/corners, near‑flat center).
- [ ] All four corners are **visually consistent** (no nested‑radius halo, no
  diagonal hot corners). Verify at radius 0, 44, and 120 px.
- [ ] Sliders update the preview live: refraction, chromatic aberration, edge band,
  blur, corner radius, width, height, both tints.
- [ ] Presets apply instantly and look correct.
- [ ] Export tabs (CSS/SCSS/SASS) regenerate code on every relevant change.
- [ ] Copy button copies; Download button downloads the correct file extension.
- [ ] Pasting the exported snippet into a blank HTML page (colorful bg + element of
  the exported size and class) reproduces the preview in Chromium.
- [ ] In Safari/Firefox the preview and the exported snippet both show a clean blur
  fallback (no broken/invisible element), and the SupportBadge reports the
  fallback state.
- [ ] `prefers-reduced-motion` disables the background drift animation.

## 8.2 Visual quality checks
- Default (refraction 0.45, aberration 0.18) reads as subtle, premium glass.
- Pushing refraction → 1 and aberration → ~0.6 yields a dramatic, rippling look
  with visible color fringing.
- Rim‑light is uniform around the perimeter (slightly brighter top/bottom),
  symmetric left/right.

## 8.3 Performance checks
- Continuously resizing the preview stays smooth (no jank); resizing must NOT
  regenerate map data‑URIs (only updates `feImage` width/height).
- Multiple instances on the page each have a unique filter id and render
  independently (test with at least two).
- Unmounting (or `destroy()`) removes the `<filter>` node and clears inline styles
  (no leaks; check the `#lg-defs` container does not accumulate stale filters).

## 8.4 Known limitations (document these in README + UI footer)
1. **Chromium‑only refraction.** `backdrop-filter: url(#svgFilter)` with
   `feDisplacementMap` does not run in Safari/Firefox; they get a blur fallback.
   This is the headline tradeoff and a good portfolio talking point.
2. **Edge band is percentage‑based.** On extreme aspect ratios the band looks
   thicker on the longer axis (see `02-refraction-technique.md` §2.9). Acceptable
   for MVP; a per‑axis percentage fix is a future enhancement.
3. **Squircle corners are disabled** to keep the element edge, rim‑light, and map on
   one circular radius. Reintroducing `corner-shape: superellipse` requires the
   displacement map to match the superellipse curve.
4. **`@supports not (backdrop-filter: url(#x))` is heuristic.** Some engines accept
   the `url()` value syntactically but still won't render the SVG filter on the
   backdrop; the JS feature flag (`supportsRefraction`) plus the blur fallback
   together cover this in practice.

## 8.5 Suggested follow‑up work (not required for MVP)
- High‑fidelity Tier‑2 fallback styling for Safari/Firefox (richer glassmorphism).
- Demo scenes: glass navbar/dock, modal/command palette, AI chat input.
- Shareable settings via URL query string.
- Optional npm package extraction of `src/lib/` (engine + hook + exporters).
~~~

---
