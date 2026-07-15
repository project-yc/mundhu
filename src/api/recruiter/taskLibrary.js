// Task Library API — follows API_CONTRACTS_TASK_LIBRARY.md
import { authAxios } from '../../lib/axios';

// ─── Filter Options ───────────────────────────────────────────────────────────

export const getFilterOptions = async () => {
  return authAxios.get('/api/v1/library/filter-options');
};

// ─── Trudev Library ───────────────────────────────────────────────────────────

export const getTrudevLibrary = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.content_type) params.set('content_type', filters.content_type);
  if (filters.difficulty) params.set('difficulty', filters.difficulty);
  if (filters.seniority) params.set('seniority', filters.seniority);
  if (filters.domain) params.set('domain', filters.domain);
  if (filters.language) params.set('language', filters.language);
  if (filters.tag) params.set('tag', filters.tag);
  if (filters.estimated_time_min) params.set('estimated_time_min', filters.estimated_time_min);
  if (filters.estimated_time_max) params.set('estimated_time_max', filters.estimated_time_max);
  if (filters.search) params.set('search', filters.search);
  const qs = params.toString();
  return authAxios.get(`/api/v1/library/trudev${qs ? `?${qs}` : ''}`);
};

export const getTrudevItem = async (itemId) => {
  return authAxios.get(`/api/v1/library/trudev/${itemId}`);
};

export const cloneToMyLibrary = async (itemId, overrides = {}) => {
  return authAxios.post(`/api/v1/library/trudev/${itemId}/clone`, overrides);
};

// ─── My Library ───────────────────────────────────────────────────────────────

export const getMyLibrary = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.content_type) params.set('content_type', filters.content_type);
  if (filters.difficulty) params.set('difficulty', filters.difficulty);
  if (filters.seniority) params.set('seniority', filters.seniority);
  if (filters.domain) params.set('domain', filters.domain);
  if (filters.language) params.set('language', filters.language);
  if (filters.tag) params.set('tag', filters.tag);
  if (filters.estimated_time_min) params.set('estimated_time_min', filters.estimated_time_min);
  if (filters.estimated_time_max) params.set('estimated_time_max', filters.estimated_time_max);
  if (filters.search) params.set('search', filters.search);
  const qs = params.toString();
  return authAxios.get(`/api/v1/library/my${qs ? `?${qs}` : ''}`);
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
