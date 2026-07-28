import { FileText, SearchX } from 'lucide-react';

/**
 * Distinguishes "nothing submitted yet" from "your search matched nothing" —
 * the two need different next actions from the recruiter.
 */
export function ReportsEmptyState({ searching }) {
  const Icon = searching ? SearchX : FileText;

  return (
    <div className="flex flex-col items-center justify-center px-4 py-[52px] text-center">
      <Icon className="h-[28px] w-[28px] text-text-faint" strokeWidth={1.6} />
      <p className="mt-[10px] text-[14px] font-semibold text-text-primary">
        {searching ? 'No matching candidates' : 'No reports yet'}
      </p>
      <p className="mt-[4px] text-[13px] text-text-secondary">
        {searching
          ? 'Try a different name or email.'
          : 'Reports appear here once candidates submit their assessment.'}
      </p>
    </div>
  );
}
