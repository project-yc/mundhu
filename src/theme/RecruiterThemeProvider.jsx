// ─────────────────────────────────────────────────────────────────────────────
// RecruiterThemeProvider
//
// Applies the recruiter color palette as CSS custom properties on the document
// root. Loads the org's brand color from (in priority order):
//
//   1. `org.branding.brand_color` in localStorage (set by login/launch API response)
//   2. `org.brand_color` in localStorage (legacy flat shape)
//   3. RECRUITER_PALETTE.brand fallback
//
// Brand color is derived into the full accent family via `derive.js`. The page
// background, surfaces, borders and text colors stay FIXED — only the brand
// family changes per organization.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { RECRUITER_PALETTE, CSS_VAR_KEYS } from './palette.js';
import { deriveBrandFamily } from './derive.js';

const ThemeCtx = createContext({ palette: RECRUITER_PALETTE, brand: RECRUITER_PALETTE.brand });

export function useRecruiterTheme() {
  return useContext(ThemeCtx);
}

function readOrgBrandFromStorage() {
  try {
    const org = JSON.parse(localStorage.getItem('org') || '{}');
    // Login API stores branding under org.branding.brand_color
    return org?.branding?.brand_color || org?.brand_color || org?.brandColor || null;
  } catch {
    return null;
  }
}

function applyPaletteToRoot(palette, root = document.documentElement) {
  for (const [key, cssVar] of Object.entries(CSS_VAR_KEYS)) {
    if (palette[key] != null) root.style.setProperty(cssVar, palette[key]);
  }
  // Mark the document so global selectors / scrollbar / selection styles can
  // pick up the recruiter context if needed.
  root.dataset.theme = 'recruiter';
}

function clearRecruiterTheme(root = document.documentElement) {
  for (const cssVar of Object.values(CSS_VAR_KEYS)) {
    root.style.removeProperty(cssVar);
  }
  if (root.dataset.theme === 'recruiter') delete root.dataset.theme;
}

export function RecruiterThemeProvider({ children }) {
  const [brand, setBrand] = useState(() => readOrgBrandFromStorage() || RECRUITER_PALETTE.brand);

  const palette = useMemo(
    () => ({ ...RECRUITER_PALETTE, ...deriveBrandFamily(brand) }),
    [brand],
  );

  useEffect(() => {
    applyPaletteToRoot(palette);
    return () => clearRecruiterTheme();
  }, [palette]);

  const value = useMemo(() => ({ palette, brand, setBrand }), [palette, brand]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}
