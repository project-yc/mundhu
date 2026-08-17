import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUp, Loader2, Mic, Search, Square } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';
import { Input } from '../ui/input';
import { Popover, PopoverAnchor, PopoverContent } from '../ui/popover';
import { useChatStream } from '../../hooks/useChatStream';
import { useSpeechInput } from '../../hooks/useSpeechInput';
import { useTypewriter } from '../../hooks/useTypewriter';

/** How close to the bottom the panel must be for streaming text to keep it pinned there. */
const AUTOSCROLL_SLACK_PX = 80;

export function AskAnythingBar({ className }) {
  const [question, setQuestion] = useState('');
  const [open, setOpen] = useState(false);
  const { status, answer, error, ask, stop, reset } = useChatStream();
  const {
    supported: micSupported,
    micBlocked,
    listening,
    transcript,
    start: startMic,
    stop: stopMic,
    resetTranscript,
  } = useSpeechInput();
  const reduceMotion = useReducedMotion();
  // Tokens arrive from SSE in uneven bursts; replaying them at a fixed rate is
  // what makes the answer read as typing instead of appearing in blocks.
  const { revealed, done: typedOut } = useTypewriter(answer, !reduceMotion);

  // Whatever was already typed when dictation started, so the growing
  // transcript appends to it instead of replacing it.
  const [dictationBase, setDictationBase] = useState('');

  const inputRef = useRef(null);
  const panelRef = useRef(null);

  // The transcript is external state owned by the recognition engine, so it's
  // read straight through into the field rather than copied into `question` —
  // whichever of the two is live wins. Typing clears the transcript (see
  // handleChange) and stopping dictation commits it, so they never fight.
  const value = transcript
    ? (dictationBase ? `${dictationBase} ${transcript}` : transcript)
    : question;

  const busy = status === 'loading' || status === 'streaming';
  const canSend = value.trim().length > 0;

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (listening) stopMic();
    setOpen(true);
    ask(trimmed);
  }, [value, ask, listening, stopMic]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    },
    [handleSubmit],
  );

  const handleChange = useCallback(
    (e) => {
      setQuestion(e.target.value);
      // Typing takes the field back from dictation — without clearing the
      // transcript, the derived `value` above would keep overriding the edit.
      if (transcript) {
        if (listening) stopMic();
        resetTranscript();
      }
      // Editing the question retires the finished answer rather than leaving a
      // stale panel open underneath a question it no longer answers.
      if (status === 'done' || status === 'error') {
        setOpen(false);
        reset();
      }
    },
    [status, reset, transcript, listening, stopMic, resetTranscript],
  );

  // Re-open on refocus if there's already an answer/error to show, so
  // clicking back into the bar doesn't lose the last result.
  const handleFocus = useCallback(() => {
    if (status !== 'idle') setOpen(true);
  }, [status]);

  const handleOpenChange = useCallback(
    (next) => {
      setOpen(next);
      // Dismissing abandons the request but keeps what already streamed, so
      // clicking back in restores the answer instead of a blank panel.
      if (!next) stop();
    },
    [stop],
  );

  const toggleMic = useCallback(() => {
    if (listening) {
      // Commit what was dictated into the field, so the text stays put once the
      // transcript is dropped.
      stopMic();
      setQuestion(value);
      resetTranscript();
      return;
    }
    // Base on what's currently *shown*, not on `question` — after submitting
    // with Enter the last transcript is still displayed but was never committed,
    // and reading `question` there would silently drop it.
    setDictationBase(value.trim());
    setQuestion(value);
    resetTranscript();
    startMic();
  }, [listening, value, resetTranscript, startMic, stopMic]);

  // Keep the newest text in view while it streams — but only if the reader is
  // already at the bottom, so scrolling up to re-read isn't fought.
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const fromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (fromBottom < AUTOSCROLL_SLACK_PX) el.scrollTop = el.scrollHeight;
  }, [revealed]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <div className={cn('hidden h-[58px] flex-shrink-0 items-center bg-page px-3 md:flex', className)}>
        {/* 1px shell — its background *is* the border. Still at rest; sweeps only while streaming. */}
        <PopoverAnchor asChild>
          <div className="ask-shell w-full rounded-[10px] p-px" data-streaming={status === 'streaming'}>
            <div className="relative flex h-[32px] w-full items-center rounded-[9px] bg-surface">
              <Search
                className="pointer-events-none absolute left-3 h-4 w-4 text-text-muted"
                strokeWidth={1.75}
              />
              <Input
                ref={inputRef}
                aria-label="Ask about the product"
                placeholder={listening ? 'Listening…' : 'Ask anything…'}
                value={value}
                maxLength={1000}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                className="h-full border-0 bg-transparent pl-9 pr-[58px] shadow-none focus-visible:ring-0"
              />

              <div className="absolute right-1 flex items-center gap-1.5">
                {micSupported && (
                  <button
                    type="button"
                    onClick={toggleMic}
                    disabled={micBlocked}
                    aria-pressed={listening}
                    aria-label={listening ? 'Stop dictation' : 'Dictate your question'}
                    title={micBlocked ? 'Microphone access is blocked in your browser settings' : undefined}
                    className={cn(
                      'grid h-6 w-6 place-items-center rounded-full transition-colors',
                      'text-text-muted hover:bg-surface-muted hover:text-text-secondary',
                      'disabled:pointer-events-none disabled:opacity-40',
                      listening && 'ask-mic-live bg-brand-tint text-brand hover:text-brand',
                    )}
                  >
                    <Mic className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={busy ? stop : handleSubmit}
                  disabled={!busy && !canSend}
                  aria-label={busy ? 'Stop generating' : 'Send question'}
                  className={cn(
                    'grid h-6 w-6 place-items-center rounded-[7px] transition-colors',
                    busy
                      ? 'bg-surface-muted text-text-secondary hover:text-text-primary'
                      : canSend
                        ? 'bg-brand text-on-brand hover:bg-brand-hover'
                        : 'text-text-faint',
                    'disabled:pointer-events-none',
                  )}
                >
                  {busy ? (
                    <Square className="h-2.5 w-2.5 fill-current" strokeWidth={0} />
                  ) : (
                    <ArrowUp className="h-4 w-4" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </PopoverAnchor>
      </div>

      <PopoverContent
        ref={panelRef}
        align="start"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[min(560px,90vw)] max-h-[320px] overflow-y-auto rounded-[11px] border border-border-default bg-surface p-4 text-[14px] leading-[20px] text-text-primary shadow-lg"
      >
        {status === 'loading' && (
          <div role="status" className="flex items-center gap-2 text-text-secondary">
            <Loader2 className="h-[14px] w-[14px] animate-spin" strokeWidth={2} />
            <span>Thinking…</span>
          </div>
        )}

        {(status === 'streaming' || status === 'done') && (
          <div
            aria-live="polite"
            className="[&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{revealed}</ReactMarkdown>
            {/* The caret outlives the stream itself — the reveal is still catching up. */}
            {(status === 'streaming' || !typedOut) && (
              <span className="ml-0.5 inline-block h-[13px] w-[2px] translate-y-[2px] animate-pulse bg-text-secondary" />
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-start justify-between gap-3">
            <p className="text-error">{error}</p>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-shrink-0 rounded-[6px] border border-border-default px-2 py-1 text-[12px] text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
            >
              Retry
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
