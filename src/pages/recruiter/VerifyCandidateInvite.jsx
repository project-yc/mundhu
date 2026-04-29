// REDESIGNED — dark theme matching user flow
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { verifyInviteToken, startInviteSession } from '../../api/recruiter/invite'
import { Check, X, Loader, Clock, Copy, CheckCheck, AlertCircle, Zap, ArrowRight } from 'lucide-react'

export default function VerifyCandidateInvite() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying')
  const [candidateData, setCandidateData] = useState(null)
  const [error, setError] = useState('')
  const [isStarting, setIsStarting] = useState(false)
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
    try {
      const result = await startInviteSession(token)
      if (result?.workspace_url) {
        window.location.href = result.workspace_url
      } else {
        setError('Workspace URL not returned by server')
        setIsStarting(false)
      }
    } catch (err) {
      setError(err.message || 'Failed to start assessment')
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
