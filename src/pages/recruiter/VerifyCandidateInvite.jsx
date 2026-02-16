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
    <div className="min-h-screen bg-navy-50/40 flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <div className="card-elevated p-10 text-center animate-fadeIn">
          
          {status === 'verifying' && (
            <div>
              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 rounded-full bg-navy-100 flex items-center justify-center">
                  <Loader className="w-6 h-6 text-navy-500 animate-spin" />
                </div>
              </div>
              <h2 className="text-lg font-semibold text-navy-900 mb-1.5">
                Verifying your invitation...
              </h2>
              <p className="text-sm text-navy-800/50">Please wait while we confirm your access.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="animate-slideUp">
              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="w-7 h-7 text-emerald-600" strokeWidth={2.5} />
                </div>
              </div>
              
              <h2 className="text-lg font-semibold text-navy-900 mb-1">
                Invitation Verified
              </h2>
              <p className="text-sm text-navy-800/50 mb-6">Your assessment is ready to start</p>
              
              {candidateData && (
                <div className="bg-navy-50/50 border border-navy-900/6 rounded-lg p-5 text-left space-y-3 mb-6">
                  
                  {/* Assessment ID */}
                  <div>
                    <p className="text-[11px] text-navy-800/40 font-medium uppercase tracking-wider mb-1.5">Assessment ID</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-white border border-navy-900/6 rounded-md text-xs text-navy-800/60 break-all font-mono">
                        {truncateId(candidateData.assessment_id)}
                      </code>
                      <button
                        onClick={handleCopyAssessmentId}
                        className={`p-2 rounded-md transition-all duration-150 flex-shrink-0 ${
                          copied
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-white border border-navy-900/8 text-navy-800/40 hover:text-navy-700 hover:border-navy-900/15'
                        }`}
                      >
                        {copied ? (
                          <CheckCheck className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Time Limit */}
                  {candidateData.time_limit_minutes && (
                    <div>
                      <p className="text-[11px] text-navy-800/40 font-medium uppercase tracking-wider mb-1.5">Time Limit</p>
                      <div className="flex items-center gap-2 px-3 py-2 bg-white border border-navy-900/6 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-navy-500" />
                        <span className="text-sm font-medium text-navy-900">
                          {candidateData.time_limit_minutes} minutes
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button 
                className="btn-primary w-full justify-center"
                onClick={handleStartAssessment}
                disabled={isStarting}
              >
                {isStarting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Start Assessment
                  </>
                )}
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="animate-slideUp">
              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center">
                  <X className="w-7 h-7 text-rose-600" strokeWidth={2.5} />
                </div>
              </div>
              
              <h2 className="text-lg font-semibold text-navy-900 mb-2">
                Invitation Invalid
              </h2>
              
              {error && (
                <div className="mb-3 px-4 py-3 bg-rose-50 border border-rose-200/60 rounded-lg">
                  <p className="text-sm text-rose-700 font-medium">{error}</p>
                </div>
              )}
              
              <p className="text-sm text-navy-800/50 leading-relaxed mb-6">
                This invitation may have expired or is no longer valid. Please contact the recruiter for a new invitation.
              </p>
              
              <button 
                className="btn-secondary w-full justify-center"
                onClick={() => navigate('/')}
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}