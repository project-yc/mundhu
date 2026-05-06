import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, CheckCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Particles from '../../components/particles/Particles';

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
  const [showPassword, setShowPassword] = useState(false);

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
        } else if (userRole === 'RECRUITER') {
          console.log('Redirecting to recruiter dashboard');
          window.location.href = '/recruiter/dashboard';
        } else {
          console.log('Redirecting to user dashboard');
          window.location.href = '/user/dashboard';
        }
      }, 1000);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

        .login-root {
          font-family: 'Inter', sans-serif;
        }

        @keyframes card-rise {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .card-rise { animation: card-rise 0.55s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .fade-in   { animation: fade-in 0.8s ease both; }

        .glass-card {
          background: rgba(12, 12, 15, 0.72);
          backdrop-filter: blur(20px) saturate(160%);
          -webkit-backdrop-filter: blur(20px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow:
            0 0 0 1px rgba(6,182,212,0.06),
            0 24px 64px rgba(0,0,0,0.6),
            0 8px 24px rgba(0,0,0,0.4);
        }

        .login-input {
          width: 100%;
          padding: 0.65rem 0.875rem 0.65rem 2.6rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          font-size: 0.875rem;
          color: #F4F4F5;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          outline: none;
          font-family: 'Inter', sans-serif;
          letter-spacing: 0.01em;
        }
        .login-input::placeholder { color: #3F3F46; }
        .login-input:hover  {
          border-color: rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.06);
        }
        .login-input:focus  {
          border-color: rgba(6,182,212,0.5);
          background: rgba(6,182,212,0.04);
          box-shadow: 0 0 0 3px rgba(6,182,212,0.1), inset 0 0 0 1px rgba(6,182,212,0.08);
        }
        .login-input.password-input {
          padding-right: 2.75rem;
        }

        .login-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.7rem 1rem;
          background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%);
          border: none;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #030712;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: opacity 0.15s ease, box-shadow 0.2s ease, transform 0.1s ease;
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
        }
        .login-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          pointer-events: none;
        }
        .login-btn:hover:not(:disabled) {
          box-shadow: 0 0 0 1px rgba(6,182,212,0.3), 0 8px 24px rgba(6,182,212,0.3);
          opacity: 0.92;
        }
        .login-btn:active:not(:disabled) { transform: scale(0.99); }
        .login-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .toggle-pw {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          color: #52525B;
          display: flex;
          align-items: center;
          transition: color 0.15s ease;
        }
        .toggle-pw:hover { color: #A1A1AA; }

        .brand-mark {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(6,182,212,0.35);
          flex-shrink: 0;
        }

        .separator {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
        }

        .status-banner {
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          padding: 0.625rem 0.875rem;
          border-radius: 8px;
          font-size: 0.8125rem;
          line-height: 1.5;
        }
      `}</style>

      {/* Full-screen particles layer */}
      <div style={{ position: 'fixed', inset: 0, background: '#080A0E', zIndex: 0 }}>
        <Particles
          particleColors={['#06B6D4', '#22D3EE', '#7DD3FC', '#ffffff']}
          particleCount={180}
          particleSpread={9}
          speed={0.04}
          particleBaseSize={72}
          sizeRandomness={1.2}
          alphaParticles={true}
          moveParticlesOnHover={true}
          particleHoverFactor={0.6}
          disableRotation={false}
          cameraDistance={20}
          pixelRatio={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
        />

        {/* radial vignette — keeps the center dimmer so card pops */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 20%, rgba(8,10,14,0.75) 100%)',
          pointerEvents: 'none',
        }} />

        {/* top glow bloom */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '300px',
          background: 'radial-gradient(ellipse, rgba(6,182,212,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Page content */}
      <div
        className="login-root min-h-screen flex items-center justify-center p-6"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <div className="card-rise w-full max-w-sm">

          {/* Brand header */}
          <div className="fade-in mb-8 text-center" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center justify-center mb-5">
              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontWeight: 700,
                fontSize: '1.75rem',
                color: '#F4F4F5',
                letterSpacing: '-0.04em',
                lineHeight: 1,
              }}>
                tru<span style={{ color: '#06B6D4' }}>dev</span><span style={{ color: '#22D3EE', opacity: 0.6 }}>_</span>
              </span>
            </div>

            <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '1.25rem', color: '#E4E4E7', letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>
              Welcome back
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#52525B', letterSpacing: '0.01em' }}>
              Sign in to continue to your workspace
            </p>
          </div>

          {/* Beta pill */}
          <div className="fade-in flex justify-center mb-6" style={{ animationDelay: '0.15s' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.6875rem',
              fontWeight: 400,
              padding: '0.3rem 0.875rem', borderRadius: '4px',
              background: 'rgba(6,182,212,0.06)',
              border: '1px solid rgba(6,182,212,0.14)',
              color: '#22D3EE',
              letterSpacing: '0.04em',
            }}>
              <span style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: '#06B6D4',
                boxShadow: '0 0 6px rgba(6,182,212,0.9)',
                flexShrink: 0,
              }} />
              beta / invited_only
            </span>
          </div>

          {/* Glass card */}
          <div className="glass-card rounded-2xl p-7" style={{ animationDelay: '0.2s' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

              {/* Email field */}
              <div>
                <label htmlFor="email" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#A1A1AA', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
                  Email address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#3F3F46', pointerEvents: 'none' }} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="login-input"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="password" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#A1A1AA', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#3F3F46', pointerEvents: 'none' }} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="login-input password-input"
                  />
                  <button
                    type="button"
                    className="toggle-pw"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword
                      ? <EyeOff style={{ width: '15px', height: '15px' }} />
                      : <Eye style={{ width: '15px', height: '15px' }} />}
                  </button>
                </div>
              </div>

              {/* Error banner */}
              {error && (
                <div
                  className="status-banner"
                  style={{ background: 'rgba(244,63,94,0.07)', border: '1px solid rgba(244,63,94,0.16)', color: '#FDA4AF' }}
                >
                  <AlertCircle style={{ width: '14px', height: '14px', marginTop: '1px', flexShrink: 0, color: '#F43F5E' }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Success banner */}
              {success && (
                <div
                  className="status-banner"
                  style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.16)', color: '#6EE7B7' }}
                >
                  <CheckCircle style={{ width: '14px', height: '14px', marginTop: '1px', flexShrink: 0, color: '#10B981' }} />
                  <span>{success}</span>
                </div>
              )}

              <div className="separator" />

              {/* Submit */}
              <button onClick={handleSubmit} disabled={loading} className="login-btn">
                {loading ? (
                  <>
                    <div style={{
                      width: '14px', height: '14px', borderRadius: '50%',
                      border: '2px solid rgba(3,7,18,0.25)',
                      borderTopColor: '#030712',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight style={{ width: '14px', height: '14px' }} />
                  </>
                )}
              </button>

            </div>
          </div>

          {/* Footer */}
          <p className="fade-in mt-6 text-center" style={{ fontSize: '0.8125rem', color: '#3F3F46', animationDelay: '0.3s' }}>
            Don&apos;t have an account?{' '}
            <Link
              to="/waitlist"
              style={{ color: '#71717A', fontWeight: 500, transition: 'color 0.15s ease', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#E4E4E7'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#71717A'; }}
            >
              Request access
            </Link>
          </p>

          <p className="fade-in mt-4 text-center" style={{ fontSize: '0.75rem', color: '#27272A', animationDelay: '0.35s' }}>
            © 2026 TruDev
          </p>

        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}