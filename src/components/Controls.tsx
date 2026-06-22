// Sidebar controls: presets, refraction sliders, geometry sliders, tint inputs.
// See docs/06 §6.3.
import { LiquidGlassOptions } from '../lib/liquidGlass';
import { Preset, PRESETS } from '../lib/presets';

interface Geometry {
  radius: number;
  width: number;
  height: number;
}

interface ControlsProps {
  opts: LiquidGlassOptions;
  geo: Geometry;
  activePreset: string | null;
  onOpts: (o: Partial<LiquidGlassOptions>) => void;
  onPresetSelect: (preset: Preset) => void;
  onGeo: (g: Partial<Geometry>) => void;
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
}

function Slider({ label, value, min, max, step, suffix = '', onChange }: SliderProps) {
  const id = `ctrl-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className="control-row">
      <div className="control-row-head">
        <label htmlFor={id}>{label}</label>
        <span className="control-value">
          {value}
          {suffix}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

export default function Controls({
  opts,
  geo,
  activePreset,
  onOpts,
  onPresetSelect,
  onGeo,
}: ControlsProps) {
  return (
    <div className="controls">
      <section className="control-section">
        <h3>Presets</h3>
        <div className="preset-list">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              className={`preset-btn${preset.name === activePreset ? ' active' : ''}`}
              aria-pressed={preset.name === activePreset}
              onClick={() => onPresetSelect(preset)}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </section>

      <section className="control-section">
        <h3>Refraction</h3>
        <Slider
          label="Refraction"
          value={opts.refraction}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => onOpts({ refraction: v })}
        />
        <Slider
          label="Chromatic aberration"
          value={opts.chromaticAberration}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => onOpts({ chromaticAberration: v })}
        />
        <Slider
          label="Edge band"
          value={opts.edge}
          min={4}
          max={45}
          step={1}
          suffix="%"
          onChange={(v) => onOpts({ edge: v })}
        />
        <Slider
          label="Blur"
          value={opts.blur}
          min={0}
          max={12}
          step={0.5}
          suffix="px"
          onChange={(v) => onOpts({ blur: v })}
        />
      </section>

      <section className="control-section">
        <h3>Geometry</h3>
        <Slider
          label="Corner radius"
          value={geo.radius}
          min={0}
          max={120}
          step={1}
          suffix="px"
          onChange={(v) => onGeo({ radius: v })}
        />
        <Slider
          label="Width"
          value={geo.width}
          min={160}
          max={520}
          step={1}
          suffix="px"
          onChange={(v) => onGeo({ width: v })}
        />
        <Slider
          label="Height"
          value={geo.height}
          min={120}
          max={520}
          step={1}
          suffix="px"
          onChange={(v) => onGeo({ height: v })}
        />
      </section>

      <section className="control-section">
        <h3>Tint</h3>
        <div className="control-row">
          <label htmlFor="ctrl-tint-top">Tint top</label>
          <input
            id="ctrl-tint-top"
            type="text"
            value={opts.tintTop}
            onChange={(e) => onOpts({ tintTop: e.target.value })}
          />
        </div>
        <div className="control-row">
          <label htmlFor="ctrl-tint-bottom">Tint bottom</label>
          <input
            id="ctrl-tint-bottom"
            type="text"
            value={opts.tintBottom}
            onChange={(e) => onOpts({ tintBottom: e.target.value })}
          />
        </div>
      </section>
    </div>
  );
}
