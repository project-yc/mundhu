import { Plus, Search } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';

/** Page title + search + "New Assessment" CTA. */
export function AssessmentsHeader({ search, onSearchChange, onCreate }) {
  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex flex-col gap-[18px] lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-[20px] font-bold leading-[24px] text-text-primary">Assessments</h1>
          <p className="mt-[5px] text-[15px] leading-[17px] text-text-secondary">
            Configure and manage technical assessments.
          </p>
        </div>

        <Button variant="cta" className="h-[42px] px-[18px] text-[14px] font-bold" onClick={onCreate}>
          <Plus className="h-[16px] w-[16px]" strokeWidth={2.5} />
          New Assessment
        </Button>
      </div>

      <div className="relative min-w-0">
        <Search
          className="pointer-events-none absolute left-[11px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-text-primary"
          strokeWidth={1.8}
        />
        <Input
          value={search}
          onChange={event => onSearchChange(event.target.value)}
          placeholder="Search assessments..."
          aria-label="Search assessments by name"
          className="h-[42px] rounded-[8px] pl-[34px] text-[14px]"
        />
      </div>
    </div>
  );
}
