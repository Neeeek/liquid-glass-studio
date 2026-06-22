// React 19 hook wrapping the framework-agnostic LiquidGlass engine.
// See docs/04-react-integration.md §4.2 — implemented verbatim per spec.
import { useEffect, useRef } from 'react';
import { LiquidGlass, LiquidGlassOptions } from './liquidGlass';

export function useLiquidGlass<T extends HTMLElement>(
  options: Partial<LiquidGlassOptions>
) {
  const ref = useRef<T>(null);
  const inst = useRef<LiquidGlass | null>(null);

  // Create once on mount; destroy on unmount (StrictMode-safe).
  useEffect(() => {
    if (!ref.current) return;
    inst.current = new LiquidGlass(ref.current, options);
    return () => {
      inst.current?.destroy();
      inst.current = null;
    };
    // Intentionally run once; live updates handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push live option changes to the engine.
  useEffect(() => {
    inst.current?.update(options);
  }, [options]);

  // Re-fit geometry after any render that may have changed size/radius.
  useEffect(() => {
    inst.current?.refresh();
  });

  return ref;
}
