// Live glass preview — applies the engine to a styled div. See docs/04 §4.3.
import { LiquidGlassOptions } from '../lib/liquidGlass';
import { useLiquidGlass } from '../lib/useLiquidGlass';

interface Props {
  options: LiquidGlassOptions;
  width: number;
  height: number;
  radius: number;
  children?: React.ReactNode;
}

export default function GlassPreview({ options, width, height, radius, children }: Props) {
  const ref = useLiquidGlass<HTMLDivElement>(options);
  return (
    <div
      ref={ref}
      className="glass-preview"
      style={{
        width,
        height,
        borderRadius: radius,
        background: `linear-gradient(to bottom, ${options.tintTop}, ${options.tintBottom})`,
      }}
    >
      {children}
    </div>
  );
}
