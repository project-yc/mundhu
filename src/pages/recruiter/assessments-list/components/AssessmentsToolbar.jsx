import { Plus, Search, X } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { STATUS_FILTER_OPTIONS } from '../constants/assessmentsConfig';

/**
 * Page title, "New Assessment" CTA, and the query controls.
 *
 * Search is debounced by the hook and issued to the server — typing here
 * refetches rather than filtering the loaded page in JS. Rows-per-page is
 * fixed (DEFAULT_PAGE_SIZE) with no control here by design.
 */
export function AssessmentsToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onCreate,
}) {
  return (
    <div className="flex flex-col gap-[16px]">
      <div className="flex flex-col gap-[14px] lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-[20px] font-bold leading-[24px] text-text-primary">Assessments</h1>
          <p className="mt-[4px] text-[14px] leading-[18px] text-text-secondary">
            Configure and manage technical assessments.
          </p>
        </div>

        <Button
          variant="cta"
          className="h-[40px] shrink-0 px-[16px] text-[14px] font-bold"
          onClick={onCreate}
        >
          <Plus className="h-[16px] w-[16px]" strokeWidth={2.5} />
          New Assessment
        </Button>
      </div>

      <div className="flex flex-col gap-[10px] sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-[380px]">
          <Search
            className="pointer-events-none absolute left-[11px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-text-muted"
            strokeWidth={1.8}
          />
          <Input
            value={search}
            onChange={event => onSearchChange(event.target.value)}
            placeholder="Search by name or description..."
            aria-label="Search assessments"
            className="h-[40px] rounded-[8px] pl-[34px] pr-[34px] text-[14px]"
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onSearchChange('')}
              className="absolute right-[8px] top-1/2 flex h-[22px] w-[22px] -translate-y-1/2 items-center justify-center rounded-[6px] text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
            >
              <X className="h-[14px] w-[14px]" strokeWidth={2} />
            </button>
          )}
        </div>

        <div className="sm:ml-auto">
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger
              aria-label="Filter by status"
              className="h-[40px] w-[150px] rounded-[8px] text-[14px]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
