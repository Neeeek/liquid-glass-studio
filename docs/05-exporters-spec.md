# 05 — Exporters Spec (`src/lib/exporters.ts`)

Generates copy‑paste output in three formats. Pure functions — no DOM access. They
take the current options + geometry and return a string.

## 5.1 Types
```ts
import { LiquidGlassOptions, mapURIs } from './liquidGlass';

export type Format = 'css' | 'scss' | 'sass';

export interface ExportArgs {
  opts: LiquidGlassOptions;
  w: number;       // element width in px
  h: number;       // element height in px
  radius: number;  // border-radius in px
  id?: string;     // filter id + class name, default 'liquid-glass'
}

export function generate(format: Format, args: ExportArgs): string;
```
## 5.2 Shared SVG block (identical for all formats)
Every output begins with the SVG filter the user pastes once into their HTML. It
must embed the current geometry into the `feImage` `width`/`height` and the current
params into the displacement scales/blur. Reference:
```ts
export function buildSvg({ opts, w, h, id = 'liquid-glass' }: ExportArgs): string {
  const base = opts.refraction * 120;
  const ca = opts.chromaticAberration;
  const { x, y } = mapURIs(opts.edge);
  return `<!-- Paste once anywhere in your HTML. Update feImage width/height to your element size. -->
<svg width="0" height="0" aria-hidden="true" style="position:absolute">
  <filter id="${id}" color-interpolation-filters="sRGB" primitiveUnits="userSpaceOnUse"
          x="-15%" y="-15%" width="130%" height="130%">
    <feImage result="mx" preserveAspectRatio="none" x="0" y="0" width="${w}" height="${h}" href="${x}"/>
    <feImage result="my" preserveAspectRatio="none" x="0" y="0" width="${w}" height="${h}" href="${y}"/>
    <feBlend mode="lighten" in="mx" in2="my" result="map"/>
    <feGaussianBlur in="SourceGraphic" stdDeviation="${opts.blur}" result="b"/>
    <feDisplacementMap in="b" in2="map" scale="${(base * (1 + ca)).toFixed(1)}" xChannelSelector="R" yChannelSelector="G" result="dr"/>
    <feColorMatrix in="dr" type="matrix" result="cr" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"/>
    <feDisplacementMap in="b" in2="map" scale="${base.toFixed(1)}" xChannelSelector="R" yChannelSelector="G" result="dg"/>
    <feColorMatrix in="dg" type="matrix" result="cg" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0"/>
    <feDisplacementMap in="b" in2="map" scale="${(base * (1 - ca)).toFixed(1)}" xChannelSelector="R" yChannelSelector="G" result="db"/>
    <feColorMatrix in="db" type="matrix" result="cb" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0"/>
    <feBlend mode="screen" in="cr" in2="cg" result="rg"/>
    <feBlend mode="screen" in="rg" in2="cb"/>
  </filter>
</svg>`;
}
```
## 5.3 CSS output
After the SVG block, append a CSS class `.${id}` that:
- sets `border-radius: ${radius}px`, `position: relative`, `color: #fff`
- applies `backdrop-filter: url(#${id})` (with `-webkit-` prefix)
- sets the tint `background: linear-gradient(to bottom, tintTop, tintBottom)`
- applies the multi‑inset `box-shadow` for depth
- defines a `.${id}::before` **rim‑light** using the border‑mask technique
- includes a **fallback** `@supports not (backdrop-filter: url(#x))` block that
  replaces the filter with `backdrop-filter: blur(${blur + 6}px)`

Reference rim‑light + fallback (escape the mask‑composite values exactly):
```css
.liquid-glass::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1.5px;
  background: linear-gradient(to bottom,
    rgba(255,255,255,.85), rgba(255,255,255,.18) 38%,
    rgba(255,255,255,.18) 62%, rgba(255,255,255,.55));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask-composite: exclude;
  pointer-events: none;
}
@supports not (backdrop-filter: url(#x)) {
  .liquid-glass {
    -webkit-backdrop-filter: blur(8px);
            backdrop-filter: blur(8px);
  }
}
```
## 5.4 SCSS output
Same visual result, but expose tunable values as `$` variables and wrap the rules
in a `@mixin liquid-glass($id: liquid-glass)`, then apply it: `.liquid-glass {
@include liquid-glass(); }`. Variables to emit: `$lg-radius`, `$lg-blur`,
`$lg-tint-top`, `$lg-tint-bottom`. Reference the filter id with interpolation:
`url("##{$id}")`.

## 5.5 SASS output (indented syntax)
Same as SCSS but in indented `.sass` syntax: no braces, no semicolons, mixin defined
with `=liquid-glass($id: liquid-glass)` and used with `+liquid-glass`. Keep the
`url("##{$id}")` interpolation.

## 5.6 `generate()` dispatch
```ts
export function generate(format: Format, args: ExportArgs): string {
  const svg = buildSvg(args);
  if (format === 'css')  return `${svg}\n\n/* styles.css */\n${cssBlock(args)}`;
  if (format === 'scss') return `${svg}\n\n// styles.scss\n${scssBlock(args)}`;
  return `${svg}\n\n// styles.sass\n${sassBlock(args)}`;
}
```
## 5.7 Download helper (UI uses this)
Provide a small util the ExportPanel calls to download the current output:
```ts
export function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
```
Filenames: `liquid-glass.css`, `liquid-glass.scss`, `liquid-glass.sass`.

## 5.8 Correctness requirement
The exported snippet, pasted into a blank HTML page (with a colorful background and
an element of width `w` × height `h` and the matching class), MUST reproduce the
live preview in Chromium and show the blur fallback elsewhere.
