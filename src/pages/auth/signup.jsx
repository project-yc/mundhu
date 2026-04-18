import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, BriefcaseBusiness, AlertCircle, CheckCircle } from 'lucide-react';
import { signupUser } from '../../api/auth/signup';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await signupUser({ name, email, password, role });
      const signedUpRole = response.role || role;

      setSuccess('Account created successfully! Redirecting...');
      setName('');
      setEmail('');
      setPassword('');

      setTimeout(() => {
        if (signedUpRole === 'RECRUITER') {
          window.location.href = '/recruiter/dashboard';
        } else {
          window.location.href = '/user/dashboard';
        }
      }, 1000);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-50/40 flex items-center justify-center p-4">
      <div className="hidden lg:flex lg:w-1/2 lg:max-w-lg flex-col justify-center pr-16">
        <div className="w-10 h-10 bg-navy-700 rounded-lg flex items-center justify-center mb-8">
          <UserPlus className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-display text-navy-900 mb-3">Create your <br />mundhu account</h1>
        <p className="text-sm text-navy-800/50 leading-relaxed max-w-sm">
          Sign up as a user or recruiter and start managing assessments right away.
        </p>
      </div>

      <div className="w-full max-w-sm">
        <div className="bg-white border border-navy-900/8 rounded-card shadow-elevated p-8">
          <div className="lg:hidden mb-6">
            <div className="w-9 h-9 bg-navy-700 rounded-lg flex items-center justify-center mb-4">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-navy-900">Sign up</h1>
            <p className="text-sm text-navy-800/50 mt-1">Create your account</p>
          </div>

          <div className="hidden lg:block mb-6">
            <h2 className="text-base font-semibold text-navy-900">Create your account</h2>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-navy-900 mb-1.5">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-800/30" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>

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
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Account type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('USER')}
                  className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    role === 'USER'
                      ? 'border-navy-700 bg-navy-50 text-navy-900'
                      : 'border-navy-900/10 text-navy-700 hover:border-navy-900/20'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <User className="w-4 h-4" />
                    User
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('RECRUITER')}
                  className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    role === 'RECRUITER'
                      ? 'border-navy-700 bg-navy-50 text-navy-900'
                      : 'border-navy-900/10 text-navy-700 hover:border-navy-900/20'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <BriefcaseBusiness className="w-4 h-4" />
                    Recruiter
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-50 border border-rose-200/60 rounded-lg animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <p className="text-xs text-rose-700 font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200/60 rounded-lg animate-fadeIn">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <p className="text-xs text-emerald-700 font-medium">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-1"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-navy-900/6">
            <p className="text-center text-xs text-navy-800/40">
              Already have an account?{' '}
              <Link to="/login" className="text-navy-700 font-semibold hover:text-navy-900 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
