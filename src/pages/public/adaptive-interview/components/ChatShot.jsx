import { MONO } from './primitives';

/**
 * Screenshot slot for a chat capture of one adaptive-interview mode.
 *
 * Drop a real capture in by passing `src` — everything else (frame, chrome,
 * caption) stays identical, so swapping placeholder → screenshot is a one-line
 * change per mode in `useCases.js`. Until then it renders a designed skeleton
 * of the chat panel rather than an empty box, so unfinished sections still
 * read as intentional in a demo.
 */
export default function ChatShot({
  src,
  alt = '',
  title = 'AI Adaptive Interview',
  caption,
  accent = 'var(--lp-ember-bright)',
  fileHint,
  className = '',
}) {
  return (
    <figure
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{
        background: 'linear-gradient(170deg, #1C1917, #121010)',
        border: '1px solid var(--lp-line)',
        boxShadow: `0 40px 90px -50px color-mix(in srgb, ${accent} 70%, transparent), 0 2px 0 0 rgba(255,255,255,0.03) inset`,
      }}
    >
      {/* Window chrome */}
      <div
        className="flex items-center gap-2.5 px-4 py-2.5"
        style={{ borderBottom: '1px solid var(--lp-line-soft)', background: 'rgba(255,255,255,0.018)' }}
      >
        <span className="flex gap-1.5" aria-hidden="true">
          <i className="w-[9px] h-[9px] rounded-full block" style={{ background: 'rgba(255,240,230,0.16)' }} />
          <i className="w-[9px] h-[9px] rounded-full block" style={{ background: 'rgba(255,240,230,0.16)' }} />
          <i className="w-[9px] h-[9px] rounded-full block" style={{ background: 'rgba(255,240,230,0.16)' }} />
        </span>
        <span
          className="truncate text-[10.5px]"
          style={{ fontFamily: MONO, color: 'var(--lp-fg-faint)', letterSpacing: '0.05em' }}
        >
          {title}
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <i className="w-1.5 h-1.5 rounded-full block" style={{ background: accent }} />
          <span className="text-[10px]" style={{ fontFamily: MONO, color: 'var(--lp-fg-faint)' }}>live</span>
        </span>
      </div>

      {src ? (
        <img src={src} alt={alt} className="block w-full h-auto" loading="lazy" />
      ) : (
        <PlaceholderBody accent={accent} caption={caption} fileHint={fileHint} />
      )}
    </figure>
  );
}

/* ── Skeleton chat panel + "drop the capture here" overlay ────────────── */

function Bubble({ side = 'left', w, accent, muted }) {
  const isLeft = side === 'left';
  return (
    <div className={`flex ${isLeft ? 'justify-start' : 'justify-end'}`}>
      <div
        className="lp-shimmer rounded-2xl"
        style={{
          width: w,
          height: 'clamp(30px, 4.4vw, 44px)',
          background: isLeft
            ? `color-mix(in srgb, ${accent} ${muted ? 7 : 13}%, rgba(255,255,255,0.03))`
            : 'rgba(255,255,255,0.045)',
          border: `1px solid ${isLeft ? `color-mix(in srgb, ${accent} 20%, transparent)` : 'var(--lp-line-soft)'}`,
          borderBottomLeftRadius: isLeft ? 6 : undefined,
          borderBottomRightRadius: isLeft ? undefined : 6,
        }}
      />
    </div>
  );
}

function PlaceholderBody({ accent, caption, fileHint }) {
  return (
    <div className="relative" style={{ aspectRatio: '16 / 10' }}>
      {/* Faint chat skeleton so the empty slot still reads as a chat panel */}
      <div className="absolute inset-0 flex flex-col gap-3 p-5 sm:p-7 opacity-[0.62]" aria-hidden="true">
        <Bubble side="left" w="62%" accent={accent} />
        <Bubble side="right" w="46%" accent={accent} />
        <Bubble side="left" w="72%" accent={accent} muted />
        <Bubble side="right" w="38%" accent={accent} />
        <div className="mt-auto flex items-center gap-2">
          <div
            className="flex-1 rounded-full"
            style={{ height: 'clamp(26px, 3.4vw, 34px)', background: 'rgba(255,255,255,0.035)', border: '1px solid var(--lp-line-soft)' }}
          />
          <div className="rounded-full" style={{ width: 34, height: 'clamp(26px, 3.4vw, 34px)', background: `color-mix(in srgb, ${accent} 28%, transparent)` }} />
        </div>
      </div>

      {/* Overlay label */}
      <div className="absolute inset-0 grid place-items-center px-6">
        <div
          className="flex flex-col items-center gap-2.5 rounded-xl px-5 py-4 text-center backdrop-blur-[3px]"
          style={{
            background: 'rgba(10, 9, 8, 0.72)',
            border: `1px dashed color-mix(in srgb, ${accent} 40%, transparent)`,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: accent }} aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="8.5" cy="9.5" r="1.6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4 17l4.6-4.3a2 2 0 0 1 2.7 0L16 17m1-2.4l1.2-1.1a2 2 0 0 1 2.7 0L21 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="text-[12px] font-semibold text-[var(--lp-fg)]">{caption || 'Chat screenshot'}</p>
          <p className="text-[10px]" style={{ fontFamily: MONO, color: 'var(--lp-fg-faint)', letterSpacing: '0.05em' }}>
            {fileHint || '1600 × 1000 · replace with capture'}
          </p>
        </div>
      </div>
    </div>
  );
}
