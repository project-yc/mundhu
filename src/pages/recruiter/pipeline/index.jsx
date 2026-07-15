import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ChevronDown,
  Download,
  Filter,
  ListFilter,
  Loader,
  Share2,
} from 'lucide-react';

import {
  getNeedsAction,
  getPipeline,
  updatePipelineCandidate,
} from '../../../api/recruiter/pipeline.jsx';
import { AskAnythingBar } from '../../../components/recruiter/AskAnythingBar';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../../components/ui/pagination.jsx';
import { cn } from '../../../lib/utils';
import { getPaginationItems } from '../../../utils/pagination.js';

const PIPELINE_POLL_MS = 10000;

const TAB_CONFIG = [
  { key: 'all', label: 'All' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'reviewing', label: 'Reviewing' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'hired', label: 'Hired' },
  { key: 'rejected', label: 'Rejected' },
];

const STAGE_OPTIONS = [
  { key: 'shortlisted', label: 'Shortlisted', apiStage: 'shortlisted' },
  { key: 'rejected', label: 'Rejected', apiStage: 'rejected' },
  { key: 'hired', label: 'Hired', apiStage: 'hired' },
  { key: 'submitted', label: 'Submitted', apiStage: 'new' },
  { key: 'reviewing', label: 'Reviewing', apiStage: 'reviewing' },
];

const STAGE_META = {
  shortlisted: {
    label: 'Shortlisted',
    text: 'var(--color-pipeline-stage-shortlisted-text)',
    bg: 'var(--color-pipeline-stage-shortlisted-bg)',
    border: 'var(--color-pipeline-stage-shortlisted-border)',
  },
  rejected: {
    label: 'Rejected',
    text: 'var(--color-pipeline-stage-rejected-text)',
    bg: 'var(--color-pipeline-stage-rejected-bg)',
    border: 'var(--color-pipeline-stage-rejected-border)',
  },
  hired: {
    label: 'Hired',
    text: 'var(--color-pipeline-stage-hired-text)',
    bg: 'var(--color-pipeline-stage-hired-bg)',
    border: 'var(--color-pipeline-stage-hired-border)',
  },
  submitted: {
    label: 'Submitted',
    text: 'var(--color-pipeline-stage-submitted-text)',
    bg: 'var(--color-pipeline-stage-submitted-bg)',
    border: 'var(--color-pipeline-stage-submitted-border)',
  },
  reviewing: {
    label: 'Reviewing',
    text: 'var(--color-pipeline-stage-reviewing-text)',
    bg: 'var(--color-pipeline-stage-reviewing-bg)',
    border: 'var(--color-pipeline-stage-reviewing-border)',
  },
};

function getCardId(card) {
  return card?.id ?? card?.instance_id ?? card?.assessment_instance_id;
}

function normalizeStage(card) {
  const stage = String(card?.stage || '').toLowerCase();
  if (stage === 'shortlisted' || stage === 'hired' || stage === 'rejected' || stage === 'reviewing') return stage;
  if (stage === 'sent_to_hm') return 'reviewing';
  return 'submitted';
}

function getCardName(card) {
  return card?.candidate_name || card?.candidate?.name || 'Candidate';
}

function getCardEmail(card) {
  return card?.candidate_email || card?.candidate?.email || '';
}

function getAssessmentName(card, selectedAssessment) {
  return card?.assessment_name || card?.assessment?.name || selectedAssessment?.name || 'Assessment';
}

function formatDate(value) {
  if (!value) return '--/--/----';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--/--/----';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatScore(card) {
  const rawScore = card?.fit_score ?? card?.score ?? card?.overall_score;
  if (rawScore === null || rawScore === undefined || Number.isNaN(Number(rawScore))) return '--/100';
  return `${String(Math.round(Number(rawScore))).padStart(2, '0')}/100`;
}

function reportIsReady(card) {
  return card?.report_status === 'completed' || card?.report_status === 'ready' || card?.report_status === 'generated';
}

function CandidateAvatar({ card }) {
  const name = getCardName(card);
  const avatarUrl = card?.avatar_url || card?.candidate_avatar || card?.candidate?.avatar_url || card?.candidate?.profile_image;
  const initials = name.split(/\s+/).filter(Boolean).map(part => part[0]).slice(0, 2).join('').toUpperCase() || 'C';

  return (
    <div className="h-[31px] w-[31px] flex-shrink-0 overflow-hidden rounded-full border border-border-default bg-surface-muted text-[10px] font-bold text-text-secondary">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">{initials}</div>
      )}
    </div>
  );
}

