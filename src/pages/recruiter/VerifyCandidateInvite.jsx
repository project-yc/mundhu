// REDESIGNED — dark theme matching user flow
import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { verifyInviteToken, startInviteSession } from '../../api/recruiter/invite'
import { Check, X, Loader, Clock, Copy, CheckCheck, Zap, ArrowRight, Terminal } from 'lucide-react'

// ─── Boot stage definitions ───────────────────────────────────────────────────
const BOOT_STAGES = [
  { id: 0, label: 'Authenticating session',      detail: 'Validating token & permissions',         startAt: 0,    endAt: 1500  },
  { id: 1, label: 'Fetching task bundle',         detail: 'Retrieving assessment artifacts from S3', startAt: 1500, endAt: 4500  },
  { id: 2, label: 'Unpacking resources',          detail: 'Decompressing task files & fixtures',    startAt: 4500, endAt: 8000  },
  { id: 3, label: 'Initializing container',       detail: 'Spinning up isolated runtime environment',startAt: 8000, endAt: 12000 },
  { id: 4, label: 'Configuring environment',      detail: 'Installing deps & applying settings',    startAt: 12000,endAt: 16000 },
  { id: 5, label: 'Launching workspace',          detail: 'Connecting IDE & finalizing setup',      startAt: 16000,endAt: 19500 },
]

const TOTAL_BOOT_MS = 19500

const LOG_LINES = [
  '[boot]   Validating JWT signature... ok',
  '[auth]   Session granted for candidate',
  '[s3]     HEAD s3://mundhu-tasks/bundle.zip → 200',
  '[s3]     GET  bundle.zip (3.2 MB) → streaming',
  '[zip]    Extracting 148 files...',
  '[zip]    Binding volume mounts',
  '[zip]    Extraction complete',
  '[docker] Pulling layer sha256:a1b2c3...',
  '[docker] Pulling layer sha256:d4e5f6...',
  '[docker] Container created (id: 7f3a9c)',
  '[env]    NODE_ENV=assessment',
  '[env]    Installing npm packages...',
  '[env]    packages installed in 3.2s',
  '[env]    Applying workspace config',
  '[theia]  Starting language server',
  '[theia]  Binding port 3000',
  '[theia]  Workspace ready ✓',
]

