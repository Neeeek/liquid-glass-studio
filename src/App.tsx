import { useState } from 'react';
import { DEFAULTS, LiquidGlassOptions } from './lib/liquidGlass';
import { Preset, PRESETS } from './lib/presets';
import GlassPreview from './components/GlassPreview';
import Controls from './components/Controls';
import ExportPanel from './components/ExportPanel';
import SupportBadge from './components/SupportBadge';

interface Geometry {
  radius: number;
  width: number;
  height: number;
}

// Assumption: sensible default geometry consistent with docs/06 §6.3 slider ranges.
const DEFAULT_GEO: Geometry = { radius: 24, width: 320, height: 200 };

const DEFAULT_PRESET = PRESETS.find((p) => p.name === 'Apple (subtle)') ?? PRESETS[0];

export default function App() {
  const [opts, setOpts] = useState<LiquidGlassOptions>({ ...DEFAULTS, ...DEFAULT_PRESET.opts });
  const [geo, setGeo] = useState<Geometry>(DEFAULT_GEO);
  const [activePreset, setActivePreset] = useState<string | null>(DEFAULT_PRESET.name);

  const onOpts = (o: Partial<LiquidGlassOptions>) => {
    setOpts((prev) => ({ ...prev, ...o }));
    setActivePreset(null);
  };
  const onPresetSelect = (preset: Preset) => {
    setOpts((prev) => ({ ...prev, ...preset.opts }));
    setActivePreset(preset.name);
  };
  const onGeo = (g: Partial<Geometry>) => setGeo((prev) => ({ ...prev, ...g }));

  return (
    <div className="app">
      <header className="hero">
        <h1 className="hero-title">Liquid Glass Studio</h1>
        <p className="hero-desc">
          Tune an Apple-style SVG refraction effect, then copy paste-ready CSS, SCSS, or SASS.
        </p>
        <SupportBadge />
      </header>

      <main className="studio">
        <div className="stage">
          <div className="stage-bg" />
          <div className="stage-stripes" />
          <GlassPreview options={opts} width={geo.width} height={geo.height} radius={geo.radius} />
        </div>
        <aside className="sidebar">
          <Controls
            opts={opts}
            geo={geo}
            activePreset={activePreset}
            onOpts={onOpts}
            onPresetSelect={onPresetSelect}
            onGeo={onGeo}
          />
        </aside>
      </main>

      <section className="output">
        <h2>Export</h2>
        <ExportPanel opts={opts} w={geo.width} h={geo.height} radius={geo.radius} />
      </section>

      <footer className="footer">
        <p>
          Refraction uses <code>backdrop-filter: url(#filter)</code> with{' '}
          <code>feDisplacementMap</code> — currently Chromium-only. Safari and Firefox receive a
          clean blur fallback automatically.
        </p>
        <ul className="footer-limitations">
          <li>Edge band is percentage-based, so extreme aspect ratios show a thicker band on the longer axis.</li>
          <li>Squircle (superellipse) corners are disabled — element edge, rim-light, and displacement map share one circular radius.</li>
          <li>
            The <code>@supports not (backdrop-filter: url(#x))</code> check is heuristic; the{' '}
            <code>supportsRefraction()</code> feature flag plus the blur fallback together cover this in practice.
          </li>
        </ul>
      </footer>
    </div>
  );
}
