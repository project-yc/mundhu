// Configuration for the template gallery.
//
// Values must match the backend enums (assessments/constants.py) — the filter
// sidebar hydrates its labels from GET /v1/presets/filter-options, and these are
// the fallbacks used before that request lands, plus the bits the API does not
// carry (icons, colors, ordering).

export const SEARCH_DEBOUNCE_MS = 300;
export const DEFAULT_PAGE_SIZE = 24;

// Mirrors AssessmentItemContentType. `label` is the singular noun used in the
// card's type strip ("4 MCQ · 1 Coding · 1 Interview") — deliberately short,
// because a card fits about three of these before it wraps.
export const CONTENT_TYPE_META = {
  mcq: { label: 'MCQ', full: 'Multiple choice', tone: 'sky' },
  free_text: { label: 'Written', full: 'Free text', tone: 'violet' },
  ranking: { label: 'Ranking', full: 'Ranking', tone: 'amber' },
  technical_task: { label: 'Coding', full: 'Technical task', tone: 'emerald' },
  adaptive_interview: { label: 'Interview', full: 'AI adaptive interview', tone: 'rose' },
};

// Fixed display order, so two cards with the same mix read the same way.
export const CONTENT_TYPE_ORDER = [
  'technical_task',
  'adaptive_interview',
  'mcq',
  'free_text',
  'ranking',
];

export const DIFFICULTY_TONE = {
  easy: 'emerald',
  medium: 'amber',
  hard: 'rose',
};

// Tailwind cannot see class names built by string interpolation, so every tone
// is spelled out here rather than assembled as `bg-${tone}-50`.
export const TONE_CLASSES = {
  sky: 'bg-sky-50 text-sky-700 border-sky-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  slate: 'bg-slate-50 text-slate-700 border-slate-200',
};

// The sidebar's groups, in render order. `key` is the query param the API
// expects; `options` is filled from filter-options when it arrives.
export const FILTER_GROUPS = [
  { key: 'domain', label: 'Discipline', optionsKey: 'domains' },
  { key: 'seniority', label: 'Seniority', optionsKey: 'seniorities' },
  { key: 'difficulty', label: 'Difficulty', optionsKey: 'difficulties' },
  { key: 'content_type', label: 'Includes', optionsKey: 'content_types' },
];

export const DURATION_OPTIONS = [
  { value: '', label: 'Any length' },
  { value: '30', label: 'Up to 30m' },
  { value: '60', label: 'Up to 1h' },
  { value: '90', label: 'Up to 1h 30m' },
  { value: '120', label: 'Up to 2h' },
];

export function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return '—';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}