// ─── Multi-stage boot screen component ────────────────────────────────────────
function BootScreen() {
  const [elapsed, setElapsed]       = useState(0)
  const [logLines, setLogLines]     = useState([])
  const logRef                      = useRef(null)
  const startTime                   = useRef(Date.now())

  // Tick every 80ms for smooth progress
  useEffect(() => {
    const iv = setInterval(() => {
      const e = Date.now() - startTime.current
      setElapsed(Math.min(e, TOTAL_BOOT_MS))
    }, 80)
    return () => clearInterval(iv)
  }, [])

  // Drip log lines at staggered intervals
  useEffect(() => {
    const timers = LOG_LINES.map((line, i) =>
      setTimeout(() => {
        setLogLines(prev => [...prev, line])
      }, 600 + i * 1050)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logLines])

  const progress = Math.min((elapsed / TOTAL_BOOT_MS) * 100, 100)

  const currentStageIndex = BOOT_STAGES.findLastIndex(s => elapsed >= s.startAt)
  const activeStage       = BOOT_STAGES[currentStageIndex] ?? BOOT_STAGES[0]

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0a1628] border border-[#0e2a4a] mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#18d3ff] animate-pulse" />
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#18d3ff] uppercase">Initializing Environment</span>
        </div>
        <h1 className="text-xl font-bold text-[#edf4ff] tracking-tight mb-1">Preparing your workspace</h1>
        <p className="text-sm text-[#4a5f7a]">This takes about 15 seconds. Hang tight.</p>
      </div>

      {/* Main card */}
      <div className="rounded-2xl border border-[#0e1f38] bg-[#070f20] overflow-hidden shadow-2xl">

        {/* Progress bar */}
        <div className="h-0.5 bg-[#0a1628]">
          <div
            className="h-full bg-gradient-to-r from-[#18d3ff] to-[#4ade80] transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stage list */}
        <div className="p-6 space-y-3">
          {BOOT_STAGES.map((stage) => {
            const isDone    = elapsed > stage.endAt
            const isActive  = elapsed >= stage.startAt && elapsed <= stage.endAt
            const isPending = elapsed < stage.startAt

            return (
              <div
                key={stage.id}
                className={`flex items-center gap-3.5 transition-all duration-300 ${isPending ? 'opacity-25' : 'opacity-100'}`}
              >
                {/* Status icon */}
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                  {isDone ? (
                    <div className="w-5 h-5 rounded-full bg-[#041a10] border border-[#1a4a28] flex items-center justify-center">
                      <Check className="w-3 h-3 text-[#4ade80]" strokeWidth={3} />
                    </div>
                  ) : isActive ? (
                    <div className="w-5 h-5 rounded-full border-2 border-[#18d3ff] border-t-transparent animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-[#1a2f4a]" />
                  )}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-semibold leading-tight transition-colors duration-200 ${
                    isDone ? 'text-[#4ade80]' : isActive ? 'text-[#edf4ff]' : 'text-[#2a3f5a]'
                  }`}>
                    {stage.label}
                  </p>
                  {isActive && (
                    <p className="text-[11px] text-[#4a6a8a] mt-0.5 animate-fadeIn">{stage.detail}</p>
                  )}
                </div>

                {/* Time badge for done stages */}
                {isDone && (
                  <span className="text-[10px] text-[#1a4a28] font-mono flex-shrink-0">done</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Terminal log */}
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
            className="h-28 overflow-y-auto px-4 py-3 space-y-0.5 scrollbar-none"
            style={{ scrollbarWidth: 'none' }}
          >
            {logLines.map((line, i) => (
              <p key={i} className="text-[11px] font-mono text-[#2a6a5a] leading-relaxed animate-fadeIn">
                {line}
              </p>
            ))}
            {logLines.length > 0 && (
              <span className="inline-block w-1.5 h-3.5 bg-[#18d3ff] opacity-70 animate-pulse align-text-bottom" />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#0a1628] flex items-center justify-between">
          <span className="text-[11px] text-[#2a4a6a]">{activeStage.label}…</span>
          <span className="text-[11px] font-mono text-[#18d3ff]">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function VerifyCandidateInvite() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying')
  const [candidateData, setCandidateData] = useState(null)
  const [error, setError] = useState('')
  const [isStarting, setIsStarting] = useState(false)
  const [isBooting, setIsBooting] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const data = await verifyInviteToken(token)
        setCandidateData(data)
        setStatus('success')
      } catch (err) {
        setError(err.message || 'Failed to verify invitation')
        setStatus('error')
      }
    }
    verifyToken()
  }, [token])

  const handleStartAssessment = async () => {
    setIsStarting(true)
    setError('')

    try {
      const result = await startInviteSession(token)
      if (result?.workspace_url) {
        setIsBooting(true)
        await new Promise(resolve => setTimeout(resolve, TOTAL_BOOT_MS + 500))
        window.location.href = result.workspace_url
        return
      }
      setError('Workspace URL not returned by server')
    } catch (err) {
      setError(err.message || 'Failed to start assessment')
    } finally {
      setIsStarting(false)
    }
  }

  const handleCopyAssessmentId = () => {
    if (candidateData?.assessment_id) {
      navigator.clipboard.writeText(candidateData.assessment_id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const truncateId = (id) => {
    if (!id) return 'N/A'
    if (id.length <= 16) return id
    return `${id.slice(0, 8)}...${id.slice(-8)}`
  }

  // ── Full-screen boot takeover ────────────────────────────────────────────────
  if (isBooting) {
    return (
      <div className="min-h-screen bg-[#040914] flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-2 mb-10">
          <Zap className="w-4 h-4 text-[#18d3ff]" strokeWidth={2.5} />
          <span className="text-sm font-bold tracking-[0.08em] text-[#edf4ff]">MUNDHU</span>
        </div>
        <BootScreen />
        <p className="text-center text-[11px] text-[#354e68] mt-6">Powered by Mundhu Assessment Platform</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#040914] flex flex-col items-center justify-center p-4">
      {/* Brand mark */}
      <div className="flex items-center gap-2 mb-10">
        <Zap className="w-4 h-4 text-[#18d3ff]" strokeWidth={2.5} />
        <span className="text-sm font-bold tracking-[0.08em] text-[#edf4ff]">MUNDHU</span>
      </div>

      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-[#0e1f38] bg-[#070f20] p-8 text-center shadow-2xl">

          {/* ── VERIFYING ── */}
          {status === 'verifying' && (
            <div className="animate-fadeIn">
              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 rounded-full border border-[#0e1f38] bg-[#040914] flex items-center justify-center">
                  <Loader className="w-6 h-6 text-[#18d3ff] animate-spin" />
                </div>
              </div>
              <h2 className="text-base font-semibold text-[#edf4ff] mb-2">Verifying your invitation</h2>
              <p className="text-sm text-[#4a5f7a]">Please wait while we confirm your access.</p>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {status === 'success' && (
            <div className="animate-slideUp">
              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 rounded-full bg-[#041a10] border border-[#1a4a28] flex items-center justify-center">
                  <Check className="w-7 h-7 text-[#4ade80]" strokeWidth={2.5} />
                </div>
              </div>

              <h2 className="text-base font-semibold text-[#edf4ff] mb-1">Invitation Verified</h2>
              <p className="text-sm text-[#4a5f7a] mb-6">Your assessment is ready to start</p>

              {candidateData && (
                <div className="rounded-xl border border-[#0e1f38] bg-[#040914]/60 p-4 text-left space-y-3 mb-6">
                  {/* Assessment ID */}
                  <div>
                    <p className="text-[10px] text-[#4a5f7a] font-semibold uppercase tracking-[0.15em] mb-2">Assessment ID</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-[#040914] border border-[#0e1f38] rounded-lg text-xs text-[#7a8aa8] break-all font-mono truncate">
                        {truncateId(candidateData.assessment_id)}
                      </code>
                      <button
                        onClick={handleCopyAssessmentId}
                        title="Copy ID"
                        className={`p-2 rounded-lg flex-shrink-0 transition-all duration-150 border ${copied ? 'bg-[#041a10] border-[#1a4a28] text-[#4ade80]' : 'bg-[#040914] border-[#0e1f38] text-[#4a5f7a] hover:border-[#18d3ff] hover:text-[#18d3ff]'}`}
                      >
                        {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Time limit */}
                  {candidateData.time_limit_minutes && (
                    <div>
                      <p className="text-[10px] text-[#4a5f7a] font-semibold uppercase tracking-[0.15em] mb-2">Time Limit</p>
                      <div className="flex items-center gap-2 px-3 py-2 bg-[#040914] border border-[#0e1f38] rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-[#18d3ff]" />
                        <span className="text-sm font-medium text-[#edf4ff]">{candidateData.time_limit_minutes} minutes</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#18d3ff] text-[#040914] text-sm font-bold rounded-xl hover:bg-[#06B6D4] transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleStartAssessment}
                disabled={isStarting}
              >
                {isStarting ? (
                  <><Loader className="w-4 h-4 animate-spin" />Starting...</>
                ) : (
                  <><span>Start Assessment</span><ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          )}

          {/* ── ERROR ── */}
          {status === 'error' && (
            <div className="animate-slideUp">
              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 rounded-full bg-[#1b0f15] border border-[#6a2335] flex items-center justify-center">
                  <X className="w-7 h-7 text-[#ff8fa5]" strokeWidth={2.5} />
                </div>
              </div>

              <h2 className="text-base font-semibold text-[#edf4ff] mb-3">Invitation Invalid</h2>

              {error && (
                <div className="mb-4 px-4 py-3 bg-[#1b0f15] border border-[#6a2335] rounded-xl">
                  <p className="text-sm text-[#ff8fa5]">{error}</p>
                </div>
              )}

              <p className="text-sm text-[#4a5f7a] leading-relaxed mb-6">
                This invitation may have expired or is no longer valid. Please contact the recruiter for a new invitation.
              </p>

              <button
                className="w-full flex items-center justify-center gap-2 py-3 border border-[#1a3050] text-[#94A3B8] text-sm font-semibold rounded-xl hover:border-[#18d3ff] hover:text-[#18d3ff] transition-all duration-150"
                onClick={() => navigate('/')}
              >
                Go Back
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-[#354e68] mt-6">Powered by Mundhu Assessment Platform</p>
      </div>
    </div>
  )
}
