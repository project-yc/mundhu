// ─────────────────────────────────────────────────────────────────────────────
// Trudev — Global Color Palette
//
// All colors used by the app live here. Two surfaces:
//
//   • RECRUITER_PALETTE — light surfaces, brand-driven accent (cyan default).
//                         Brand color is overridden per-organization at runtime.
//
//   • CANDIDATE_PALETTE — dark surfaces used by candidate / user-facing flows.
//                         Centralized so the palette can be tweaked in one
//                         place without touching screens.
//
// To experiment, edit the hex values below. CSS variables are derived from
// these objects at runtime in `RecruiterThemeProvider` / `CandidateTheme`.
// ─────────────────────────────────────────────────────────────────────────────

export const RECRUITER_PALETTE = {
  // ── Surfaces ──────────────────────────────────────────────────────────────
  pageBg:        '#F8FAFC', // Slate 50  — fixed, NOT brand-driven
  surface:       '#FFFFFF', // card surfaces
  surfaceMuted:  '#F1F5F9', // Slate 100 — input fills, sub-surfaces
  surfaceHover:  '#F8FAFC',
  sidebarBgTop:   '#FF8528',
  sidebarBgMid:   '#FF8528',
  sidebarBgBottom:'#FF8528',
  sidebarControl: '#090E18',
  sidebarControlHover:'#111827',
  sidebarControlText:'#FFFFFF',
  sidebarText:    '#FFFFFF',
  sidebarMuted:   '#FFFFFF',
  sidebarIcon:    '#FFFFFF',
  sidebarActive:  '#FFFFFF',
  sidebarStroke:  '#DCE5F5',
  sidebarShadow:  'rgba(15, 23, 42, 0.14)',
  assessmentAccent:'#249000',
  assessmentStepActive:'#121A33',
  assessmentCta:  '#34B3C5',
  assessmentCtaHover:'#229EAF',
  assessmentCtaText:'#FFFFFF',
  assessmentAllocation:'#FF7A1A',
  reportMetricStart:'#6678EF',
  reportMetricEnd:'#32B5C2',
  reportMetricIconBg:'#90A6F8',
  reportMetricIconText:'#6F82F4',
  reportEmailText:'#9AA9BD',

  // ── Borders ───────────────────────────────────────────────────────────────
  border:        '#E2E8F0', // Slate 200
  borderStrong:  '#CBD5E1', // Slate 300
  borderSubtle:  '#EEF2F6',

  // ── Text ──────────────────────────────────────────────────────────────────
  textPrimary:   '#0F172A', // Slate 900
  textSecondary: '#64748B', // Slate 500
  textMuted:     '#94A3B8', // Slate 400
  textFaint:     '#CBD5E1', // Slate 300

  // ── Brand accent (DEFAULT — overridden per-org) ───────────────────────────
  // The user's default brand is cyan-400. Derived shades are computed at
  // runtime by `derive.js`; the values here mirror those defaults so styles
  // look correct before any branding is loaded.
  brand:         '#22D3EE', // Cyan 400
  brandHover:    '#06B6D4', // Cyan 500
  brandDeep:     '#0E7490', // Cyan 700 — text on brand-tint background
  brandNavy:     '#0C4A6E', // Cyan 900 — icon/text on solid brand button
  brandTint:     '#CFFAFE', // Cyan 100 — badge / active background
  brandTintLight:'#E0F9FC', // Cyan 50  — hover states
  brandBorder:   '#0E7490',
  onBrand:       '#0C4A6E', // text/icon color on top of solid `brand`

  // ── Status (semantic, not brand-driven) ───────────────────────────────────
  success:       '#16A34A',
  successBg:     '#F0FDF4',
  successBorder: '#86EFAC',

  warning:       '#D97706',
  warningBg:     '#FFFBEB',
  warningBorder: '#FCD34D',

  error:         '#DC2626',
  errorBg:       '#FEF2F2',
  errorBorder:   '#FCA5A5',

  info:          '#0E7490',
  infoBg:        '#CFFAFE',
  infoBorder:    '#67E8F9',
};

