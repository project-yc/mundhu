// ReportDetailScreen - recruiter detail view with assessment-level scoring
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Download,
  FileText,
  Image,
  Loader,
  Mic,
  Search,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';
import { getRecruiterReportDetail } from '../../api/recruiter/assessment.jsx';

const SECTION_LABELS = {
  technical_task: 'Coding',
  coding: 'Coding',
  mcq: 'MCQ',
  free_text: 'Free Text',
  ranking: 'Ranking',
  ai_adaptive: 'AI Adaptive',
};

const SECTION_META = {
  technical_task: {
    name: 'Coding Section',
    task: 'Coding Task',
    accent: 'bg-[var(--color-assessment-step-active)]',
    dot: 'bg-[var(--color-assessment-step-active)]',
    badge: 'Coding',
  },
  coding: {
    name: 'Coding Section',
    task: 'Coding Task',
    accent: 'bg-[var(--color-assessment-step-active)]',
    dot: 'bg-[var(--color-assessment-step-active)]',
    badge: 'Coding',
  },
  mcq: {
    name: 'MCQ Section',
    task: 'MCQs Task',
    accent: 'bg-brand-deep',
    dot: 'bg-brand-deep',
    badge: 'MCQs',
  },
  free_text: {
    name: 'Free Text Section',
    task: 'Free Text Task',
    accent: 'bg-info',
    dot: 'bg-info',
    badge: 'Free text',
  },
  ranking: {
    name: 'Ranking Section',
    task: 'Ranking Task',
    accent: 'bg-[var(--color-assessment-cta)]',
    dot: 'bg-[var(--color-assessment-cta)]',
    badge: 'Ranking',
  },
  ai_adaptive: {
    name: 'AI Adaptive Section',
    task: 'AI Adaptive Task',
    accent: 'bg-surface-muted',
    dot: 'bg-surface-muted',
    badge: 'AI',
  },
};

const SIGNAL_LABELS = {
  green: 'STRONG',
  yellow: 'MODERATE',
  red: 'WEAK',
};

function getSectionMeta(type) {
  return SECTION_META[type] || SECTION_META.technical_task;
}

function formatSectionType(type) {
  return SECTION_LABELS[type] || 'Section';
}

function getCandidateName(report) {
  return report.candidate_name || report.candidate?.name || report.assessment_instance?.candidate_name || 'Candidate';
}

function getCandidateEmail(report) {
  return report.candidate_email || report.candidate?.email || report.assessment_instance?.candidate_email || '';
}

function getScorePercent(section) {
  const score = Number(section.score ?? 0);
  const maxScore = Number(section.max_score ?? 0);
  if (maxScore <= 0) return null;
  return Math.round((score / maxScore) * 100);
}

function formatScore(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '00';
  return String(Math.round(Number(value))).padStart(2, '0');
}

