import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, BarChart3, Tag, PlayCircle, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { getProblemDetail, startPractice } from '../../api/problems';
import { isAuthenticated } from '../../api/auth';

// Difficulty badge colors
const difficultyColors = {
  EASY: 'bg-green-100 text-green-700 border-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  HARD: 'bg-red-100 text-red-700 border-red-200',
};

export default function ProblemDetail() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const authenticated = isAuthenticated();

  useEffect(() => {
    fetchProblem();
  }, [slug]);

  const fetchProblem = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await getProblemDetail(slug);
      setProblem(data);
    } catch (err) {
      setError(err.message || 'Failed to load problem');
    } finally {
      setLoading(false);
    }
  };

  // Check if workspace URL is ready (container started)
  const waitForWorkspace = async (url, maxAttempts = 30) => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        // Try to fetch the workspace URL with no-cors to check if it's up
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        await fetch(url, { 
          method: 'HEAD', 
          mode: 'no-cors',
          signal: controller.signal 
        });
        clearTimeout(timeoutId);
        
        // If we get here without error, the server is responding
        return true;
      } catch {
        // Wait 1 second before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    return false;
  };

  const handleStartPractice = async () => {
    if (!authenticated) {
      navigate('/login');
      return;
    }

    setStarting(true);
    setError('');

    try {
      const data = await startPractice(slug);
      
      if (data.workspace_url) {
        // Wait for workspace to be ready before redirecting
        const isReady = await waitForWorkspace(data.workspace_url);
        
        if (isReady) {
          window.location.href = data.workspace_url;
        } else {
          // Still redirect - container might be slow but eventually ready
          window.location.href = data.workspace_url;
        }
      } else {
        setError('Failed to get workspace URL');
        setStarting(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to start practice session');
      setStarting(false);
    }
    // Note: Don't setStarting(false) on success - we're redirecting
  };

  // Full-screen loading when starting workspace
  if (starting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-green-500/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-green-500 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Starting Workspace</h2>
          <p className="text-gray-400 mb-4">Setting up your coding environment...</p>
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error && !problem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/problems" className="text-green-600 hover:text-green-700">
            Back to Problems
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate('/problems')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Problems</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Problem Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{problem.title}</h1>
                  {problem.is_premium && (
                    <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      PRO
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${difficultyColors[problem.difficulty]}`}>
                    {problem.difficulty}
                  </span>
                  {problem.category_name && (
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <Tag className="w-4 h-4" />
                      {problem.category_name}
                    </span>
                  )}
                  {problem.time_limit_minutes && (
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {problem.time_limit_minutes} min
                    </span>
                  )}
                  {problem.acceptance_rate && (
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <BarChart3 className="w-4 h-4" />
                      {problem.acceptance_rate.toFixed(1)}% acceptance
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleStartPractice}
                disabled={starting}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {starting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Starting...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-5 h-5" />
                    Start Practice
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Problem Description */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <div className="prose prose-gray max-w-none">
              <div 
                className="text-gray-700 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: problem.description }}
              />
            </div>
          </div>

          {/* Examples */}
          {problem.examples && problem.examples.length > 0 && (
            <div className="p-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Examples</h2>
              <div className="space-y-4">
                {problem.examples.map((example, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="font-medium text-gray-900 mb-2">Example {index + 1}</div>
                    {example.input && (
                      <div className="mb-2">
                        <span className="text-sm text-gray-500">Input: </span>
                        <code className="text-sm bg-gray-200 px-2 py-0.5 rounded">{example.input}</code>
                      </div>
                    )}
                    {example.output && (
                      <div className="mb-2">
                        <span className="text-sm text-gray-500">Output: </span>
                        <code className="text-sm bg-gray-200 px-2 py-0.5 rounded">{example.output}</code>
                      </div>
                    )}
                    {example.explanation && (
                      <div className="text-sm text-gray-600">
                        <span className="text-gray-500">Explanation: </span>
                        {example.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Constraints */}
          {problem.constraints && (
            <div className="p-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Constraints</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {Array.isArray(problem.constraints) ? (
                  problem.constraints.map((constraint, index) => (
                    <li key={index}><code className="text-sm">{constraint}</code></li>
                  ))
                ) : (
                  <li><code className="text-sm">{problem.constraints}</code></li>
                )}
              </ul>
            </div>
          )}

          {/* Tags */}
          {problem.tags && problem.tags.length > 0 && (
            <div className="p-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Topics</h2>
              <div className="flex flex-wrap gap-2">
                {problem.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
