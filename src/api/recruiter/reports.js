/**
 * Recruiter Reports API layer.
 *
 * Contract: backend/core/API_CONTRACTS_REPORTS.md
 *
 * Endpoints:
 *   GET /api/assessments/all
 *   GET /api/v1/recruiter/assessment/<assessment_id>/candidates/reports
 *   GET /api/v1/analytics/reports/instance/<assessment_instance_id>
 */

import { authAxios } from '../../lib/axios';

/**
 * GET /api/assessments/all
 * Every assessment template visible to the recruiter's org. Feeds the
 * assessment picker; the response shape varies (bare array vs paginated
 * envelope), so callers normalize via `normalizeList`.
 */
export async function listAssessments({ signal } = {}) {
  return authAxios.get('/api/assessments/all', { signal });
}

/**
 * GET /api/v1/recruiter/assessment/<assessment_id>/candidates/reports
 * AssessmentInstance rows enriched with report data, pre-ranked by
 * overall_score desc (nulls last) server-side.
 */
export async function listCandidateReports(assessmentId, { pageSize = 1000, signal } = {}) {
  const params = new URLSearchParams();
  params.set('page_size', String(pageSize));
  return authAxios.get(
    `/api/v1/recruiter/assessment/${assessmentId}/candidates/reports?${params.toString()}`,
    { signal },
  );
}

/**
 * GET /api/v1/analytics/reports/instance/<assessment_instance_id>
 * Instance-keyed detail. Works for assessments with no coding section, which
 * have no CandidateSession to key on.
 */
export async function getReportByInstance(assessmentInstanceId, { signal } = {}) {
  return authAxios.get(`/api/v1/analytics/reports/instance/${assessmentInstanceId}`, { signal });
}

/**
 * GET /api/v1/analytics/reports/instance/<instance_id>/sections/<section_id>/mcq
 * Per-question MCQ breakdown for one section. Served separately from the
 * report payload — a 20-question section carries every prompt and option, and
 * is only needed once the panel opens.
 */
export async function getMcqSectionReport(assessmentInstanceId, sectionId, { signal } = {}) {
  return authAxios.get(
    `/api/v1/analytics/reports/instance/${assessmentInstanceId}/sections/${sectionId}/mcq`,
    { signal },
  );
}

/**
 * GET /api/v1/analytics/reports/instance/<instance_id>/sections/<section_id>/adaptive
 * Adaptive interview snapshot — competency scores and the scored transcript.
 * Captured into Django when the run was scored, so it stays readable without
 * the adaptive engine being reachable.
 */
export async function getAdaptiveSectionReport(assessmentInstanceId, sectionId, { signal } = {}) {
  return authAxios.get(
    `/api/v1/analytics/reports/instance/${assessmentInstanceId}/sections/${sectionId}/adaptive`,
    { signal },
  );
}

/**
 * GET /api/v1/analytics/reports/instance/<instance_id>/sections/<section_id>/free-text
 * Free-text breakdown — the candidate's answers plus the grader's findings and
 * per-hint coverage. Recruiter-only: it carries full answer text.
 */
export async function getFreeTextSectionReport(assessmentInstanceId, sectionId, { signal } = {}) {
  return authAxios.get(
    `/api/v1/analytics/reports/instance/${assessmentInstanceId}/sections/${sectionId}/free-text`,
    { signal },
  );
}

/**
 * GET /api/v1/analytics/reports/instance/<instance_id>/sections/<section_id>/ranking
 * Ranking breakdown — per-position correctness and partial-credit scores.
 */
export async function getRankingSectionReport(assessmentInstanceId, sectionId, { signal } = {}) {
  return authAxios.get(
    `/api/v1/analytics/reports/instance/${assessmentInstanceId}/sections/${sectionId}/ranking`,
    { signal },
  );
}

/**
 * Report lifecycle, mirroring AssessmentReport.Status.
 * `coding_analytics_pending` means every section is scored and submitted while
 * the AI coding review is still running — distinct from "not started".
 */
export const REPORT_STATE = {
  READY: 'ready',
  ANALYZING: 'analyzing',
  PENDING: 'pending',
  FAILED: 'failed',
};

function deriveReportState(row) {
  if (row.assessment_status === 'finalized') return REPORT_STATE.READY;
  if (row.assessment_status === 'coding_analytics_pending') return REPORT_STATE.ANALYZING;
  if (row.report_status === 'failed') return REPORT_STATE.FAILED;
  // Legacy rows predate AssessmentReport and only carry the collapsed status.
  if (!row.assessment_status && row.report_status === 'completed') return REPORT_STATE.READY;
  if (row.report_status === 'processing') return REPORT_STATE.ANALYZING;
  return REPORT_STATE.PENDING;
}

/**
 * Maps one server row to the stable shape the screen renders, following the
 * `normalizeCandidateRuntimeState` convention in api/candidate/runtime.js.
 *
 * Keeping every field fallback here — rather than scattered across components —
 * means backend drift shows up in one place.
 */
export function normalizeReportRow(row = {}) {
  return {
    id: row.id || null,
    assessmentInstanceId: row.id || null,
    sessionId: row.session_id || null,
    rank: row.rank ?? null,
    name: row.candidate_name || '',
    email: row.candidate_email || '',
    avatarUrl: row.avatar_url || null,
    assessmentName: row.assessment_name || null,
    instanceStatus: row.status || null,
    stage: (row.stage || '').toLowerCase(),
    state: deriveReportState(row),
    score: Number.isFinite(Number(row.overall_score)) ? Number(row.overall_score) : null,
    submittedAt:
      row.submitted_at ||
      row.completed_at ||
      row.updated_at ||
      row.created_at ||
      null,
    // Server-emitted navigation target; the client never builds this URL.
    reportRoute: row.report_route || null,
  };
}

export function normalizeReportRows(rows = []) {
  return rows.map(normalizeReportRow);
}
