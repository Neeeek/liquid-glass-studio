// Pill showing whether the browser supports SVG-filter refraction. See docs/06 §6.5.
import { useState } from 'react';
import { supportsRefraction } from '../lib/liquidGlass';

export default function SupportBadge() {
  const [supported] = useState(supportsRefraction);

  return supported ? (
    <span className="badge badge-ok">supported (Chromium)</span>
  ) : (
    <span className="badge badge-warn">falls back to blur</span>
  );
}
