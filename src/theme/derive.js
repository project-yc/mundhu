// ─────────────────────────────────────────────────────────────────────────────
// Color derivation — given a single brand hex, compute the accent family.
//
// Used so an organization can supply ONLY their brand color and the rest of
// the recruiter UI (tints, hover, deep, navy, on-brand) is derived
// automatically and stays visually consistent.
// ─────────────────────────────────────────────────────────────────────────────

// ── hex <-> rgb / hsl ────────────────────────────────────────────────────────
export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const v = h.length === 3
    ? h.split('').map((c) => c + c).join('')
    : h;
  const n = parseInt(v, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }) {
  const to = (x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

export function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s; const l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }) {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) { const v = l * 255; return { r: v, g: v, b: v }; }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: hue2rgb(p, q, h + 1 / 3) * 255,
    g: hue2rgb(p, q, h)         * 255,
    b: hue2rgb(p, q, h - 1 / 3) * 255,
  };
}

// Adjust lightness while keeping hue + saturation. delta in percent points.
export function shiftLightness(hex, deltaL) {
  const hsl = rgbToHsl(hexToRgb(hex));
  hsl.l = Math.max(0, Math.min(100, hsl.l + deltaL));
  return rgbToHex(hslToRgb(hsl));
}

// Set lightness to an absolute value.
export function setLightness(hex, l) {
  const hsl = rgbToHsl(hexToRgb(hex));
  hsl.l = Math.max(0, Math.min(100, l));
  return rgbToHex(hslToRgb(hsl));
}

// Relative luminance for contrast decisions.
export function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Pick a readable text color for a given background.
export function readableOn(hex, dark = '#0C4A6E', light = '#FFFFFF') {
  return luminance(hex) > 0.55 ? dark : light;
}

// ─────────────────────────────────────────────────────────────────────────────
// Derive the full brand family from a single hex. Returns the same shape as
// the brand-related fields in palette.js so callers can spread it in.
// ─────────────────────────────────────────────────────────────────────────────
export function deriveBrandFamily(brandHex) {
  const base = brandHex || '#22D3EE';
  const hsl  = rgbToHsl(hexToRgb(base));

  return {
    brand:          base,
    brandHover:     setLightness(base, Math.max(hsl.l - 10, 30)),
    brandDeep:      setLightness(base, 28),                 // text on tint
    brandNavy:      setLightness(base, 18),                 // icon on solid CTA
    brandTint:      setLightness(base, 92),                 // active / badge bg
    brandTintLight: setLightness(base, 96),                 // hover bg
    brandBorder:    setLightness(base, 32),
    onBrand:        readableOn(base, setLightness(base, 18), '#FFFFFF'),
  };
}
