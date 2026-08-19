// Assessment templates ("presets") — the prebuilt assessments a recruiter
// starts from instead of a blank builder.
//
//   GET  /api/v1/presets                        browse the gallery
//   GET  /api/v1/presets/filter-options         dropdown values for the sidebar
//   GET  /api/v1/presets/<id>                   detail + section outline
//   POST /api/v1/presets/<id>/instantiate       -> { id } of a new draft assessment
//
// Note the backend model is `AssessmentPreset`, not `AssessmentTemplate` —
// `AssessmentTemplate` is the assessment itself. The word the user sees is
// "template" everywhere; only the wire format says preset.
import { authAxios } from '../../lib/axios';

const PRESET_QUERY_KEYS = [
  'domain', 'seniority', 'difficulty', 'content_type', 'tag', 'skill',
  'search', 'duration_min', 'duration_max', 'page', 'page_size',
];

function presetQueryString(filters = {}) {
  const params = new URLSearchParams();
  for (const key of PRESET_QUERY_KEYS) {
    const value = filters[key];
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

// Same normalization as taskLibrary.js: `authAxios` already unwraps
// `response.data`, so a paginated envelope arrives as `{ items, total, ... }`
// and callers should never have to guess which layer they are holding.
function normalizePresetPage(res) {
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

export const listPresets = async (filters = {}) => {
  const res = await authAxios.get(`/api/v1/presets${presetQueryString(filters)}`);
  return normalizePresetPage(res);
};

export const getPreset = async (presetId) => {
  const res = await authAxios.get(`/api/v1/presets/${presetId}`);
  return res?.data ?? res;
};

export const getPresetFilterOptions = async () => {
  const res = await authAxios.get('/api/v1/presets/filter-options');
  return res?.data ?? res;
};

/**
 * Turn a template into a real draft assessment owned by the caller's org.
 *
 * `overrides` are the recruiter's edits from step 1 — any of name, description,
 * duration_minutes, config_json, expiry_datetime. Everything is optional; an
 * empty object is the "use it as-is" path and produces a working assessment
 * from the template's own defaults.
 *
 * Returns the same `{ id }` shape as `createAssessment`, so the builder's
 * continue handler does not branch after this point.
 */
export const instantiatePreset = async (presetId, overrides = {}) => {
  const res = await authAxios.post(`/api/v1/presets/${presetId}/instantiate`, overrides);
  return res?.data ?? res;
};
