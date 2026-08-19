import { FileText, SearchX } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

/**
 * Two distinct states: an org with no assessments at all, and a query that
 * happens to match nothing. Collapsing them tells a first-time recruiter their
 * search is bad when they simply have not created anything yet.
 */
export function AssessmentsEmptyState({ filtersActive, onClearFilters }) {
  const Icon = filtersActive ? SearchX : FileText;

  return (
    <div className="flex flex-col items-center justify-center px-4 py-[56px] text-center">
      <Icon className="h-[28px] w-[28px] text-text-faint" strokeWidth={1.6} />
      <p className="mt-[10px] text-[14px] font-semibold text-text-primary">
        {filtersActive ? 'No assessments match these filters' : 'No assessments yet'}
      </p>
      <p className="mt-[4px] text-[13px] text-text-secondary">
        {filtersActive
          ? 'Try a different search term, or widen the status filter.'
          : 'Create your first assessment to see it here.'}
      </p>

      {filtersActive && (
        <Button variant="outline" className="mt-[16px] h-[34px] text-[13px]" onClick={onClearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
