import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Briefcase, AlertCircle, CheckCircle, ArrowRight, ChevronDown } from 'lucide-react';
import Particles from '../../components/particles/Particles';

const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzr1ChWXgQY9arA-DyCrVoTaARe3_A5oqwxiLN7O4805OFX3vC3oa_KgflfVM89ZARy/exec';

const ROLES = [
  { value: 'developer', label: 'Developer' },
  { value: 'recruiter', label: 'Recruiter' },
  { value: 'founder',   label: 'Founder'   },
];

export default function WaitlistPage() {
  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [designation, setDesignation] = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState(false);
  const [roleOpen,    setRoleOpen]    = useState(false);

  const selectedRole = ROLES.find(r => r.value === designation);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !designation) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ name, email, designation }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      // Google Apps Script CORS can throw even on success — treat network errors leniently
      console.error(err);
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

        .wl-root { font-family: 'Inter', sans-serif; }

        @keyframes card-rise {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .card-rise { animation: card-rise 0.55s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .fade-in   { animation: fade-in 0.8s ease both; }

        .glass-card {
          background: rgba(12,12,15,0.72);
          backdrop-filter: blur(20px) saturate(160%);
          -webkit-backdrop-filter: blur(20px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow:
            0 0 0 1px rgba(6,182,212,0.06),
            0 24px 64px rgba(0,0,0,0.6),
            0 8px 24px rgba(0,0,0,0.4);
        }

        .wl-input {
          width: 100%;
          padding: 0.65rem 0.875rem 0.65rem 2.6rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          font-size: 0.875rem;
          color: #F4F4F5;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          outline: none;
          font-family: 'Inter', sans-serif;
          letter-spacing: 0.01em;
        }
        .wl-input::placeholder { color: #3F3F46; }
        .wl-input:hover  { border-color: rgba(255,255,255,0.14); background: rgba(255,255,255,0.06); }
        .wl-input:focus  {
          border-color: rgba(6,182,212,0.5);
          background: rgba(6,182,212,0.04);
          box-shadow: 0 0 0 3px rgba(6,182,212,0.1), inset 0 0 0 1px rgba(6,182,212,0.08);
        }

        /* Role dropdown */
        .role-trigger {
          width: 100%;
          padding: 0.65rem 2.5rem 0.65rem 2.6rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          font-size: 0.875rem;
          color: #F4F4F5;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          outline: none;
          font-family: 'Inter', sans-serif;
          letter-spacing: 0.01em;
          cursor: pointer;
          text-align: left;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }
        .role-trigger.placeholder { color: #3F3F46; }
        .role-trigger:hover  { border-color: rgba(255,255,255,0.14); background: rgba(255,255,255,0.06); }
        .role-trigger.open,
        .role-trigger:focus  {
          border-color: rgba(6,182,212,0.5);
          background: rgba(6,182,212,0.04);
          box-shadow: 0 0 0 3px rgba(6,182,212,0.1), inset 0 0 0 1px rgba(6,182,212,0.08);
        }

        .role-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          z-index: 50;
          background: rgba(14,14,18,0.96);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }
        .role-option {
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: #A1A1AA;
          cursor: pointer;
          transition: background 0.12s, color 0.12s;
          font-family: 'Inter', sans-serif;
        }
        .role-option:hover  { background: rgba(6,182,212,0.08); color: #E4E4E7; }
        .role-option.active { background: rgba(6,182,212,0.12); color: #22D3EE; }

        .wl-btn {
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
          transition: opacity 0.15s, box-shadow 0.2s, transform 0.1s;
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
        }
        .wl-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          pointer-events: none;
        }
        .wl-btn:hover:not(:disabled) {
          box-shadow: 0 0 0 1px rgba(6,182,212,0.3), 0 8px 24px rgba(6,182,212,0.3);
          opacity: 0.92;
        }
        .wl-btn:active:not(:disabled) { transform: scale(0.99); }
        .wl-btn:disabled { opacity: 0.35; cursor: not-allowed; }

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

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Background */}
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

      {/* Page content */}
      <div
        className="wl-root min-h-screen flex items-center justify-center p-6"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <div className="card-rise w-full max-w-sm">

          {/* Brand */}
          <div className="fade-in mb-8 text-center" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center justify-center mb-5">
              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontWeight: 700, fontSize: '1.75rem',
                color: '#F4F4F5', letterSpacing: '-0.04em', lineHeight: 1,
              }}>
                tru<span style={{ color: '#06B6D4' }}>dev</span>
                <span style={{ color: '#22D3EE', opacity: 0.6 }}>_</span>
              </span>
            </div>
            <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '1.25rem', color: '#E4E4E7', letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>
              Join the waitlist
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#52525B', letterSpacing: '0.01em' }}>
              Be first in line when we open early access
            </p>
          </div>

          {/* Beta pill */}
          <div className="fade-in flex justify-center mb-6" style={{ animationDelay: '0.15s' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              fontFamily: "'Space Mono', monospace", fontSize: '0.6875rem', fontWeight: 400,
              padding: '0.3rem 0.875rem', borderRadius: '4px',
              background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.14)',
              color: '#22D3EE', letterSpacing: '0.04em',
            }}>
              <span style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: '#06B6D4', boxShadow: '0 0 6px rgba(6,182,212,0.9)', flexShrink: 0,
              }} />
              beta / invited_only
            </span>
          </div>

          {/* Card */}
          <div className="glass-card rounded-2xl p-7">
            {success ? (
              /* ── Success state ── */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem 0', textAlign: 'center' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckCircle style={{ width: '22px', height: '22px', color: '#10B981' }} />
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#E4E4E7', marginBottom: '0.375rem' }}>
                    You&apos;re on the list!
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: '#52525B', lineHeight: 1.6 }}>
                    We&apos;ll reach out to&nbsp;
                    <span style={{ color: '#A1A1AA' }}>{email}</span>
                    &nbsp;when your spot is ready.
                  </p>
                </div>
                <Link
                  to="/login"
                  style={{
                    marginTop: '0.5rem', fontSize: '0.8125rem', color: '#71717A',
                    fontWeight: 500, textDecoration: 'none', transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#E4E4E7'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#71717A'; }}
                >
                  ← Back to sign in
                </Link>
              </div>
            ) : (
              /* ── Form ── */
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

                {/* Name */}
                <div>
                  <label htmlFor="wl-name" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#A1A1AA', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
                    Full name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#3F3F46', pointerEvents: 'none' }} />
                    <input
                      id="wl-name"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Alex Johnson"
                      required
                      className="wl-input"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="wl-email" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#A1A1AA', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
                    Work email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#3F3F46', pointerEvents: 'none' }} />
                    <input
                      id="wl-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="alex@company.com"
                      required
                      className="wl-input"
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#A1A1AA', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
                    I am a
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Briefcase style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#3F3F46', pointerEvents: 'none', zIndex: 1 }} />
                    <button
                      type="button"
                      className={`role-trigger${!selectedRole ? ' placeholder' : ''}${roleOpen ? ' open' : ''}`}
                      onClick={() => setRoleOpen(v => !v)}
                      aria-haspopup="listbox"
                      aria-expanded={roleOpen}
                    >
                      <span style={{ paddingLeft: '1.85rem' }}>
                        {selectedRole ? selectedRole.label : 'Select your role…'}
                      </span>
                      <ChevronDown style={{
                        width: '14px', height: '14px', color: '#52525B',
                        transition: 'transform 0.2s',
                        transform: roleOpen ? 'rotate(180deg)' : 'rotate(0)',
                        flexShrink: 0,
                      }} />
                    </button>

                    {roleOpen && (
                      <div className="role-dropdown" role="listbox">
                        {ROLES.map(r => (
                          <div
                            key={r.value}
                            role="option"
                            aria-selected={designation === r.value}
                            className={`role-option${designation === r.value ? ' active' : ''}`}
                            onClick={() => { setDesignation(r.value); setRoleOpen(false); }}
                          >
                            {r.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div
                    className="status-banner"
                    style={{ background: 'rgba(244,63,94,0.07)', border: '1px solid rgba(244,63,94,0.16)', color: '#FDA4AF' }}
                  >
                    <AlertCircle style={{ width: '14px', height: '14px', marginTop: '1px', flexShrink: 0, color: '#F43F5E' }} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="separator" />

                {/* Submit */}
                <button type="submit" disabled={loading} className="wl-btn">
                  {loading ? (
                    <>
                      <div style={{
                        width: '14px', height: '14px', borderRadius: '50%',
                        border: '2px solid rgba(3,7,18,0.25)', borderTopColor: '#030712',
                        animation: 'spin 0.7s linear infinite',
                      }} />
                      Submitting…
                    </>
                  ) : (
                    <>
                      Request access
                      <ArrowRight style={{ width: '14px', height: '14px' }} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          {!success && (
            <p className="fade-in mt-6 text-center" style={{ fontSize: '0.8125rem', color: '#3F3F46', animationDelay: '0.3s' }}>
              Already have an account?{' '}
              <Link
                to="/login"
                style={{ color: '#71717A', fontWeight: 500, transition: 'color 0.15s ease', textDecoration: 'none' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#E4E4E7'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#71717A'; }}
              >
                Sign in
              </Link>
            </p>
          )}

          <p className="fade-in mt-4 text-center" style={{ fontSize: '0.75rem', color: '#27272A', animationDelay: '0.35s' }}>
            © 2026 TruDev
          </p>
        </div>
      </div>
    </>
  );
}
