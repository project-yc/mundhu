# Bulk-migrate recruiter screens to the global theme tokens.
# Order matters — Pass A converts Tailwind arbitrary classes to semantic
# tokens, Pass B then maps any remaining hex literals (e.g. inside
# `style={{ ... }}` or JS color tables) to the light-palette equivalents.

$ErrorActionPreference = 'Stop'

$root = "c:\Users\Surya\OneDrive\Documents\ai assessment platform\mundhu\src\pages\recruiter"

$files = @(
  "$root\AssessmentsScreen.jsx",
  "$root\AssessmentDetailScreen.jsx",
  "$root\CandidatesScreen.jsx",
  "$root\ReportsScreen.jsx",
  "$root\ReportDetailScreen.jsx",
  "$root\InviteScreen.jsx",
  "$root\InviteCandidate.jsx",
  "$root\pipeline\index.jsx",
  "$root\dashboard\index.jsx",
  "$root\dashboard\MetricsStrip.jsx",
  "$root\dashboard\AssessmentTable.jsx",
  "$root\dashboard\ActivitySidebar.jsx",
  "$root\dashboard\NewAssessmentWizard.jsx",
  "$root\dashboard\shared\StatusBadge.jsx",
  "$root\dashboard\shared\FormPrimitives.jsx"
)

# ── PASS A: Tailwind arbitrary classes → semantic tokens ──────────────────
# Keys must be ordered longest-first to avoid partial matches.
$passA = [ordered]@{
  # Brand-related (these become DYNAMIC via CSS vars)
  'hover:bg-[#0a3d52]'          = 'hover:bg-brand-tint-light'
  'hover:bg-[#0891B2]'          = 'hover:bg-brand-hover'
  'hover:border-[#06B6D4]'      = 'hover:border-brand'
  'hover:text-[#06B6D4]'        = 'hover:text-brand'
  'focus:border-[#06B6D4]'      = 'focus:border-brand'
  'focus:ring-[#06B6D4]/15'     = 'focus:ring-brand/20'
  'focus:ring-[#06B6D4]/20'     = 'focus:ring-brand/20'
  'bg-[#06B6D4]/15'             = 'bg-brand/15'
  'bg-[#06B6D4]/30'             = 'bg-brand/30'
  'bg-[#06B6D4]'                = 'bg-brand'
  'text-[#06B6D4]'              = 'text-brand'
  'border-[#06B6D4]'            = 'border-brand'
  'bg-[#083344]'                = 'bg-brand-tint'
  'border-[#0E7490]'            = 'border-brand-border'
  'border-[#0E7490]/60'         = 'border-brand-border/60'
  'text-[#0C0C0E]'              = 'text-on-brand'

  # Surfaces
  'bg-[#0C0C0E]'                = 'bg-page'
  'bg-[#0A0A0C]'                = 'bg-page'
  'bg-[#111113]'                = 'bg-surface'
  'bg-[#17171A]'                = 'bg-surface-muted'
  'bg-[#1C1C20]'                = 'bg-surface-muted'
  'hover:bg-[#111113]'          = 'hover:bg-surface-hover'
  'hover:bg-[#17171A]'          = 'hover:bg-surface-muted'
  'hover:bg-[#1C1C20]'          = 'hover:bg-surface-muted'
  'focus-within:border-[#3F3F46]'= 'focus-within:border-border-strong'

  # Borders
  'border-[#27272A]/60'         = 'border-border-default/60'
  'border-[#27272A]'            = 'border-border-default'
  'bg-[#27272A]'                = 'bg-border-default'
  'text-[#27272A]'              = 'text-text-faint'
  'bg-[#0E7490]/30'             = 'bg-brand-border/30'
  'border-[#1C1C20]'            = 'border-border-subtle'
  'border-[#3F3F46]'            = 'border-border-strong'
  'hover:border-[#3F3F46]'      = 'hover:border-border-strong'
  'divide-[#27272A]'            = 'divide-border-default'
  'divide-[#1C1C20]'            = 'divide-border-subtle'

  # Text
  'text-[#FAFAFA]'              = 'text-text-primary'
  'text-[#E4E4E7]'              = 'text-text-primary'
  'text-[#A1A1AA]'              = 'text-text-secondary'
  'text-[#71717A]'              = 'text-text-secondary'
  'text-[#52525B]'              = 'text-text-secondary'
  'text-[#3F3F46]'              = 'text-text-muted'
  'hover:text-[#FAFAFA]'        = 'hover:text-text-primary'
  'hover:text-[#E4E4E7]'        = 'hover:text-text-primary'
  'hover:text-[#A1A1AA]'        = 'hover:text-text-primary'
  'hover:text-white'            = 'hover:text-text-primary'
  'placeholder:text-[#3F3F46]'  = 'placeholder:text-text-muted'
  'placeholder:text-[#52525B]'  = 'placeholder:text-text-muted'

  # Status (success/warning/error)
  'bg-[#022C22]'                = 'bg-success-bg'
  'text-[#10B981]'              = 'text-success'
  'border-[#065F46]'            = 'border-success-border'

  'bg-[#1C150A]'                = 'bg-warning-bg'
  'bg-[#1C1005]'                = 'bg-warning-bg'
  'text-[#F59E0B]'              = 'text-warning'
  'border-[#78350F]/60'         = 'border-warning-border'
  'border-[#78350F]'            = 'border-warning-border'

  'bg-[#1C0813]'                = 'bg-error-bg'
  'text-[#F43F5E]'              = 'text-error'
  'border-[#881337]'            = 'border-error-border'
  'hover:bg-[#1C0813]'          = 'hover:bg-error-bg'
  'hover:text-[#F43F5E]'        = 'hover:text-error'

  # Misc backdrop
  'bg-black/75'                 = 'bg-text-primary/40'
  'bg-black/70'                 = 'bg-text-primary/40'
  'bg-black/40'                 = 'bg-text-primary/30'

  # InviteCandidate (alt dark palette)
  'bg-[#040914]/95'             = 'bg-surface/95'
  'bg-[#040914]'                = 'bg-page'
  'bg-[#070f20]'                = 'bg-surface'
  'bg-[#0d1e38]'                = 'bg-surface-muted'
  'bg-[#0a1628]'                = 'bg-surface-muted'
  'bg-[#07253a]'                = 'bg-brand-tint'
  'border-[#0e1f38]'            = 'border-border-default'
  'border-[#1a3050]'            = 'border-border-default'
  'border-[#1a4a28]'            = 'border-success-border'
  'border-[#0e4a6c]'            = 'border-brand-border'
  'bg-[#041a10]'                = 'bg-success-bg'
  'bg-[#052010]'                = 'bg-success-bg'
  'text-[#edf4ff]'              = 'text-text-primary'
  'text-[#94A3B8]'              = 'text-text-secondary'
  'text-[#7a8aa8]'              = 'text-text-secondary'
  'text-[#4a5f7a]'              = 'text-text-muted'
  'text-[#354e68]'              = 'text-text-faint'
  'text-[#ff8fa5]'              = 'text-error'
  'text-[#4ade80]'              = 'text-success'
  'text-[#040914]'              = 'text-on-brand'
  'placeholder:text-[#354e68]'  = 'placeholder:text-text-muted'
  'bg-[#18d3ff]'                = 'bg-brand'
  'hover:bg-[#06B6D4]'          = 'hover:bg-brand-hover'
  'text-[#18d3ff]'              = 'text-brand'
  'hover:text-[#18d3ff]'        = 'hover:text-brand'
  'hover:border-[#18d3ff]'      = 'hover:border-brand'
  'focus:border-[#18d3ff]'      = 'focus:border-brand'
  'focus:ring-[#18d3ff]/20'     = 'focus:ring-brand/20'
}

