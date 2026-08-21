import { useMemo, useState } from 'react';
import { CloudUpload, FileSpreadsheet, CheckCircle, X } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../../../components/ui/pagination.jsx';
import { getPaginationItems } from '../../../../utils/pagination.js';
import { CandidatePreviewTable } from './CandidatePreviewTable.jsx';

const PAGE_SIZE = 10;

function formatKb(bytes) {
  if (!bytes) return '';
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function UploadFileTab({ csvRows, csvFileName, csvFileSize, csvInputRef, onFile, onDrop, onClear }) {
  const [page, setPage] = useState(1);
  // Reset to page 1 whenever a new file is loaded (adjusted during render, not an effect).
  const [trackedFileName, setTrackedFileName] = useState(csvFileName);
  if (csvFileName !== trackedFileName) {
    setTrackedFileName(csvFileName);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(csvRows.length / PAGE_SIZE));

  const paginatedRows = useMemo(
    () => csvRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [csvRows, page],
  );
  const paginationItems = useMemo(() => getPaginationItems(page, totalPages), [page, totalPages]);

  if (csvRows.length === 0) {
    return (
      <label
        className="flex h-[196px] cursor-pointer flex-col items-center justify-center gap-6 rounded-[12px] border border-dashed border-[#b8c2cf] bg-[#fcfbfc] px-9 py-4 transition-colors hover:border-brand/50"
        onDragOver={e => e.preventDefault()}
        onDrop={onDrop}
      >
        <div className="flex flex-col items-center gap-2">
          <CloudUpload className="h-9 w-9 text-text-muted" strokeWidth={1.5} />
          <p className="text-center text-[14px] font-semibold text-text-primary">
            Choose a file or drag &amp; drop it here.
          </p>
          <p className="text-center text-[14px] text-text-secondary">txt, docx, pdf, jpeg, xlsx - Up to 50MB</p>
        </div>
        <span className="rounded-[8px] border border-border-subtle bg-surface px-[10px] py-2 text-[12px] font-medium text-text-secondary">
          Browse files
        </span>
        <input ref={csvInputRef} type="file" accept=".csv,text/csv" onChange={onFile} className="hidden" />
      </label>
    );
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start">
      <div className="flex-1">
        <div className="flex items-center justify-between rounded-[8px] border border-border-subtle bg-surface px-3 py-2.5">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-brand" />
            <div>
              <p className="text-[14px] text-text-primary">{csvFileName}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] text-text-secondary">{formatKb(csvFileSize)}</span>
                <CheckCircle className="h-3 w-3 text-success" />
                <span className="text-[12px] text-success">Completed</span>
              </div>
            </div>
          </div>
          <button type="button" onClick={onClear} aria-label="Remove file" className="text-text-muted hover:text-error">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1">
        <CandidatePreviewTable rows={paginatedRows} startIndex={(page - 1) * PAGE_SIZE} />
        {totalPages > 1 && (
          <Pagination className="mt-3 justify-between">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} />
              </PaginationItem>
              {paginationItems.map((item, i) => (
                <PaginationItem key={`${item}-${i}`}>
                  {item === 'ellipsis' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink isActive={item === page} onClick={() => setPage(item)}>
                      {item}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
