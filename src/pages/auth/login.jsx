import { useState } from 'react';
import { Link } from 'react-router-dom';
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
    <div className="min-h-screen bg-navy-50/40 flex items-center justify-center p-4">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 lg:max-w-lg flex-col justify-center pr-16">
        <div className="w-10 h-10 bg-navy-700 rounded-lg flex items-center justify-center mb-8">
          <LogIn className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-display text-navy-900 mb-3">Welcome back to <br />mundhu</h1>
        <p className="text-sm text-navy-800/50 leading-relaxed max-w-sm">
          Sign in to manage your recruitment assessments, invite candidates, and track progress.
        </p>
      </div>

      {/* Login card */}
      <div className="w-full max-w-sm">
        <div className="bg-white border border-navy-900/8 rounded-card shadow-elevated p-8">
          {/* Mobile header */}
          <div className="lg:hidden mb-6">
            <div className="w-9 h-9 bg-navy-700 rounded-lg flex items-center justify-center mb-4">
              <LogIn className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-navy-900">Sign in</h1>
            <p className="text-sm text-navy-800/50 mt-1">Continue to your dashboard</p>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block mb-6">
            <h2 className="text-base font-semibold text-navy-900">Sign in to your account</h2>
          </div>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy-900 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-800/30" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-navy-900 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-800/30" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-50 border border-rose-200/60 rounded-lg animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <p className="text-xs text-rose-700 font-medium">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200/60 rounded-lg animate-fadeIn">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <p className="text-xs text-emerald-700 font-medium">{success}</p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full justify-center mt-1"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-navy-900/6">
            <p className="text-center text-xs text-navy-800/40">
              Don't have an account?{' '}
              <Link to="/signup" className="text-navy-700 font-semibold hover:text-navy-900 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}