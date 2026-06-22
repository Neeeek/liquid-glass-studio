// Copy-paste exporters (CSS / SCSS / SASS) for the Liquid Glass refraction effect.
// Pure functions — no DOM access except `downloadText` (UI download trigger).
// See docs/05-exporters-spec.md (contract) and docs/02-refraction-technique.md (filter chain).

import { LiquidGlassOptions, mapURIs } from './liquidGlass';

export type Format = 'html' | 'css' | 'scss' | 'sass' | 'js';

export interface ExportArgs {
  opts: LiquidGlassOptions;
  w: number; // element width in px
  h: number; // element height in px
  radius: number; // border-radius in px
  id?: string; // filter id + class name, default 'liquid-glass'
}

/**
 * Builds the SVG filter block (the shared markup pasted once into the user's
 * HTML). Embeds current geometry (feImage width/height) and current params
 * (displacement scales, blur). See docs/05 §5.2 / docs/02 §2.6.
 */
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

/** Plain CSS output: `.${id}` class + `::before` rim-light + `@supports` fallback. */
function cssBlock({ opts, radius, id = 'liquid-glass' }: ExportArgs): string {
  return `.${id} {
  position: relative;
  border-radius: ${radius}px;
  color: #fff;
  background: linear-gradient(to bottom, ${opts.tintTop}, ${opts.tintBottom});
  -webkit-backdrop-filter: url(#${id});
          backdrop-filter: url(#${id});
  box-shadow:
    0 8px 32px rgba(0, 0, 0, .18),
    inset 0 1px 1px rgba(255, 255, 255, .4),
    inset 0 -1px 1px rgba(0, 0, 0, .08);
}
.${id}::before {
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
  .${id} {
    -webkit-backdrop-filter: blur(${opts.blur + 6}px);
            backdrop-filter: blur(${opts.blur + 6}px);
  }
}`;
}

/** SCSS output: `$lg-*` variables + `@mixin liquid-glass($id)` applied to `.${id}`. */
function scssBlock({ opts, radius, id = 'liquid-glass' }: ExportArgs): string {
  return `$lg-radius: ${radius}px;
$lg-blur: ${opts.blur}px;
$lg-tint-top: ${opts.tintTop};
$lg-tint-bottom: ${opts.tintBottom};

@mixin liquid-glass($id: ${id}) {
  position: relative;
  border-radius: $lg-radius;
  color: #fff;
  background: linear-gradient(to bottom, $lg-tint-top, $lg-tint-bottom);
  -webkit-backdrop-filter: url("##{$id}");
          backdrop-filter: url("##{$id}");
  box-shadow:
    0 8px 32px rgba(0, 0, 0, .18),
    inset 0 1px 1px rgba(255, 255, 255, .4),
    inset 0 -1px 1px rgba(0, 0, 0, .08);

  &::before {
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
    -webkit-backdrop-filter: blur(#{$lg-blur + 6});
            backdrop-filter: blur(#{$lg-blur + 6});
  }
}

.${id} {
  @include liquid-glass();
}`;
}

/** SASS output (indented syntax): same as SCSS, no braces/semicolons. */
function sassBlock({ opts, radius, id = 'liquid-glass' }: ExportArgs): string {
  return `$lg-radius: ${radius}px
$lg-blur: ${opts.blur}px
$lg-tint-top: ${opts.tintTop}
$lg-tint-bottom: ${opts.tintBottom}

=liquid-glass($id: ${id})
  position: relative
  border-radius: $lg-radius
  color: #fff
  background: linear-gradient(to bottom, $lg-tint-top, $lg-tint-bottom)
  -webkit-backdrop-filter: url("##{$id}")
  backdrop-filter: url("##{$id}")
  box-shadow: 0 8px 32px rgba(0, 0, 0, .18), inset 0 1px 1px rgba(255, 255, 255, .4), inset 0 -1px 1px rgba(0, 0, 0, .08)

  &::before
    content: ""
    position: absolute
    inset: 0
    border-radius: inherit
    padding: 1.5px
    background: linear-gradient(to bottom, rgba(255,255,255,.85), rgba(255,255,255,.18) 38%, rgba(255,255,255,.18) 62%, rgba(255,255,255,.55))
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)
    -webkit-mask-composite: xor
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)
    mask-composite: exclude
    pointer-events: none

  @supports not (backdrop-filter: url(#x))
    -webkit-backdrop-filter: blur(#{$lg-blur + 6})
    backdrop-filter: blur(#{$lg-blur + 6})

.${id}
  +liquid-glass`;
}

