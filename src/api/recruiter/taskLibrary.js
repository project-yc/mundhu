// Task Library API — follows API_CONTRACTS_TASK_LIBRARY.md
import { authAxios } from '../../lib/axios';

// ─── Filter Options ───────────────────────────────────────────────────────────

export const getFilterOptions = async () => {
  return authAxios.get('/api/v1/library/filter-options');
};

// ─── Shared list plumbing ─────────────────────────────────────────────────────

const LIBRARY_QUERY_KEYS = [
  'content_type', 'difficulty', 'seniority', 'domain', 'language', 'tag',
  'estimated_time_min', 'estimated_time_max', 'search', 'page', 'page_size',
];

function libraryQueryString(filters = {}) {
  const params = new URLSearchParams();
  for (const key of LIBRARY_QUERY_KEYS) {
    const value = filters[key];
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Both list endpoints return a paginated envelope. Normalizing here means
 * callers never have to guess between `res.data.items`, `res.data` and `res` —
 * that guesswork is why three separate library UIs each unwrapped differently.
 *
 * The array branch tolerates a backend still serving the old bare list, so the
 * two sides can deploy independently.
 */
function normalizeLibraryPage(res) {
  const payload = res?.data ?? res ?? {};
  if (Array.isArray(payload)) {
    return { items: payload, total: payload.length, page: 1, totalPages: 1 };
  }
  return {
    items: payload.items ?? [],
    total: payload.total ?? 0,
    page: payload.page ?? 1,
    totalPages: payload.total_pages ?? 1,
  };
}

// ─── Trudev Library ───────────────────────────────────────────────────────────

export const getTrudevLibrary = async (filters = {}) => {
  const res = await authAxios.get(`/api/v1/library/trudev${libraryQueryString(filters)}`);
  return normalizeLibraryPage(res);
};

export const getTrudevItem = async (itemId) => {
  return authAxios.get(`/api/v1/library/trudev/${itemId}`);
};

// Forks any item the caller can see into their own library — Trudev items and,
// since the builder needs it, the org's own items too (editing an in-use
// question must copy rather than rewrite the original).
export const cloneToMyLibrary = async (itemId, overrides = {}) => {
  return authAxios.post(`/api/v1/library/items/${itemId}/clone`, overrides);
};

// ─── My Library ───────────────────────────────────────────────────────────────

export const getMyLibrary = async (filters = {}) => {
  const res = await authAxios.get(`/api/v1/library/my${libraryQueryString(filters)}`);
  return normalizeLibraryPage(res);
};

export const createMyLibraryItem = async (body) => {
  return authAxios.post('/api/v1/library/my', body);
};

export const updateMyLibraryItem = async (itemId, body) => {
  return authAxios.patch(`/api/v1/library/my/${itemId}`, body);
};

export const deleteMyLibraryItem = async (itemId) => {
  return authAxios.delete(`/api/v1/library/my/${itemId}`);
};

// ─── Question-bank import ─────────────────────────────────────────────────────

// Step 1: read the headers and propose a column mapping. Nothing is persisted.
// Real question banks use "Q Text" / "Choice 1..5" / "Answer Key", so the
// mapping is inferred rather than a fixed schema being demanded.
// `contentType` picks what the columns mean — options + answer key for MCQ,
// ordered items for ranking, a model answer for free text. A prose .docx/.pdf
// has no columns, so the response comes back with `needs_mapping: false` and the
// questions already read; the caller skips the mapping stage.
export const inspectQuestionFile = async (file, contentType = 'mcq') => {
  const body = new FormData();
  body.append('file', file);
  body.append('content_type', contentType);
  return authAxios.post('/api/v1/library/import/inspect', body);
};

// Step 2: parse every row through the mapping the user confirmed. Still nothing
// persisted — the caller saves what it keeps via createMyLibraryItem.
export const parseQuestionFile = async (file, mapping, contentType = 'mcq') => {
  const body = new FormData();
  body.append('file', file);
  body.append('mapping', JSON.stringify(mapping));
  body.append('content_type', contentType);
  return authAxios.post('/api/v1/library/import/parse', body);
};

// ─── Technical task files (read-only code viewer) ─────────────────────────────

// Returns { item, files[], entry_file, truncated, source } for a technical task.
// Only candidate-visible starter files are served — never hidden tests or solutions.
export const getTaskFiles = async (itemId) => {
  return authAxios.get(`/api/v1/library/items/${itemId}/files`);
};

// ─── Attach / Detach ──────────────────────────────────────────────────────────

export const attachToAssessment = async (assessmentId, { assessment_item_id, section_id, order, points }) => {
  return authAxios.post(`/api/v1/assessments/${assessmentId}/library-items`, {
    assessment_item_id,
    section_id,
    order,
    points,
  });
};

export const getAttachedItems = async (assessmentId) => {
  return authAxios.get(`/api/v1/assessments/${assessmentId}/library-items`);
};

export const detachFromAssessment = async (assessmentId, sectionItemId) => {
  return authAxios.delete(`/api/v1/assessments/${assessmentId}/library-items/${sectionItemId}`);
};
