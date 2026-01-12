import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { verifyInviteToken } from '../api/invite'

export default function VerifyCandidateInvite() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying')
  const [candidateData, setCandidateData] = useState(null)
  const [error, setError] = useState('')
  const [isStarting, setIsStarting] = useState(false)

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

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-12 max-w-md w-full text-center">
        
        {status === 'verifying' && (
          <div className="animate-fadeIn">
            <div className="flex justify-center mb-8">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Verifying your invitation...</h2>
            <p className="text-gray-600 text-base leading-relaxed">Please wait while we confirm your access.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-fadeIn">
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center animate-scaleIn">
                <span className="text-3xl font-bold text-white">✓</span>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Invitation Verified!</h2>
            <p className="text-gray-600 text-base mb-8">Your assessment is ready to start</p>
            
            {candidateData && (
              <div className="bg-gray-50 rounded-lg p-5 mb-8 text-left">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-600 text-sm font-medium">Assessment ID:</span>
                  <span className="text-gray-900 text-sm font-semibold">{candidateData.assessment_id || 'N/A'}</span>
                </div>
                {candidateData.time_limit_minutes && (
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-gray-600 text-sm font-medium">Time Limit:</span>
                    <span className="text-gray-900 text-sm font-semibold">{candidateData.time_limit_minutes} minutes</span>
                  </div>
                )}
              </div>
            )}

            <button 
              className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={handleStartAssessment}
              disabled={isStarting}
            >
              {isStarting ? 'Starting Assessment...' : 'Start Assessment'}
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-fadeIn">
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center animate-scaleIn">
                <span className="text-3xl font-bold text-white">✕</span>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Invitation Invalid</h2>
            <p className="text-red-600 text-base font-medium mb-2">{error}</p>
            <p className="text-gray-600 text-sm leading-relaxed mb-8">This invitation may have expired or is no longer valid. Please contact the recruiter for a new invitation.</p>
            <button 
              className="w-full py-3 px-6 bg-gray-200 text-gray-900 font-semibold rounded-lg transition-all duration-300 hover:bg-gray-300 hover:-translate-y-0.5"
              onClick={() => navigate('/')}
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  )
}