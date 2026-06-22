# Liquid Glass Studio

A web app for designing Apple-inspired **liquid glass** surface effects and exporting production-ready CSS/SCSS/SASS. Uses cutting-edge SVG filtering to achieve genuine **light refraction** in Chromium browsers.

## What is this?

Liquid Glass Studio is a live customizer where front-end developers can interactively tune an Apple-style frosted-glass effect — adjusting refraction strength, chromatic aberration, edge width, blur, tint, and corner radius — then copy the generated code directly into their own projects.

The effect is achieved with **SVG `feDisplacementMap`** driven by vector gradients, making it resolution-independent and scalable to any element size without recomputation.

## How the refraction works

The refraction technique bends the background behind an element using an SVG filter with `backdrop-filter: url(#filter)`. The distortion is powered by a **displacement map** built from two linear gradients (red channel for X displacement, green for Y):

- Strongest refraction at the **edges/corners** (like a thick lens rim).
- Nearly flat in the **center** for a natural glass effect.
- Optional **chromatic aberration** creates color fringing.
- Progressive **blur** for depth.

The gradients use percentage-based stops, so the map stretches to any element size automatically. For the full technical deep dive, see [`docs/02-refraction-technique.md`](docs/02-refraction-technique.md).

## Browser support

- **Chromium (Chrome, Edge, Brave):** Full refraction effect with SVG displacement.
- **Safari & Firefox:** Graceful fallback to `backdrop-filter: blur(...)` (no refraction, clean styling).

This is a critical portfolio talking point: the app detects support at runtime using CSS `@supports` and a JS feature flag (`supportsRefraction()`), and degrades beautifully on unsupported engines.

## Getting started

```bash
# Install dependencies
npm install

# Start the dev server (Vite, http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview the production build locally
npm run preview
```

## Deployment

Pushes to `main` auto-deploy to GitHub Pages via `.github/workflows/deploy.yml` (builds with `npm run build`, publishes `dist/`). One-time setup in the repo: **Settings → Pages → Source: GitHub Actions**. The Vite `base` is set to `./` (relative), so it works at any subpath without per-repo config.

## Known limitations

1. **Chromium-only refraction.** `backdrop-filter: url(#svgFilter)` with `feDisplacementMap` is a Chromium feature; Safari and Firefox receive a clean blur fallback instead. This is the core browser-support tradeoff and a good demonstration of feature detection + progressive enhancement.

2. **Edge band is percentage-based.** Because the displacement map uses percentage gradient stops (for resolution independence), the refraction band width is a percentage of the element's size. On extreme aspect ratios, the band appears thicker on the longer axis. A future enhancement could compute per-axis percentages to equalize pixel thickness.

3. **Squircle corners are disabled.** The MVP uses a single circular `border-radius` shared by the element edge, the rim-light highlight, and the displacement map. This avoids a "nested radius halo" artifact that would occur if the CSS shape didn't match the SVG map. Reintroducing `corner-shape: superellipse` requires the displacement map geometry to match the superellipse curve.

4. **`@supports` is heuristic.** Some browsers accept `backdrop-filter: url(#x)` syntactically but don't actually render SVG filters on the backdrop. The JS `supportsRefraction()` check plus the blur fallback handle this edge case in practice.

## Documentation

The full specification lives in `/docs`:

- [`01-product-spec.md`](docs/01-product-spec.md) — What we're building and why.
- [`02-refraction-technique.md`](docs/02-refraction-technique.md) — The core technique (read this carefully).
- [`03-engine-spec.md`](docs/03-engine-spec.md) — Framework-agnostic engine API.
- [`04-react-integration.md`](docs/04-react-integration.md) — React 19 hook and component.
- [`05-exporters-spec.md`](docs/05-exporters-spec.md) — CSS/SCSS/SASS code generators.
- [`06-ui-customizer-spec.md`](docs/06-ui-customizer-spec.md) — Landing page UI.
- [`07-tooling-setup.md`](docs/07-tooling-setup.md) — Build tooling and configuration.
- [`08-acceptance-criteria.md`](docs/08-acceptance-criteria.md) — Definition of done and limitations.

See [`docs/00-README.md`](docs/00-README.md) for the full reading order and project principles.

## Stack

- **React 19** + **Vite 6** + **TypeScript 5** (strict mode).
- Plain CSS (no framework).
- SVG filters and CSS `backdrop-filter`.

## License

[MIT](LICENSE) — free to use, modify, and distribute, including commercially.
