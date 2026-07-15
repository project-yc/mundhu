// ReportsScreen - all scored candidates with reports across all assessments
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  ChevronDown,
  FileText,
  Image,
  Loader,
  Mic,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
} from 'lucide-react';
import { getAllAssessments, getCandidatesWithReports } from '../../api/recruiter/assessment.jsx';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../components/ui/pagination.jsx';
import { getPaginationItems } from '../../utils/pagination.js';

const POLL_INTERVAL_MS = 8000;

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function getSubmissionDate(candidate) {
  return (
    candidate.submitted_at ||
    candidate.submission_date ||
    candidate.completed_at ||
    candidate.updated_at ||
    candidate.created_at
  );
}

function getAssessmentName(assessments, selectedId) {
  return assessments.find(assessment => String(assessment.id) === selectedId)?.name || 'Assessment';
}

function reportIsReady(candidate) {
  return candidate.report_status === 'completed' && Boolean(candidate.session_id);
}

function isShortlisted(candidate) {
  const values = [
    candidate.stage,
    candidate.pipeline_stage,
    candidate.status,
    candidate.report_status,
  ].map(value => String(value || '').toLowerCase());

  return Boolean(candidate.shortlisted || candidate.is_shortlisted || values.includes('shortlisted'));
}

function MetricIcon({ active = false }) {
  return (
    <span className={`flex h-[34px] w-[34px] items-center justify-center rounded-[7px] ${active ? 'bg-surface text-[var(--color-report-metric-icon-text)]' : 'bg-[var(--color-report-metric-icon-bg)] text-surface'}`}>
      <BarChart3 className="h-[18px] w-[18px]" strokeWidth={2.2} />
    </span>
  );
}

