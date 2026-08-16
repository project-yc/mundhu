import { useCallback, useRef, useState } from 'react';
import { Image, Loader2, Mic, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';
import { Input } from '../ui/input';
import { Popover, PopoverAnchor, PopoverContent } from '../ui/popover';
import { useChatStream } from '../../hooks/useChatStream';

export function AskAnythingBar({ className }) {
  const [question, setQuestion] = useState('');
  const [open, setOpen] = useState(false);
  const { status, answer, error, ask, reset } = useChatStream();
  const inputRef = useRef(null);

  const handleSubmit = useCallback(() => {
    const trimmed = question.trim();
    if (!trimmed) return;
    setOpen(true);
    ask(trimmed);
  }, [question, ask]);

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

  // Re-open on refocus if there's already an answer/error to show, so
  // clicking back into the bar doesn't lose the last result.
  const handleFocus = useCallback(() => {
    if (status !== 'idle') setOpen(true);
  }, [status]);

  const handleOpenChange = useCallback(
    (next) => {
      setOpen(next);
      if (!next) reset();
    },
    [reset],
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <div className={cn('hidden h-[58px] flex-shrink-0 items-center  bg-page px-3 md:flex', className)}>
        {/* Animated gradient border wrapper */}
        <PopoverAnchor asChild>
          <div className="ask-gradient-border w-full rounded-[11px] p-[1.5px]">
            <div className="relative flex h-[32px] w-full items-center rounded-[10px] bg-surface">
              <Search className="pointer-events-none absolute left-[13px] h-[17px] w-[17px] text-text-secondary" strokeWidth={1.8} />
              <Input
                ref={inputRef}
                aria-label="Ask about the product"
                placeholder="Ask anything..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                className="h-full border-0 bg-transparent pl-[38px] pr-[72px] shadow-none focus-visible:ring-0"
              />
              <div className="absolute right-[12px] flex items-center gap-[12px] text-text-primary">
                <button type="button" className="transition-opacity hover:opacity-70" aria-label="Voice input">
                  <Mic className="h-[17px] w-[17px]" strokeWidth={1.8} />
                </button>
                <button type="button" className="transition-opacity hover:opacity-70" aria-label="Attach image">
                  <Image className="h-[17px] w-[17px]" strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </div>
        </PopoverAnchor>
      </div>

      <PopoverContent
        align="start"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[min(560px,90vw)] max-h-[320px] overflow-y-auto rounded-[11px] border border-border-default bg-surface p-4 text-[14px] leading-[20px] text-text-primary shadow-lg"
      >
        {status === 'loading' && (
          <div className="flex items-center gap-2 text-text-secondary">
            <Loader2 className="h-[14px] w-[14px] animate-spin" strokeWidth={2} />
            <span>Thinking…</span>
          </div>
        )}

        {(status === 'streaming' || status === 'done') && (
          <div className="[&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
            {status === 'streaming' && (
              <span className="ml-0.5 inline-block h-[13px] w-[2px] translate-y-[2px] animate-pulse bg-text-secondary" />
            )}
          </div>
        )}

        {status === 'error' && <p className="text-error">{error}</p>}
      </PopoverContent>
    </Popover>
  );
}
