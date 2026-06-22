// Liquid Glass refraction engine — framework-agnostic (no React imports).
// Owns all DOM/SVG manipulation. See docs/02-refraction-technique.md (critical)
// and docs/03-engine-spec.md.

const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

export interface LiquidGlassOptions {
  refraction: number; // 0..1  (maps to displacement base = refraction * 120 px)
  blur: number; // px, backdrop blur (stdDeviation)
  chromaticAberration: number; // 0..1  (per-channel scale spread)
  edge: number; // edge band as % of element (1..49)
  tintTop: string; // CSS color for top of glass tint gradient
  tintBottom: string; // CSS color for bottom of glass tint gradient
}

export const DEFAULTS: LiquidGlassOptions = {
  refraction: 0.45,
  blur: 2,
  chromaticAberration: 0.18,
  edge: 14,
  tintTop: 'rgba(255,255,255,.12)',
  tintBottom: 'rgba(255,255,255,.05)',
};

// Encode an SVG string as an encodeURIComponent data URI (not base64).
const enc = (s: string) =>
  'data:image/svg+xml,' + encodeURIComponent(s.replace(/\s+/g, ' ').trim());

/**
 * Returns the X-map and Y-map displacement data-URIs for a given edge band %.
 * Pure function. See docs/02 §2.3.
 */
export function mapURIs(edgePct: number): { x: string; y: string } {
  const p = edgePct;
  const q = 100 - edgePct;

  const x = enc(
    `<svg xmlns='${SVG_NS}' width='100' height='100' viewBox='0 0 100 100' preserveAspectRatio='none'>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='0'>
        <stop offset='0%' stop-color='#000000'/>
        <stop offset='${p}%' stop-color='#800000'/>
        <stop offset='${q}%' stop-color='#800000'/>
        <stop offset='100%' stop-color='#ff0000'/>
      </linearGradient>
      <rect width='100' height='100' fill='url(#g)'/>
    </svg>`
  );

  const y = enc(
    `<svg xmlns='${SVG_NS}' width='100' height='100' viewBox='0 0 100 100' preserveAspectRatio='none'>
      <linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stop-color='#000000'/>
        <stop offset='${p}%' stop-color='#008000'/>
        <stop offset='${q}%' stop-color='#008000'/>
        <stop offset='100%' stop-color='#00ff00'/>
      </linearGradient>
      <rect width='100' height='100' fill='url(#g)'/>
    </svg>`
  );

  return { x, y };
}

/**
 * Chromium feature check. SSR-safe. See docs/02 §2.8.
 */
export function supportsRefraction(): boolean {
  if (typeof window === 'undefined') return false; // SSR guard
  return (
    CSS.supports('backdrop-filter', 'url(#x)') ||
    CSS.supports('-webkit-backdrop-filter', 'url(#x)')
  );
}

let instanceCounter = 0;

const DEFS_ID = 'lg-defs';

function ensureDefs(): SVGSVGElement {
  const existing = document.getElementById(DEFS_ID);
  if (existing) return existing as unknown as SVGSVGElement;

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('id', DEFS_ID);
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
  document.body.appendChild(svg);
  return svg;
}

function el(name: string, attrs: Record<string, string>): SVGElement {
  const node = document.createElementNS(SVG_NS, name);
  for (const k in attrs) node.setAttribute(k, attrs[k]);
  return node;
}

export class LiquidGlass {
  // Public, readable fields (consumed by the exporters module).
  w = 0;
  h = 0;
  radius = 0;
  id: string;
  opts: LiquidGlassOptions;

  private el: HTMLElement;
  private filter: SVGFilterElement;

  // Primitive handles set during filter construction.
  private feMx!: SVGElement;
  private feMy!: SVGElement;
  private feBlur!: SVGElement;
  private feR!: SVGElement;
  private feG!: SVGElement;
  private feB!: SVGElement;

  private ro: ResizeObserver;
  private rafHandle: number | null = null;
  private lastEdge = -1;

