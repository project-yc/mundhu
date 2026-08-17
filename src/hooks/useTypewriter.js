import { useEffect, useRef, useState } from 'react';

/** Reveal rate. ~80 chars/sec reads as brisk typing without lagging the stream. */
const CHARS_PER_MS = 0.08;

/**
 * Reveals a growing string at a steady rate so a bursty SSE stream reads as
 * typing rather than arriving in visible chunks.
 *
 * The source text runs ahead while the reveal trails behind it; once the stream
 * finishes, the remaining tail still plays out, so the last (often largest)
 * chunk doesn't slam in all at once. `done` tells the caller whether the reveal
 * has caught up — a caret should stay visible until it has, even after the
 * stream itself is complete.
 *
 * Only a character *count* is stored; the visible string is sliced from the
 * live `text` at render. That keeps the two in step for free when the source
 * shrinks (a reset for a new question) instead of leaving a stale string behind.
 *
 * @param {string} text     The full text so far (grows as tokens arrive).
 * @param {boolean} enabled False (e.g. prefers-reduced-motion) reveals instantly.
 */
export function useTypewriter(text, enabled = true) {
  const [count, setCount] = useState(0);
  // The rAF loop advances many times between renders, so it needs a position
  // that survives both frames and the effect restart every new token causes.
  const countRef = useRef(0);

  useEffect(() => {
    if (!enabled) return undefined;

    // A source shorter than what's already shown means the stream was reset for
    // a new question — rewind so the reveal starts over from the top.
    if (text.length < countRef.current) countRef.current = 0;
    if (countRef.current >= text.length) return undefined;

    let frame = 0;
    let lastTick = performance.now();

    const step = (now) => {
      const chars = Math.floor((now - lastTick) * CHARS_PER_MS);
      if (chars >= 1) {
        lastTick = now;
        countRef.current = Math.min(text.length, countRef.current + chars);
        setCount(countRef.current);
      }
      if (countRef.current < text.length) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [text, enabled]);

  const revealed = enabled ? text.slice(0, Math.min(count, text.length)) : text;
  return { revealed, done: revealed.length >= text.length };
}
