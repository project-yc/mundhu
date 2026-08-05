// Static configuration for the recruiter Assessments list screen.
// Column widths mirror the Reports table convention (fixed <colgroup>).

export const SEARCH_DEBOUNCE_MS = 250;
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];
export const DEFAULT_PAGE_SIZE = 10;

/**
 * Table columns. `width` sets the <col> so layout stays fixed regardless of
 * content length.
 */
export const ASSESSMENT_COLUMNS = [
  { key: 'name', label: 'Assessment', width: 320 },
  { key: 'status', label: 'Status', width: 120 },
  { key: 'created', label: 'Created', width: 120 },
  { key: 'endDate', label: 'End Date', width: 120 },
  { key: 'candidates', label: 'Candidates', width: 130 },
  { key: 'completion', label: 'Completion', width: 110 },
  { key: 'actions', label: 'Action', width: 130 },
];

/**
 * Metric tiles above the table. `accessor` reads from the derived metrics
 * object built by `deriveAssessmentMetrics`.
 */
export const ASSESSMENT_METRICS = [
  {
    key: 'total',
    label: 'Total Assessments',
    icon: 'FileText',
    featured: true,
  },
  {
    key: 'averageCompletionRate',
    label: 'Average Completion Rate',
    icon: 'CheckCircle2',
  },
  {
    key: 'averageScore',
    label: 'Average Score',
    icon: 'BarChart3',
  },
  {
    key: 'endingSoon',
    label: 'Ending Soon',
    icon: 'Clock',
  },
];

/** Status pill styling, grouped per assessments/constants.py AssessmentStatus. */
export const STATUS_BADGE_CONFIG = {
  draft: { label: 'Draft', variant: 'secondary' },
  published: { label: 'Published', variant: 'default' },
  active: { label: 'Published', variant: 'default' },
  closed: { label: 'Closed', variant: 'outline' },
  archived: { label: 'Closed', variant: 'outline' },
  expired: { label: 'Expired', variant: 'error' },
};
