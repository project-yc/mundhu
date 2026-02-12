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

    // Handle both response formats
    // New format: { tokens: { access_token, refresh_token }, user, org, role }
    // Old format: { access_token, refresh_token, user }
    const tokens = data.tokens || data;
    const accessToken = tokens.access_token || data.access_token;
    const refreshToken = tokens.refresh_token || data.refresh_token;

    console.log('=== LOGIN DEBUG ===');
    console.log('Full login response:', JSON.stringify(data, null, 2));
    console.log('Access token:', accessToken ? 'exists' : 'missing');
    console.log('Role from data.role:', data.role);

    if (accessToken) {
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Store user info
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      // Store role - check multiple possible locations
      const userRole = data.role || data.user?.role || null;
      console.log('Detected user role:', userRole);
      
      if (userRole) {
        console.log('Storing user role:', userRole);
        localStorage.setItem('userRole', userRole);
      } else {
        console.warn('No role found in response! Response structure:', Object.keys(data));
        // Don't store null/undefined
        localStorage.removeItem('userRole');
      }
      
      // Store org info
      if (data.org) {
        localStorage.setItem('org', JSON.stringify(data.org));
      }
      
      console.log('=== END LOGIN DEBUG ===');
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
      console.log('Checking role for redirect:', response.role);
      
      // Redirect based on role after 1 second
      setTimeout(() => {
        const userRole = response.role || localStorage.getItem('userRole');
        console.log('Role for redirect decision:', userRole);
        
        if (userRole === 'ADMIN') {
          console.log('Redirecting to admin dashboard');
          window.location.href = '/admin';
        } else {
          console.log('Redirecting to recruiter dashboard');
          window.location.href = '/';
        }
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
        {/* Outer glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-[2rem] blur-2xl"></div>
        
        <div className="relative backdrop-blur-2xl bg-white/70 border border-white/40 rounded-[2rem] shadow-[0_8px_32px_0_rgba(59,130,246,0.15)] p-10 hover:shadow-[0_8px_48px_0_rgba(59,130,246,0.2)] transition-all duration-500">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative group">
                {/* Icon glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-[0_8px_24px_0_rgba(59,130,246,0.3)] transform hover:scale-110 hover:rotate-3 transition-all duration-300">
                  <LogIn className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-gray-600 text-center text-sm">Sign in to continue to your dashboard</p>
          </div>

          <div className="space-y-5">
            {/* Email field */}
            <div className="group">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors z-10" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3.5 backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white/80 hover:bg-white/70 transition-all duration-300 shadow-[inset_0_2px_8px_0_rgba(0,0,0,0.04)] hover:shadow-[inset_0_2px_12px_0_rgba(59,130,246,0.08)]"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="group">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-cyan-500 transition-colors z-10" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-3.5 backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 focus:bg-white/80 hover:bg-white/70 transition-all duration-300 shadow-[inset_0_2px_8px_0_rgba(0,0,0,0.04)] hover:shadow-[inset_0_2px_12px_0_rgba(6,182,212,0.08)]"
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-400/10 to-red-400/10 rounded-2xl blur-lg"></div>
                <div className="relative flex items-start gap-3 p-4 backdrop-blur-xl bg-rose-50/90 border border-rose-200/60 rounded-2xl animate-in fade-in slide-in-from-top-1 shadow-[0_4px_16px_0_rgba(244,63,94,0.12)]">
                  <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5 drop-shadow-sm" />
                  <p className="text-sm text-rose-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-green-400/10 rounded-2xl blur-lg"></div>
                <div className="relative flex items-start gap-3 p-4 backdrop-blur-xl bg-emerald-50/90 border border-emerald-200/60 rounded-2xl animate-in fade-in slide-in-from-top-1 shadow-[0_4px_16px_0_rgba(16,185,129,0.12)]">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5 drop-shadow-sm" />
                  <p className="text-sm text-emerald-700 font-medium">{success}</p>
                </div>
              </div>
            )}

            {/* Submit button */}
            <div className="pt-2">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="relative w-full py-4 px-4 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 shadow-[0_8px_24px_0_rgba(59,130,246,0.25)] hover:shadow-[0_12px_32px_0_rgba(59,130,246,0.35)] disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/30">
            <p className="text-center text-gray-600 text-sm">
              Don't have an account?{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors hover:underline underline-offset-4">
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