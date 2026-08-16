import { motion as Motion, useReducedMotion } from 'motion/react';

// Type stack for the whole page. Syne carries the display voice, DM Sans the
// body, Noto Serif Display italic is the single "playful" accent used on one
// word per headline, and JetBrains Mono handles every micro-label.
// All four are already loaded in index.html — no extra network cost.
export const DISPLAY = "'Syne', sans-serif";
export const SERIF = "'Noto Serif Display', Georgia, serif";
export const MONO = "'JetBrains Mono', ui-monospace, monospace";

/** Scroll-triggered fade + rise. Collapses to a plain div when the OS asks. */
export function Reveal({ children, delay = 0, y = 20, className = '' }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <Motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.62, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Motion.div>
  );
}

/** Uppercase mono kicker that sits above every section heading. */
export function Eyebrow({ children, accent = 'var(--lp-ember-bright)' }) {
  return (
    <div
      className="inline-flex items-center gap-2 text-[10.5px] uppercase"
      style={{ fontFamily: MONO, letterSpacing: '0.16em', color: accent }}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
      {children}
    </div>
  );
}

/** Small bordered pill. Used for status chips, tags and trust markers. */
export function Pill({ children, accent = 'var(--lp-ember-bright)', tone = 'outline', className = '' }) {
  const solid = tone === 'solid';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[10.5px] whitespace-nowrap ${className}`}
      style={{
        fontFamily: MONO,
        letterSpacing: '0.06em',
        color: solid ? '#140C05' : accent,
        background: solid ? accent : `color-mix(in srgb, ${accent} 12%, transparent)`,
        border: `1px solid color-mix(in srgb, ${accent} ${solid ? '100' : '30'}%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}

/** Page-width wrapper. Every section uses this so the rhythm stays true. */
export function Container({ children, className = '' }) {
  return <div className={`mx-auto w-full max-w-[1160px] px-5 sm:px-7 lg:px-10 ${className}`}>{children}</div>;
}

/** Section shell: consistent vertical rhythm + optional hairline top rule. */
export function Section({ id, children, className = '', rule = true }) {
  return (
    <section
      id={id}
      className={`relative py-20 sm:py-24 lg:py-28 ${className}`}
      style={rule ? { borderTop: '1px solid var(--lp-line-soft)' } : undefined}
    >
      {children}
    </section>
  );
}

/** Section heading. Always an h2 — the hero owns the page's only h1. */
export function Heading({ children, className = '' }) {
  return (
    <h2
      className={`text-[clamp(1.9rem,4.1vw,3.05rem)] leading-[1.08] text-[var(--lp-fg)] ${className}`}
      style={{ fontFamily: DISPLAY, fontWeight: 700, letterSpacing: '-0.028em' }}
    >
      {children}
    </h2>
  );
}

/** The one word we let off the leash. */
export function Accent({ children, color = 'var(--lp-ember-soft)' }) {
  return (
    <em style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, color, letterSpacing: '-0.01em' }}>
      {children}
    </em>
  );
}

export function Lede({ children, className = '' }) {
  return (
    <p className={`text-[15px] sm:text-[16px] leading-[1.68] text-[var(--lp-fg-dim)] ${className}`}>
      {children}
    </p>
  );
}

/** Surface card with a soft ember edge-light on hover. */
export function Card({ children, className = '', accent = 'var(--lp-ember-bright)', hover = true }) {
  return (
    <div
      className={`group relative rounded-2xl p-5 sm:p-6 transition-all duration-300 ${
        hover ? 'hover:-translate-y-[3px]' : ''
      } ${className}`}
      style={{
        background: 'linear-gradient(168deg, var(--lp-raised), var(--lp-surface))',
        border: '1px solid var(--lp-line)',
      }}
      onMouseEnter={hover ? (e) => {
        e.currentTarget.style.borderColor = `color-mix(in srgb, ${accent} 42%, transparent)`;
        e.currentTarget.style.boxShadow = `0 18px 46px -22px color-mix(in srgb, ${accent} 60%, transparent)`;
      } : undefined}
      onMouseLeave={hover ? (e) => {
        e.currentTarget.style.borderColor = 'var(--lp-line)';
        e.currentTarget.style.boxShadow = 'none';
      } : undefined}
    >
      {children}
    </div>
  );
}

/** Primary ember CTA. */
export function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`group inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[13.5px] font-semibold text-[#180C03] transition-all duration-200 hover:brightness-110 active:scale-[0.98] ${className}`}
      style={{
        background: 'linear-gradient(135deg, var(--lp-ember-soft), var(--lp-ember))',
        boxShadow: '0 12px 30px -12px rgba(255, 107, 0, 0.7)',
      }}
      {...props}
    >
      {children}
    </button>
  );
}

/** Quiet secondary CTA. */
export function GhostButton({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[13.5px] font-semibold text-[var(--lp-fg)] transition-all duration-200 hover:bg-[rgba(255,240,230,0.07)] active:scale-[0.98] ${className}`}
      style={{ border: '1px solid var(--lp-line)' }}
      {...props}
    >
      {children}
    </button>
  );
}

export function ArrowIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={`w-3.5 h-3.5 ${className}`} aria-hidden="true">
      <path d="M3 8h9m0 0L8.5 4.5M12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
