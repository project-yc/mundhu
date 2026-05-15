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

        @keyframes card-rise {
          from { opacity: 0; transform: translateY(20px) scale(0.985); }
          to   { opacity: 1; transform: translateY(0)    scale(1);     }
        }
        .card-rise { animation: card-rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }

        .glass-card {
          background: rgba(11, 11, 14, 0.78);
          backdrop-filter: blur(24px) saturate(160%);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow:
            0 0 0 1px rgba(6,182,212,0.05),
            0 32px 72px rgba(0,0,0,0.65),
            0 8px 24px rgba(0,0,0,0.35);
        }

        .login-input {
          width: 100%;
          padding: 0.6rem 0.875rem 0.6rem 2.5rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 9px;
          font-size: 0.8125rem;
          color: #F4F4F5;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          outline: none;
          font-family: 'Inter', sans-serif;
          letter-spacing: 0.01em;
        }
        .login-input::placeholder { color: #3F3F46; }
        .login-input:hover { border-color: rgba(255,255,255,0.13); background: rgba(255,255,255,0.055); }
        .login-input:focus {
          border-color: rgba(6,182,212,0.45);
          background: rgba(6,182,212,0.035);
          box-shadow: 0 0 0 3px rgba(6,182,212,0.09), inset 0 0 0 1px rgba(6,182,212,0.07);
        }
        .login-input.password-input { padding-right: 2.5rem; }

        .login-btn {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 0.45rem;
          padding: 0.65rem 1rem;
          background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%);
          border: none; border-radius: 9px;
          font-size: 0.8125rem; font-weight: 600; color: #030712;
          cursor: pointer; letter-spacing: 0.02em;
          transition: opacity 0.15s, box-shadow 0.2s, transform 0.1s;
          font-family: 'Inter', sans-serif;
          position: relative; overflow: hidden;
        }
        .login-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 55%);
          pointer-events: none;
        }
        .login-btn:hover:not(:disabled) {
          box-shadow: 0 0 0 1px rgba(6,182,212,0.28), 0 6px 20px rgba(6,182,212,0.28);
          opacity: 0.91;
        }
        .login-btn:active:not(:disabled) { transform: scale(0.99); }
        .login-btn:disabled { opacity: 0.33; cursor: not-allowed; }

        .toggle-pw {
          position: absolute; right: 0.7rem; top: 50%; transform: translateY(-50%);
          background: none; border: none; padding: 0; cursor: pointer;
          color: #52525B; display: flex; align-items: center;
          transition: color 0.15s;
        }
        .toggle-pw:hover { color: #A1A1AA; }

        .waitlist-strip {
          display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
          padding: 0.875rem 1rem;
          border-radius: 10px;
          background: rgba(6,182,212,0.03);
          border: 1px solid rgba(6,182,212,0.1);
          transition: border-color 0.22s, background 0.22s;
          cursor: default;
        }
        .waitlist-strip:hover {
          border-color: rgba(6,182,212,0.22);
          background: rgba(6,182,212,0.05);
        }

        .waitlist-link {
          display: inline-flex; align-items: center; gap: 0.375rem;
          padding: 0.4rem 0.875rem;
          border: 1px solid rgba(6,182,212,0.3);
          border-radius: 7px;
          font-size: 0.75rem; font-weight: 600;
          color: #22D3EE; text-decoration: none;
          font-family: 'Inter', sans-serif; letter-spacing: 0.02em;
          white-space: nowrap; flex-shrink: 0;
          transition: background 0.16s, border-color 0.16s, box-shadow 0.16s, color 0.16s;
        }
        .waitlist-link:hover {
          background: rgba(6,182,212,0.08);
          border-color: rgba(6,182,212,0.5);
          box-shadow: 0 0 16px rgba(6,182,212,0.15);
          color: #67E8F9;
        }

        .status-banner {
          display: flex; align-items: flex-start; gap: 0.575rem;
          padding: 0.55rem 0.8rem; border-radius: 8px;
          font-size: 0.78rem; line-height: 1.5;
        }

        .sep {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Fixed background — particles layer */}
      <div style={{ position: 'fixed', inset: 0, background: '#080A0E', zIndex: 0 }}>
        <Particles
          particleColors={['#ffffff', '#ffffff', '#ffffff']}
          particleCount={180}
          particleSpread={9}
          speed={0.04}
          particleBaseSize={110}
          sizeRandomness={1.2}
          alphaParticles={false}
          moveParticlesOnHover={true}
          particleHoverFactor={0.6}
          disableRotation={false}
          cameraDistance={20}
          pixelRatio={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 20%, rgba(8,10,14,0.75) 100%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(6,182,212,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Fixed viewport shell — no scroll possible */}
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.25rem',
        zIndex: 1,
        fontFamily: "'Inter', sans-serif",
      }}>
        <div className="card-rise" style={{ width: '100%', maxWidth: '384px' }}>

          {/* ── Single glass card containing everything ── */}
          <div className="glass-card" style={{ borderRadius: '20px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

            {/* Top bar: brand + beta pill */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontWeight: 700, fontSize: '1.25rem',
                color: '#F4F4F5', letterSpacing: '-0.04em', lineHeight: 1,
              }}>
                tru<span style={{ color: '#06B6D4' }}>dev</span>
                <span style={{ color: '#22D3EE', opacity: 0.55 }}>_</span>
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.625rem', fontWeight: 400,
                padding: '0.25rem 0.625rem', borderRadius: '4px',
                background: 'rgba(6,182,212,0.06)',
                border: '1px solid rgba(6,182,212,0.13)',
                color: '#22D3EE', letterSpacing: '0.04em',
              }}>
                <span style={{
                  width: '4px', height: '4px', borderRadius: '50%',
                  background: '#06B6D4', boxShadow: '0 0 5px rgba(6,182,212,0.9)',
                }} />
                beta
              </span>
            </div>

            {/* Greeting */}
            <div>
              <h1 style={{ fontWeight: 600, fontSize: '1.0625rem', color: '#E4E4E7', letterSpacing: '-0.02em', marginBottom: '0.2rem', margin: 0 }}>
                Welcome back
              </h1>
              <p style={{ fontSize: '0.8rem', color: '#52525B', marginTop: '0.25rem', margin: '0.25rem 0 0' }}>
                Sign in to continue to your workspace
              </p>
            </div>

            <div className="sep" />

            {/* Email */}
            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 500, color: '#71717A', marginBottom: '0.4rem', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#3F3F46', pointerEvents: 'none' }} />
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

            {/* Password */}
            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 500, color: '#71717A', marginBottom: '0.4rem', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#3F3F46', pointerEvents: 'none' }} />
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
                    ? <EyeOff style={{ width: '14px', height: '14px' }} />
                    : <Eye    style={{ width: '14px', height: '14px' }} />}
                </button>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="status-banner" style={{ background: 'rgba(244,63,94,0.07)', border: '1px solid rgba(244,63,94,0.15)', color: '#FDA4AF' }}>
                <AlertCircle style={{ width: '13px', height: '13px', marginTop: '1px', flexShrink: 0, color: '#F43F5E' }} />
                <span>{error}</span>
              </div>
            )}

            {/* Success banner */}
            {success && (
              <div className="status-banner" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)', color: '#6EE7B7' }}>
                <CheckCircle style={{ width: '13px', height: '13px', marginTop: '1px', flexShrink: 0, color: '#10B981' }} />
                <span>{success}</span>
              </div>
            )}

            {/* Sign in button */}
            <button onClick={handleSubmit} disabled={loading} className="login-btn">
              {loading ? (
                <>
                  <div style={{
                    width: '13px', height: '13px', borderRadius: '50%',
                    border: '2px solid rgba(3,7,18,0.2)', borderTopColor: '#030712',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Signing in…
                </>
              ) : (
                <>Sign in <ArrowRight style={{ width: '13px', height: '13px' }} /></>
              )}
            </button>

            {/* ── Waitlist strip ── */}
            <div className="waitlist-strip">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                  <span style={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    background: '#10B981', boxShadow: '0 0 5px rgba(16,185,129,0.8)',
                    animation: 'pulse-dot 2s ease infinite', flexShrink: 0,
                  }} />
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: '#22D3EE', letterSpacing: '0.06em' }}>
                    EARLY ACCESS · OPEN
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#71717A', margin: 0, lineHeight: 1.5 }}>
                  New to TruDev? Get early access.
                </p>
              </div>
              <Link to="/waitlist" className="waitlist-link">
                Join waitlist <ArrowRight style={{ width: '11px', height: '11px' }} />
              </Link>
            </div>

          </div>

          {/* Copyright — outside card, very subtle */}
          <p style={{ textAlign: 'center', fontSize: '0.6875rem', color: '#27272A', marginTop: '1rem', fontFamily: "'Inter', sans-serif" }}>
            © 2026 TruDev
          </p>

        </div>
      </div>
    </>
  );
}