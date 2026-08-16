// ReportDetailScreen - recruiter detail view with assessment-level scoring
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, Download, Loader, Share2 } from 'lucide-react';
import { getRecruiterReportDetail } from '../../api/recruiter/assessment.jsx';
import { getReportByInstance } from '../../api/recruiter/reports';
import { AskAnythingBar } from '../../components/recruiter/AskAnythingBar.jsx';
import { SectionPanel } from './report-detail/components/SectionPanel';
import { SectionCard } from './report-detail/components/SectionCard';
import { SectionPanelContent } from './report-detail/components/panels';
import { getSectionPanelTitle } from './report-detail/constants/sectionPanels';

const SECTION_META = {
  technical_task: {
    name: 'Coding Section',
    task: 'Coding Task',
    accent: 'bg-[var(--color-section-coding)]',
    dot: 'bg-[var(--color-section-coding)]',
    badge: 'Coding',
    barWidth: 283,
  },
  coding: {
    name: 'Coding Section',
    task: 'Coding Task',
    accent: 'bg-[var(--color-section-coding)]',
    dot: 'bg-[var(--color-section-coding)]',
    badge: 'Coding',
    barWidth: 283,
  },
  mcq: {
    name: 'MCQ Section',
    task: 'MCQs Task',
    accent: 'bg-[var(--color-section-mcq)]',
    dot: 'bg-[var(--color-section-mcq)]',
    badge: 'MCQs',
    barWidth: 146,
  },
  free_text: {
    name: 'Free Text Section',
    task: 'Free Text Task',
    accent: 'bg-[var(--color-section-free-text)]',
    dot: 'bg-[var(--color-section-free-text)]',
    badge: 'Free text',
    barWidth: 205,
  },
  ranking: {
    name: 'Ranking Section',
    task: 'Ranking Task',
    accent: 'bg-[var(--color-section-ranking)]',
    dot: 'bg-[var(--color-section-ranking)]',
    badge: 'Ranking',
    barWidth: 151,
  },
  adaptive_interview: {
    name: 'AI Adaptive Section',
    task: 'AI Adaptive Task',
    accent: 'bg-[var(--color-section-adaptive)]',
    dot: 'bg-[var(--color-section-adaptive)]',
    badge: 'AI',
    barWidth: 204,
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

/**
 * Renders a score, or null when there isn't one.
 *
 * This used to return '00' for a missing value, so an ungraded section — which
 * is exactly when getScorePercent returns null — was displayed as a hard zero
 * with nothing marking it as ungraded. Callers must handle null.
 */
function formatScore(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return null;
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

  const orderedTypes = ['technical_task', 'mcq', 'free_text', 'ranking', 'adaptive_interview'];
  const sectionMap = new Map(sections.map(section => [section.content_type, section]));
  // Only sections this assessment actually contains. Rendering the full set
  // unconditionally showed an adaptive-only assessment as Coding 0/100,
  // MCQ 0/100, Free Text 0/100 and Ranking 0/100 — four sections the candidate
  // was never given, presented as if they had failed them.
  const overviewItems = orderedTypes
    .map(type => {
      const section = sectionMap.get(type) || (type === 'technical_task' ? sectionMap.get('coding') : null);
      if (!section) return null;
      // `max_score`, not `score`: the label reads "X% of N pts", so N is what
      // the section was worth, not what the candidate earned. Using `score`
      // rendered "50% of 5 pts" for a 5-of-10 result, and was invisible for any
      // section scored in full — where the two numbers happen to be equal.
      return {
        type,
        section,
        percent: getScorePercent(section),
        points: section.max_score ?? section.points ?? 0,
      };
    })
    .filter(Boolean);

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
        {/* Figma sizes each bar to its own label rather than using equal
            columns: 283 + 146 + 205 + 151 + 204 + 4x15 gaps = 1049. */}
        <div className="flex flex-wrap gap-[15px]">
          {overviewItems.map(({ type, percent, points }) => {
            const meta = getSectionMeta(type);
            const displayPercent = percent ?? 0;
            return (
              <div
                key={type}
                className="min-w-[140px] flex-1 sm:flex-none"
                style={{ flexBasis: meta.barWidth }}
              >
                <p className="truncate text-[12px] font-medium uppercase leading-none text-[var(--color-report-email-text)]">
                  {meta.name}
                </p>
                <div className="mt-[9px] h-[7px] overflow-hidden rounded-full bg-surface-muted">
                  <div className={`h-full rounded-full ${meta.accent}`} style={{ width: `${displayPercent}%` }} />
                </div>
                <div className="mt-[16px] flex items-center gap-[7px]">
                  <span className={`h-[12px] w-[12px] rounded-full ${meta.dot}`} />
                  {formatScore(percent) === null ? (
                    <span className="text-[13px] font-semibold text-text-muted">Not graded</span>
                  ) : (
                    <span className="text-[13px] font-bold text-text-primary">
                      {formatScore(percent)}% of {points} pts
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * AI summary for the coding section (`top_insight` on that section's
 * SessionReport). Renders nothing when the AI review produced no cited
 * insight — this previously fell back to a hardcoded sentence, which meant
 * every report displayed invented behavioural evidence as if it were real.
 *
 * Scope caveat: `top_insight` is per coding session. On an assessment with
 * several coding tasks this shows the matched session's insight only; the
 * per-section panels are where each one belongs.
 */
function InsightBanner({ report }) {
  const insight = report.top_insight || report.ai_narrative_assessments?.top_insight || '';
  if (!insight) return null;

  // Neutral, not amber. `top_insight` is a summary, not a warning — the caution
  // styling editorialised every insight, painting a positive observation as a
  // concern. The coding panel repeats this string; keeping the registers
  // consistent is what stops it reading as two different claims.
  return (
    <div className="rounded-[10px] border border-border-subtle bg-surface px-[11px] py-[9px]">
      <p className="text-[11px] font-semibold uppercase leading-[14px] tracking-wide text-text-muted">
        AI summary
      </p>
      <p className="mt-[3px] text-[14px] leading-[19px] text-text-secondary">{insight}</p>
    </div>
  );
}

export default function ReportDetailScreen() {
  const { assessmentId, sessionId, assessmentInstanceId } = useParams();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    // Instance-keyed is the current contract; the session-keyed route is kept
    // for links created before the reports screen migrated.
    const request = assessmentInstanceId
      ? getReportByInstance(assessmentInstanceId)
      : getRecruiterReportDetail(assessmentId, sessionId);

    request
      .then(data => setReport(data.data || data))
      .catch(err => setError(err.message || 'Failed to load report.'))
      .finally(() => setLoading(false));
  }, [assessmentId, sessionId, assessmentInstanceId]);

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
      <AskAnythingBar />

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
                {/* The handler serializes the report to JSON — labelling it
                    "Pdf" promised a file this never produced. */}
                Download JSON
              </button>
            </div>
          </div>

          <div className="mt-[29px]">
            <ScoreOverview report={report} sections={sections} />
          </div>

          <div className="mt-[20px]">
            <InsightBanner report={report} />
          </div>

          {/* One card per section of the assessment — MCQ, coding, free text,
              ranking, adaptive. Previously capped at 3, which silently dropped
              sections 4+ on multi-section tests. */}
          {/* Flex-wrap rather than a fixed grid: coding cards take a 50% basis
              and the rest 33.33%, so a trailing row of two grows to fill the
              width exactly as the Figma frames show. */}
          <div className="mt-[24px] flex flex-wrap gap-[12px]">
            {taskSections.map((section, index) => (
              <SectionCard
                key={section.section_id || `${section.content_type}-${index}`}
                section={section}
                onShowDetails={setActiveSection}
              />
            ))}
          </div>

          <div className="absolute bottom-[20px] right-[38px] flex flex-wrap justify-end gap-[8px]">
            {/* A session only exists for coding sections. On an adaptive-only or
                MCQ-only assessment there is nothing to watch, and the button
                rendered anyway. */}
            {report.session_id && (
              <button
                type="button"
                className="inline-flex h-[41px] min-w-[146px] items-center justify-center rounded-[8px] border border-border-default bg-surface px-[22px] text-[14px] font-medium text-text-primary shadow-card transition-colors hover:bg-surface-hover"
              >
                Watch session
              </button>
            )}
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

      {/* Clicking a section card opens that section's panel for this candidate.
          Coding is built; other section types show a scored placeholder. */}
      <SectionPanel
        open={Boolean(activeSection)}
        title={getSectionPanelTitle(activeSection)}
        subtitle={activeSection?.section_name || undefined}
        onClose={() => setActiveSection(null)}
      >
        {activeSection && (
          <SectionPanelContent section={activeSection} report={report} />
        )}
      </SectionPanel>
    </div>
  );
}
