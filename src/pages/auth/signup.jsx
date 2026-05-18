import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CANDIDATE_PALETTE as CP, RECRUITER_PALETTE as RP } from '../../theme/palette';
import Particles from '../../components/particles/Particles';

const REC_ACCENT        = CP.recruiterAccent;         // #A78BFA
const REC_ACCENT_DIM    = CP.recruiterAccentDim;
const REC_ACCENT_GLOW   = CP.recruiterAccentGlow;
const REC_ACCENT_BORDER = CP.recruiterAccentBorder;

async function doRecruiterSignup(name, email, password) {
  const res  = await fetch('/api/auth/v1/recruiter/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.message || data.error || `Error ${res.status}`);
  return data;
}

function storeAuthData(data) {
  const tokens       = data.tokens || data;
  const accessToken  = tokens.access_token  || data.access_token;
  const refreshToken = tokens.refresh_token || data.refresh_token;
  if (!accessToken) return;
  localStorage.setItem('authToken',    accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
  if (data.org)  localStorage.setItem('org',  JSON.stringify(data.org));
  const role = data.role || data.user?.role || null;
  if (role) localStorage.setItem('userRole', role);
  else      localStorage.removeItem('userRole');
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function UserIcon({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
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

function CheckIcon({ color }) {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2,8 6,12 14,4" />
    </svg>
  );
}

// ─── Left panel (always dark — identical vibe to login) ───────────────────────
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
      <div style={{ position: 'absolute', top: -120, right: -120, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -100, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(24,211,255,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

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
          fontSize: 10, color: REC_ACCENT,
          border: `1px solid ${REC_ACCENT_BORDER}`,
          background: REC_ACCENT_DIM,
          padding: '3px 8px', borderRadius: 4,
          letterSpacing: '0.04em',
        }}>for recruiters</span>
      </div>

      {/* Hero */}
      <div style={{ marginTop: 48, position: 'relative', zIndex: 1 }}>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, color: REC_ACCENT,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          margin: '0 0 14px',
        }}>
          Hire with confidence. Finally.
        </p>
        <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 34, color: CP.textPrimary, lineHeight: 1.22, margin: 0 }}>
          <span style={{ fontWeight: 300 }}>Find engineers who</span>
          <br />
          <span style={{ fontWeight: 600 }}>actually ship</span>
        </h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14, color: CP.textSecondary,
          marginTop: 16, maxWidth: 340, lineHeight: 1.65,
        }}>
          Set up your recruiting workspace in minutes. Run real-world
          technical assessments — not trick questions.
        </p>
      </div>

      {/* Feature list */}
      <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 1 }}>
        {[
          'Custom-branded candidate portal',
          'Role-based team permissions',
          'Async assessment pipeline',
          'Zero DSA — real engineering tasks',
        ].map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
              background: REC_ACCENT_DIM,
              border: `1px solid ${REC_ACCENT_BORDER}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckIcon color={REC_ACCENT} />
            </div>
            <span style={{ fontSize: 13, color: CP.textSecondary, fontFamily: "'DM Sans', sans-serif" }}>{item}</span>
          </div>
        ))}
      </div>

      {/* Stats — anchored to bottom */}
      <div style={{ marginTop: 'auto', paddingTop: 48, display: 'flex', gap: 36, position: 'relative', zIndex: 1 }}>
        {[['2.4k+', 'Assessments run'], ['98%', 'Signal accuracy'], ['< 5 min', 'Setup time']].map(([num, label]) => (
          <div key={label}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, color: CP.textPrimary, fontWeight: 500 }}>{num}</div>
            <div style={{ fontSize: 11, color: CP.textFaint, marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Password strength indicator ─────────────────────────────────────────────
function passwordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score: 1, label: 'Weak',   color: RP.error   };
  if (score <= 2) return { score: 2, label: 'Fair',   color: RP.warning  };
  if (score <= 3) return { score: 3, label: 'Good',   color: '#22D3EE'  };
  return              { score: 4, label: 'Strong', color: RP.success };
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SignupPage() {
  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [nameFocus, setNameFocus] = useState(false);
  const [emailFocus,setEmailFocus]= useState(false);
  const [passFocus, setPassFocus] = useState(false);

  const pw        = passwordStrength(password);
  const palette   = RP;   // recruiter light palette for right panel

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
    ? { ...baseInput, borderColor: REC_ACCENT, background: palette.surfaceHover, boxShadow: `0 0 0 3px ${REC_ACCENT_GLOW}` }
    : baseInput;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email || !password) { setError('All fields are required.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError(''); setSuccess(''); setLoading(true);
    try {
      const data = await doRecruiterSignup(name.trim(), email, password);
      storeAuthData(data);
      setSuccess('Account created! Setting up your workspace…');
      setTimeout(() => { window.location.href = '/recruiter/onboarding'; }, 900);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
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
        <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(167,139,250,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
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

          {/* Right panel — recruiter light theme */}
          <div className="auth-right-panel" style={{
            flex: 1, padding: '48px 44px',
            background: palette.surface,
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto',
          }}>

            {/* Mobile-only wordmark */}
            <div className="auth-mobile-wordmark" style={{ display: 'none', marginBottom: 24, alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, fontSize: 20, color: palette.textPrimary, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center' }}>
                <span>tru</span>
                <span style={{ color: REC_ACCENT }}>dev</span>
                <span style={{ display: 'inline-block', width: 2, height: 18, background: REC_ACCENT, marginLeft: 3, verticalAlign: 'middle', animation: 'blink 1.1s step-end infinite' }} />
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: REC_ACCENT, border: `1px solid ${REC_ACCENT_BORDER}`, background: REC_ACCENT_DIM, padding: '3px 8px', borderRadius: 4, letterSpacing: '0.04em' }}>for recruiters</span>
            </div>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: REC_ACCENT_DIM,
                border: `1px solid ${REC_ACCENT_BORDER}`,
                borderRadius: 999, padding: '5px 12px',
                marginBottom: 14,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: REC_ACCENT, flexShrink: 0 }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: REC_ACCENT, letterSpacing: '0.08em' }}>
                  RECRUITER ACCOUNT
                </span>
              </div>
              <h2 style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 22, fontWeight: 500,
                color: palette.textPrimary, letterSpacing: '-0.3px',
                margin: 0,
              }}>
                Create your workspace
              </h2>
              <p style={{ fontSize: 13, color: palette.textSecondary, marginTop: 6 }}>
                Takes{' '}
                <span style={{ color: REC_ACCENT }}>2 minutes</span>
                {' '}— no credit card required
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

              {/* Full Name */}
              <div>
                <label style={{
                  display: 'block', fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: palette.textMuted, marginBottom: 7,
                }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex', pointerEvents: 'none' }}>
                    <UserIcon color={nameFocus ? REC_ACCENT : palette.textFaint} />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onFocus={() => setNameFocus(true)}
                    onBlur={() => setNameFocus(false)}
                    placeholder="Your full name"
                    autoComplete="name"
                    required
                    style={inputStyle(nameFocus)}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{
                  display: 'block', fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: palette.textMuted, marginBottom: 7,
                }}>Work Email</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex', pointerEvents: 'none' }}>
                    <EnvelopeIcon color={emailFocus ? REC_ACCENT : palette.textFaint} />
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
                    <LockIcon color={passFocus ? REC_ACCENT : palette.textFaint} />
                  </span>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setPassFocus(true)}
                    onBlur={() => setPassFocus(false)}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    minLength={8}
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
                {/* Strength bar */}
                {password.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 3, background: palette.border, borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 999,
                        width: `${(pw.score / 4) * 100}%`,
                        background: pw.color,
                        transition: 'width 0.3s, background 0.3s',
                      }} />
                    </div>
                    <span style={{ fontSize: 11, color: pw.color, fontFamily: "'JetBrains Mono', monospace", minWidth: 40 }}>
                      {pw.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', height: 48,
                  background: REC_ACCENT,
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
                      border: '2px solid rgba(26,0,80,0.2)', borderTopColor: '#1A0050',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                    Creating workspace…
                  </>
                ) : (
                  <>
                    Create my workspace
                    <ArrowRightIcon color="#1A0050" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', color: palette.textFaint, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
              <span style={{ flex: 1, height: 1, background: palette.border }} />
              ALREADY HAVE AN ACCOUNT?
              <span style={{ flex: 1, height: 1, background: palette.border }} />
            </div>

            {/* Sign in link */}
            <Link
              to="/login"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                height: 44,
                background: palette.surfaceMuted,
                border: `1px solid ${palette.border}`,
                borderRadius: 10,
                fontSize: 13, fontWeight: 500,
                color: palette.textSecondary,
                fontFamily: "'DM Sans', sans-serif",
                textDecoration: 'none',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = REC_ACCENT; e.currentTarget.style.color = REC_ACCENT; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = palette.border; e.currentTarget.style.color = palette.textSecondary; }}
            >
              Sign in instead
            </Link>

            {/* Fine print */}
            <p style={{ marginTop: 16, fontSize: 11, color: palette.textFaint, textAlign: 'center', lineHeight: 1.6 }}>
              By creating an account you agree to our{' '}
              <a href="#" style={{ color: palette.textMuted, textDecoration: 'underline' }}>Terms</a> and{' '}
              <a href="#" style={{ color: palette.textMuted, textDecoration: 'underline' }}>Privacy Policy</a>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}