function StageSelect({ card, onChange }) {
  const stage = normalizeStage(card);
  const meta = STAGE_META[stage] || STAGE_META.submitted;

  return (
    <div
      className="relative inline-flex h-[31px] min-w-[91px] items-center rounded-[8px] border text-[13px] leading-none"
      style={{
        color: meta.text,
        backgroundColor: meta.bg,
        borderColor: meta.border,
      }}
    >
      <select
        value={stage}
        onChange={event => onChange(card, event.target.value)}
        className="h-full w-full appearance-none rounded-[8px] bg-transparent pl-[10px] pr-[27px] text-[13px] font-normal outline-none"
        aria-label={`Stage for ${getCardName(card)}`}
      >
        {STAGE_OPTIONS.map(option => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-[9px] top-1/2 h-[14px] w-[14px] -translate-y-1/2" strokeWidth={2.4} />
    </div>
  );
}

function AssessmentSelect({ assessments, selectedId, onSelect }) {
  return (
    <div className="relative h-[42px] w-full md:w-[460px]">
      <select
        value={selectedId || ''}
        onChange={event => onSelect(event.target.value || null)}
        className="h-full w-full appearance-none rounded-[7px] border border-[var(--color-pipeline-selected)] bg-surface px-[11px] pr-[40px] text-[14px] text-text-primary outline-none transition-colors focus:border-[var(--color-pipeline-selected)]"
        aria-label="Select assessment"
      >
        {assessments.length === 0 ? (
          <option value="">Select assessment</option>
        ) : (
          assessments.map(assessment => (
            <option key={assessment.id} value={assessment.id}>
              {assessment.name}
            </option>
          ))
        )}
      </select>
      <ChevronDown className="pointer-events-none absolute right-[13px] top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-text-muted" strokeWidth={1.8} />
    </div>
  );
}

function PipelineTable({
  cards,
  loading,
  selectedAssessment,
  selectedIds,
  onToggleAll,
  onToggleRow,
  onStageChange,
  onViewReport,
}) {
  const allSelected = cards.length > 0 && cards.every(card => selectedIds.has(getCardId(card)));

  if (loading) {
    return (
      <div className="flex h-[314px] items-center justify-center rounded-[8px] border border-border-subtle bg-surface">
        <Loader className="h-[22px] w-[22px] animate-spin text-brand" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex h-[314px] flex-col items-center justify-center rounded-[8px] border border-border-subtle bg-surface text-center">
        <p className="text-[15px] font-semibold text-text-primary">No candidates found</p>
        <p className="mt-1 text-[13px] text-text-secondary">Candidates will appear here once they enter this pipeline.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[8px] border border-border-subtle bg-surface shadow-[0_1px_3px_var(--color-pipeline-shadow)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1098px] border-collapse text-left">
          <thead>
            <tr className="h-[43px] bg-[var(--color-pipeline-table-header)] text-[14px] font-medium text-text-secondary">
              <th className="w-[45px] px-[12px]">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                  className="h-[16px] w-[16px] rounded-[4px] border-border-strong accent-[var(--color-pipeline-selected)]"
                  aria-label="Select all candidates"
                />
              </th>
              <th className="w-[269px] px-[10px]">Candidate&apos;s name</th>
              <th className="w-[247px] px-[10px]">Assessment</th>
              <th className="w-[139px] px-[10px]">Submission Date</th>
              <th className="w-[138px] px-[10px]">Stage</th>
              <th className="w-[112px] px-[10px]">Score</th>
              <th className="w-[148px] px-[10px]">Report status</th>
            </tr>
          </thead>
          <tbody>
            {cards.map(card => {
              const id = getCardId(card);
              const selected = selectedIds.has(id);
              const submittedAt = card.submitted_at || card.completed_at || card.started_at || card.invited_at;

              return (
                <tr key={id} className="h-[46px] border-t border-border-subtle bg-surface text-[14px] text-text-primary">
                  <td className="px-[12px] align-middle">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => onToggleRow(id)}
                      className="h-[16px] w-[16px] rounded-[4px] border-border-strong accent-[var(--color-pipeline-selected)]"
                      aria-label={`Select ${getCardName(card)}`}
                    />
                  </td>
                  <td className="px-[10px] align-middle">
                    <div className="flex min-w-0 items-center gap-[10px]">
                      <CandidateAvatar card={card} />
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold leading-[17px] text-text-primary">{getCardName(card)}</p>
                        <p className="truncate text-[11px] leading-[14px] text-[var(--color-report-email-text)]">{getCardEmail(card)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-[247px] px-[10px] align-middle">
                    <p className="truncate text-[14px] leading-[18px] text-text-primary">{getAssessmentName(card, selectedAssessment)}</p>
                  </td>
                  <td className="px-[10px] align-middle text-[14px] text-text-secondary">{formatDate(submittedAt)}</td>
                  <td className="px-[10px] align-middle">
                    <StageSelect card={card} onChange={onStageChange} />
                  </td>
                  <td className="px-[10px] align-middle text-[14px] text-text-primary">{formatScore(card)}</td>
                  <td className="px-[10px] align-middle">
                    {reportIsReady(card) ? (
                      <button
                        type="button"
                        onClick={() => onViewReport(card)}
                        className="h-[30px] min-w-[96px] rounded-[8px] border border-border-default bg-surface px-[12px] text-[14px] text-text-primary shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition-colors hover:border-border-strong"
                      >
                        View report
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="h-[30px] min-w-[96px] rounded-[8px] border border-border-subtle bg-surface px-[12px] text-[14px] text-text-muted shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
                      >
                        Pending
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PipelineScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [pipeline, setPipeline] = useState(null);
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needsLoading, setNeedsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pollRef = useRef(null);

  const loadPipeline = useCallback(async (assessmentId) => {
    setLoading(true);
    setError('');
    try {
      const res = await getPipeline(assessmentId);
      const data = res.data || res;
      setPipeline(data);
      if (data.selected_assessment_id) {
        setSelectedAssessment(prev => prev || data.selected_assessment_id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load pipeline');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadNeeds = useCallback(async (assessmentId) => {
    setNeedsLoading(true);
    try {
      const res = await getNeedsAction(assessmentId);
      const data = res.data || res;
      setNeeds(data.items || []);
    } catch {
      setNeeds([]);
    } finally {
      setNeedsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPipeline(selectedAssessment);
  }, [loadPipeline, selectedAssessment]);

  useEffect(() => {
    loadNeeds(selectedAssessment);
  }, [loadNeeds, selectedAssessment]);

  const assessments = pipeline?.assessments || [];
  const selectedAssessmentData = assessments.find(assessment => assessment.id === selectedAssessment) || assessments[0] || null;

  const allCards = useMemo(() => {
    const byId = new Map();
    const addCard = (card, fallbackStage) => {
      const id = getCardId(card);
      if (!id || byId.has(id)) return;
      byId.set(id, {
        ...card,
        stage: card.stage || fallbackStage,
      });
    };

    Object.entries(pipeline?.columns || {}).forEach(([stage, cards]) => {
      (cards || []).forEach(card => addCard(card, stage));
    });
    (pipeline?.trays?.in_flight || []).forEach(card => addCard(card, 'submitted'));
    (pipeline?.trays?.expired || []).forEach(card => addCard(card, card.stage || 'submitted'));
    (needs || []).forEach(card => addCard(card, card.stage || 'submitted'));

    return Array.from(byId.values());
  }, [needs, pipeline]);

  useEffect(() => {
    setSelectedIds(prev => {
      const validIds = new Set(allCards.map(card => getCardId(card)));
      const next = new Set([...prev].filter(id => validIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [allCards]);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);

    const needsPoll = allCards.some(
      card => card.report_status === 'pending' ||
        card.report_status === 'processing' ||
        card.status === 'Invited' ||
        card.status === 'In Progress',
    );

    if (needsPoll && selectedAssessment) {
      pollRef.current = setInterval(async () => {
        const res = await getPipeline(selectedAssessment).catch(() => null);
        if (res) setPipeline(res.data || res);
      }, PIPELINE_POLL_MS);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [allCards, selectedAssessment]);

  const stageCounts = useMemo(() => {
    const counts = Object.fromEntries(TAB_CONFIG.map(tab => [tab.key, 0]));
    counts.all = allCards.length;
    allCards.forEach(card => {
      const stage = normalizeStage(card);
      counts[stage] = (counts[stage] || 0) + 1;
    });
    return counts;
  }, [allCards]);

  const visibleCards = useMemo(() => {
    if (activeTab === 'all') return allCards;
    return allCards.filter(card => normalizeStage(card) === activeTab);
  }, [activeTab, allCards]);

  const totalPages = Math.ceil(visibleCards.length / pageSize) || 1;
  const effectivePage = Math.min(currentPage, totalPages);
  const pageOffset = (effectivePage - 1) * pageSize;
  const paginatedCards = visibleCards.slice(pageOffset, pageOffset + pageSize);
  const paginationItems = useMemo(
    () => getPaginationItems(effectivePage, totalPages),
    [effectivePage, totalPages],
  );

  const mergeUpdatedCard = useCallback((updated) => {
    setPipeline(prev => {
      if (!prev) return prev;
      const columns = { ...(prev.columns || {}) };
      const trays = { ...(prev.trays || {}) };

      for (const key of Object.keys(columns)) {
        columns[key] = (columns[key] || []).filter(card => getCardId(card) !== getCardId(updated));
      }
      trays.in_flight = (trays.in_flight || []).filter(card => getCardId(card) !== getCardId(updated));
      trays.expired = (trays.expired || []).filter(card => getCardId(card) !== getCardId(updated));

      const targetStage = updated.stage || 'new';
      if (columns[targetStage]) {
        columns[targetStage] = [updated, ...columns[targetStage]];
      } else if (targetStage === 'rejected' || targetStage === 'hired' || targetStage === 'shortlisted' || targetStage === 'reviewing') {
        columns[targetStage] = [updated, ...(columns[targetStage] || [])];
      } else {
        columns.new = [updated, ...(columns.new || [])];
      }

      const totals = Object.fromEntries(Object.entries(columns).map(([key, cards]) => [key, cards.length]));
      totals.in_flight = (trays.in_flight || []).length;
      totals.expired = (trays.expired || []).length;
      return { ...prev, columns, trays, totals };
    });

    setNeeds(prev => prev.map(card => (getCardId(card) === getCardId(updated) ? { ...card, ...updated } : card)));
  }, []);

  const handleStageChange = useCallback(async (card, nextStageKey) => {
    const option = STAGE_OPTIONS.find(item => item.key === nextStageKey);
    if (!option) return;

    const previous = card;
    const optimistic = { ...card, stage: option.apiStage };
    mergeUpdatedCard(optimistic);

    try {
      const res = await updatePipelineCandidate(getCardId(card), { stage: option.apiStage });
      const updated = res?.data || res || optimistic;
      mergeUpdatedCard({ ...optimistic, ...updated });
    } catch (err) {
      mergeUpdatedCard(previous);
      setError(err.message || 'Failed to update candidate stage');
    }
  }, [mergeUpdatedCard]);

  const handleAssessmentSelect = useCallback((id) => {
    setSelectedAssessment(id);
    setSelectedIds(new Set());
    setCurrentPage(1);
  }, []);

  const handleTabChange = useCallback((key) => {
    setActiveTab(key);
    setCurrentPage(1);
  }, []);

  const handleToggleAll = useCallback(() => {
    setSelectedIds(prev => {
      const pageIds = paginatedCards.map(card => getCardId(card)).filter(Boolean);
      const allSelected = pageIds.length > 0 && pageIds.every(id => prev.has(id));
      if (allSelected) {
        const next = new Set(prev);
        pageIds.forEach(id => next.delete(id));
        return next;
      }
      return new Set([...prev, ...pageIds]);
    });
  }, [paginatedCards]);

  const handleToggleRow = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleViewReport = useCallback((card) => {
    if (card.assessment_id && card.session_id) {
      navigate(`/recruiter/reports/${card.assessment_id}/${card.session_id}`);
    }
  }, [navigate]);

  const selectedCount = selectedIds.size;
  const candidateCount = selectedAssessmentData?.total ?? allCards.length;

  return (
    <div className="min-h-full bg-[var(--color-pipeline-canvas)] font-sans antialiased">
      <AskAnythingBar className="bg-[var(--color-pipeline-canvas)]" />

      <div className="px-3 pb-[18px] pt-[7px]">
        <section className="min-h-[calc(100vh-76px)] rounded-[10px] bg-[var(--color-pipeline-panel)] px-[38px] pb-[31px] pt-[43px]">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <h1 className="text-[20px] font-bold leading-[24px] text-text-primary">Pipelines</h1>
              <p className="mt-[4px] text-[14px] leading-[18px] text-text-secondary">
                {selectedAssessmentData?.name || 'Assessment'} · {candidateCount} candidates
              </p>
            </div>
            <AssessmentSelect
              assessments={assessments}
              selectedId={selectedAssessment || selectedAssessmentData?.id}
              onSelect={handleAssessmentSelect}
            />
          </div>

          <div className="mt-[26px] flex flex-col gap-[12px] xl:flex-row xl:items-center xl:justify-between">
            <div className="inline-flex h-[44px] w-fit items-center rounded-[22px] border border-border-subtle bg-[var(--color-pipeline-toolbar)] p-[3px]">
              {TAB_CONFIG.map(tab => {
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => handleTabChange(tab.key)}
                    className={cn(
                      'h-[36px] rounded-[18px] px-[13px] text-[14px] leading-none transition-colors',
                      active
                        ? 'border border-border-default bg-surface text-text-primary shadow-[0_1px_2px_rgba(15,23,42,0.08)]'
                        : 'text-text-secondary hover:text-text-primary',
                    )}
                  >
                    {tab.label} <span className="text-text-muted">({stageCounts[tab.key] || 0})</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-[7px]">
              <button type="button" className="flex h-[43px] w-[43px] items-center justify-center rounded-[8px] border border-border-subtle bg-surface text-text-primary shadow-[0_4px_10px_var(--color-pipeline-shadow)]">
                <Share2 className="h-[17px] w-[17px]" strokeWidth={1.8} />
              </button>
              <button type="button" className="flex h-[43px] w-[43px] items-center justify-center rounded-[8px] border border-border-subtle bg-surface text-text-primary shadow-[0_4px_10px_var(--color-pipeline-shadow)]">
                <Download className="h-[17px] w-[17px]" strokeWidth={1.8} />
              </button>
              <button type="button" className="flex h-[43px] items-center gap-[8px] rounded-[8px] border border-border-subtle bg-surface px-[23px] text-[14px] font-medium text-text-primary shadow-[0_4px_10px_var(--color-pipeline-shadow)]">
                Filter
                <Filter className="h-[16px] w-[16px]" strokeWidth={1.8} />
              </button>
              <button type="button" className="flex h-[43px] items-center gap-[8px] rounded-[8px] border border-border-subtle bg-surface px-[23px] text-[14px] font-medium text-text-primary shadow-[0_4px_10px_var(--color-pipeline-shadow)]">
                Threshold
                <ListFilter className="h-[16px] w-[16px]" strokeWidth={1.8} />
              </button>
            </div>
          </div>

          <div className="mt-[13px] flex min-h-[49px] items-center justify-between rounded-[7px] bg-[var(--color-pipeline-notice)] px-[12px] py-[10px] text-white">
            <p className="text-[15px] leading-[20px] text-white">
              No ATS connected at this moment. Managing pipeline manually ro connect with ATS now.
            </p>
            <button type="button" className="ml-4 h-[30px] flex-shrink-0 rounded-[7px] bg-surface px-[12px] text-[14px] font-medium text-text-primary">
              Connect ATS
            </button>
          </div>

          {error && (
            <div className="mt-[12px] flex items-center gap-2 rounded-[8px] border border-error-border bg-error-bg px-4 py-3 text-[12px] text-error">
              <AlertCircle className="h-[15px] w-[15px]" />
              {error}
            </div>
          )}

          <div className="mt-[12px]">
            <PipelineTable
              cards={paginatedCards}
              loading={loading || needsLoading}
              selectedAssessment={selectedAssessmentData}
              selectedIds={selectedIds}
              onToggleAll={handleToggleAll}
              onToggleRow={handleToggleRow}
              onStageChange={handleStageChange}
              onViewReport={handleViewReport}
            />
          </div>

          {visibleCards.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-[13px] text-text-muted">
                Showing {pageOffset + 1} to {Math.min(pageOffset + pageSize, visibleCards.length)} of {visibleCards.length} candidates
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

          <div className="mt-[68px] flex min-h-[42px] items-center justify-between">
            <p className="text-[15px] font-medium text-[var(--color-pipeline-selected-text)]">
              {selectedCount > 0 ? `${selectedCount} selected` : ''}
            </p>
            <div className="flex items-center gap-[9px]">
              <button
                type="button"
                className="h-[42px] rounded-[8px] border border-error-border bg-error-bg px-[25px] text-[14px] font-semibold text-error"
              >
                Reject all
              </button>
              <button
                type="button"
                className="h-[42px] rounded-[8px] bg-[var(--color-pipeline-selected)] px-[27px] text-[14px] font-semibold text-white"
              >
                Send email
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
