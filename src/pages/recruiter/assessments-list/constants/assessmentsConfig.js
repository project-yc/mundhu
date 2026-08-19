// Static configuration for the recruiter Assessments list screen.
// Column widths mirror the Reports table convention (fixed <colgroup>).

import { SORT_KEYS } from '../../../../api/recruiter/assessments';

export const SEARCH_DEBOUNCE_MS = 250;

// No frontend control for this — 6 keeps the panel a fixed, predictable
// height regardless of how many assessments an org has.
export const DEFAULT_PAGE_SIZE = 6;

export const DEFAULT_SORT = SORT_KEYS.CREATED_AT;
export const DEFAULT_ORDER = 'desc';

/**
 * Table columns. `width` sets the <col> so layout stays fixed regardless of
 * content length. `sortKey` is the value sent as `?sort=` — columns without one
 * are not sortable (Owner is a display name, Action is not data).
 */
export const ASSESSMENT_COLUMNS = [
  { key: 'name', label: 'Assessment', width: 300, sortKey: SORT_KEYS.NAME },
  { key: 'status', label: 'Status', width: 110, sortKey: SORT_KEYS.STATUS },
  { key: 'owner', label: 'Owner', width: 140 },
  { key: 'candidates', label: 'Candidates', width: 150, sortKey: SORT_KEYS.INVITED },
  { key: 'completion', label: 'Completion', width: 150, sortKey: SORT_KEYS.COMPLETION },
  { key: 'endDate', label: 'End Date', width: 130, sortKey: SORT_KEYS.END_DATE },
  { key: 'actions', label: 'Action', width: 120, align: 'right' },
];

/**
 * Status filter buckets. Values are sent verbatim as `?status=` — the backend
 * expands `live`/`closed` into their underlying DB statuses
 * (assessments/services/assessment_query.py STATUS_BUCKETS), so the collapsing
 * lives in exactly one place.
 */
export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'live', label: 'Live' },
  { value: 'closed', label: 'Closed' },
  { value: 'expired', label: 'Expired' },
];

/**
 * Status indicator styling, grouped per assessments/constants.py
 * AssessmentStatus. Rendered as a dot + label (StatusBadge.jsx) rather than a
 * filled pill.
 */
export const STATUS_DOT_CONFIG = {
  draft: { label: 'Draft', dot: 'bg-text-muted' },
  published: { label: 'Published', dot: 'bg-success' },
  active: { label: 'Published', dot: 'bg-success' },
  closed: { label: 'Closed', dot: 'bg-text-muted' },
  archived: { label: 'Closed', dot: 'bg-text-muted' },
  expired: { label: 'Expired', dot: 'bg-error' },
};
