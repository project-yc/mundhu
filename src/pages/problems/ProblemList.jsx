import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Filter, Code, Clock, BarChart3, CheckCircle, Circle, PlayCircle, LogOut, User, XCircle } from 'lucide-react';
import { getProblems, getCategories, getUserDashboard, getActiveSessions, closeAllSessions } from '../../api/problems';
import { logout, getUser, isAuthenticated } from '../../api/auth';

// Difficulty badge colors
const difficultyColors = {
  EASY: 'bg-green-100 text-green-700 border-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  HARD: 'bg-red-100 text-red-700 border-red-200',
};

export default function ProblemList() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [closingSession, setClosingSession] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const user = getUser();
  const authenticated = isAuthenticated();
  const [autoClosing, setAutoClosing] = useState(true); // Start true to block fetchData

  // Auto-close sessions when returning from Theia (like B2B flow)
  useEffect(() => {
    const autoCloseSessionsOnReturn = async () => {
      if (!authenticated) {
        setAutoClosing(false);
        return;
      }
      
      try {
        const sessions = await getActiveSessions();
        if (sessions && sessions.length > 0) {
          // User returned from Theia with active sessions - auto-close them
          console.log(`Auto-closing ${sessions.length} practice session(s)...`);
          await closeAllSessions();
          console.log('Sessions closed successfully');
        }
      } catch (err) {
        console.error('Failed to auto-close sessions:', err);
      } finally {
        setAutoClosing(false);
      }
    };

    autoCloseSessionsOnReturn();
  }, []); // Run once on mount

  // Only fetch data after auto-close is done
  useEffect(() => {
    if (!autoClosing) {
      fetchData();
    }
  }, [autoClosing, difficultyFilter, categoryFilter]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [problemsData, categoriesData] = await Promise.all([
        getProblems({ difficulty: difficultyFilter, category: categoryFilter }),
        getCategories(),
      ]);
      
      setProblems(problemsData.results || problemsData);
      setCategories(categoriesData.results || categoriesData);

      // Fetch dashboard (sessions already handled by auto-close)
      if (authenticated) {
        try {
          const dashboardData = await getUserDashboard();
          setDashboard(dashboardData);
        } catch {
          // Ignore dashboard errors
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAllSessions = async () => {
    setClosingSession(true);
    try {
      await closeAllSessions();
      setActiveSessions([]);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to close sessions');
    } finally {
      setClosingSession(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';  // Full reload to reset auth state
  };

  const filteredProblems = problems.filter(problem => 
    problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    problem.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CodePractice</span>
            </div>
            
            <div className="flex items-center gap-4">
              {authenticated ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{user?.name || user?.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active Sessions Banner */}
        {activeSessions.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  You have {activeSessions.length} active session{activeSessions.length > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-yellow-600">
                  {activeSessions.map(s => s.problem_title).join(', ')}
                </p>
              </div>
            </div>
            <button
              onClick={handleCloseAllSessions}
              disabled={closingSession}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg transition disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              {closingSession ? 'Closing...' : 'Close All Sessions'}
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Page Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Problems</h1>
              <p className="text-gray-600">Practice coding problems to improve your skills</p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search problems..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                {/* Difficulty Filter */}
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                  <option value="">All Difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : (
              /* Problem List */
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acceptance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProblems.map((problem) => (
                      <tr 
                        key={problem.id}
                        onClick={() => navigate(`/problems/${problem.slug}`)}
                        className="hover:bg-gray-50 cursor-pointer transition"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {problem.user_status === 'SOLVED' ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : problem.user_status === 'ATTEMPTED' ? (
                            <Circle className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300" />
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{problem.title}</span>
                            {problem.is_premium && (
                              <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">PRO</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {problem.category_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${difficultyColors[problem.difficulty]}`}>
                            {problem.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {problem.acceptance_rate ? `${problem.acceptance_rate.toFixed(1)}%` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredProblems.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No problems found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Stats (only for authenticated users) */}
          {authenticated && dashboard && (
            <div className="w-80 hidden lg:block">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h2>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{dashboard.stats?.solved || 0}</div>
                    <div className="text-xs text-gray-500">Solved</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{dashboard.stats?.attempted || 0}</div>
                    <div className="text-xs text-gray-500">Attempted</div>
                  </div>
                </div>

                {/* By Difficulty */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">By Difficulty</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-600">Easy</span>
                      <span className="text-sm font-medium">{dashboard.solved_by_difficulty?.easy || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-yellow-600">Medium</span>
                      <span className="text-sm font-medium">{dashboard.solved_by_difficulty?.medium || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-red-600">Hard</span>
                      <span className="text-sm font-medium">{dashboard.solved_by_difficulty?.hard || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Streak */}
                {dashboard.stats?.streak_days > 0 && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-100">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🔥</span>
                      <div>
                        <div className="font-bold text-orange-600">{dashboard.stats.streak_days} Day Streak!</div>
                        <div className="text-xs text-orange-500">Keep it going!</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
