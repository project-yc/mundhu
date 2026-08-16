import { useEffect, useRef, useState } from 'react';
import { motion as Motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { MONO } from './primitives';

/**
 * The hero's self-playing transcript.
 *
 * It dramatises the one thing that is hard to explain in a sentence: the
 * follow-up changes because of what the candidate just said. The signal chips
 * between turns are the engine's real vocabulary (`low_evidence`,
 * `sufficient_evidence` → question strategy), not invented copy.
 */

const SCRIPT = [
  { kind: 'typing', hold: 1150 },
  {
    kind: 'ai',
    hold: 2600,
    text: 'You cached the leaderboard read in your submission. What was the invalidation strategy?',
  },
  { kind: 'candidate', hold: 900, text: 'We just set a 60 second TTL.' },
  {
    kind: 'signal',
    hold: 1400,
    label: 'answer_signal',
    value: 'low_evidence',
    strategy: 'evidence_seeking',
    color: '#FBBF24',
  },
  { kind: 'typing', hold: 1000 },
  {
    kind: 'ai',
    hold: 3000,
    text: 'Got it — and when a score changes inside that window, what does the user see?',
  },
  {
    kind: 'candidate',
    hold: 1100,
    text: 'A stale rank for up to a minute. We accepted it because writes are rare — though at a contest finish that assumption breaks.',
  },
  {
    kind: 'signal',
    hold: 1500,
    label: 'answer_signal',
    value: 'sufficient_evidence',
    strategy: 'deeper_tradeoff',
    color: '#4ADE80',
  },
  { kind: 'typing', hold: 1000 },
  {
    kind: 'ai',
    hold: 5200,
    text: 'That is the right instinct. How would you handle the contest finish without giving up the cache entirely?',
  },
];

export default function LiveChatDemo() {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? SCRIPT.length : 0);
  const scrollerRef = useRef(null);

  useEffect(() => {
    if (reduce) return undefined;
    const step = SCRIPT[shown] ?? SCRIPT[SCRIPT.length - 1];
    const done = shown >= SCRIPT.length;
    const id = setTimeout(() => setShown((n) => (n >= SCRIPT.length ? 0 : n + 1)), done ? 4200 : step.hold);
    return () => clearTimeout(id);
  }, [shown, reduce]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
  }, [shown, reduce]);

  // A `typing` row only stands in for the message that follows it, so it is
  // dropped from the log as soon as that message lands.
  const visible = SCRIPT.slice(0, shown).filter((s, i) => !(s.kind === 'typing' && i < shown - 1));

  return (
    <div
      className="relative overflow-hidden rounded-[20px]"
      style={{
        background: 'linear-gradient(168deg, #1D1A17, #100E0D)',
        border: '1px solid var(--lp-line)',
        boxShadow: '0 50px 110px -55px rgba(255, 107, 0, 0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* Panel header */}
      <div
        className="flex items-center gap-2.5 px-4 py-3"
        style={{ borderBottom: '1px solid var(--lp-line-soft)', background: 'rgba(255,255,255,0.02)' }}
      >
        <span
          className="grid place-items-center w-6 h-6 rounded-lg text-[10px] font-bold text-[#180C03]"
          style={{ background: 'linear-gradient(135deg, var(--lp-ember-soft), var(--lp-ember))', fontFamily: MONO }}
        >
          T
        </span>
        <div className="min-w-0">
          <p className="text-[11.5px] font-semibold leading-none text-[var(--lp-fg)]">Adaptive Panel</p>
          <p className="mt-1 text-[9.5px] leading-none" style={{ fontFamily: MONO, color: 'var(--lp-fg-faint)' }}>
            backend · senior · reliability
          </p>
        </div>
        <span className="ml-auto flex items-center gap-1.5">
          <i className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ADE80', boxShadow: '0 0 8px #4ADE80' }} />
          <span className="text-[9.5px]" style={{ fontFamily: MONO, color: 'var(--lp-fg-faint)' }}>Q3 / 8</span>
        </span>
      </div>

      {/* Transcript */}
      <div
        ref={scrollerRef}
        className="flex flex-col gap-2.5 overflow-y-auto px-4 py-4"
        style={{ height: 'clamp(320px, 42vh, 400px)' }}
      >
        <AnimatePresence initial={false}>
          {visible.map((item, i) => (
            <Row key={`${item.kind}-${i}`} item={item} reduce={reduce} />
          ))}
        </AnimatePresence>
      </div>

      {/* Composer (decorative) */}
      <div className="px-4 pb-4">
        <div
          className="flex items-center gap-2 rounded-full px-4 py-2.5"
          style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid var(--lp-line-soft)' }}
        >
          <span className="text-[12px] text-[var(--lp-fg-faint)]">Type your answer</span>
          <span className="lp-caret inline-block w-[1.5px] h-3.5" style={{ background: 'var(--lp-ember-soft)' }} />
          <span
            className="ml-auto grid place-items-center w-6 h-6 rounded-full"
            style={{ background: 'linear-gradient(135deg, var(--lp-ember-soft), var(--lp-ember))' }}
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3 text-[#180C03]" aria-hidden="true">
              <path d="M8 13V3m0 0L4 7m4-4l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({ item, reduce }) {
  const anim = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 10, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
      };

  if (item.kind === 'typing') {
    return (
      <Motion.div {...anim} className="flex justify-start">
        <div
          className="flex items-center gap-1.5 rounded-2xl rounded-bl-md px-3.5 py-3"
          style={{ background: 'rgba(255, 133, 40, 0.09)', border: '1px solid rgba(255, 133, 40, 0.22)' }}
        >
          {[0, 1, 2].map((d) => (
            <Motion.i
              key={d}
              className="block w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--lp-ember-soft)' }}
              animate={reduce ? undefined : { opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
              transition={{ duration: 1.05, repeat: Infinity, delay: d * 0.15 }}
            />
          ))}
        </div>
      </Motion.div>
    );
  }

  if (item.kind === 'signal') {
    return (
      <Motion.div {...anim} className="flex justify-center py-0.5">
        <div
          className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 rounded-full px-3 py-1"
          style={{
            background: `color-mix(in srgb, ${item.color} 10%, transparent)`,
            border: `1px solid color-mix(in srgb, ${item.color} 26%, transparent)`,
            fontFamily: MONO,
          }}
        >
          <span className="text-[9px]" style={{ color: 'var(--lp-fg-faint)' }}>{item.label}</span>
          <span className="text-[9px] font-semibold" style={{ color: item.color }}>{item.value}</span>
          <span className="text-[9px]" style={{ color: 'var(--lp-fg-faint)' }}>→</span>
          <span className="text-[9px] font-semibold" style={{ color: item.color }}>{item.strategy}</span>
        </div>
      </Motion.div>
    );
  }

  const isAi = item.kind === 'ai';
  return (
    <Motion.div {...anim} className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}>
      <p
        className="max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-[1.55]"
        style={
          isAi
            ? {
                background: 'rgba(255, 133, 40, 0.1)',
                border: '1px solid rgba(255, 133, 40, 0.24)',
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
    </Motion.div>
  );
}