function MetricCard({ label, value, sublabel, featured = false }) {
  return (
    <div
      className={`min-h-[145px] overflow-hidden rounded-[10px] border border-border-default ${
        featured
          ? 'bg-[linear-gradient(135deg,var(--color-report-metric-start)_0%,var(--color-report-metric-end)_100%)] text-surface'
          : 'bg-surface text-text-primary'
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start gap-[12px] px-[12px] pt-[11px]">
          <MetricIcon active={featured} />
          <div className="min-w-0 flex-1 pt-[1px]">
            <p className={`truncate text-[16px] font-bold leading-[20px] ${featured ? 'text-surface' : 'text-text-primary'}`}>
              {label}
            </p>
            <p className={`mt-[2px] truncate text-[10px] leading-none ${featured ? 'text-surface/70' : 'text-text-faint'}`}>
              {sublabel}
            </p>
          </div>
          <MoreHorizontal className={`h-[17px] w-[17px] flex-shrink-0 ${featured ? 'text-surface' : 'text-text-primary'}`} strokeWidth={2.2} />
        </div>

        <div className="mt-auto px-[12px] pb-[13px]">
          <p className={`text-[25px] font-bold leading-none ${featured ? 'text-surface' : 'text-text-primary'}`}>
            {value}
          </p>
        </div>

        <div className={`mt-auto flex h-[35px] items-center justify-between border-t px-[11px] text-[13px] font-medium ${featured ? 'border-surface/20 bg-surface text-text-primary' : 'border-border-subtle bg-surface-hover text-text-primary'}`}>
          <span>See details</span>
          <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

function ReportStatusButton({ candidate, onViewReport }) {
  if (!reportIsReady(candidate)) {
    return (
      <span className="inline-flex h-[30px] min-w-[96px] items-center justify-center rounded-[8px] border border-border-subtle bg-surface text-[14px] font-medium text-text-muted shadow-card">
        Pending
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onViewReport}
      className="inline-flex h-[30px] min-w-[96px] items-center justify-center rounded-[8px] border border-border-default bg-surface px-[12px] text-[14px] font-medium text-text-primary shadow-card transition-colors hover:bg-surface-hover"
    >
      View report
    </button>
  );
}

export default function ReportsScreen() {
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assLoading, setAssLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pollRef = useRef(null);

  useEffect(() => {
    getAllAssessments()
      .then(data => {
        const list = data.data || data;
        setAssessments(list);
        if (list.length > 0) setSelectedId(String(list[0].id));
      })
      .catch(() => setError('Failed to load assessments.'))
      .finally(() => setAssLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setCandidates([]);
      setError('');
      setCurrentPage(1);
    });

    getCandidatesWithReports(selectedId)
      .then(data => {
        if (!cancelled) setCandidates((data.data || data).candidates || []);
      })
      .catch(err => {
        if (!cancelled) setError(err.message || 'Failed to load reports.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    const hasActive = candidates.some(candidate => (
      candidate.report_status === 'pending' || candidate.report_status === 'processing'
    ));

    if (hasActive && selectedId) {
      pollRef.current = setInterval(() => {
        getCandidatesWithReports(selectedId)
          .then(data => setCandidates((data.data || data).candidates || []))
          .catch(() => {});
      }, POLL_INTERVAL_MS);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [candidates, selectedId]);

  const submitted = useMemo(() => (
    candidates.filter(candidate => candidate.status === 'Submitted')
  ), [candidates]);

  const reportsReady = useMemo(() => (
    submitted.filter(candidate => candidate.report_status === 'completed')
  ), [submitted]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return submitted;

    return submitted.filter(candidate => (
      candidate.candidate_name?.toLowerCase().includes(query) ||
      candidate.candidate_email?.toLowerCase().includes(query)
    ));
  }, [submitted, search]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const effectivePage = Math.min(currentPage, totalPages);
  const pageOffset = (effectivePage - 1) * pageSize;
  const paginatedCandidates = filtered.slice(pageOffset, pageOffset + pageSize);
  const paginationItems = useMemo(
    () => getPaginationItems(effectivePage, totalPages),
    [effectivePage, totalPages],
  );

  const avgScore = useMemo(() => {
    const scored = reportsReady.filter(candidate => Number.isFinite(Number(candidate.overall_score)));
    if (scored.length === 0) return 0;
    const total = scored.reduce((sum, candidate) => sum + Number(candidate.overall_score), 0);
    return Math.round(total / scored.length);
  }, [reportsReady]);

  const shortlistedCount = submitted.filter(isShortlisted).length;
  const assessmentName = getAssessmentName(assessments, selectedId);

  const metrics = [
    {
      label: 'Total Submissions',
      value: submitted.length,
      sublabel: 'Number of candidates gave the test',
      featured: true,
    },
    {
      label: 'Total Reports',
      value: reportsReady.length,
      sublabel: 'Number of candidates gave the test',
    },
    {
      label: 'Average Score',
      value: avgScore,
      sublabel: 'Number of candidates gave the test',
    },
    {
      label: 'Shortlisted Candidates',
      value: shortlistedCount,
      sublabel: 'Number of candidates gave the test',
    },
  ];

  return (
    <div className="flex min-h-full flex-col bg-page">
      <div className="min-h-0 flex-1 p-3 pt-0">
        <section className="min-h-[calc(100vh-76px)] rounded-[10px] border border-border-subtle bg-surface px-[38px] pb-[24px] pt-[41px]">
          <div className="flex flex-col gap-[18px] lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-[20px] font-bold leading-[24px] text-text-primary">Reports</h1>
              <p className="mt-[6px] text-[15px] leading-[18px] text-text-secondary">
                Candidate assessment reports - scored and ranked by performance.
              </p>
            </div>

            <div className="relative w-full lg:w-[460px]">
              {assLoading ? (
                <div className="flex h-[42px] items-center gap-2 rounded-[8px] border border-border-default px-[12px] text-[14px] text-text-secondary">
                  <Loader className="h-[15px] w-[15px] animate-spin" />
                  Loading...
                </div>
              ) : (
                <>
                  <select
                    value={selectedId}
                    onChange={event => setSelectedId(event.target.value)}
                    className="h-[42px] w-full appearance-none rounded-[8px] border border-border-default bg-surface px-[12px] pr-[38px] text-[14px] text-text-primary outline-none transition-colors focus:border-border-strong"
                  >
                    {assessments.map(assessment => (
                      <option key={assessment.id} value={assessment.id}>
                        {assessment.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-[12px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-text-muted" strokeWidth={1.8} />
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-[22px] flex items-center gap-3 rounded-[8px] border border-error-border bg-error-bg px-4 py-3">
              <AlertCircle className="h-[17px] w-[17px] flex-shrink-0 text-error" />
              <p className="text-[13px] leading-[18px] text-error">{error}</p>
            </div>
          )}

          <div className="mt-[34px] flex flex-col gap-[8px] lg:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-[11px] top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-text-primary" strokeWidth={1.8} />
              <input
                value={search}
                onChange={event => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Ask anything..."
                className="h-[42px] w-full rounded-[8px] border border-border-default bg-surface pl-[33px] pr-[12px] text-[14px] text-text-primary outline-none placeholder:text-text-muted transition-colors focus:border-border-strong"
              />
            </div>
            <button
              type="button"
              className="h-[42px] rounded-[8px] bg-[var(--color-assessment-cta)] px-[25px] text-[14px] font-bold text-[var(--color-assessment-cta-text)] transition-colors hover:bg-[var(--color-assessment-cta-hover)]"
            >
              Apply filters
            </button>
          </div>

          <div className="mt-[17px] grid grid-cols-1 gap-[8px] md:grid-cols-2 xl:grid-cols-4">
            {metrics.map(metric => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>

          <div className="mt-[17px] overflow-hidden rounded-[10px] border border-border-subtle bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse text-left">
                <thead>
                  <tr className="h-[43px] bg-surface-hover text-[14px] font-medium text-text-primary">
                    <th className="w-[44px] px-[12px]">#</th>
                    <th className="w-[260px] px-[12px]">Identity</th>
                    <th className="px-[12px]">Assessment</th>
                    <th className="w-[138px] px-[12px]">Submission Date</th>
                    <th className="w-[112px] px-[12px]">Score</th>
                    <th className="w-[138px] px-[12px]">Report status</th>
                    <th className="w-[104px] px-[12px]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="h-[160px] text-center">
                        <Loader className="mx-auto h-[22px] w-[22px] animate-spin text-brand" />
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="h-[160px] text-center">
                        <FileText className="mx-auto h-[28px] w-[28px] text-text-faint" />
                        <p className="mt-[10px] text-[14px] font-semibold text-text-primary">No reports found</p>
                        <p className="mt-[4px] text-[13px] text-text-secondary">Reports appear here after candidates submit.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedCandidates.map((candidate, index) => {
                      const score = Number.isFinite(Number(candidate.overall_score))
                        ? `${Math.round(Number(candidate.overall_score))}/100`
                        : '-';
                      const rowNumber = pageOffset + index + 1;

                      return (
                        <tr key={candidate.id || candidate.session_id || `${candidate.candidate_email}-${rowNumber}`} className="h-[46px] border-t border-border-subtle">
                          <td className="px-[12px] text-[14px] font-medium text-text-secondary">{rowNumber}</td>
                          <td className="px-[12px]">
                            <div className="flex min-w-0 items-center gap-[9px]">
                              <div className="flex h-[31px] w-[31px] flex-shrink-0 items-center justify-center rounded-full border border-border-default bg-surface-muted text-[11px] font-bold text-text-secondary">
                                {getInitials(candidate.candidate_name)}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-[14px] font-bold leading-[17px] text-text-primary">
                                  {candidate.candidate_name || 'Unknown'}
                                </p>
                                <p className="truncate text-[12px] leading-[15px] text-[var(--color-report-email-text)]">
                                  {candidate.candidate_email || '-'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="max-w-[280px] px-[12px]">
                            <p className="truncate text-[14px] font-medium text-text-primary">{assessmentName}</p>
                          </td>
                          <td className="px-[12px] text-[14px] font-medium text-text-secondary">
                            {formatDate(getSubmissionDate(candidate))}
                          </td>
                          <td className="px-[12px] text-[14px] font-medium text-text-secondary">{score}</td>
                          <td className="px-[12px]">
                            <ReportStatusButton
                              candidate={candidate}
                              onViewReport={() => navigate(`/recruiter/reports/${selectedId}/${candidate.session_id}`)}
                            />
                          </td>
                          <td className="px-[12px]">
                            <div className="flex items-center gap-[12px] text-[var(--color-assessment-step-active)]">
                              <span aria-hidden="true">
                                <Trash2 className="h-[18px] w-[18px]" strokeWidth={1.8} />
                              </span>
                              <span aria-hidden="true">
                                <Pencil className="h-[17px] w-[17px]" strokeWidth={1.8} />
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {filtered.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-[13px] text-text-muted">
                Showing {pageOffset + 1} to {Math.min(pageOffset + pageSize, filtered.length)} of {filtered.length} reports
              </p>
              <div className="flex items-center gap-3">
                <div className="relative flex items-center gap-2">
                  <span className="text-[13px] text-text-muted">Rows per page</span>
                  <select
                    value={pageSize}
                    onChange={event => {
                      setPageSize(Number(event.target.value));
                      setCurrentPage(1);
                    }}
                    className="h-8 appearance-none rounded-lg border border-border-default bg-surface px-2 pr-7 text-[13px] text-text-primary outline-none transition-colors focus:border-border-strong"
                  >
                    {[5, 10, 25, 50].map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" strokeWidth={1.8} />
                </div>
                {totalPages > 1 && (
                  <Pagination className="mx-0 w-auto justify-end">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(Math.max(1, effectivePage - 1))}
                          disabled={effectivePage === 1}
                        />
                      </PaginationItem>
                      {paginationItems.map((item, index) => (
                        <PaginationItem key={`${item}-${index}`}>
                          {item === 'ellipsis' ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              isActive={item === effectivePage}
                              onClick={() => setCurrentPage(item)}
                            >
                              {item}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(Math.min(totalPages, effectivePage + 1))}
                          disabled={effectivePage === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
