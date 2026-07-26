import { Image, Mic, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Input } from '../ui/input';

export function AskAnythingBar({ className }) {
  return (
    <div className={cn('hidden h-[58px] flex-shrink-0 items-center  bg-page px-3 md:flex', className)}>
      {/* Animated gradient border wrapper */}
      <div className="ask-gradient-border w-full rounded-[11px] p-[1.5px]">
        <div className="relative flex h-[32px] w-full items-center rounded-[10px] bg-surface">
          <Search className="pointer-events-none absolute left-[13px] h-[17px] w-[17px] text-text-secondary" strokeWidth={1.8} />
          <Input
            aria-label="Global search"
            placeholder="Ask anything..."
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
    </div>
  );
}
