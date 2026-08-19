// Admin management of the platform template catalogue (ADMIN role only).
//
//   GET    /api/admin/presets                      list, incl. drafts
//   POST   /api/admin/presets                      create a draft
//   GET    /api/admin/presets/<id>                 detail
//   PATCH  /api/admin/presets/<id>                 edit catalogue fields
//   DELETE /api/admin/presets/<id>                 soft delete
//   GET    /api/admin/presets/<id>/structure       the section tree
//   PUT    /api/admin/presets/<id>/structure       replace the section tree
//   POST   /api/admin/presets/<id>/publish         make visible to every org
//   POST   /api/admin/presets/<id>/unpublish       pull it from the gallery
//   POST   /api/admin/presets/from-assessment      promote an existing assessment
import { authAxios } from '../../lib/axios';

const unwrap = res => res?.data ?? res;

export const listAdminPresets = async (params = {}) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  }
  const qs = search.toString();
  const payload = unwrap(await authAxios.get(`/api/admin/presets${qs ? `?${qs}` : ''}`));
  if (Array.isArray(payload)) {
    return { items: payload, total: payload.length, page: 1, totalPages: 1 };
  }
  return {
    items: payload?.items ?? [],
    total: payload?.total ?? 0,
    page: payload?.page ?? 1,
    totalPages: payload?.total_pages ?? 1,
  };
};

export const getAdminPreset = async id =>
  unwrap(await authAxios.get(`/api/admin/presets/${id}`));

export const createAdminPreset = async body =>
  unwrap(await authAxios.post('/api/admin/presets', body));

export const updateAdminPreset = async (id, body) =>
  unwrap(await authAxios.patch(`/api/admin/presets/${id}`, body));

export const deleteAdminPreset = async id =>
  authAxios.delete(`/api/admin/presets/${id}`);

export const getAdminPresetStructure = async id =>
  unwrap(await authAxios.get(`/api/admin/presets/${id}/structure`));

// Whole-tree replace, same contract as the assessment builder's builder-state:
// absence is a delete, so always send the complete tree.
export const saveAdminPresetStructure = async (id, sections) =>
  unwrap(await authAxios.put(`/api/admin/presets/${id}/structure`, { sections }));

export const publishAdminPreset = async id =>
  unwrap(await authAxios.post(`/api/admin/presets/${id}/publish`, {}));

export const unpublishAdminPreset = async id =>
  unwrap(await authAxios.post(`/api/admin/presets/${id}/unpublish`, {}));

/**
 * Promote an existing assessment into a template.
 *
 * Only `assessment_id` is required — the duration, config and section tree all
 * come from the assessment. The rest is shelf metadata an assessment has no
 * field for: target_role, summary, skills, tags, difficulty.
 */
export const createPresetFromAssessment = async body =>
  unwrap(await authAxios.post('/api/admin/presets/from-assessment', body));
