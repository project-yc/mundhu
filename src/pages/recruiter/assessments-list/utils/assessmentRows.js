// Pure helpers over *normalized* assessment rows.
// No React, no I/O, no raw server field names.
//
// Search, filtering and metric derivation used to live here. They are now
// server-side (assessments/services/assessment_query.py) — the client fetches
// one page and renders it, so it stays honest past 50 assessments.

import { normalizeList } from '../../reports/utils/reportRows';

export { normalizeList };

const ENDING_SOON_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;
const ENDING_SOON_MS = ENDING_SOON_DAYS * DAY_MS;

/** Statuses that no longer accept submissions — mirrors CLOSED_STATUSES server-side. */
const CLOSED_STATUSES = ['closed', 'archived', 'expired'];

export function normalizeAssessmentRow(row = {}) {
  const invitedCount = row.invited_count ?? 0;
  const submittedCount = row.submitted_count ?? 0;

  // The server now annotates completion_rate; the local fallback covers older
  // payloads (and the Reports picker's shape) rather than diverging from it.
  const completionRate = Number.isFinite(row.completion_rate)
    ? row.completion_rate
    : invitedCount > 0
      ? submittedCount / invitedCount
      : null;

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
    completionRate,
    createdBy: row.created_by?.name || null,
    configJson: row.config_json || {},
  };
}

export function normalizeAssessmentRows(rows = []) {
  return rows.map(normalizeAssessmentRow);
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatCompletionRate(rate) {
  return Number.isFinite(rate) ? `${Math.round(rate * 100)}%` : '—';
}

/** "60 min" for the meta line under an assessment name. */
export function formatDuration(minutes) {
  return Number.isFinite(minutes) && minutes > 0 ? `${minutes} min` : null;
}

export function isEndingSoon(row) {
  if (!row.endDate || CLOSED_STATUSES.includes(row.status)) return false;
  const end = new Date(row.endDate).getTime();
  if (Number.isNaN(end)) return false;
  const diff = end - Date.now();
  return diff >= 0 && diff <= ENDING_SOON_MS;
}

/**
 * Short hint under the end date — "in 3 days" / "today" / "closed".
 * Returns null when there is nothing useful to say, so the caller can omit the
 * line rather than render an em dash under an em dash.
 */
export function formatRelativeDeadline(row) {
  if (!row.endDate) return null;
  const end = new Date(row.endDate).getTime();
  if (Number.isNaN(end)) return null;
  if (CLOSED_STATUSES.includes(row.status)) return null;

  const diff = end - Date.now();
  if (diff < 0) return 'passed';

  const days = Math.floor(diff / DAY_MS);
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days <= 30) return `in ${days} days`;
  return null;
}

/** Stable React key — assessment id is unique. */
export function getRowKey(row, fallbackIndex) {
  return row.id || `row-${fallbackIndex}`;
}
