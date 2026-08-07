// ─────────────────────────────────────────────────────────────────────────────
// ExamShell — the frame every candidate exam screen sits in.
//
// Three fixed regions and one scrolling one:
//   • top bar     — identity on the left, run status on the right
//   • sidebar     — the question navigator, its legend, and the finish action
//   • action bar  — the per-question controls, pinned to the bottom of the stage
//   • stage       — the only thing that scrolls
//
// Chrome sits on `chrome` (below the stage), the stage on `page`, and cards on
// `surface` (above it) — three planes, so the regions separate without borders
// doing all the work. Nothing in the chrome moves while the candidate works.
// ─────────────────────────────────────────────────────────────────────────────

import { CandidateThemeScope } from '../../../theme/CandidateThemeProvider'
import { cn } from '../../../lib/utils'

export function ExamTopBar({ brand, children }) {
  return (
    <header className="relative z-30 flex h-[52px] shrink-0 items-center gap-4 border-b border-border-subtle bg-chrome px-4 lg:px-5">
      <div className="min-w-0 flex-1">{brand}</div>
      <div className="flex shrink-0 items-center gap-2.5">{children}</div>
    </header>
  )
}

// `width` widens the rail for content-heavy panels — the question navigator fits
// in 240px, but a scenario panel carrying stat grids, log blocks and chat
// transcripts does not.
export function ExamSidebar({ title, subtitle, children, legend, action, width = '240px' }) {
  return (
    <aside
      style={{ width }}
      className="hidden shrink-0 flex-col border-r border-border-subtle bg-chrome lg:flex"
    >
      <div className="shrink-0 border-b border-border-subtle px-5 py-4">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-text-primary">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[12px] text-text-muted">{subtitle}</p>}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>

      {legend && (
        <div className="shrink-0 border-t border-border-subtle px-5 py-4">{legend}</div>
      )}

      {action && <div className="shrink-0 px-5 pb-5">{action}</div>}
    </aside>
  )
}

export function ExamActionBar({ children }) {
  return (
    <div className="relative z-20 flex h-[60px] shrink-0 items-center gap-2.5 border-t border-border-subtle bg-chrome px-4 lg:px-6">
      {children}
    </div>
  )
}

/**
 * Thin progress rail directly under the top bar. It replaces a numeric progress
 * readout on the stage: the candidate can see how much of the section is done
 * without a number competing with the question.
 */
export function ExamProgress({ value = 0, total = 0 }) {
  const pct = total > 0 ? Math.min(Math.max(value / total, 0), 1) * 100 : 0

  return (
    <div
      className="relative h-[2px] w-full shrink-0 bg-border-subtle"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label="Section progress"
    >
      <div
        className="h-full bg-ember transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function ExamShell({
  branding,
  topBar,
  sidebar,
  actionBar,
  progress,
  children,
  contentClassName = '',
}) {
  return (
    <CandidateThemeScope branding={branding}>
      <div className="flex h-screen flex-col overflow-hidden bg-page text-text-primary">
        {topBar}

        <div className="flex min-h-0 flex-1">
          {sidebar}

          <div className="flex min-w-0 flex-1 flex-col bg-page">
            {progress}

            <main className="min-h-0 flex-1 overflow-y-auto">
              <div className={cn('mx-auto w-full max-w-[680px] px-5 py-8 lg:px-6 lg:py-9', contentClassName)}>
                {children}
              </div>
            </main>

            {actionBar}
          </div>
        </div>
      </div>
    </CandidateThemeScope>
  )
}
