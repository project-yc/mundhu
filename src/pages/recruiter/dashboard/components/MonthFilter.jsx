import { useState } from 'react';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../../../../components/ui/popover';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Month/year filter. `value` is '' (all time) or 'YYYY-MM'.
export default function MonthFilter({ value, onChange }) {
  const now = new Date();
  const selYear  = value ? Number(value.split('-')[0]) : null;
  const selMonth = value ? Number(value.split('-')[1]) : null; // 1-12
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selYear ?? now.getFullYear());

  const label = value ? `${MONTHS[selMonth - 1]} ${selYear}` : 'All time';

  const pickMonth = (monthIdx) => {
    onChange(`${viewYear}-${String(monthIdx + 1).padStart(2, '0')}`);
    setOpen(false);
  };

  const clear = () => {
    onChange('');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-secondary border border-border-default rounded-full pl-3 pr-2.5 py-[5px] bg-surface cursor-pointer hover:border-border-strong transition-colors flex-shrink-0"
        >
          <CalendarDays className="w-3.5 h-3.5 text-text-muted" strokeWidth={1.8} />
          {label}
          <ChevronDown className="w-3 h-3 text-text-muted" strokeWidth={2} />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={6} className="w-[236px] p-3">
        {/* Year navigation */}
        <div className="flex items-center justify-between mb-2.5">
          <button
            type="button"
            onClick={() => setViewYear(y => y - 1)}
            className="w-6 h-6 rounded-md flex items-center justify-center text-text-secondary hover:bg-surface-muted transition-colors"
            aria-label="Previous year"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <span className="text-[13px] font-semibold text-text-primary">{viewYear}</span>
          <button
            type="button"
            onClick={() => setViewYear(y => y + 1)}
            className="w-6 h-6 rounded-md flex items-center justify-center text-text-secondary hover:bg-surface-muted transition-colors"
            aria-label="Next year"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-3 gap-1.5">
          {MONTHS.map((m, i) => {
            const isSelected = selYear === viewYear && selMonth === i + 1;
            return (
              <button
                key={m}
                type="button"
                onClick={() => pickMonth(i)}
                className={`h-8 rounded-lg text-[12px] font-medium transition-colors ${
                  isSelected ? 'text-white' : 'text-text-secondary hover:bg-surface-muted'
                }`}
                style={isSelected ? { backgroundColor: 'var(--color-assessment-accent)' } : undefined}
              >
                {m}
              </button>
            );
          })}
        </div>

        {/* Clear */}
        <button
          type="button"
          onClick={clear}
          className={`mt-2.5 w-full h-8 rounded-lg text-[12px] font-medium border transition-colors ${
            value
              ? 'text-text-secondary border-border-default hover:bg-surface-muted'
              : 'text-white border-transparent'
          }`}
          style={!value ? { backgroundColor: 'var(--color-assessment-accent)' } : undefined}
        >
          All time
        </button>
      </PopoverContent>
    </Popover>
  );
}
