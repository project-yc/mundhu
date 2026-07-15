import { authAxios } from '../../lib/axios';

export const adminGetLibraryTasks = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.difficulty) params.set('difficulty', filters.difficulty);
  if (filters.seniority) params.set('seniority', filters.seniority);
  if (filters.domain) params.set('domain', filters.domain);
  if (filters.language) params.set('language', filters.language);
  if (filters.search) params.set('search', filters.search);
  if (filters.is_published !== undefined && filters.is_published !== '')
    params.set('is_published', String(filters.is_published));
  const qs = params.toString();
  return authAxios.get(`/api/admin/library/tasks${qs ? `?${qs}` : ''}`);
};

export const adminUploadTaskZip = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return authAxios.post('/api/v1/tasks/upload-zip', formData);
};

export const adminCreateLibraryTask = async (data) => {
  return authAxios.post('/api/admin/library/tasks', data);
};

export const adminUpdateLibraryTask = async (id, data) => {
  return authAxios.patch(`/api/admin/library/tasks/${id}`, data);
};

export const adminDeleteLibraryTask = async (id) => {
  return authAxios.delete(`/api/admin/library/tasks/${id}`);
};
