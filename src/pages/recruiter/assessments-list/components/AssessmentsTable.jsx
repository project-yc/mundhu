import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import { ASSESSMENT_COLUMNS } from '../constants/assessmentsConfig';
import { formatCompletionRate, formatDate, getRowKey } from '../utils/assessmentRows';
import { StatusBadge } from './StatusBadge';
import { RowActions } from './RowActions';
import { AssessmentsEmptyState } from './AssessmentsEmptyState';
import { AssessmentsTableSkeleton } from './AssessmentsTableSkeleton';

/**
 * Assessments table. Column widths come from ASSESSMENT_COLUMNS via
 * <colgroup> so the layout stays fixed as content length varies.
 */
export function AssessmentsTable({
  rows,
  loading,
  searching,
  offset,
  pageSize,
  onView,
  onEdit,
  onDuplicate,
  duplicatingId,
}) {
  const isEmpty = !loading && rows.length === 0;

  return (
    <div className="overflow-hidden">
      <Table className="min-w-[1050px] table-fixed">
        <caption className="sr-only">Assessments, most recently created first</caption>
        <colgroup>
          {ASSESSMENT_COLUMNS.map(column => (
            <col key={column.key} style={{ width: `${column.width}px` }} />
          ))}
        </colgroup>

        <TableHeader>
          <TableRow className="bg-surface-hover hover:bg-surface-hover">
            {ASSESSMENT_COLUMNS.map(column => (
              <TableHead key={column.key} className="px-[12px]">
                {column.key === 'actions' ? (
                  <span className="pl-[10px]">{column.label}</span>
                ) : (
                  column.label
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <AssessmentsTableSkeleton rows={Math.min(pageSize, 5)} />
          ) : isEmpty ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={ASSESSMENT_COLUMNS.length} className="h-auto p-0">
                <AssessmentsEmptyState searching={searching} />
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow key={getRowKey(row, offset + index)} className="border-t border-border-subtle">
                <TableCell className="px-[12px]">
                  <p className="truncate text-[14px] font-bold leading-[18px] text-text-primary">
                    {row.name}
                  </p>
                  {row.description && (
                    <p className="mt-[2px] truncate text-[12px] leading-[16px] text-text-secondary">
                      {row.description}
                    </p>
                  )}
                </TableCell>

                <TableCell className="px-[12px]">
                  <StatusBadge status={row.status} />
                </TableCell>

                <TableCell className="px-[12px] font-medium">
                  {formatDate(row.createdAt)}
                </TableCell>

                <TableCell className="px-[12px] font-medium">
                  {formatDate(row.endDate)}
                </TableCell>

                <TableCell className="px-[12px] font-medium">
                  {row.submittedCount} / {row.invitedCount}
                </TableCell>

                <TableCell className="px-[12px] font-medium">
                  {formatCompletionRate(row.completionRate)}
                </TableCell>

                <TableCell className="px-[12px]">
                  <RowActions
                    row={row}
                    onView={onView}
                    onEdit={onEdit}
                    onDuplicate={onDuplicate}
                    duplicating={duplicatingId === row.id}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
