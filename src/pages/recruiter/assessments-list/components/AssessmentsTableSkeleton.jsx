import { TableCell, TableRow } from '../../../../components/ui/table';
import { Skeleton } from '../../../../components/ui/skeleton';
import { ASSESSMENT_COLUMNS } from '../constants/assessmentsConfig';

/** Row-shaped placeholders so the table does not collapse while loading. */
export function AssessmentsTableSkeleton({ rows = 5 }) {
  return Array.from({ length: rows }, (_, rowIndex) => (
    <TableRow key={`skeleton-${rowIndex}`} className="h-[46px] border-t border-border-subtle">
      {ASSESSMENT_COLUMNS.map(column => (
        <TableCell key={column.key} className="px-[12px] py-0">
          {column.key === 'name' ? (
            <div className="space-y-[5px]">
              <Skeleton className="h-[11px] w-[180px]" />
              <Skeleton className="h-[9px] w-[220px]" />
            </div>
          ) : (
            <Skeleton className="h-[11px] w-full max-w-[84px]" />
          )}
        </TableCell>
      ))}
    </TableRow>
  ));
}