export interface JsSnippet {
  label: string;
  code: string;
}

/**
 * Resize-sync examples: the SVG filter's two `<feImage>` maps are sized with
 * fixed width/height attributes. If the glass element auto-sizes to content
 * (instead of using a fixed CSS width/height), those attributes need to be
 * kept in sync with a ResizeObserver — the same thing `LiquidGlass.refresh()`
 * does internally. Four equivalent, independent examples.
 */
export function jsSnippets({ id = 'liquid-glass' }: ExportArgs): JsSnippet[] {
  return [
    {
      label: 'Vanilla JS',
      code: `const el = document.querySelector('.${id}');
const maps = document.querySelectorAll('#${id} feImage');

function syncLiquidGlassSize() {
  const { width, height } = el.getBoundingClientRect();
  maps.forEach((m) => {
    m.setAttribute('width', width);
    m.setAttribute('height', height);
  });
}

new ResizeObserver(syncLiquidGlassSize).observe(el);
syncLiquidGlassSize();`,
    },
    {
      label: 'React',
      code: `function useLiquidGlassResize(ref, id = '${id}') {
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const maps = document.querySelectorAll(\`#\${id} feImage\`);
    const sync = () => {
      const { width, height } = el.getBoundingClientRect();
      maps.forEach((m) => {
        m.setAttribute('width', width);
        m.setAttribute('height', height);
      });
    };
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    sync();
    return () => ro.disconnect();
  }, [ref, id]);
}
// usage: const ref = useRef(null); useLiquidGlassResize(ref);
//        <div ref={ref} className="${id}">...</div>`,
    },
    {
      label: 'Angular',
      code: `@Directive({ selector: '[liquidGlassResize]' })
export class LiquidGlassResizeDirective implements OnInit, OnDestroy {
  @Input() filterId = '${id}';
  private ro;

  constructor(private host: ElementRef) {}

  ngOnInit() {
    const el = this.host.nativeElement;
    const maps = document.querySelectorAll(\`#\${this.filterId} feImage\`);
    const sync = () => {
      const { width, height } = el.getBoundingClientRect();
      maps.forEach((m) => {
        m.setAttribute('width', String(width));
        m.setAttribute('height', String(height));
      });
    };
    this.ro = new ResizeObserver(sync);
    this.ro.observe(el);
    sync();
  }

  ngOnDestroy() {
    this.ro?.disconnect();
  }
}
// usage: <div class="${id}" liquidGlassResize>...</div>`,
    },
    {
      label: 'Vue',
      code: `import { onMounted, onUnmounted } from 'vue';

export function useLiquidGlassResize(elRef, id = '${id}') {
  let ro;
  const sync = () => {
    const el = elRef.value;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    document.querySelectorAll(\`#\${id} feImage\`).forEach((m) => {
      m.setAttribute('width', width);
      m.setAttribute('height', height);
    });
  };
  onMounted(() => {
    ro = new ResizeObserver(sync);
    ro.observe(elRef.value);
    sync();
  });
  onUnmounted(() => ro?.disconnect());
}
// usage: const el = ref(null); useLiquidGlassResize(el);
//        <div ref="el" class="${id}">...</div>`,
    },
  ];
}

/** Concatenates `jsSnippets` into one copy/download-able text block. */
function jsBlock(args: ExportArgs): string {
  return jsSnippets(args)
    .map((s) => `/* ---------- ${s.label} ---------- */\n${s.code}`)
    .join('\n\n\n');
}

/**
 * Dispatches to the requested format. `html` is the shared SVG filter block
 * (pasted once into the page); `css`/`scss`/`sass` are the stylesheet alone;
 * `js` is the resize-sync examples (concatenated — see `jsSnippets` for the
 * per-framework breakdown the UI renders as separate blocks). See docs/05 §5.6.
 */
export function generate(format: Format, args: ExportArgs): string {
  if (format === 'html') return buildSvg(args);
  if (format === 'css') return cssBlock(args);
  if (format === 'scss') return scssBlock(args);
  if (format === 'sass') return sassBlock(args);
  return jsBlock(args);
}

/**
 * Triggers a browser download of `text` as `filename`. The sole DOM access
 * in this module — by design, for the ExportPanel's download button.
 */
export function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
