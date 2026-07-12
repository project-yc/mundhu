import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CANDIDATE_PALETTE as CP, RECRUITER_PALETTE as RP } from '../../theme/palette';
import Particles from '../../components/particles/Particles';

// ─── Accent shortcuts ────────────────────────────────────────────────────────
const REC_ACCENT        = CP.recruiterAccent;         // #A78BFA
const REC_ACCENT_DIM    = CP.recruiterAccentDim;
const REC_ACCENT_GLOW   = CP.recruiterAccentGlow;
const REC_ACCENT_BORDER = CP.recruiterAccentBorder;

// ─── API helpers ─────────────────────────────────────────────────────────────
async function doLogin(email, password) {
  const res  = await fetch('/api/auth/v1/recruiter/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.message || data.error || `Error ${res.status}`);
  return data;
}

function storeAuthData(data) {
  const tokens       = data.tokens || data;
  const accessToken  = tokens.access_token  || data.access_token;
  const refreshToken = tokens.refresh_token || data.refresh_token;
  if (!accessToken) return null;
  localStorage.setItem('authToken',    accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
  if (data.org)  localStorage.setItem('org',  JSON.stringify(data.org));
  const role = data.role || data.user?.role || null;
  if (role) localStorage.setItem('userRole', role);
  else      localStorage.removeItem('userRole');
  return role;
}

function resolveRedirect(userRole) {
  if (userRole === 'ORG_ADMIN' || userRole === 'ADMIN') {
    const org = (() => { try { return JSON.parse(localStorage.getItem('org') || '{}'); } catch { return {}; } })();
    if (org?.org_id) return org.is_onboarded === false ? '/recruiter/onboarding' : '/recruiter/dashboard';
    if (userRole === 'ADMIN') return '/admin';
    return '/recruiter/onboarding';
  }
  if (userRole === 'RECRUITER') return '/recruiter/dashboard';
  return '/user/dashboard';
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function RecruiterIcon({ color = 'currentColor' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  );
}

function EnvelopeIcon({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="14" height="10" rx="2" />
      <polyline points="1,3 8,9 15,3" />
    </svg>
  );
}

function LockIcon({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="10" height="8" rx="1.5" />
      <path d="M5 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function EyeIcon({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 8c1.7-3.3 4-5 7-5s5.3 1.7 7 5c-1.7 3.3-4 5-7 5s-5.3-1.7-7-5z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  );
}

function EyeSlashIcon({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="15" y2="15" />
      <path d="M6.4 3.2A7 7 0 0 1 8 3c3 0 5.3 1.7 7 5a11.7 11.7 0 0 1-1.6 2.4M3.5 4.5C2.2 5.5 1.3 6.7 1 8c1.7 3.3 4 5 7 5a7 7 0 0 0 3.9-1.3" />
      <path d="M5.6 5.6a3 3 0 0 0 4.8 3.8" />
    </svg>
  );
}

function ArrowRightIcon({ color, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="8" x2="14" y2="8" />
      <polyline points="9,3 14,8 9,13" />
    </svg>
  );
}

// ─── Left panel (always dark) ─────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div className="auth-left" style={{
      position: 'relative', overflow: 'hidden',
      width: '46%', flexShrink: 0,
      background: 'linear-gradient(135deg, #070F20 0%, #0A1628 100%)',
      borderRight: `1px solid ${CP.border}`,
      padding: '56px 52px',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Decorative glows */}
      <div style={{ position: 'absolute', top: -120, right: -120, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(24,211,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -100, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, fontSize: 20, color: CP.textPrimary, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center' }}>
          <span>tru</span>
          <span style={{ color: CP.brand }}>dev</span>
          <span style={{
            display: 'inline-block', width: 2, height: 18, background: CP.brand,
            marginLeft: 3, verticalAlign: 'middle',
            animation: 'blink 1.1s step-end infinite',
          }} />
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10, color: CP.brand,
          border: `1px solid ${CP.brandBorder}`,
          background: CP.brandTint,
          padding: '3px 8px', borderRadius: 4,
          letterSpacing: '0.04em',
        }}>beta</span>
      </div>

      {/* Hero */}
      <div style={{ marginTop: 48, position: 'relative', zIndex: 1 }}>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, color: CP.brand,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          margin: '0 0 14px',
        }}>
          Real Engineering. Verified Talent.
        </p>
        <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 36, color: CP.textPrimary, lineHeight: 1.2, margin: 0 }}>
          <span style={{ fontWeight: 300 }}>Assessments that</span>
          <br />
          <span style={{ fontWeight: 600 }}>reflect actual work</span>
        </h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14, color: CP.textSecondary,
          marginTop: 16, maxWidth: 340, lineHeight: 1.65,
        }}>
          Create work-sample assessments, review candidate evidence, and move
          hiring decisions forward with a clearer signal.
        </p>
      </div>

      {/* Role chips */}
      <div style={{ marginTop: 36, display: 'flex', gap: 10, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
        {[
          { label: 'Role-ready reports', dot: CP.brand, border: 'rgba(24,211,255,0.2)', bg: 'rgba(24,211,255,0.06)' },
          { label: 'Recruiter workspace', dot: REC_ACCENT,  border: REC_ACCENT_BORDER, bg: REC_ACCENT_DIM },
        ].map(({ label, dot, border, bg }) => (
          <div key={label} style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            border: `1px solid ${border}`, background: bg,
            borderRadius: 999, padding: '7px 14px',
            fontSize: 12, fontWeight: 500, color: CP.textSecondary,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, flexShrink: 0 }} />
            {label}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ marginTop: 'auto', paddingTop: 48, display: 'flex', gap: 36, position: 'relative', zIndex: 1 }}>
        {[['2.4k+', 'Assessments run'], ['98%', 'Signal accuracy'], ['0 DSA', 'No puzzle grind']].map(([num, label]) => (
          <div key={label}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, color: CP.textPrimary, fontWeight: 500 }}>{num}</div>
            <div style={{ fontSize: 11, color: CP.textFaint, marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus,  setPassFocus]  = useState(false);

  const palette     = RP;
  const accentColor = REC_ACCENT;
  const accentDim   = REC_ACCENT_DIM;
  const accentGlow  = REC_ACCENT_GLOW;

  const baseInput = {
    width: '100%', height: 46,
    background: palette.surfaceMuted,
    border: `1px solid ${palette.border}`,
    borderRadius: 10,
    padding: '0 14px 0 42px',
    fontSize: 13.5,
    fontFamily: "'DM Sans', sans-serif",
    color: palette.textPrimary,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
    boxSizing: 'border-box',
  };

  const inputStyle = (focused) => focused
    ? { ...baseInput, borderColor: accentColor, background: palette.surfaceHover, boxShadow: `0 0 0 3px ${accentGlow}` }
    : baseInput;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Email and password are required.'); return; }
    setError(''); setSuccess(''); setLoading(true);
    try {
      const data     = await doLogin(email, password);
      const userRole = storeAuthData(data);
      setSuccess('Login successful! Redirecting…');
      setTimeout(() => { window.location.href = resolveRedirect(userRole); }, 900);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes pulse-dot{ 0%,100%{opacity:1} 50%{opacity:0.3} }
        *, *::before, *::after { box-sizing: border-box; }
        @media (max-width: 768px) {
          .auth-shell { align-items: flex-start !important; padding: 0 !important; overflow-y: auto !important; }
          .auth-card  { flex-direction: column !important; border-radius: 0 !important; max-width: 100% !important; min-height: 100vh !important; overflow: visible !important; }
          .auth-left  { display: none !important; }
          .auth-right-panel { padding: 36px 20px 40px !important; }
          .auth-mobile-wordmark { display: flex !important; }
        }
      `}</style>

      {/* Full-viewport dark canvas */}
      <div className="auth-bg" style={{ position: 'fixed', inset: 0, background: CP.pageBg, zIndex: 0 }}>
        <Particles
          particleColors={['#ffffff', '#ffffff', '#ffffff']}
          particleCount={180} particleSpread={9} speed={0.04}
          particleBaseSize={110} sizeRandomness={1.2}
          alphaParticles={false} moveParticlesOnHover={true}
          particleHoverFactor={0.6} disableRotation={false}
          cameraDistance={20}
          pixelRatio={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 20%, rgba(4,9,20,0.75) 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(24,211,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      </div>

      {/* Centered shell */}
      <div className="auth-shell" style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.25rem', zIndex: 1,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div className="auth-card" style={{
          width: '100%', maxWidth: 1060,
          borderRadius: 20, overflow: 'hidden',
          display: 'flex',
          border: `1px solid ${CP.border}`,
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.35)',
        }}>

          {/* Left panel */}
          <LeftPanel />

          {/* Right panel */}
          <div className="auth-right-panel" style={{
            flex: 1, padding: '48px 44px',
            background: palette.surface,
            display: 'flex', flexDirection: 'column',
            transition: 'background 0.25s',
          }}>

            {/* Mobile-only wordmark */}
            <div className="auth-mobile-wordmark" style={{ display: 'none', marginBottom: 24, alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, fontSize: 20, color: palette.textPrimary, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center' }}>
                <span>tru</span>
                <span style={{ color: accentColor }}>dev</span>
                <span style={{ display: 'inline-block', width: 2, height: 18, background: accentColor, marginLeft: 3, verticalAlign: 'middle', animation: 'blink 1.1s step-end infinite' }} />
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: accentColor, border: `1px solid ${accentColor}40`, background: accentDim, padding: '3px 8px', borderRadius: 4, letterSpacing: '0.04em' }}>beta</span>
            </div>

            {/* Recruiter badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              alignSelf: 'flex-start',
              color: REC_ACCENT,
              background: REC_ACCENT_DIM,
              border: `1px solid ${REC_ACCENT_BORDER}`,
              borderRadius: 999,
              padding: '8px 12px',
              marginBottom: 30,
              fontSize: 12,
              fontWeight: 600,
            }}>
              <RecruiterIcon color={REC_ACCENT} />
              Recruiter portal
            </div>

            {/* Heading */}
            <div style={{ marginBottom: 28 }}>
              <h2 style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 22, fontWeight: 500,
                color: palette.textPrimary, letterSpacing: '-0.3px',
                margin: 0,
              }}>
                Sign in to your recruiter workspace
              </h2>
              <p style={{ fontSize: 13, color: palette.textSecondary, marginTop: 8, lineHeight: 1.6 }}>
                Manage assessments, review reports, and keep hiring decisions moving.
              </p>
            </div>

            {/* Status banners */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                padding: '9px 12px', borderRadius: 8, marginBottom: 18,
                background: palette.errorBg, border: `1px solid ${palette.errorBorder}`,
                fontSize: 13, color: palette.error, lineHeight: 1.5,
              }}>
                <span style={{ flexShrink: 0, marginTop: 1 }}>⚠</span>
                {error}
              </div>
            )}
            {success && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                padding: '9px 12px', borderRadius: 8, marginBottom: 18,
                background: palette.successBg, border: `1px solid ${palette.successBorder}`,
                fontSize: 13, color: palette.success, lineHeight: 1.5,
              }}>
                <span style={{ flexShrink: 0, marginTop: 1 }}>✓</span>
                {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Email */}
              <div>
                <label style={{
                  display: 'block', fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: palette.textMuted, marginBottom: 7,
                }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex', pointerEvents: 'none' }}>
                    <EnvelopeIcon color={emailFocus ? accentColor : palette.textFaint} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setEmailFocus(true)}
                    onBlur={() => setEmailFocus(false)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                    style={inputStyle(emailFocus)}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{
                  display: 'block', fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: palette.textMuted, marginBottom: 7,
                }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex', pointerEvents: 'none' }}>
                    <LockIcon color={passFocus ? accentColor : palette.textFaint} />
                  </span>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setPassFocus(true)}
                    onBlur={() => setPassFocus(false)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    style={{ ...inputStyle(passFocus), paddingRight: 42 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    tabIndex={-1}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex',
                    }}
                  >
                    {showPw ? <EyeSlashIcon color={palette.textMuted} /> : <EyeIcon color={palette.textMuted} />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: palette.textSecondary, cursor: 'pointer' }}>
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} style={{ accentColor }} />
                  Remember me
                </label>
                <a href="/forgot-password" style={{ fontSize: 12, color: palette.textMuted, textDecoration: 'none' }}>
                  Forgot password?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', height: 48,
                  background: accentColor,
                  color: '#1A0050',
                  borderRadius: 10, border: 'none',
                  fontSize: 14, fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.65 : 1,
                  transition: 'opacity 0.2s, transform 0.15s',
                  marginTop: 4,
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.88'; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.opacity = '1'; }}
                onMouseDown={e => { if (!loading) e.currentTarget.style.transform = 'scale(0.99)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: 15, height: 15, borderRadius: '50%', flexShrink: 0,
                      border: '2px solid rgba(26,0,80,0.2)',
                      borderTopColor: '#1A0050',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRightIcon color="#1A0050" />
                  </>
                )}
              </button>
            </form>

            {/* Signup CTA */}
              <div style={{
                background: RP.surfaceMuted,
                border: `1px solid ${RP.border}`,
                borderRadius: 10, padding: '14px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                marginTop: 22,
              }}>
                <div>
                  <strong style={{ display: 'block', fontSize: 13, color: RP.textPrimary, marginBottom: 3 }}>
                    Need recruiter access?
                  </strong>
                  <p style={{ fontSize: 12, color: RP.textSecondary, margin: 0, lineHeight: 1.5 }}>
                    Request an account for your hiring team.
                  </p>
                </div>
                <Link
                  to="/waitlist"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    color: REC_ACCENT, border: `1px solid ${REC_ACCENT}40`,
                    background: REC_ACCENT_DIM,
                    borderRadius: 7, padding: '8px 14px',
                    fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                    textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  Request access
                  <ArrowRightIcon color={REC_ACCENT} size={11} />
                </Link>
              </div>

          </div>
        </div>
      </div>
    </>
  );
}
