// ─────────────────────────────────────────────────────────────────────────────
// ExamStatus — the run indicators in the top bar.
//
// Everything here answers a question the candidate would otherwise have to ask
// mid-exam: is my work saved, am I still online, can I get more room. Nothing
// here is decorative; if it can't change state, it isn't in the bar.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import {
  IconMaximize,
  IconMinimize,
  IconWifi,
  IconWifiOff,
} from '@tabler/icons-react'
import { cn } from '../../../lib/utils'

// ── Autosave ─────────────────────────────────────────────────────────────────
// `savedAt` is a timestamp that changes whenever answers are persisted. Keying
// the dot on it remounts the element, which replays the CSS pulse — a save
// acknowledgement with no state and no effect to keep in sync.
export function AutoSaveChip({ savedAt }) {
  return (
    <div className="hidden items-center gap-2 md:flex">
      <span
        key={savedAt}
        aria-hidden="true"
        className={cn('h-1.5 w-1.5 rounded-full bg-ember', savedAt && 'autosave-pulse')}
      />
      <span className="text-[12px] text-text-muted">Auto-saved</span>
    </div>
  )
}

// ── Connection ───────────────────────────────────────────────────────────────
export function ConnectionStatus() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine)
    sync()
    window.addEventListener('online', sync)
    window.addEventListener('offline', sync)
    return () => {
      window.removeEventListener('online', sync)
      window.removeEventListener('offline', sync)
    }
  }, [])

  return (
    <span
      title={online ? 'Connected' : 'No connection — answers are held locally'}
      className={cn('flex h-8 w-8 items-center justify-center rounded-lg', online ? 'text-text-muted' : 'text-error')}
    >
      {online ? <IconWifi size={16} /> : <IconWifiOff size={16} />}
      <span className="sr-only">{online ? 'Connected' : 'Offline'}</span>
    </span>
  )
}

// ── Fullscreen ───────────────────────────────────────────────────────────────
export function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const sync = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

  const toggle = () => {
    if (document.fullscreenElement) document.exitFullscreen?.()
    else document.documentElement.requestFullscreen?.().catch(() => {})
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      {isFullscreen ? <IconMinimize size={16} /> : <IconMaximize size={16} />}
    </button>
  )
}

// ── Org identity ─────────────────────────────────────────────────────────────
export function ExamBrand({ branding, fallback }) {
  const { logo_url, candidate_name } = branding || {}
  const name = candidate_name || fallback

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      {logo_url && (
        <img src={logo_url} alt="" className="h-6 w-auto shrink-0 object-contain" />
      )}
      <span className="truncate text-[15px] font-bold tracking-[-0.01em] text-brand">{name}</span>
    </div>
  )
}
