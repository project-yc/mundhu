import { ArrowRight, BarChart3, MoreHorizontal } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import {
  Card,
  CardDescription,
  CardFooter,
  CardTitle,
} from '../../../../components/ui/card';
import { Skeleton } from '../../../../components/ui/skeleton';

/**
 * Stat tile. Figma: 268x146 — 111px body + 35px footer.
 * `featured` renders the gradient treatment used on the first tile.
 *
 * Generic on purpose: the detailed report screen reuses this.
 */
export function MetricCard({
  label,
  description,
  value,
  featured = false,
  loading = false,
  icon,
}) {
  const Icon = icon || BarChart3;
  return (
    <Card
      className={cn(
        'flex min-h-[146px] flex-col overflow-hidden border-border-default p-0',
        featured &&
          'border-transparent bg-[linear-gradient(135deg,var(--color-report-metric-start)_0%,var(--color-report-metric-end)_100%)] text-surface',
      )}
    >
      <div className="flex flex-1 flex-col">
        <div className="flex items-start gap-[12px] px-[12px] pt-[12px]">
          <span
            className={cn(
              'flex h-[34px] w-[33px] flex-shrink-0 items-center justify-center rounded-[7px]',
              featured
                ? 'bg-surface text-[var(--color-report-metric-icon-text)]'
                : 'bg-[var(--color-report-metric-icon-bg)] text-surface',
            )}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </span>

          <div className="min-w-0 flex-1">
            <CardTitle className={cn(featured ? 'text-surface' : 'text-text-primary')}>
              {label}
            </CardTitle>
            <CardDescription className={cn('mt-[2px]', featured && 'text-surface/70')}>
              {description}
            </CardDescription>
          </div>

          <MoreHorizontal
            aria-hidden="true"
            className={cn('h-[16px] w-[16px] flex-shrink-0', featured ? 'text-surface' : 'text-text-primary')}
            strokeWidth={2.2}
          />
        </div>

        <div className="mt-auto px-[12px] pb-[12px] pt-[16px]">
          {loading ? (
            <Skeleton className={cn('h-[29px] w-[52px]', featured && 'bg-surface/25')} />
          ) : (
            <p
              className={cn(
                'text-[25px] font-bold leading-[29px]',
                featured ? 'text-surface' : 'text-text-primary',
              )}
            >
              {value}
            </p>
          )}
        </div>
      </div>

      <CardFooter
        className={cn(
          'h-[35px] flex-shrink-0 px-[10px] py-0 text-[13px] font-medium text-text-primary',
          featured ? 'border-surface/20 bg-surface' : 'border-border-subtle bg-surface-hover',
        )}
      >
        <span>See details</span>
        <ArrowRight aria-hidden="true" className="h-[12px] w-[12px]" strokeWidth={2} />
      </CardFooter>
    </Card>
  );
}
