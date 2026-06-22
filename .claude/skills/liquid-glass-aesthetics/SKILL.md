---
name: liquid-glass-aesthetics
description: Visual design guidance for achieving a premium Apple-style Liquid Glass look in Liquid Glass Studio. Use when tuning the glass appearance, rim-light, tint, default parameter values, presets, contrast/legibility, or reviewing whether a result looks high-quality vs. cheap glassmorphism. Trigger on styling, preset, or visual-polish tasks.
metadata:
author: Liquid Glass Studio
version: "1.0.0"
tags: [ design, glassmorphism, aesthetics, accessibility, css ]
allowed-tools: Read, Edit, Grep, Glob
---

# Liquid Glass Aesthetics

Taste guide for making the effect look premium and intentional, not like generic
"blur + transparency" glassmorphism.

## What "premium Apple glass" means

- **Refraction does the work, not heavy blur.** Real Liquid Glass bends the
  background (strong near edges, near-flat center). Keep blur low-to-moderate so the
  refraction reads. Default reference: refraction ~0.4-0.45, blur ~2, aberration ~0.15-0.18.
- **Subtle by default, dramatic on demand.** Ship a calm, expensive-looking default;
  let sliders reach the artistic extreme. Don't make the default look like a toy.
- **Edges are the story.** The lens-like rim is where the eye reads "glass." A clean,
  even edge band matters more than a strong center warp.

## Rim-light rules (non-negotiable)

- Use a UNIFORM border-thickness rim-light (the border-mask `::before` technique),
  brighter top and bottom, symmetric left/right.
- NEVER a `135deg` diagonal sheen — it visually breaks the top-left/bottom-right
  corners and looks cheap.
- Keep the rim thin (~1.5px) and bright but not blown-out.

## Tint & depth

- Tint is a gentle top->bottom gradient (e.g. `rgba(255,255,255,.12)` -> `.05`).
  Keep a minimum opacity so the surface reads as a physical object.
- Depth from layered insets + a soft drop shadow:
  inset top highlight, inset bottom highlight, faint inner glow, large soft shadow.
- Avoid muddy/dark tints over dark backgrounds; the glass should feel lit.

## Legibility (this is part of the design, not an afterthought)

- Content over glass must stay readable. If text sits on refracted/blurred backdrop,
  raise tint opacity or add a subtle content scrim — don't sacrifice contrast for
  prettiness.
- Test over the busiest part of the background, not the calm part.

## Presets (intent, not just numbers)

- **Apple (subtle):** the flagship default; quiet, premium.
- **Frosted:** more blur, low refraction; utilitarian/legible surfaces.
- **Crystal:** low blur, high refraction + aberration; jewel-like.
- **Dramatic:** maxed refraction/aberration; demo "wow", not real UI.

## Accessibility-aware aesthetics

- `prefers-reduced-transparency`: increase opacity, reduce blur/refraction — still
  make it look deliberate, not broken.
- `prefers-reduced-motion`: no animated background drift / no pulsing states.
- Maintain WCAG-reasonable contrast for any text on glass.

## Quick review checklist

- [ ] Default reads premium and calm (not over-blurred, not over-warped)?
- [ ] Rim-light uniform; no diagonal hot corners?
- [ ] Corners clean at small AND large radius?
- [ ] Text legible over the busiest background region?
- [ ] Dramatic preset clearly different but still tasteful?

## References

- `docs/01-product-spec.md` (locked design decisions: rim-light, no squircle, Option A default)
- `docs/06-ui-customizer-spec.md` (controls, presets, accessibility)