function downloadReport(reportData, candidateName) {
  const json = JSON.stringify(reportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `report-${(candidateName || 'candidate').replace(/\s+/g, '-').toLowerCase()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function GlobalSearchBar() {
  return (
    <div className="hidden h-[64px] flex-shrink-0 items-center border-b border-border-subtle bg-page px-3 md:flex">
      <div className="relative flex h-[42px] w-full items-center rounded-[8px] border border-border-default bg-surface shadow-sm">
        <Search className="pointer-events-none absolute left-[11px] h-[17px] w-[17px] text-text-secondary" strokeWidth={1.8} />
        <input
          aria-label="Global search"
          placeholder="Ask anything..."
          className="h-full min-w-0 flex-1 rounded-[8px] bg-transparent pl-[33px] pr-[72px] text-[14px] text-text-primary outline-none placeholder:text-text-muted"
        />
        <div className="absolute right-[10px] flex items-center gap-[12px] text-text-primary">
          <button type="button" className="transition-opacity hover:opacity-70" aria-label="Voice input">
            <Mic className="h-[17px] w-[17px]" strokeWidth={1.8} />
          </button>
          <button type="button" className="transition-opacity hover:opacity-70" aria-label="Attach image">
            <Image className="h-[17px] w-[17px]" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CandidateAvatar({ name }) {
  const initials = name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="flex h-[41px] w-[41px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-default bg-surface-muted text-[12px] font-bold text-text-secondary">
      {initials || 'C'}
    </div>
  );
}

function ScoreOverview({ report, sections }) {
  const name = getCandidateName(report);
  const email = getCandidateEmail(report);
  const overallScore = Number(report.overall_score ?? report.percentage ?? 0);

  const orderedTypes = ['technical_task', 'mcq', 'free_text', 'ranking', 'ai_adaptive'];
  const sectionMap = new Map(sections.map(section => [section.content_type, section]));
  const overviewItems = orderedTypes.map(type => {
    const section = sectionMap.get(type) || (type === 'technical_task' ? sectionMap.get('coding') : null);
    const percent = section ? getScorePercent(section) : null;
    const points = section?.score ?? 0;
    return { type, section, percent, points };
  });

  return (
    <div className="rounded-[10px] border border-border-default bg-surface px-[24px] pb-[20px] pt-[23px] shadow-card">
      <div className="flex items-start justify-between gap-5">
        <div className="flex min-w-0 items-center gap-[10px]">
          <CandidateAvatar name={name} />
          <div className="min-w-0">
            <h2 className="truncate text-[18px] font-bold leading-[22px] text-text-primary">{name}</h2>
            <p className="mt-[3px] truncate text-[13px] text-[var(--color-report-email-text)]">{email}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[20px] font-bold leading-none text-[var(--color-assessment-accent)]">
            {overallScore ? overallScore.toFixed(1) : '0.0'} <span className="text-[14px] font-semibold text-text-primary">(out of 100)</span>
          </p>
          <p className="mt-[4px] text-[12px] text-text-muted">Overall average score</p>
        </div>
      </div>

      <div className="mt-[12px] border-t border-dashed border-border-default pt-[18px]">
        <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-5">
          {overviewItems.map(({ type, percent, points }) => {
            const meta = getSectionMeta(type);
            const displayPercent = percent ?? 0;
            return (
              <div key={type} className="min-w-0">
                <p className="truncate text-[12px] font-medium uppercase leading-none text-[var(--color-report-email-text)]">
                  {meta.name}
                </p>
                <div className="mt-[9px] h-[7px] overflow-hidden rounded-full bg-surface-muted">
                  <div className={`h-full rounded-full ${meta.accent}`} style={{ width: `${displayPercent}%` }} />
                </div>
                <div className="mt-[16px] flex items-center gap-[7px]">
                  <span className={`h-[12px] w-[12px] rounded-full ${meta.dot}`} />
                  <span className="text-[13px] font-bold text-text-primary">{formatScore(percent)}/100</span>
                  <span className="text-[12px] text-text-faint">{points} Points</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function InsightBanner({ report }) {
  const insight =
    report.ai_review_output?.top_insight ||
    report.ai_narrative_assessments?.top_insight ||
    report.summary ||
    'Used AI to generate a pipeline scaffolding skeleton, then manually rewrote the transformation logic. Caught and corrected one AI-introduced bug independently.';

  return (
    <div className="rounded-[10px] border border-warning-border bg-warning-bg px-[11px] py-[8px]">
      <p className="text-[14px] leading-[18px] text-warning">{insight}</p>
    </div>
  );
}

function TaskIllustration({ badge, featured = false }) {
  return (
    <div className="flex h-full min-h-[111px] w-[117px] flex-shrink-0 items-center justify-center bg-surface-muted">
      <div className="h-[80px] w-[72px] rounded-[9px] bg-surface px-[10px] py-[12px] shadow-card">
        <span className={`inline-flex h-[20px] items-center rounded-[6px] px-[9px] text-[7px] font-bold text-surface ${featured ? 'bg-[var(--color-assessment-cta)]' : 'bg-[var(--color-assessment-accent)]'}`}>
          {badge}
        </span>
        <div className="mt-[10px] space-y-[5px]">
          <span className="block h-[4px] w-[44px] rounded-full bg-border-default" />
          <span className="block h-[4px] w-[55px] rounded-full bg-border-default" />
          <span className="block h-[4px] w-[48px] rounded-full bg-border-default" />
          <span className="block h-[4px] w-[42px] rounded-full bg-border-default" />
        </div>
      </div>
    </div>
  );
}

function TaskCard({ section, index, onShowDetails }) {
  const type = section.content_type || 'technical_task';
  const meta = getSectionMeta(type);
  const percent = getScorePercent(section);
  const signal = section.signal || (percent >= 75 ? 'green' : percent >= 50 ? 'yellow' : 'red');

  return (
    <div className="flex min-h-[111px] overflow-hidden rounded-[10px] border border-border-subtle bg-surface shadow-card">
      <TaskIllustration badge={meta.badge} featured={index % 2 === 1} />
      <div className="flex min-w-0 flex-1 flex-col px-[12px] py-[14px]">
        <div className="flex items-center justify-between gap-3">
          <h3 className="truncate text-[15px] font-bold leading-[18px] text-text-primary">
            {section.section_name || meta.task}
          </h3>
          <button
            type="button"
            onClick={() => onShowDetails(section)}
            className="flex-shrink-0 text-[14px] font-medium leading-none text-brand transition-colors hover:text-brand-hover"
          >
            Show details
          </button>
        </div>
        <div className="mt-auto">
          <p className="text-[20px] font-bold leading-none text-text-primary">
            {formatScore(percent)} <span className="text-[14px] font-medium text-text-muted">(out of 100)</span>
          </p>
          <p className="mt-[7px] text-[13px] font-bold leading-none text-[var(--color-assessment-accent)]">
            {SIGNAL_LABELS[signal] || 'STRONG'}
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailMetric({ label, value }) {
  return (
    <div className="rounded-[8px] border border-border-subtle bg-surface-hover px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">{label}</p>
      <p className="mt-1 text-[16px] font-bold text-text-primary">{value}</p>
    </div>
  );
}

function DetailsDrawer({ open, section, report, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = event => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const narrativeAssessments = report?.ai_narrative_assessments || {};
  const dimensions = narrativeAssessments.dimensions || report?.dimensions || {};
  const evidence = narrativeAssessments.behavioral_evidence || report?.behavioral_evidence || [];
  const growth = narrativeAssessments.growth_edges || report?.growth_edges || [];
  const probes = narrativeAssessments.interview_probes || report?.interview_probes || [];

  const type = section?.content_type || 'technical_task';
  const meta = getSectionMeta(type);
  const percent = section ? getScorePercent(section) : null;
  const isCoding = type === 'technical_task' || type === 'coding';
  const dimensionCards = [
    ['Task Completion', dimensions.task_completion],
    ['Design Quality', dimensions.design_quality],
    ['Problem-Solving Process', dimensions.problem_solving_process],
    ['AI Collaboration', dimensions.ai_collaboration],
  ].filter(([, value]) => value);

  return (
    <div className={`fixed inset-0 z-50 transition-[visibility] duration-500 ${open ? 'visible' : 'invisible'}`}>
      <button
        type="button"
        aria-label="Close details overlay"
        onClick={onClose}
        className={`absolute inset-0 bg-text-primary/45 transition-opacity duration-500 ease-out ${open ? 'opacity-100' : 'opacity-0'}`}
      />

      <aside
        className={`absolute inset-y-0 right-0 flex w-full max-w-[520px] flex-col border-l border-border-subtle bg-surface shadow-modal transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!open}
      >
        <div className="flex h-[70px] flex-shrink-0 items-center justify-between border-b border-border-subtle px-[24px]">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-text-muted">
              {formatSectionType(type)}
            </p>
            <h2 className="mt-[4px] truncate text-[18px] font-bold leading-none text-text-primary">
              {section?.section_name || meta.task}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-border-default bg-surface text-text-primary transition-colors hover:bg-surface-hover"
            aria-label="Close details"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-[24px] py-[22px]">
          <div className="rounded-[10px] border border-border-default bg-surface-hover p-[16px]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-text-muted">Section score</p>
                <p className="mt-[8px] text-[36px] font-bold leading-none text-text-primary">
                  {formatScore(percent)} <span className="text-[16px] font-medium text-text-muted">/100</span>
                </p>
              </div>
              <span className={`inline-flex h-[30px] items-center rounded-[8px] px-[10px] text-[12px] font-bold uppercase text-surface ${meta.dot}`}>
                {SIGNAL_LABELS[section?.signal] || 'STRONG'}
              </span>
            </div>
            <div className="mt-[15px] h-[8px] overflow-hidden rounded-full bg-border-default">
              <div className={`h-full rounded-full ${meta.accent}`} style={{ width: `${percent ?? 0}%` }} />
            </div>
          </div>

          <div className="mt-[14px] grid grid-cols-2 gap-[10px]">
            <DetailMetric label="Points" value={`${section?.score ?? 0}/${section?.max_score ?? 0}`} />
            <DetailMetric label="Status" value={section?.status || report?.status || 'Pending'} />
          </div>

          {section?.summary && (
            <div className="mt-[18px] rounded-[10px] border border-border-subtle bg-surface p-[14px]">
              <p className="text-[13px] font-bold text-text-primary">Summary</p>
              <p className="mt-[8px] text-[13px] leading-[19px] text-text-secondary">{section.summary}</p>
            </div>
          )}

          {isCoding && dimensionCards.length > 0 && (
            <div className="mt-[18px] space-y-[10px]">
              <p className="text-[13px] font-bold text-text-primary">Assessment dimensions</p>
              {dimensionCards.map(([label, dimension]) => (
                <div key={label} className="rounded-[10px] border border-border-subtle bg-surface p-[14px]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-bold text-text-primary">{label}</p>
                    <p className="text-[13px] font-bold text-text-primary">
                      {dimension.score ?? '--'}<span className="font-medium text-text-muted">/100</span>
                    </p>
                  </div>
                  {dimension.summary && (
                    <p className="mt-[8px] text-[13px] leading-[19px] text-text-secondary">{dimension.summary}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {isCoding && evidence.length > 0 && (
            <div className="mt-[18px] space-y-[10px]">
              <p className="text-[13px] font-bold text-text-primary">Activity timeline</p>
              {evidence.slice(0, 5).map((item, index) => (
                <div key={`${item.dimension || 'evidence'}-${index}`} className="flex gap-[10px] rounded-[10px] border border-border-subtle bg-surface p-[12px]">
                  <span className="mt-[6px] h-[7px] w-[7px] flex-shrink-0 rounded-full bg-brand" />
                  <p className="text-[13px] leading-[19px] text-text-secondary">{item.observation || item}</p>
                </div>
              ))}
            </div>
          )}

          {growth.length > 0 && (
            <div className="mt-[18px] space-y-[10px]">
              <p className="text-[13px] font-bold text-text-primary">Growth edges</p>
              {growth.slice(0, 4).map((item, index) => (
                <div key={`growth-${index}`} className="rounded-[10px] border border-warning-border bg-warning-bg p-[12px]">
                  <p className="text-[13px] leading-[19px] text-text-primary">{typeof item === 'object' ? item.moment : item}</p>
                  {typeof item === 'object' && item.alternative && (
                    <p className="mt-[6px] text-[12px] leading-[18px] text-text-secondary">{item.alternative}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {probes.length > 0 && (
            <div className="mt-[18px] space-y-[10px]">
              <p className="text-[13px] font-bold text-text-primary">Interview probes</p>
              {probes.slice(0, 4).map((probe, index) => (
                <div key={`probe-${index}`} className="rounded-[10px] border border-border-subtle bg-surface p-[12px]">
                  <p className="text-[12px] font-bold text-brand">Q{index + 1}</p>
                  <p className="mt-[5px] text-[13px] leading-[19px] text-text-secondary">{probe}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

export default function ReportDetailScreen() {
  const { assessmentId, sessionId } = useParams();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    getRecruiterReportDetail(assessmentId, sessionId)
      .then(data => setReport(data.data || data))
      .catch(err => setError(err.message || 'Failed to load report.'))
      .finally(() => setLoading(false));
  }, [assessmentId, sessionId]);

  const sections = useMemo(() => {
    if (!Array.isArray(report?.section_results)) return [];
    return [...report.section_results].sort((a, b) => (
      (a.section_order ?? Number.MAX_SAFE_INTEGER) - (b.section_order ?? Number.MAX_SAFE_INTEGER)
    ));
  }, [report]);

  if (loading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <Loader className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 rounded-[10px] border border-error-border bg-error-bg px-4 py-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-error" />
          <p className="text-[13px] text-error">{error}</p>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const candidateName = getCandidateName(report);
  const taskSections = sections.length > 0
    ? sections
    : [{ section_name: 'Coding Task', content_type: 'technical_task', score: report.overall_score ?? 0, max_score: 100, status: report.status }];

  return (
    <div className="flex min-h-full flex-col bg-page">
      <GlobalSearchBar />

      <div className="min-h-0 flex-1 p-3 pt-0">
        <section className="relative min-h-[calc(100vh-76px)] rounded-[10px] border border-border-subtle bg-surface px-[38px] pb-[100px] pt-[35px]">
          <div className="flex flex-col gap-[18px] lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-[22px] font-bold leading-[27px] text-text-primary">Detailed report</h1>
              <p className="mt-[5px] text-[15px] leading-[18px] text-text-secondary">
                Candidate assessment reports - scored and ranked by performance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-[12px]">
              <button
                type="button"
                className="inline-flex h-[41px] items-center justify-center gap-[8px] rounded-[8px] border border-border-default bg-surface px-[23px] text-[14px] font-medium text-text-primary shadow-card transition-colors hover:bg-surface-hover"
              >
                <Share2 className="h-[15px] w-[15px]" strokeWidth={1.8} />
                Share report
              </button>
              <button
                type="button"
                onClick={() => downloadReport(report, candidateName)}
                className="inline-flex h-[41px] items-center justify-center gap-[8px] rounded-[8px] bg-[var(--color-assessment-cta)] px-[23px] text-[14px] font-bold text-[var(--color-assessment-cta-text)] transition-colors hover:bg-[var(--color-assessment-cta-hover)]"
              >
                <Download className="h-[15px] w-[15px]" strokeWidth={1.8} />
                Download Pdf
              </button>
            </div>
          </div>

          <div className="mt-[29px]">
            <ScoreOverview report={report} sections={sections} />
          </div>

          <div className="mt-[20px]">
            <InsightBanner report={report} />
          </div>

          <div className="mt-[24px] grid grid-cols-1 gap-[12px] xl:grid-cols-3">
            {taskSections.slice(0, 3).map((section, index) => (
              <TaskCard
                key={section.section_id || `${section.content_type}-${index}`}
                section={section}
                index={index}
                onShowDetails={setActiveSection}
              />
            ))}
          </div>

          <textarea
            className="mt-[12px] h-[113px] w-full resize-none rounded-[10px] border-0 bg-surface-hover px-[11px] py-[10px] text-[15px] italic text-text-secondary outline-none placeholder:text-text-secondary"
            placeholder="(Optional) write feedback to the candidate"
          />

          <div className="absolute bottom-[20px] right-[38px] flex flex-wrap justify-end gap-[8px]">
            <button
              type="button"
              className="inline-flex h-[41px] min-w-[146px] items-center justify-center rounded-[8px] border border-border-default bg-surface px-[22px] text-[14px] font-medium text-text-primary shadow-card transition-colors hover:bg-surface-hover"
            >
              Watch session
            </button>
            <button
              type="button"
              className="inline-flex h-[41px] min-w-[91px] items-center justify-center rounded-[8px] border border-error-border bg-error-bg px-[20px] text-[14px] font-bold text-error transition-colors hover:bg-error-bg/80"
            >
              Reject
            </button>
            <button
              type="button"
              className="inline-flex h-[41px] min-w-[107px] items-center justify-center rounded-[8px] bg-[var(--color-assessment-accent)] px-[20px] text-[14px] font-bold text-surface transition-opacity hover:opacity-90"
            >
              Shortlist
            </button>
          </div>
        </section>
      </div>

      <DetailsDrawer
        open={Boolean(activeSection)}
        section={activeSection}
        report={report}
        onClose={() => setActiveSection(null)}
      />
    </div>
  );
}
