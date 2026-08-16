import { useState } from 'react';
import { motion as Motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { USE_CASES } from '../useCases';
import ChatShot from './ChatShot';
import { DISPLAY, MONO, Pill } from './primitives';

export default function UseCaseShowcase() {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState(USE_CASES[0].id);
  const active = USE_CASES.find((u) => u.id === activeId) ?? USE_CASES[0];

  return (
    <div>
      {/* Tab rail — scrolls horizontally on narrow screens rather than wrapping */}
      <div
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        role="tablist"
        aria-label="Adaptive interview modes"
      >
        {USE_CASES.map((u) => {
          const on = u.id === activeId;
          return (
            <button
              key={u.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActiveId(u.id)}
              className="relative flex-shrink-0 rounded-full px-4 py-2.5 text-[12.5px] font-semibold transition-colors duration-200"
              style={{
                color: on ? '#140C05' : 'var(--lp-fg-dim)',
                border: `1px solid ${on ? 'transparent' : 'var(--lp-line)'}`,
              }}
            >
              {on && (
                <Motion.span
                  layoutId={reduce ? undefined : 'usecase-pill'}
                  className="absolute inset-0 rounded-full"
                  style={{ background: u.accent }}
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                {u.tab}
                {u.status === 'soon' && (
                  <span
                    className="rounded-full px-1.5 py-px text-[8.5px] uppercase"
                    style={{
                      fontFamily: MONO,
                      letterSpacing: '0.08em',
                      background: on ? 'rgba(20,12,5,0.16)' : 'rgba(255,240,230,0.07)',
                      color: on ? '#140C05' : 'var(--lp-fg-faint)',
                    }}
                  >
                    soon
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active panel */}
      <div className="mt-8 lg:mt-10">
        <AnimatePresence mode="wait">
          <Motion.div
            key={active.id}
            role="tabpanel"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-8 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-12 lg:items-start"
          >
            {/* Copy */}
            <div className="lg:pt-2">
              <div className="flex items-center gap-2.5">
                <span
                  className="text-[10.5px] uppercase"
                  style={{ fontFamily: MONO, letterSpacing: '0.16em', color: active.accent }}
                >
                  {active.kicker}
                </span>
                <Pill accent={active.status === 'live' ? '#4ADE80' : 'var(--lp-fg-faint)'}>
                  {active.status === 'live' ? 'Live today' : 'Shipping soon'}
                </Pill>
              </div>

              <h3
                className="mt-4 text-[clamp(1.45rem,2.5vw,1.95rem)] leading-[1.16] text-[var(--lp-fg)]"
                style={{ fontFamily: DISPLAY, fontWeight: 700, letterSpacing: '-0.025em' }}
              >
                {active.title}
              </h3>

              <p className="mt-4 text-[14.5px] leading-[1.72] text-[var(--lp-fg-dim)]">{active.body}</p>

              <ul className="mt-6 flex flex-col gap-3">
                {active.proof.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <span
                      className="mt-[6px] grid h-4 w-4 flex-shrink-0 place-items-center rounded-full"
                      style={{ background: `color-mix(in srgb, ${active.accent} 18%, transparent)` }}
                    >
                      <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5" style={{ color: active.accent }} aria-hidden="true">
                        <path d="M2.5 6.2l2.3 2.3L9.5 3.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-[13.5px] leading-[1.6] text-[var(--lp-fg-dim)]">{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual */}
            <div>
              <ChatShot
                src={active.image}
                alt={active.caption}
                title={`AI Adaptive Interview — ${active.tab}`}
                caption={active.caption}
                fileHint={`1600 × 1000 · ${active.file}`}
                accent={active.accent}
              />
              <SampleExchange quote={active.quote} accent={active.accent} />
            </div>
          </Motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** A three-line taste of the real thing: question → answer → adapted follow-up. */
function SampleExchange({ quote, accent }) {
  return (
    <div
      className="mt-4 rounded-2xl p-4 sm:p-5"
      style={{ background: 'rgba(255,255,255,0.022)', border: '1px solid var(--lp-line-soft)' }}
    >
      <p
        className="mb-3 text-[9.5px] uppercase"
        style={{ fontFamily: MONO, letterSpacing: '0.16em', color: 'var(--lp-fg-faint)' }}
      >
        Sample exchange
      </p>
      <div className="flex flex-col gap-2.5">
        <Line who="Panel" text={quote.q} accent={accent} strong />
        <Line who="Candidate" text={quote.a} accent={accent} />
        <Line who="Panel" text={quote.f} accent={accent} strong adapted />
      </div>
    </div>
  );
}

function Line({ who, text, accent, strong, adapted }) {
  return (
    <div className="flex gap-3">
      <span
        className="mt-[3px] w-[62px] flex-shrink-0 text-right text-[9.5px]"
        style={{ fontFamily: MONO, color: strong ? accent : 'var(--lp-fg-faint)' }}
      >
        {who}
      </span>
      <p
        className="text-[12.5px] leading-[1.6]"
        style={{ color: strong ? 'var(--lp-fg)' : 'var(--lp-fg-dim)' }}
      >
        {text}
        {adapted && (
          <span
            className="ml-2 align-middle text-[9px] uppercase"
            style={{ fontFamily: MONO, letterSpacing: '0.1em', color: accent }}
          >
            ← adapted
          </span>
        )}
      </p>
    </div>
  );
}
