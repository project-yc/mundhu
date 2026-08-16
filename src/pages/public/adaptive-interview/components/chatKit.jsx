import { motion as Motion } from 'motion/react';
import { MONO } from './primitives';

/**
 * Shared rendering kit for every transcript on the page — the hero's
 * self-playing demo and the five mode mockups.
 *
 * One row renderer, one frame, one accent knob. Each mode passes its own
 * accent colour and its own mix of row kinds, which is what makes the five
 * panels read as five different products rather than one screenshot recoloured.
 *
 * Row kinds:
 *   note      system line — what context got loaded
 *   cite      a quoted passage from the source material
 *   code      a slice of the candidate's own diff
 *   stats     scenario artefact — the metrics the candidate is reasoning over
 *   ai        panel question
 *   candidate answer
 *   typing    the panel thinking
 *   signal    the engine's branch decision
 *   score     a competency landing on the rubric
 */

/* ── Frame ────────────────────────────────────────────────────────── */

export function ChatFrame({
  accent = 'var(--lp-ember-bright)',
  title,
  meta,
  badge,
  children,
  footer = true,
  className = '',
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[20px] ${className}`}
      style={{
        background: 'linear-gradient(168deg, #1D1A17, #100E0D)',
        border: '1px solid var(--lp-line)',
        boxShadow: `0 50px 110px -55px color-mix(in srgb, ${accent} 60%, transparent), inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      <div
        className="flex items-center gap-2.5 px-4 py-3"
        style={{ borderBottom: '1px solid var(--lp-line-soft)', background: 'rgba(255,255,255,0.02)' }}
      >
        <span
          className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-lg text-[10px] font-bold text-[#140C05]"
          style={{ background: `linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 62%, #FF6B00))`, fontFamily: MONO }}
        >
          T
        </span>
        <div className="min-w-0">
          <p className="truncate text-[11.5px] font-semibold leading-none text-[var(--lp-fg)]">{title}</p>
          <p className="mt-1 truncate text-[9.5px] leading-none" style={{ fontFamily: MONO, color: 'var(--lp-fg-faint)' }}>
            {meta}
          </p>
        </div>
        {badge && (
          <span className="ml-auto flex flex-shrink-0 items-center gap-1.5">
            <i className="h-1.5 w-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
            <span className="text-[9.5px]" style={{ fontFamily: MONO, color: 'var(--lp-fg-faint)' }}>{badge}</span>
          </span>
        )}
      </div>

      {children}

      {footer && <Composer accent={accent} />}
    </div>
  );
}

function Composer({ accent }) {
  return (
    <div className="px-4 pb-4">
      <div
        className="flex items-center gap-2 rounded-full px-4 py-2.5"
        style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid var(--lp-line-soft)' }}
      >
        <span className="text-[12px] text-[var(--lp-fg-faint)]">Type your answer</span>
        <span className="lp-caret inline-block h-3.5 w-[1.5px]" style={{ background: accent }} />
        <span
          className="ml-auto grid h-6 w-6 place-items-center rounded-full"
          style={{ background: `linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 60%, #FF6B00))` }}
        >
          <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 text-[#140C05]" aria-hidden="true">
            <path d="M8 13V3m0 0L4 7m4-4l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  );
}

/* ── Rows ─────────────────────────────────────────────────────────── */

export function ChatRow({ item, accent, reduce, motionProps = {} }) {
  const props = reduce ? {} : motionProps;

  switch (item.kind) {
    case 'note':      return <Motion.div {...props}><NoteRow item={item} accent={accent} /></Motion.div>;
    case 'cite':      return <Motion.div {...props}><CiteRow item={item} accent={accent} /></Motion.div>;
    case 'code':      return <Motion.div {...props}><CodeRow item={item} accent={accent} /></Motion.div>;
    case 'stats':     return <Motion.div {...props}><StatsRow item={item} accent={accent} /></Motion.div>;
    case 'signal':    return <Motion.div {...props}><SignalRow item={item} /></Motion.div>;
    case 'score':     return <Motion.div {...props}><ScoreRow item={item} accent={accent} /></Motion.div>;
    case 'typing':    return <Motion.div {...props}><TypingRow accent={accent} reduce={reduce} /></Motion.div>;
    default:          return <Motion.div {...props}><BubbleRow item={item} accent={accent} /></Motion.div>;
  }
}

function NoteRow({ item, accent }) {
  return (
    <div className="flex justify-center py-0.5">
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9.5px]"
        style={{
          fontFamily: MONO,
          color: 'var(--lp-fg-faint)',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--lp-line-soft)',
        }}
      >
        <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5" style={{ color: accent }} aria-hidden="true">
          <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        {item.text}
      </span>
    </div>
  );
}

function CiteRow({ item, accent }) {
  return (
    <div
      className="rounded-xl px-3.5 py-3"
      style={{
        background: `color-mix(in srgb, ${accent} 6%, rgba(255,255,255,0.02))`,
        border: '1px solid var(--lp-line-soft)',
        borderLeft: `2px solid ${accent}`,
      }}
    >
      <p className="text-[9.5px] uppercase" style={{ fontFamily: MONO, letterSpacing: '0.12em', color: accent }}>
        {item.label}
      </p>
      <p className="mt-2 text-[12px] leading-[1.6] text-[var(--lp-fg-dim)]">&ldquo;{item.body}&rdquo;</p>
    </div>
  );
}

function CodeRow({ item, accent }) {
  return (
    <div
      className="min-w-0 overflow-hidden rounded-xl"
      style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--lp-line-soft)' }}
    >
      <div
        className="flex items-center gap-2 px-3 py-1.5"
        style={{ borderBottom: '1px solid var(--lp-line-soft)' }}
      >
        <span className="text-[9.5px]" style={{ fontFamily: MONO, color: accent }}>{item.file}</span>
        <span className="ml-auto text-[9px]" style={{ fontFamily: MONO, color: 'var(--lp-fg-faint)' }}>{item.meta}</span>
      </div>
      <pre className="overflow-x-auto px-3 py-2.5 text-[10.5px] leading-[1.75]" style={{ fontFamily: MONO }}>
        {item.lines.map((l) => (
          <div
            key={l.n}
            className="flex gap-3 px-1"
            style={l.hl ? { background: `color-mix(in srgb, ${accent} 11%, transparent)`, borderRadius: 3 } : undefined}
          >
            <span style={{ color: 'var(--lp-fg-faint)', opacity: 0.7 }}>{l.n}</span>
            <span style={{ color: l.hl ? accent : 'var(--lp-fg-dim)', whiteSpace: 'pre' }}>{l.t}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}

function StatsRow({ item, accent }) {
  const toneColor = { up: '#FB7185', flat: 'var(--lp-fg-dim)', ok: '#4ADE80' };
  return (
    <div
      className="rounded-xl px-3.5 py-3"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--lp-line-soft)' }}
    >
      <p className="text-[9.5px] uppercase" style={{ fontFamily: MONO, letterSpacing: '0.12em', color: accent }}>
        {item.label}
      </p>
      <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        {item.stats.map((s) => (
          <div key={s.k}>
            <p className="text-[9px]" style={{ fontFamily: MONO, color: 'var(--lp-fg-faint)' }}>{s.k}</p>
            <p className="mt-0.5 text-[12.5px] font-semibold" style={{ fontFamily: MONO, color: toneColor[s.tone] || 'var(--lp-fg)' }}>
              {s.v}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SignalRow({ item }) {
  const color = item.color || '#FBBF24';
  return (
    <div className="flex justify-center py-0.5">
      <div
        className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 rounded-full px-3 py-1"
        style={{
          background: `color-mix(in srgb, ${color} 10%, transparent)`,
          border: `1px solid color-mix(in srgb, ${color} 26%, transparent)`,
          fontFamily: MONO,
        }}
      >
        <span className="text-[9px]" style={{ color: 'var(--lp-fg-faint)' }}>answer_signal</span>
        <span className="text-[9px] font-semibold" style={{ color }}>{item.value}</span>
        <span className="text-[9px]" style={{ color: 'var(--lp-fg-faint)' }}>→</span>
        <span className="text-[9px] font-semibold" style={{ color }}>{item.strategy}</span>
      </div>
    </div>
  );
}

function ScoreRow({ item, accent }) {
  return (
    <div className="flex justify-center py-0.5">
      <div
        className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full px-3 py-1"
        style={{
          background: `color-mix(in srgb, ${accent} 11%, transparent)`,
          border: `1px solid color-mix(in srgb, ${accent} 28%, transparent)`,
        }}
      >
        <span className="text-[9px]" style={{ fontFamily: MONO, color: 'var(--lp-fg-faint)' }}>{item.competency}</span>
        <span className="flex items-center gap-0.5" aria-label={`${item.value} of 4`}>
          {[0, 1, 2, 3].map((d) => (
            <i
              key={d}
              className="block h-1 w-2.5 rounded-full"
              style={{ background: d < item.value ? accent : 'rgba(255,255,255,0.12)' }}
            />
          ))}
        </span>
        <span className="text-[9px] font-semibold" style={{ fontFamily: MONO, color: accent }}>{item.value}/4</span>
        {item.note && (
          <span className="text-[9px]" style={{ fontFamily: MONO, color: 'var(--lp-fg-faint)' }}>· {item.note}</span>
        )}
      </div>
    </div>
  );
}

function TypingRow({ accent, reduce }) {
  return (
    <div className="flex justify-start">
      <div
        className="flex items-center gap-1.5 rounded-2xl rounded-bl-md px-3.5 py-3"
        style={{
          background: `color-mix(in srgb, ${accent} 9%, transparent)`,
          border: `1px solid color-mix(in srgb, ${accent} 22%, transparent)`,
        }}
      >
        {[0, 1, 2].map((d) => (
          <Motion.i
            key={d}
            className="block h-1.5 w-1.5 rounded-full"
            style={{ background: accent }}
            animate={reduce ? undefined : { opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
            transition={{ duration: 1.05, repeat: Infinity, delay: d * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

function BubbleRow({ item, accent }) {
  const isAi = item.kind === 'ai';
  return (
    <div className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}>
      <p
        className="max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-[1.58]"
        style={
          isAi
            ? {
                background: `color-mix(in srgb, ${accent} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${accent} 24%, transparent)`,
                borderBottomLeftRadius: 6,
                color: 'var(--lp-fg)',
              }
            : {
                background: 'rgba(255,255,255,0.055)',
                border: '1px solid var(--lp-line)',
                borderBottomRightRadius: 6,
                color: 'var(--lp-fg-dim)',
              }
        }
      >
        {item.text}
      </p>
    </div>
  );
}
