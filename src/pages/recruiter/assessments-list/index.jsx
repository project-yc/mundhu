// Recruiter Assessments — all assessments for the org, table + metric cards.
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { TooltipProvider } from '../../../components/ui/tooltip';
import { AskAnythingBar } from '../../../components/recruiter/AskAnythingBar.jsx';
import { createAssessment } from '../../../api/recruiter/assessment.jsx';
import { useAssessmentsTable } from './hooks/useAssessmentsTable';
import { AssessmentsHeader } from './components/AssessmentsHeader';
import { AssessmentsMetricsGrid } from './components/AssessmentsMetricsGrid';
import { AssessmentsTable } from './components/AssessmentsTable';
import { AssessmentsPagination } from './components/AssessmentsPagination';

export default function AssessmentsListPage() {
  const navigate = useNavigate();
  const [duplicatingId, setDuplicatingId] = useState(null);
  const [duplicateError, setDuplicateError] = useState('');

  const {
    rows,
    metrics,
    loading,
    error,
    search,
    setSearch,
    totalCount,
    offset,
    page,
    setPage,
    totalPages,
    pageSize,
    refetch,
  } = useAssessmentsTable();

  const handleView = useCallback(
    row => navigate(`/recruiter/assessments/${row.id}`),
    [navigate],
  );

  // The builder has no resume/edit flow for an existing draft yet — this
  // opens a fresh builder rather than silently doing nothing.
  const handleEdit = useCallback(
    () => navigate('/recruiter/assessments/new'),
    [navigate],
  );

  const handleCreate = useCallback(
    () => navigate('/recruiter/assessments/new'),
    [navigate],
  );

  const handleDuplicate = useCallback(
    async row => {
      setDuplicateError('');
      setDuplicatingId(row.id);
      try {
        await createAssessment(
          `${row.name} (copy)`,
          row.description,
          row.durationMinutes,
          row.configJson,
        );
        await refetch();
      } catch (err) {
        setDuplicateError(err?.message || 'Failed to duplicate assessment.');
      } finally {
        setDuplicatingId(null);
      }
    },
    [refetch],
  );

  const errorMessage = error || duplicateError;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-full flex-col bg-page">
        <AskAnythingBar />

        <div className="min-h-0 flex-1 p-3 pt-0">
          <section className="min-h-[calc(100vh-76px)] rounded-[10px] border border-border-subtle bg-surface px-[39px] pb-[24px] pt-[42px]">
            <AssessmentsHeader search={search} onSearchChange={setSearch} onCreate={handleCreate} />

            {errorMessage && (
              <div
                role="alert"
                className="mt-[22px] flex items-center gap-3 rounded-[8px] border border-error-border bg-error-bg px-4 py-3"
              >
                <AlertCircle className="h-[17px] w-[17px] flex-shrink-0 text-error" />
                <p className="text-[13px] leading-[18px] text-error">{errorMessage}</p>
              </div>
            )}

            <div className="mt-[17px]">
              <AssessmentsMetricsGrid metrics={metrics} loading={loading} />
            </div>

            <div className="mt-[17px] overflow-hidden rounded-[10px] border border-border-subtle bg-surface">
              <AssessmentsTable
                rows={rows}
                loading={loading}
                searching={Boolean(search.trim())}
                offset={offset}
                pageSize={pageSize}
                onView={handleView}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                duplicatingId={duplicatingId}
              />

              {!loading && totalCount > 0 && (
                <AssessmentsPagination page={page} totalPages={totalPages} onPageChange={setPage} />
              )}
            </div>
          </section>
        </div>
      </div>
    </TooltipProvider>
  );
}
