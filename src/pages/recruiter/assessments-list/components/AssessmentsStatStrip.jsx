import { cn } from '../../../../lib/utils';
import { Skeleton } from '../../../../components/ui/skeleton';
import { formatCompletionRate } from '../utils/assessmentRows';

/**
 * Workspace totals above the table.
 *
 * Replaces the four 146px gradient MetricCards this screen used to render — at
 * roughly half the height, with no gradient and no dead "See details" footer,
 * so the table starts above the fold. The numbers come from the list
 * endpoint's `summary` block and are org-wide: they deliberately do not move
 * as the user searches or filters.
 */

function Stat({ label, value, detail, loading, className }) {
  return (
    <div className={cn('min-w-0 px-[20px] py-[14px]', className)}>
      {/* Value and label share a baseline — two lines total, which is what
          keeps the whole strip under half the height of the old cards. */}
      <div className="flex min-w-0 items-baseline gap-[8px]">
        {loading ? (
          <Skeleton className="h-[22px] w-[48px]" />
        ) : (
          <span className="text-[22px] font-bold leading-[26px] text-text-primary">{value}</span>
        )}
        <span className="min-w-0 truncate text-[13px] font-medium text-text-secondary">
          {label}
        </span>
      </div>
      <p className="mt-[3px] truncate text-[12px] leading-[16px] text-text-muted">
        {loading ? ' ' : detail}
      </p>
    </div>
  );
}

export function AssessmentsStatStrip({ summary, loading }) {
  const withCandidates = summary.with_candidates ?? 0;

  const stats = [
    {
      key: 'total',
      label: 'Total assessments',
      value: summary.total,
      detail: `${summary.live} live · ${summary.draft} draft`,
    },
    {
      key: 'completion',
      label: 'Avg completion',
      value: formatCompletionRate(summary.avg_completion_rate),
      detail: withCandidates
        ? `across ${withCandidates} with candidates`
        : 'no candidates invited yet',
    },
    {
      key: 'candidates',
      label: 'Candidates',
      value: summary.invited_total,
      detail: `${summary.submitted_total} submitted`,
    },
    {
      key: 'endingSoon',
      label: 'Ending soon',
      value: summary.ending_soon,
      detail: 'closing in the next 7 days',
    },
  ];

  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-[10px] border border-border-subtle bg-surface-hover lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Stat
          key={stat.key}
          label={stat.label}
          value={stat.value}
          detail={stat.detail}
          loading={loading}
          className={cn(
            // Dividers drawn per-cell rather than with divide-x, which cannot
            // express "no left border on the first item of each row" across
            // the 2-col and 4-col breakpoints.
            index % 2 !== 0 && 'border-l border-border-subtle',
            index >= 2 && 'border-t border-border-subtle lg:border-t-0',
            index === 2 && 'lg:border-l lg:border-border-subtle',
          )}
        />
      ))}
    </div>
  );
}
