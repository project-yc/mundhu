import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import { REPORT_COLUMNS } from '../constants/reportsConfig';
import { formatDate, formatScore, getRowKey } from '../utils/reportRows';
import { IdentityCell } from './IdentityCell';
import { ReportStatusCell } from './ReportStatusCell';
import { RowActions } from './RowActions';
import { ReportsEmptyState } from './ReportsEmptyState';
import { ReportsTableSkeleton } from './ReportsTableSkeleton';

/**
 * Reports table. Column widths come from REPORT_COLUMNS via <colgroup> so the
 * layout stays fixed as content length varies (Figma total: 1097px).
 */
export function ReportsTable({
  rows,
  loading,
  searching,
  offset,
  assessmentName,
  onViewReport,
  pageSize,
}) {
  const isEmpty = !loading && rows.length === 0;

  return (
    <div className="overflow-hidden">
      <Table className="min-w-[920px] table-fixed">
        <caption className="sr-only">
          Candidate assessment reports, ranked by overall score
        </caption>
        <colgroup>
          {REPORT_COLUMNS.map(column => (
            <col key={column.key} style={{ width: `${column.width}px` }} />
          ))}
        </colgroup>

        <TableHeader>
          <TableRow className="bg-surface-hover hover:bg-surface-hover">
            {REPORT_COLUMNS.map(column => (
              <TableHead key={column.key} className="px-[12px]">
                {column.key === 'actions' ? (
                  <span className="pl-[12px]">{column.label}</span>
                ) : (
                  column.label
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <ReportsTableSkeleton rows={Math.min(pageSize, 5)} />
          ) : isEmpty ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={REPORT_COLUMNS.length} className="h-auto p-0">
                <ReportsEmptyState searching={searching} />
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow key={getRowKey(row, offset + index)} className="border-t border-border-subtle">
                {/* Server-side rank across the whole assessment — not the
                    position within the current page or search result. */}
                <TableCell className="px-[12px] font-medium">
                  {row.rank ?? offset + index + 1}
                </TableCell>

                <TableCell className="px-[12px]">
                  <IdentityCell name={row.name} email={row.email} avatarUrl={row.avatarUrl} />
                </TableCell>

                <TableCell className="px-[12px]">
                  <p className="truncate font-medium text-text-primary">
                    {row.assessmentName || assessmentName}
                  </p>
                </TableCell>

                <TableCell className="px-[12px] font-medium">
                  {formatDate(row.submittedAt)}
                </TableCell>

                <TableCell className="px-[12px] font-medium">
                  {formatScore(row.score)}
                </TableCell>

                <TableCell className="px-[12px]">
                  <ReportStatusCell row={row} onViewReport={() => onViewReport(row)} />
                </TableCell>

                <TableCell className="px-[12px]">
                  <RowActions />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
