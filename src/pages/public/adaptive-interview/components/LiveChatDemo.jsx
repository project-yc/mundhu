import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, useReducedMotion } from 'motion/react';
import { ChatFrame, ChatRow } from './chatKit';

/**
 * The hero's self-playing transcript.
 *
 * It dramatises the one thing that is hard to explain in a sentence: the
 * follow-up changes because of what the candidate just said. The signal chips
 * between turns use the engine's real vocabulary (`low_evidence`,
 * `sufficient_evidence` → question strategy), not invented copy.
 *
 * The arc runs thin answer → probe → real answer → push → strong answer →
 * score → transition, so a founder who watches one loop sees the whole
 * mechanism without scrolling.
 */

const ACCENT = 'var(--lp-ember-bright)';

const SCRIPT = [
  { kind: 'typing', hold: 1100 },
  {
    kind: 'ai',
    hold: 2500,
    text: 'You cached the leaderboard read in your submission. What was the invalidation strategy?',
  },
  { kind: 'candidate', hold: 900, text: 'We just set a 60 second TTL.' },
  { kind: 'signal', hold: 1350, value: 'low_evidence', strategy: 'evidence_seeking', color: '#FBBF24' },
  { kind: 'typing', hold: 950 },
  {
    kind: 'ai',
    hold: 2700,
    text: 'Got it — and when a score changes inside that window, what does the user see?',
  },
  {
    kind: 'candidate',
    hold: 1100,
    text: 'A stale rank for up to a minute. We accepted it because writes are rare — though at a contest finish that assumption breaks.',
  },
  { kind: 'signal', hold: 1350, value: 'sufficient_evidence', strategy: 'deeper_tradeoff', color: '#4ADE80' },
  { kind: 'typing', hold: 950 },
  {
    kind: 'ai',
    hold: 2900,
    text: 'That is the right instinct. How would you handle the contest finish without giving up the cache entirely?',
  },
  {
    kind: 'candidate',
    hold: 1250,
    text: 'Push invalidation on score writes, keyed by leaderboard id. I would keep the TTL underneath as a backstop, so a dropped event cannot strand a board forever.',
  },
  { kind: 'score', hold: 1600, competency: 'reliability', value: 3, note: 'named the failure mode, kept the fallback' },
  { kind: 'typing', hold: 900 },
  {
    kind: 'ai',
    hold: 5000,
    text: 'That is the shape I would want too. Let us move to data modelling for the last stretch.',
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
    const id = setTimeout(() => setShown((n) => (n >= SCRIPT.length ? 0 : n + 1)), done ? 4000 : step.hold);
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
    <ChatFrame accent={ACCENT} title="Adaptive Panel" meta="backend · senior · reliability" badge="Q3 / 8">
      <div
        ref={scrollerRef}
        className="flex flex-col gap-2.5 overflow-y-auto px-4 py-4"
        style={{ height: 'clamp(340px, 44vh, 424px)' }}
      >
        <AnimatePresence initial={false}>
          {visible.map((item, i) => (
            <ChatRow
              key={`${item.kind}-${i}`}
              item={item}
              accent={ACCENT}
              reduce={reduce}
              motionProps={{
                initial: { opacity: 0, y: 10, scale: 0.98 },
                animate: { opacity: 1, y: 0, scale: 1 },
                transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </ChatFrame>
  );
}
