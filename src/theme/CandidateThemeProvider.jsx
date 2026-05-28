// ─────────────────────────────────────────────────────────────────────────────
// CandidateThemeProvider
//
// Applies the org's brand color as CSS custom properties for all candidate-
// facing pages. Reuses the same --color-brand* variable family as the recruiter
// side so all Tailwind semantic tokens (bg-brand, text-on-brand, etc.) work
// automatically on candidate pages too.
//
// Usage:
//   1. When the assessment overview loads, call:
//        saveCandidateBranding(overview.org_branding)
//        applyCandidateBranding(overview.org_branding)
//   2. CandidatePageShell calls applyCandidateBranding(loadCandidateBranding())
//      on every mount — no extra wiring needed for subsequent pages.
// ─────────────────────────────────────────────────────────────────────────────

import { deriveBrandFamily } from './derive.js';

const STORAGE_KEY = 'trudev_candidate_branding';

export const DEFAULT_CANDIDATE_BRANDING = {
  brand_color:    '#22D3EE',
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

// ── Theme application ─────────────────────────────────────────────────────────
// Derives the full brand family from the org's brand_color and writes it to
// the same --color-brand* CSS variables used by the recruiter theme. This means
// all Tailwind token classes (bg-brand, hover:bg-brand-hover, text-on-brand,
// bg-brand-tint, border-brand-border, etc.) automatically reflect the org brand.

export function applyCandidateBranding(branding) {
  try {
    const data = branding || DEFAULT_CANDIDATE_BRANDING;
    const derived = deriveBrandFamily(data.brand_color || DEFAULT_CANDIDATE_BRANDING.brand_color);
    const root = document.documentElement;

    root.style.setProperty('--color-brand',            derived.brand);
    root.style.setProperty('--color-brand-hover',      derived.brandHover);
    root.style.setProperty('--color-brand-deep',       derived.brandDeep);
    root.style.setProperty('--color-brand-navy',       derived.brandNavy);
    root.style.setProperty('--color-brand-tint',       derived.brandTint);
    root.style.setProperty('--color-brand-tint-light', derived.brandTintLight);
    root.style.setProperty('--color-brand-border',     derived.brandBorder);
    root.style.setProperty('--color-on-brand',         derived.onBrand);
  } catch { /* non-browser environment */ }
}

