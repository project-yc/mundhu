import { Mic, Search } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';

/**
 * Search + filter row. Figma: 1097x42 — input 958 wide, action button 131x41.
 *
 * The input filters the loaded rows client-side on name and email. "Apply
 * filters" and voice input have no backend behind them yet and are inert.
 */
export function ReportsFilterBar({ value, onChange }) {
  return (
    <div className="flex flex-col gap-[8px] lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-[11px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-text-primary"
          strokeWidth={1.8}
        />
        <Input
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder="Ask anything..."
          aria-label="Search reports by candidate name or email"
          className="h-[42px] rounded-[8px] pl-[34px] pr-[42px] text-[14px]"
        />
        <button
          type="button"
          aria-label="Voice input"
          className="absolute right-[12px] top-1/2 -translate-y-1/2 text-text-primary transition-opacity hover:opacity-70"
        >
          <Mic className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </button>
      </div>

      <Button
        variant="cta"
        className="h-[41px] w-full min-w-[131px] rounded-[8px] px-[25px] text-[14px] font-bold lg:w-[131px]"
      >
        Apply filters
      </Button>
    </div>
  );
}
