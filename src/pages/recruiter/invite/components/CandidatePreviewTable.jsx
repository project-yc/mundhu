import { Trash2 } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../../../../components/ui/table.jsx';

// Shared candidate table used by the Individual tab (with row delete) and the
// Upload-file preview (read-only). `startIndex` offsets SL No. for pagination.
export function CandidatePreviewTable({ rows, startIndex = 0, showActions = false, onRemove }) {
  if (rows.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-[8px] border border-border-subtle bg-surface shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-page hover:bg-page">
            <TableHead className="w-[64px] bg-page">SL No.</TableHead>
            <TableHead className="bg-page">Candidate name</TableHead>
            <TableHead className="bg-page">Email</TableHead>
            {showActions && <TableHead className="w-[74px] bg-page">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={row.id}>
              <TableCell>{startIndex + i + 1}</TableCell>
              <TableCell>{row.name || <span className="italic text-text-muted">—</span>}</TableCell>
              <TableCell>{row.email}</TableCell>
              {showActions && (
                <TableCell>
                  <button
                    type="button"
                    onClick={() => onRemove(row.id)}
                    aria-label={`Remove ${row.email}`}
                    className="text-error/70 transition-colors hover:text-error"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
