import { useEffect, useRef, useState } from 'react'
import { Check, Terminal } from 'lucide-react'

const BOOT_STAGES = [
  { id: 0, label: 'Authenticating session', detail: 'Validating token & permissions', startAt: 0, endAt: 1500 },
  { id: 1, label: 'Fetching task bundle', detail: 'Retrieving assessment artifacts from S3', startAt: 1500, endAt: 4500 },
  { id: 2, label: 'Unpacking resources', detail: 'Decompressing task files & fixtures', startAt: 4500, endAt: 8000 },
  { id: 3, label: 'Initializing container', detail: 'Spinning up isolated runtime environment', startAt: 8000, endAt: 12000 },
  { id: 4, label: 'Configuring environment', detail: 'Installing deps & applying settings', startAt: 12000, endAt: 16000 },
  { id: 5, label: 'Launching workspace', detail: 'Connecting IDE & finalizing setup', startAt: 16000, endAt: 19500 },
]

const LOG_LINES = [
  '[boot]   Validating JWT signature... ok',
  '[auth]   Session granted for candidate',
  '[s3]     HEAD bundle.zip → 200',
  '[zip]    Extracting project files...',
  '[docker] Spinning up runtime container',
  '[env]    Applying workspace config',
  '[theia]  Starting IDE services',
  '[theia]  Waiting for workspace readiness',
]

export const TOTAL_BOOT_MS = 19500

export function CandidateBootScreen() {
  const [elapsed, setElapsed] = useState(0)
  const [logLines, setLogLines] = useState([])
  const logRef = useRef(null)
  const startTime = useRef(0)

  useEffect(() => {
    startTime.current = Date.now()
    const intervalId = window.setInterval(() => {
      const nextElapsed = Date.now() - startTime.current
      setElapsed(Math.min(nextElapsed, TOTAL_BOOT_MS))
    }, 80)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const timers = LOG_LINES.map((line, index) => window.setTimeout(() => {
      setLogLines((current) => [...current, line])
    }, 600 + index * 1050))

    return () => timers.forEach((timerId) => window.clearTimeout(timerId))
  }, [])

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logLines])

  const progress = Math.min((elapsed / TOTAL_BOOT_MS) * 100, 100)
  const currentStageIndex = BOOT_STAGES.findLastIndex((stage) => elapsed >= stage.startAt)
  const activeStage = BOOT_STAGES[currentStageIndex] ?? BOOT_STAGES[0]

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0a1628] border border-[#0e2a4a] mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#18d3ff] animate-pulse" />
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#18d3ff] uppercase">Initializing Environment</span>
        </div>
        <h1 className="text-xl font-bold text-[#edf4ff] tracking-tight mb-1">Preparing your workspace</h1>
        <p className="text-sm text-[#4a5f7a]">This takes about 15 seconds. Hang tight.</p>
      </div>

      <div className="rounded-2xl border border-[#0e1f38] bg-[#070f20] overflow-hidden shadow-2xl">
        <div className="h-0.5 bg-[#0a1628]">
          <div
            className="h-full bg-gradient-to-r from-[#18d3ff] to-[#4ade80] transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-6 space-y-3">
          {BOOT_STAGES.map((stage) => {
            const isDone = elapsed > stage.endAt
            const isActive = elapsed >= stage.startAt && elapsed <= stage.endAt
            const isPending = elapsed < stage.startAt

            return (
              <div
                key={stage.id}
                className={`flex items-center gap-3.5 transition-all duration-300 ${isPending ? 'opacity-25' : 'opacity-100'}`}
              >
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                  {isDone ? (
                    <div className="w-5 h-5 rounded-full bg-[#041a10] border border-[#1a4a28] flex items-center justify-center">
                      <Check className="w-3 h-3 text-[#4ade80]" strokeWidth={3} />
                    </div>
                  ) : isActive ? (
                    <div
                      className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: 'var(--color-brand)', borderTopColor: 'transparent' }}
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-[#1a2f4a]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-semibold leading-tight transition-colors duration-200 ${
                    isDone ? 'text-[#4ade80]' : isActive ? 'text-[#edf4ff]' : 'text-[#2a3f5a]'
                  }`}>
                    {stage.label}
                  </p>
                  {isActive ? <p className="text-[11px] text-[#4a6a8a] mt-0.5 animate-fadeIn">{stage.detail}</p> : null}
                </div>

                {isDone ? <span className="text-[10px] text-[#1a4a28] font-mono flex-shrink-0">done</span> : null}
              </div>
            )
          })}
        </div>

        <div className="border-t border-[#0a1628] bg-[#040914]">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-[#0a1628]">
            <Terminal className="w-3 h-3 text-[#2a4a6a]" />
            <span className="text-[10px] font-mono text-[#2a4a6a] tracking-wider">system log</span>
            <div className="ml-auto flex gap-1">
              <span className="w-2 h-2 rounded-full bg-[#1a2f3a]" />
              <span className="w-2 h-2 rounded-full bg-[#1a2f3a]" />
              <span className="w-2 h-2 rounded-full bg-[#1a3a2a]" />
            </div>
          </div>
          <div
            ref={logRef}
            className="h-28 overflow-y-auto px-4 py-3 space-y-0.5"
            style={{ scrollbarWidth: 'none' }}
          >
            {logLines.map((line, index) => (
              <p key={index} className="text-[11px] font-mono text-[#2a6a5a] leading-relaxed animate-fadeIn">
                {line}
              </p>
            ))}
            {logLines.length > 0 ? <span className="inline-block w-1.5 h-3.5 bg-[#18d3ff] opacity-70 animate-pulse align-text-bottom" /> : null}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#0a1628] flex items-center justify-between">
          <span className="text-[11px] text-[#2a4a6a]">{activeStage.label}…</span>
          <span className="text-[11px] font-mono text-[#18d3ff]">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  )
}