import { TableCell, TableRow } from '../../../../components/ui/table';
import { Skeleton } from '../../../../components/ui/skeleton';
import { REPORT_COLUMNS } from '../constants/reportsConfig';

/** Row-shaped placeholders so the table does not collapse while loading. */
export function ReportsTableSkeleton({ rows = 5 }) {
  return Array.from({ length: rows }, (_, rowIndex) => (
    <TableRow key={`skeleton-${rowIndex}`} className="h-[46px] border-t border-border-subtle">
      {REPORT_COLUMNS.map(column => (
        <TableCell key={column.key} className="px-[12px] py-0">
          {column.key === 'identity' ? (
            <div className="flex items-center gap-[8px]">
              <Skeleton className="h-[32px] w-[32px] rounded-full" />
              <div className="space-y-[5px]">
                <Skeleton className="h-[11px] w-[104px]" />
                <Skeleton className="h-[9px] w-[136px]" />
              </div>
            </div>
          ) : (
            <Skeleton className="h-[11px] w-full max-w-[84px]" />
          )}
        </TableCell>
      ))}
    </TableRow>
  ));
}
