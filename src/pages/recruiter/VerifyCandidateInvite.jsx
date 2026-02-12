import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { verifyInviteToken } from '../../api/recruiter/invite'
import { Check, X, Loader, Clock, Copy, CheckCheck } from 'lucide-react'

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

  const handleStartAssessment = () => {
    setIsStarting(true)
    // Redirect to workspace URL from API response
    if (candidateData?.workspace_url) {
      window.location.href = candidateData.workspace_url
    } else {
      setError('Workspace URL not found')
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
    <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-4 overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

      <div className="relative max-w-md w-full">
        {/* Card outer glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-[2rem] blur-2xl"></div>
        
        <div className="relative backdrop-blur-2xl bg-white/85 rounded-[2rem] shadow-[0_8px_48px_0_rgba(59,130,246,0.25)] border border-white/40 p-12 text-center">
          
          {status === 'verifying' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-xl"></div>
                  <div className="relative backdrop-blur-xl bg-white/60 p-4 rounded-full border border-white/40">
                    <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-cyan-900 bg-clip-text text-transparent mb-3">
                Verifying your invitation...
              </h2>
              <p className="text-gray-600 text-base leading-relaxed">Please wait while we confirm your access.</p>
            </div>
          )}

        {status === 'success' && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/40 to-teal-400/40 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative backdrop-blur-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-5 rounded-full border border-white/40 shadow-[0_8px_32px_0_rgba(16,185,129,0.3)] animate-in zoom-in-95 duration-700">
                  <Check className="w-10 h-10 text-white drop-shadow-lg" strokeWidth={3} />
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent mb-2">
              Invitation Verified!
            </h2>
            <p className="text-gray-600 text-base mb-8">Your assessment is ready to start</p>
            
            {candidateData && (
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-2xl blur-lg"></div>
                <div className="relative backdrop-blur-xl bg-white/70 rounded-2xl p-6 border border-white/50 shadow-[0_4px_24px_0_rgba(59,130,246,0.12)] text-left space-y-4">
                  
                  {/* Assessment ID with copy button */}
                  <div className="group">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span className="text-gray-600 text-sm font-semibold">Assessment ID</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 backdrop-blur-xl bg-white/60 rounded-xl px-3 py-2.5 border border-white/50 shadow-[inset_0_2px_8px_0_rgba(0,0,0,0.04)]">
                        <code className="text-xs font-mono text-gray-900 break-all">
                          {truncateId(candidateData.assessment_id)}
                        </code>
                      </div>
                      <button
                        onClick={handleCopyAssessmentId}
                        className="p-2.5 backdrop-blur-xl bg-white/60 hover:bg-white/80 rounded-xl border border-white/50 transition-all hover:shadow-md group/copy"
                        title="Copy full ID"
                      >
                        {copied ? (
                          <CheckCheck className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600 group-hover/copy:text-blue-600 transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Time Limit */}
                  {candidateData.time_limit_minutes && (
                    <div className="group">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                        <span className="text-gray-600 text-sm font-semibold">Time Limit</span>
                      </div>
                      <div className="backdrop-blur-xl bg-white/60 rounded-xl px-3 py-2.5 border border-white/50 shadow-[inset_0_2px_8px_0_rgba(0,0,0,0.04)] flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-600" />
                        <span className="text-sm font-semibold text-gray-900">
                          {candidateData.time_limit_minutes} minutes
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <button 
                className="relative w-full py-4 px-6 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-2xl transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_8px_24px_0_rgba(59,130,246,0.25)] hover:shadow-[0_12px_32px_0_rgba(59,130,246,0.35)] transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:shadow-none"
                onClick={handleStartAssessment}
                disabled={isStarting}
              >
                {isStarting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Starting Assessment...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Start Assessment
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-400/40 to-red-400/40 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative backdrop-blur-xl bg-gradient-to-br from-rose-500 to-red-500 p-5 rounded-full border border-white/40 shadow-[0_8px_32px_0_rgba(244,63,94,0.3)] animate-in zoom-in-95 duration-700">
                  <X className="w-10 h-10 text-white drop-shadow-lg" strokeWidth={3} />
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-rose-900 to-red-900 bg-clip-text text-transparent mb-3">
              Invitation Invalid
            </h2>
            
            {error && (
              <div className="relative mb-3">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-400/10 to-red-400/10 rounded-2xl blur-lg"></div>
                <div className="relative backdrop-blur-xl bg-rose-50/90 rounded-2xl p-4 border border-rose-200/60 shadow-[0_4px_16px_0_rgba(244,63,94,0.12)]">
                  <p className="text-rose-700 text-sm font-semibold">{error}</p>
                </div>
              </div>
            )}
            
            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              This invitation may have expired or is no longer valid. Please contact the recruiter for a new invitation.
            </p>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <button 
                className="relative w-full py-4 px-6 backdrop-blur-xl bg-white/80 hover:bg-white/90 text-gray-900 font-semibold rounded-2xl transition-all duration-300 border border-white/50 shadow-[0_4px_16px_0_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_0_rgba(0,0,0,0.12)] transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => navigate('/')}
              >
                Go Back
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}