// ─────────────────────────────────────────────────────────────────────────────
// CANDIDATE PALETTE — dark theme. Frozen for now per product direction;
// values centralized so we can iterate quickly.
// ─────────────────────────────────────────────────────────────────────────────
export const CANDIDATE_PALETTE = {
  pageBg:        '#040914',
  surface:       '#070F20',
  surfaceMuted:  '#0A1628',
  surfaceHover:  '#0D1E38',

  border:        '#0E1F38',
  borderStrong:  '#1A3050',
  borderSubtle:  '#0A1628',

  textPrimary:   '#EDF4FF',
  textSecondary: '#94A3B8',
  textMuted:     '#7A8AA8',
  textFaint:     '#4A5F7A',

  brand:         '#18D3FF',
  brandHover:    '#06B6D4',
  brandDeep:     '#083344',
  brandNavy:     '#040914',
  brandTint:     '#07253A',
  brandTintLight:'#0D2B45',
  brandBorder:   '#0E4A6C',
  onBrand:       '#040914',

  success:       '#4ADE80',
  successBg:     '#041A10',
  successBorder: '#1A4A28',

  warning:       '#F59E0B',
  warningBg:     '#1C150A',
  warningBorder: '#78350F',

  error:         '#F43F5E',
  errorBg:       '#1C0813',
  errorBorder:   '#881337',

  info:          '#18D3FF',
  infoBg:        '#07253A',
  infoBorder:    '#0E4A6C',

  // ── Recruiter accent (used on the split login screen) ─────────────────────
  recruiterAccent:       '#A78BFA',
  recruiterAccentDim:    'rgba(167,139,250,0.12)',
  recruiterAccentGlow:   'rgba(167,139,250,0.25)',
  recruiterAccentBorder: 'rgba(167,139,250,0.35)',
};

// CSS variable name table — keep in sync with tailwind.config.js semantic tokens
export const CSS_VAR_KEYS = {
  pageBg:         '--color-page',
  surface:        '--color-surface',
  surfaceMuted:   '--color-surface-muted',
  surfaceHover:   '--color-surface-hover',
  sidebarBgTop:   '--color-sidebar-bg-top',
  sidebarBgMid:   '--color-sidebar-bg-mid',
  sidebarBgBottom:'--color-sidebar-bg-bottom',
  sidebarControl: '--color-sidebar-control',
  sidebarControlHover:'--color-sidebar-control-hover',
  sidebarControlText:'--color-sidebar-control-text',
  sidebarText:    '--color-sidebar-text',
  sidebarMuted:   '--color-sidebar-muted',
  sidebarIcon:    '--color-sidebar-icon',
  sidebarActive:  '--color-sidebar-active',
  sidebarStroke:  '--color-sidebar-stroke',
  sidebarShadow:  '--color-sidebar-shadow',
  assessmentAccent:'--color-assessment-accent',
  assessmentStepActive:'--color-assessment-step-active',
  assessmentCta:  '--color-assessment-cta',
  assessmentCtaHover:'--color-assessment-cta-hover',
  assessmentCtaText:'--color-assessment-cta-text',
  assessmentAllocation:'--color-assessment-allocation',
  reportMetricStart:'--color-report-metric-start',
  reportMetricEnd:'--color-report-metric-end',
  reportMetricIconBg:'--color-report-metric-icon-bg',
  reportMetricIconText:'--color-report-metric-icon-text',
  reportEmailText:'--color-report-email-text',
  border:         '--color-border',
  borderStrong:   '--color-border-strong',
  borderSubtle:   '--color-border-subtle',
  textPrimary:    '--color-text-primary',
  textSecondary:  '--color-text-secondary',
  textMuted:      '--color-text-muted',
  textFaint:      '--color-text-faint',
  brand:          '--color-brand',
  brandHover:     '--color-brand-hover',
  brandDeep:      '--color-brand-deep',
  brandNavy:      '--color-brand-navy',
  brandTint:      '--color-brand-tint',
  brandTintLight: '--color-brand-tint-light',
  brandBorder:    '--color-brand-border',
  onBrand:        '--color-on-brand',
  success:        '--color-success',
  successBg:      '--color-success-bg',
  successBorder:  '--color-success-border',
  warning:        '--color-warning',
  warningBg:      '--color-warning-bg',
  warningBorder:  '--color-warning-border',
  error:          '--color-error',
  errorBg:        '--color-error-bg',
  errorBorder:    '--color-error-border',
  info:           '--color-info',
  infoBg:         '--color-info-bg',
  infoBorder:     '--color-info-border',
};
