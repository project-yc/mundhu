import { FileText, SearchX } from 'lucide-react';

export function AssessmentsEmptyState({ searching }) {
  const Icon = searching ? SearchX : FileText;

  return (
    <div className="flex flex-col items-center justify-center px-4 py-[52px] text-center">
      <Icon className="h-[28px] w-[28px] text-text-faint" strokeWidth={1.6} />
      <p className="mt-[10px] text-[14px] font-semibold text-text-primary">
        {searching ? 'No matching assessments' : 'No assessments yet'}
      </p>
      <p className="mt-[4px] text-[13px] text-text-secondary">
        {searching
          ? 'Try a different name.'
          : 'Create your first assessment to see it here.'}
      </p>
    </div>
  );
}
