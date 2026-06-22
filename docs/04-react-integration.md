# 04 — React 19 Integration

Target: **React 19** + **react-dom 19**. The engine (doc 03) is consumed via a hook
and an optional component. Keep React‑specific code out of `src/lib/liquidGlass.ts`.

## 4.1 React 19 notes that affect this code
- **Refs as props:** In React 19, function components can accept `ref` as a normal
  prop; `forwardRef` is no longer required (but still works). The optional
  `GlassPreview` component below may accept `ref` directly.
- **StrictMode double‑invoke (dev):** Effects run setup → cleanup → setup again in
  dev. The hook MUST fully create on setup and fully `destroy()` on cleanup so the
  second setup produces a clean instance (no duplicate `<filter>` nodes).
- `ReactDOM.createRoot(...).render(<App/>)` is unchanged. Keep `StrictMode` on.

## 4.2 The hook (`src/lib/useLiquidGlass.ts`)
```ts
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
```
### Contract
- `options` may be a fresh object each render; the update effect is cheap so that
  is acceptable. Callers should memoize if they prefer.
- The returned `ref` is attached to the element that should become glass.

## 4.3 Optional component (`src/components/GlassPreview.tsx`)
A thin convenience wrapper used by the live preview. Requirements:
- Accepts `options: LiquidGlassOptions`, plus `width`, `height`, `radius` numbers,
  and `children`.
- Applies the engine via `useLiquidGlass`.
- Renders a `<div>` with inline `width`, `height`, `borderRadius`, and the tint
  `background` gradient, plus class `glass-preview`.
- Renders the rim‑light via the `.glass-preview::before` rule (doc 06 CSS), not via
  JS.

Reference:
```tsx
import { LiquidGlassOptions } from '../lib/liquidGlass';
import { useLiquidGlass } from '../lib/useLiquidGlass';

interface Props {
  options: LiquidGlassOptions;
  width: number; height: number; radius: number;
  children?: React.ReactNode;
}

export default function GlassPreview({ options, width, height, radius, children }: Props) {
  const ref = useLiquidGlass<HTMLDivElement>(options);
  return (
    <div
      ref={ref}
      className="glass-preview"
      style={{
        width, height, borderRadius: radius,
        background: `linear-gradient(to bottom, ${options.tintTop}, ${options.tintBottom})`,
      }}
    >
      {children}
    </div>
  );
}
```
## 4.4 App state shape
`App.tsx` holds two pieces of state:
- `opts: LiquidGlassOptions` (visual params).
- `geo: { radius: number; width: number; height: number }` (geometry).

It passes `opts` into `useLiquidGlass`/`GlassPreview`, and passes both `opts` and
`geo` to the exporter (doc 05) so generated code matches the preview exactly.