  constructor(element: HTMLElement, options?: Partial<LiquidGlassOptions>) {
    this.el = element;
    this.opts = { ...DEFAULTS, ...options };
    this.id = `lg-${++instanceCounter}`;

    const defs = ensureDefs();

    // Build the filter primitive chain (docs/02 §2.6).
    this.filter = document.createElementNS(SVG_NS, 'filter');
    this.filter.setAttribute('id', this.id);
    this.filter.setAttribute('color-interpolation-filters', 'sRGB');
    this.filter.setAttribute('primitiveUnits', 'userSpaceOnUse');
    this.filter.setAttribute('x', '-15%');
    this.filter.setAttribute('y', '-15%');
    this.filter.setAttribute('width', '130%');
    this.filter.setAttribute('height', '130%');

    this.feMx = el('feImage', {
      class: 'lg-mx',
      result: 'mx',
      preserveAspectRatio: 'none',
      x: '0',
      y: '0',
      width: '0',
      height: '0',
    });
    this.feMy = el('feImage', {
      class: 'lg-my',
      result: 'my',
      preserveAspectRatio: 'none',
      x: '0',
      y: '0',
      width: '0',
      height: '0',
    });
    const blendMap = el('feBlend', {
      mode: 'lighten',
      in: 'mx',
      in2: 'my',
      result: 'map',
    });

    this.feBlur = el('feGaussianBlur', {
      class: 'lg-blur',
      in: 'SourceGraphic',
      stdDeviation: '2',
      result: 'b',
    });

    this.feR = el('feDisplacementMap', {
      class: 'lg-r',
      in: 'b',
      in2: 'map',
      scale: '0',
      xChannelSelector: 'R',
      yChannelSelector: 'G',
      result: 'dr',
    });
    const cr = el('feColorMatrix', {
      in: 'dr',
      type: 'matrix',
      result: 'cr',
      values: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0',
    });

    this.feG = el('feDisplacementMap', {
      class: 'lg-g',
      in: 'b',
      in2: 'map',
      scale: '0',
      xChannelSelector: 'R',
      yChannelSelector: 'G',
      result: 'dg',
    });
    const cg = el('feColorMatrix', {
      in: 'dg',
      type: 'matrix',
      result: 'cg',
      values: '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0',
    });

    this.feB = el('feDisplacementMap', {
      class: 'lg-b',
      in: 'b',
      in2: 'map',
      scale: '0',
      xChannelSelector: 'R',
      yChannelSelector: 'G',
      result: 'db',
    });
    const cb = el('feColorMatrix', {
      in: 'db',
      type: 'matrix',
      result: 'cb',
      values: '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0',
    });

    const blendRG = el('feBlend', {
      mode: 'screen',
      in: 'cr',
      in2: 'cg',
      result: 'rg',
    });
    const blendRGB = el('feBlend', {
      mode: 'screen',
      in: 'rg',
      in2: 'cb',
    });

    this.filter.append(
      this.feMx,
      this.feMy,
      blendMap,
      this.feBlur,
      this.feR,
      cr,
      this.feG,
      cg,
      this.feB,
      cb,
      blendRG,
      blendRGB
    );
    defs.appendChild(this.filter);

    // Apply the filter to the element's backdrop.
    this.el.style.backdropFilter = `url(#${this.id})`;
    (this.el.style as CSSStyleDeclaration & {
      webkitBackdropFilter?: string;
    }).webkitBackdropFilter = `url(#${this.id})`;

    this.buildMaps();
    this.refresh();
    this.update();

    this.ro = new ResizeObserver(() => this.scheduleRefresh());
    this.ro.observe(this.el);
  }

  /**
   * Reads live geometry (size + computed border-radius) and updates the feImage
   * dimensions. Cheap — safe to call every frame.
   */
  refresh(): void {
    const rect = this.el.getBoundingClientRect();
    this.w = rect.width;
    this.h = rect.height;
    this.radius = parseFloat(
      getComputedStyle(this.el).borderTopLeftRadius
    ) || 0;

    const w = String(this.w);
    const h = String(this.h);
    this.feMx.setAttribute('width', w);
    this.feMx.setAttribute('height', h);
    this.feMy.setAttribute('width', w);
    this.feMy.setAttribute('height', h);
  }

  /**
   * Merges options (if given), recomputes displacement scales + blur, and
   * rebuilds maps only if the edge band % changed.
   */
  update(options?: Partial<LiquidGlassOptions>): void {
    if (options) this.opts = { ...this.opts, ...options };

    const base = this.opts.refraction * 120;
    const ca = this.opts.chromaticAberration;

    this.feR.setAttribute('scale', String(base * (1 + ca)));
    this.feG.setAttribute('scale', String(base));
    this.feB.setAttribute('scale', String(base * (1 - ca)));

    this.feBlur.setAttribute('stdDeviation', String(this.opts.blur));

    if (this.opts.edge !== this.lastEdge) this.buildMaps();
  }

  /**
   * Disconnects observers, cancels pending work, removes the filter, and clears
   * the element's inline backdrop-filter styles.
   */
  destroy(): void {
    this.ro.disconnect();
    if (this.rafHandle !== null) {
      cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
    this.filter.remove();
    this.el.style.backdropFilter = '';
    (this.el.style as CSSStyleDeclaration & {
      webkitBackdropFilter?: string;
    }).webkitBackdropFilter = '';
  }

  private buildMaps(): void {
    const { x, y } = mapURIs(this.opts.edge);
    this.feMx.setAttribute('href', x);
    this.feMx.setAttributeNS(XLINK_NS, 'xlink:href', x);
    this.feMy.setAttribute('href', y);
    this.feMy.setAttributeNS(XLINK_NS, 'xlink:href', y);
    this.lastEdge = this.opts.edge;
  }

  private scheduleRefresh(): void {
    if (this.rafHandle !== null) return;
    this.rafHandle = requestAnimationFrame(() => {
      this.rafHandle = null;
      this.refresh();
    });
  }
}