# ── PASS B: Bare hex literals (in `style={{ ... }}` or JS color tables) ──
# These run AFTER pass A. Brand colors map to the light-palette default cyan
# but for true dynamic theming consumers should refactor to use
# `useRecruiterTheme()` palette values where possible.
$passB = [ordered]@{
  # Surfaces / borders / text — flip dark → light (single-quoted JS literals)
  "'#0C0C0E'" = "'#FFFFFF'"
  "'#0A0A0C'" = "'#F8FAFC'"
  "'#111113'" = "'#FFFFFF'"
  "'#17171A'" = "'#F1F5F9'"
  "'#1C1C20'" = "'#F1F5F9'"
  "'#27272A'" = "'#E2E8F0'"
  "'#3F3F46'" = "'#CBD5E1'"
  "'#52525B'" = "'#64748B'"
  "'#71717A'" = "'#64748B'"
  "'#A1A1AA'" = "'#475569'"
  "'#E4E4E7'" = "'#0F172A'"
  "'#FAFAFA'" = "'#0F172A'"

  # Double-quoted variants (JSX `color="#XXX"` props, etc.)
  '"#0C0C0E"' = '"#FFFFFF"'
  '"#111113"' = '"#FFFFFF"'
  '"#17171A"' = '"#F1F5F9"'
  '"#1C1C20"' = '"#F1F5F9"'
  '"#27272A"' = '"#E2E8F0"'
  '"#3F3F46"' = '"#CBD5E1"'
  '"#52525B"' = '"#64748B"'
  '"#71717A"' = '"#64748B"'
  '"#A1A1AA"' = '"#475569"'
  '"#E4E4E7"' = '"#0F172A"'
  '"#FAFAFA"' = '"#0F172A"'

  # Status
  "'#022C22'" = "'#F0FDF4'"
  "'#065F46'" = "'#86EFAC'"
  "'#10B981'" = "'#16A34A'"

  "'#1C150A'" = "'#FFFBEB'"
  "'#1C1005'" = "'#FFFBEB'"
  "'#78350F'" = "'#FCD34D'"
  "'#F59E0B'" = "'#D97706'"

  "'#1C0813'" = "'#FEF2F2'"
  "'#881337'" = "'#FCA5A5'"
  "'#9F1239'" = "'#FCA5A5'"
  "'#F43F5E'" = "'#DC2626'"

  # Brand defaults (consumers should migrate to useRecruiterTheme().palette)
  "'#06B6D4'" = "'#22D3EE'"
  "'#0891B2'" = "'#06B6D4'"
  "'#083344'" = "'#CFFAFE'"
  "'#0a3d52'" = "'#E0F9FC'"

  # Pipeline-specific palettes (kept tonally similar in light mode)
  "'#A78BFA'" = "'#7C3AED'"
  "'#1E1B3A'" = "'#F5F3FF'"
  "'#5B21B6'" = "'#C4B5FD'"
  "'#60A5FA'" = "'#2563EB'"
  "'#0B2545'" = "'#EFF6FF'"
  "'#1E40AF'" = "'#93C5FD'"
}

foreach ($file in $files) {
  if (-not (Test-Path $file)) { Write-Warning "skip missing: $file"; continue }
  $text = Get-Content -Raw -LiteralPath $file
  foreach ($k in $passA.Keys) { $text = $text.Replace($k, $passA[$k]) }
  foreach ($k in $passB.Keys) { $text = $text.Replace($k, $passB[$k]) }
  Set-Content -LiteralPath $file -NoNewline -Value $text
  Write-Host "migrated: $file"
}
