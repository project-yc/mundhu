import { Image, Mic, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Input } from '../ui/input';

export function AskAnythingBar({ className }) {
  return (
    <div className={cn('hidden h-[58px] flex-shrink-0 items-center border-b border-border-subtle bg-page px-3 md:flex', className)}>
      <div className="relative flex h-[32px] w-full items-center rounded-[8px] border border-border-default bg-surface shadow-sm">
        <Search className="pointer-events-none absolute left-[11px] h-[17px] w-[17px] text-text-secondary" strokeWidth={1.8} />
        <Input
          aria-label="Global search"
          placeholder="Ask anything..."
          className="h-full border-0 bg-transparent pl-[33px] pr-[72px] shadow-none focus-visible:ring-0"
        />
        <div className="absolute right-[10px] flex items-center gap-[12px] text-text-primary">
          <button type="button" className="transition-opacity hover:opacity-70" aria-label="Voice input">
            <Mic className="h-[17px] w-[17px]" strokeWidth={1.8} />
          </button>
          <button type="button" className="transition-opacity hover:opacity-70" aria-label="Attach image">
            <Image className="h-[17px] w-[17px]" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}
