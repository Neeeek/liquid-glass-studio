// Copy-paste export panel: HTML/CSS/SCSS/SASS/JS tabs + copy/download. See docs/06 §6.4.
import { useMemo, useState } from 'react';
import { LiquidGlassOptions } from '../lib/liquidGlass';
import { Format, generate, downloadText, jsSnippets } from '../lib/exporters';

interface Props {
  opts: LiquidGlassOptions;
  w: number;
  h: number;
  radius: number;
}

const TABS: Format[] = ['html', 'css', 'scss', 'sass', 'js'];

export default function ExportPanel({ opts, w, h, radius }: Props) {
  const [tab, setTab] = useState<Format>('css');
  const [copied, setCopied] = useState(false);

  const code = useMemo(
    () => generate(tab, { opts, w, h, radius }),
    [tab, opts, w, h, radius]
  );

  const snippets = useMemo(
    () => (tab === 'js' ? jsSnippets({ opts, w, h, radius }) : null),
    [tab, opts, w, h, radius]
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleDownload = () => {
    downloadText(`liquid-glass.${tab}`, code);
  };

  return (
    <div className="export-panel">
      <div className="export-toolbar">
        <div className="export-tabs">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              className={`export-tab${t === tab ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="export-actions">
          <button type="button" className="export-btn" onClick={handleCopy}>
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
          <button type="button" className="export-btn" onClick={handleDownload}>
            Download
          </button>
        </div>
      </div>
      {snippets ? (
        <div className="export-snippets">
          {snippets.map((s) => (
            <div className="export-snippet" key={s.label}>
              <h4 className="export-snippet-label">{s.label}</h4>
              <pre className="export-code">
                <code>{s.code}</code>
              </pre>
            </div>
          ))}
        </div>
      ) : (
        <pre className="export-code">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
