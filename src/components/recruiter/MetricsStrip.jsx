import { cn } from '../../lib/utils';
import { Skeleton } from '../ui/skeleton';

/**
 * Compact horizontal row of stat tiles, shared by the Assessments and Reports
 * screens. Replaces per-screen 146px gradient MetricCards (with a dead "See
 * details" footer) with a flat ~75px strip — value and label share a
 * baseline, a muted detail line sits underneath.
 *
 * `stats` is `{ key, label, value, detail }[]` — each screen derives its own
 * numbers (org-wide summary for Assessments, candidate-derived metrics for
 * Reports) and hands this component only the display shape.
 */
export function MetricsStrip({ stats, loading }) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-[10px] border border-border-subtle bg-surface-hover lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={stat.key}
          className={cn(
            'min-w-0 px-[20px] py-[14px]',
            // Dividers drawn per-cell rather than with divide-x, which cannot
            // express "no left border on the first item of each row" across
            // the 2-col and 4-col breakpoints.
            index % 2 !== 0 && 'border-l border-border-subtle',
            index >= 2 && 'border-t border-border-subtle lg:border-t-0',
            index === 2 && 'lg:border-l lg:border-border-subtle',
          )}
        >
          <div className="flex min-w-0 items-baseline gap-[8px]">
            {loading ? (
              <Skeleton className="h-[22px] w-[48px]" />
            ) : (
              <span className="text-[22px] font-bold leading-[26px] text-text-primary">
                {stat.value}
              </span>
            )}
            <span className="min-w-0 truncate text-[13px] font-medium text-text-secondary">
              {stat.label}
            </span>
          </div>
          <p className="mt-[3px] truncate text-[12px] leading-[16px] text-text-muted">
            {loading ? ' ' : stat.detail}
          </p>
        </div>
      ))}
    </div>
  );
}
