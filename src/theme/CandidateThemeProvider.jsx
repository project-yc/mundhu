// ─────────────────────────────────────────────────────────────────────────────
// CandidateThemeProvider
//
// Candidate screens run on a dark "warm charcoal + ember" surface. Two things
// have to happen for that to be true:
//
//   1. The full CANDIDATE_PALETTE has to be written to the --color-* variables
//      that Tailwind's semantic tokens read (bg-page, bg-surface, text-primary…).
//      Without this, candidate pages silently fall through to the light
//      recruiter defaults in index.css.
//
//   2. The org's brand color, if they have one, overrides the ember family —
//      derived for DARK surfaces, not light ones.
//
// Both are scoped to the `.candidate-theme` element rather than :root, so the
// recruiter app running in the same SPA is never affected.
//
// Usage:
//   Wrap any candidate route in <CandidateThemeScope>. It applies the palette
//   on mount and re-applies the org brand whenever branding changes.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { deriveDarkBrandFamily, rgba } from './derive.js';
import { CANDIDATE_PALETTE, CSS_VAR_KEYS } from './palette.js';

const STORAGE_KEY = 'trudev_candidate_branding';

export const DEFAULT_CANDIDATE_BRANDING = {
  brand_color:    CANDIDATE_PALETTE.brand,
  logo_url:       '',
  candidate_name: '',
  org_name:       '',
  tagline:        '',
};

// ── Session storage helpers ───────────────────────────────────────────────────

export function saveCandidateBranding(branding) {
  try {
    if (branding) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(branding));
  } catch { /* storage unavailable */ }
}

export function loadCandidateBranding() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

// ── Palette application ───────────────────────────────────────────────────────

// Writes every CANDIDATE_PALETTE key that has a CSS variable mapping onto the
// given element. Falls back to documentElement so callers outside the scope
// wrapper (older screens) still get the dark surface.
export function applyCandidatePalette(element) {
  const target = element || (typeof document !== 'undefined' ? document.documentElement : null);
  if (!target) return;

  Object.entries(CANDIDATE_PALETTE).forEach(([key, value]) => {
    const cssVar = CSS_VAR_KEYS[key];
    if (cssVar) target.style.setProperty(cssVar, value);
  });
}

// Applies the org's brand color over the ember family, derived for dark
// surfaces. Called after applyCandidatePalette so it wins.
export function applyCandidateBranding(branding, element) {
  const target = element || (typeof document !== 'undefined' ? document.documentElement : null);
  if (!target) return;

  try {
    const data      = branding || DEFAULT_CANDIDATE_BRANDING;
    const brandColor = data.brand_color || DEFAULT_CANDIDATE_BRANDING.brand_color;
    const derived    = deriveDarkBrandFamily(brandColor);

    // With no org override we're on the product's own ember, and the hand-tuned
    // palette values beat anything the deriver can compute from a single hex.
    const isDefaultBrand = brandColor.toUpperCase() === CANDIDATE_PALETTE.brand.toUpperCase();

    target.style.setProperty('--color-brand',            derived.brand);
    target.style.setProperty('--color-brand-hover',      derived.brandHover);
    target.style.setProperty('--color-brand-deep',       derived.brandDeep);
    target.style.setProperty('--color-brand-navy',       derived.brandNavy);
    target.style.setProperty('--color-brand-tint',       derived.brandTint);
    target.style.setProperty('--color-brand-tint-light', derived.brandTintLight);
    target.style.setProperty('--color-brand-border',     derived.brandBorder);
    target.style.setProperty('--color-on-brand',         derived.onBrand);

    if (isDefaultBrand) return;

    target.style.setProperty('--color-ember',        derived.ember);
    target.style.setProperty('--color-ember-bright', derived.emberBright);
    target.style.setProperty('--color-ember-soft',   derived.emberSoft);
    target.style.setProperty('--color-ember-faint',  derived.emberFaint);
    target.style.setProperty('--color-ember-glow',   rgba(derived.ember, 0.45));
    target.style.setProperty('--color-ember-wash',   rgba(derived.emberBright, 0.08));
    target.style.setProperty('--color-ember-edge',   rgba(derived.emberBright, 0.22));
  } catch { /* non-browser environment */ }
}

// ── Scope wrapper ─────────────────────────────────────────────────────────────

// Portalled UI (dialogs, sheets, popovers) mounts on <body>, outside the scope
// element — so it would inherit the light recruiter variables. Components read
// this container and portal into the scope instead.
const CandidateThemeContext = createContext(null);

export function useCandidateThemeContainer() {
  return useContext(CandidateThemeContext);
}

/**
 * Establishes the candidate dark theme for everything inside it.
 *
 * Variables are set on this element, so the cascade takes care of the rest and
 * the recruiter side keeps its own :root values.
 */
export function CandidateThemeScope({ children, branding, className = '' }) {
  const ref = useRef(null);
  const [container, setContainer] = useState(null);

  // Candidate screens run on the product's own ember palette. The org's stored
  // `brand_color` is deliberately NOT applied to the color family — orgs still
  // brand these screens through their logo, name and tagline. Re-enable
  // per-org accent colors by calling applyCandidateBranding here, but note
  // that any legacy brand color in the org record (many are still the old
  // cyan default) will take over the whole candidate theme.
  useEffect(() => {
    if (!ref.current) return;
    applyCandidatePalette(ref.current);
    setContainer(ref.current);
  }, [branding]);

  // The page background lives on <body> too, so overscroll doesn't reveal white.
  useEffect(() => {
    const previous = document.body.style.backgroundColor;
    document.body.style.backgroundColor = CANDIDATE_PALETTE.pageBg;
    return () => { document.body.style.backgroundColor = previous; };
  }, []);

  return (
    <CandidateThemeContext.Provider value={container}>
      <div ref={ref} className={`candidate-theme ${className}`}>
        {children}
      </div>
    </CandidateThemeContext.Provider>
  );
}
