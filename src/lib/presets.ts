// Curated preset combinations for the Controls panel. See docs/06 §6.6.
import { LiquidGlassOptions } from './liquidGlass';

export interface Preset {
  name: string;
  opts: Partial<LiquidGlassOptions>;
}

export const PRESETS: Preset[] = [
  { name: 'Apple (subtle)', opts: { refraction: 0.4, blur: 2, chromaticAberration: 0.15, edge: 13 } },
  { name: 'Frosted', opts: { refraction: 0.25, blur: 8, chromaticAberration: 0.08, edge: 18 } },
  { name: 'Crystal', opts: { refraction: 0.5, blur: 1, chromaticAberration: 0.14, edge: 14 } },
  { name: 'Dramatic', opts: { refraction: 0.55, blur: 0.5, chromaticAberration: 0.22, edge: 20 } },
];
