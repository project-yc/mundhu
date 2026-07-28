// Normalizes the coding-section slice of a recruiter report payload.
//
// The detail payload flattens most coding fields to the top level, but
// `overall_score` there is the *whole assessment* percentage — the coding
// section's own score lives under `coding_analytics.detail`. Reading the nested
// object first and falling back to the flattened keys keeps that distinction
// in one place instead of in every component.

export const DIMENSION_ORDER = [
  ['task_completion', 'Task Completion'],
  ['design_quality', 'Design Quality'],
  ['problem_solving_process', 'Problem-Solving Process'],
  ['ai_collaboration', 'AI Collaboration'],
];

export const SIGNAL_TOKENS = {
  green: { dot: 'bg-success', text: 'text-success', label: 'Strong' },
  yellow: { dot: 'bg-warning', text: 'text-warning', label: 'Mixed' },
  red: { dot: 'bg-error', text: 'text-error', label: 'Weak' },
  not_evaluated: { dot: 'bg-border-default', text: 'text-text-muted', label: 'Not evaluated' },
};

export function getSignalTokens(signal) {
  return SIGNAL_TOKENS[signal] || SIGNAL_TOKENS.not_evaluated;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function selectCodingReport(report) {
  const analytics = report?.coding_analytics || {};
  const detail = analytics.detail || {};

  return {
    ready: Boolean(analytics.report_ready),
    status: analytics.status || detail.status || null,
    // Coding-section score, NOT the assessment total.
    score: toNumber(detail.overall_score),
    reviewPolicy: detail.review_policy || report?.review_policy || null,
    topInsight: detail.top_insight || report?.top_insight || '',
    // Tags on the coding task — the "Top skills / Labels" chips.
    taskLabels: detail.task_labels || report?.task_labels || [],
    dimensions: detail.dimensions || report?.dimensions || {},
    evidence: detail.behavioral_evidence || report?.behavioral_evidence || [],
    timeline: detail.session_timeline || report?.session_timeline || [],
    growthEdges: detail.growth_edges || report?.growth_edges || [],
    probes: detail.interview_probes || report?.interview_probes || [],
    proctoring: detail.proctoring_signals || null,
    authorship: detail.authorship_metrics || report?.authorship_metrics || {},
    aiReviewError: detail.ai_review_error || report?.ai_review_error || null,
    sessionCount: Array.isArray(analytics.sessions) ? analytics.sessions.length : 0,
  };
}

/** `requires_human_review` is the only state that warrants a banner. */
export function needsHumanReview(reviewPolicy) {
  return reviewPolicy?.review_status === 'requires_human_review';
}

/** Turns `verification:low_post_ai_accept_run_ratio` into readable prose. */
export function humanizeReason(reason) {
  const [scope, detail] = String(reason).split(':');
  const text = (detail || scope || '').replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatPercent(value) {
  const parsed = toNumber(value);
  if (parsed === null) return null;
  return `${Math.round(parsed <= 1 ? parsed * 100 : parsed)}%`;
}

/**
 * Score colour thresholds, matching the Figma rubric table where 92 reads
 * green, 56 and 42 amber, and 08 red.
 */
export function getScoreTone(score) {
  const value = Number(score);
  if (!Number.isFinite(value)) return 'text-text-muted';
  if (value >= 75) return 'text-success';
  if (value >= 40) return 'text-warning';
  return 'text-error';
}

/** Figma prints episode times as "Friday, 4:16PM". */
export function formatTimelineTimestamp(timeRange) {
  const raw = timeRange?.start;
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;

  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date).replace(/\s/g, '');

  return `${weekday}, ${time}`;
}

export function formatDuration(seconds) {
  const total = Math.round(Number(seconds) || 0);
  if (total <= 0) return null;
  if (total < 60) return `${total}s`;
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;
  return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
}

/**
 * `_timeline_label` returns a bare "Work Window" with `activity_type: null`
 * whenever classification confidence is below 0.75 — the backend deliberately
 * declines to name the activity. Surface that rather than implying certainty.
 */
export function isLowConfidenceEpisode(entry) {
  return !entry?.activity_type;
}

export function sortTimeline(timeline) {
  return [...(timeline || [])].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
}

/** Any yellow/red proctoring criterion means the block should not stay quiet. */
export function getProctoringFlags(proctoring) {
  const criteria = proctoring?.criteria || {};
  return Object.entries(criteria)
    .filter(([, value]) => value?.signal === 'yellow' || value?.signal === 'red')
    .map(([key, value]) => ({
      key,
      label: key.replace(/_/g, ' '),
      signal: value.signal,
      detail: value.detail || value.summary || '',
    }));
}
