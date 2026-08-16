import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, useReducedMotion } from 'motion/react';
import { ChatFrame, ChatRow } from './chatKit';
import { MONO } from './primitives';

/**
 * A mode's transcript, played out like a real conversation.
 *
 * Same feel as the hero: the panel "thinks" before each question, messages
 * land one at a time, and the view follows the newest turn. Two deliberate
 * differences:
 *
 *  - It starts when the panel scrolls into view, not on mount, so someone
 *    arriving at the section catches the conversation from the top.
 *  - It plays once and rests on the finished transcript instead of looping.
 *    The hero loops because it is ambient; here the reader is being asked to
 *    actually read, and a loop would wipe the exchange out from under them.
 *    A replay control appears once it finishes.
 *
 * The transcript box is a fixed height with its own scroll — without that,
 * every arriving message would grow the panel and shove the rest of the page
 * down mid-animation.
 */

/* Pacing. Message rows are timed off their own length so a one-line answer
   does not sit on screen as long as a four-line one. */
const HOLD = { note: 800, cite: 1900, code: 2300, stats: 2300, signal: 1150, score: 1500, typing: 900 };
const READ_BASE = 800;
const READ_PER_CHAR = 17;
const READ_MAX = 3600;

function holdFor(item) {
  if (item.kind === 'ai' || item.kind === 'candidate') {
    return Math.min(READ_MAX, READ_BASE + (item.text?.length ?? 0) * READ_PER_CHAR);
  }
  return HOLD[item.kind] ?? 1200;
}

/** Insert a thinking beat before every panel question, then time each row. */
function buildTimeline(turns) {
  const out = [];
  turns.forEach((t) => {
    if (t.kind === 'ai') out.push({ kind: 'typing' });
    out.push(t);
  });
  return out.map((item) => ({ ...item, hold: holdFor(item) }));
}

/**
 * True once the element has been on screen. Never flips back.
 *
 * The gate is fail-open in two ways, because the cost of it being wrong is a
 * permanently blank chat panel:
 *
 *  - No IntersectionObserver at all → never gate.
 *  - Observer present but silent → play anyway. A document that is not being
 *    rendered (background tab, non-compositing embed) skips the step that
 *    flushes observer callbacks, so a live observer is not the same thing as
 *    a delivering one. A working observer always fires once on observe(),
 *    intersecting or not, so that first callback is what cancels the fallback.
 */
function useSeen(ref, threshold = 0.25) {
  const [seen, setSeen] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;

    let delivering = false;
    const fallback = setTimeout(() => { if (!delivering) setSeen(true); }, 2000);

    const io = new IntersectionObserver(
      (entries) => {
        delivering = true;
        clearTimeout(fallback);
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);

    return () => { clearTimeout(fallback); io.disconnect(); };
  }, [ref, threshold]);

  return seen;
}

export default function ChatMock({ chat, accent }) {
  const reduce = useReducedMotion();
  const timeline = useMemo(() => buildTimeline(chat.turns), [chat.turns]);

  const hostRef = useRef(null);
  const scrollerRef = useRef(null);
  const seen = useSeen(hostRef);

  // Reduced motion gets the whole transcript immediately — no playback at all.
  // Otherwise start at 1, not 0: the context row is on screen from the first
  // frame, so the panel is never a blank box waiting on a timer.
  const [shown, setShown] = useState(reduce ? timeline.length : 1);
  const [replayKey, setReplayKey] = useState(0);

  const playing = !reduce && seen && shown < timeline.length;
  const finished = shown >= timeline.length;

  useEffect(() => {
    if (!playing) return undefined;
    const previous = timeline[shown - 1];
    const delay = previous ? previous.hold : 250;
    const id = setTimeout(() => setShown((n) => n + 1), delay);
    return () => clearTimeout(id);
  }, [playing, shown, timeline]);

  // Follow the newest turn.
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
  }, [shown, reduce]);

  // A `typing` row only stands in for the message that follows it, so it is
  // dropped from the log as soon as that message lands.
  const visible = timeline.slice(0, shown).filter((s, i) => !(s.kind === 'typing' && i < shown - 1));

  const replay = () => {
    setShown(1);
    setReplayKey((k) => k + 1);
  };

  return (
    <div ref={hostRef}>
      <ChatFrame accent={accent} title={chat.title} meta={chat.meta} badge={chat.badge}>
        <div className="relative">
          <div
            ref={scrollerRef}
            className="flex min-w-0 flex-col gap-2.5 overflow-y-auto px-4 py-4"
            style={{ height: 'clamp(400px, 56vh, 536px)' }}
          >
            <AnimatePresence initial={false}>
              {visible.map((item, i) => (
                <ChatRow
                  key={`${replayKey}-${item.kind}-${i}`}
                  item={item}
                  accent={accent}
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

          {finished && !reduce && (
            <button
              type="button"
              onClick={replay}
              className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9.5px] backdrop-blur-[3px] transition-colors"
              style={{
                fontFamily: MONO,
                color: 'var(--lp-fg-faint)',
                background: 'rgba(10, 9, 8, 0.72)',
                border: '1px solid var(--lp-line)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = accent; e.currentTarget.style.borderColor = accent; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--lp-fg-faint)'; e.currentTarget.style.borderColor = 'var(--lp-line)'; }}
            >
              <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5" aria-hidden="true">
                <path d="M10 6a4 4 0 1 1-1.2-2.85M10 1.5V4H7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Replay
            </button>
          )}
        </div>
      </ChatFrame>
    </div>
  );
}
