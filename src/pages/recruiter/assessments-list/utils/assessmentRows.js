// Pure helpers over *normalized* assessment rows.
// No React, no I/O, no raw server field names.

import { normalizeList } from '../../reports/utils/reportRows';

export { normalizeList };

const ENDING_SOON_DAYS = 7;
const ENDING_SOON_MS = ENDING_SOON_DAYS * 24 * 60 * 60 * 1000;

/** Statuses that no longer accept submissions — excluded from "ending soon". */
const CLOSED_STATUSES = ['closed', 'archived', 'expired'];

export function normalizeAssessmentRow(row = {}) {
  const invitedCount = row.invited_count ?? 0;
  const submittedCount = row.submitted_count ?? 0;

  return {
    id: row.id,
    name: row.name || 'Untitled assessment',
    description: row.description || '',
    durationMinutes: row.duration_minutes ?? null,
    status: row.status || 'draft',
    createdAt: row.created_at || null,
    endDate: row.expiry_datetime || null,
    invitedCount,
    submittedCount,
    completionRate: invitedCount > 0 ? submittedCount / invitedCount : null,
    createdBy: row.created_by?.name || null,
    configJson: row.config_json || {},
  };
}

export function normalizeAssessmentRows(rows = []) {
  return rows.map(normalizeAssessmentRow);
}

export function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatCompletionRate(rate) {
  return Number.isFinite(rate) ? `${Math.round(rate * 100)}%` : '-';
}

export function isEndingSoon(row) {
  if (!row.endDate || CLOSED_STATUSES.includes(row.status)) return false;
  const end = new Date(row.endDate).getTime();
  if (Number.isNaN(end)) return false;
  const diff = end - Date.now();
  return diff >= 0 && diff <= ENDING_SOON_MS;
}

export function filterAssessments(rows, query) {
  const term = query.trim().toLowerCase();
  if (!term) return rows;
  return rows.filter(row => row.name.toLowerCase().includes(term));
}

/** Metric tile values, derived client-side from the loaded assessment list. */
export function deriveAssessmentMetrics(rows) {
  const total = rows.length;
  const published = rows.filter(row => row.status !== 'draft').length;
  const draft = total - published;

  const withCandidates = rows.filter(row => row.invitedCount > 0);
  const averageCompletionRate = withCandidates.length
    ? withCandidates.reduce((sum, row) => sum + row.completionRate, 0) / withCandidates.length
    : null;

  const endingSoon = rows.filter(isEndingSoon).length;

  return {
    total,
    published,
    draft,
    averageCompletionRate,
    endingSoon,
  };
}

/** Stable React key — assessment id is unique. */
export function getRowKey(row, fallbackIndex) {
  return row.id || `row-${fallbackIndex}`;
}
