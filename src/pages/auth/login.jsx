import { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle, CheckCircle } from 'lucide-react';

const loginUser = async (email, password) => {
  try {
    const response = await fetch('/api/auth/v1/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    // Parse JSON once
    const data = await response.json();
    console.log('Login response:', data);

    if (!response.ok) {
      const errorMessage = data.message || data.error || `HTTP Error: ${response.status}`;
      throw new Error(errorMessage);
    }

    // Store tokens - the API returns tokens at root level
    if (data.access_token) {
      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      // Optionally store user info
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to connect to the server. Please check your connection.');
    }
    throw error;
  }
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await loginUser(email, password);
      setSuccess('Login successful! Redirecting...');
      setEmail('');
      setPassword('');
      console.log('Login response:', response);
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-slate-50 to-blue-100/60 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-40 w-96 h-96 bg-cyan-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Login card */}
      <div className="relative w-full max-w-md z-10">
        <div className="backdrop-blur-2xl bg-white/70 border border-white/30 rounded-3xl shadow-2xl shadow-blue-100/30 p-10">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-200/50 transform hover:scale-110 transition-transform duration-300">
                <LogIn className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-gray-600 text-center text-sm">Sign in to continue to your dashboard</p>
          </div>

          <div className="space-y-5">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3.5 backdrop-blur-xl bg-white/60 border border-white/40 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white/80 transition-all duration-300 shadow-sm"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-3.5 backdrop-blur-xl bg-white/60 border border-white/40 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white/80 transition-all duration-300 shadow-sm"
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-3 p-4 backdrop-blur-xl bg-rose-50/80 border border-rose-200/50 rounded-2xl animate-in fade-in slide-in-from-top-1 shadow-sm">
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-rose-700 font-medium">{error}</p>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="flex items-start gap-3 p-4 backdrop-blur-xl bg-emerald-50/80 border border-emerald-200/50 rounded-2xl animate-in fade-in slide-in-from-top-1 shadow-sm">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-700 font-medium">{success}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 shadow-xl hover:shadow-2xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/30">
            <p className="text-center text-gray-600 text-sm">
              Don't have an account?{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}