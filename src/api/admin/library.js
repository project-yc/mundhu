import { authFetch } from '../../utils/authFetch';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

const handleApiError = async (response) => {
  if (response.status === 204) return {};
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || data.error || `HTTP Error: ${response.status}`);
  }
  return response.json();
};

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
  const response = await authFetch(`/api/admin/library/tasks${qs ? `?${qs}` : ''}`);
  return handleApiError(response);
};

export const adminUploadTaskZip = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await authFetch('/api/v1/tasks/upload-zip', {
    method: 'POST',
    body: formData,
  });
  return handleApiError(response);
};

export const adminCreateLibraryTask = async (data) => {
  const response = await authFetch('/api/admin/library/tasks', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });
  return handleApiError(response);
};

export const adminUpdateLibraryTask = async (id, data) => {
  const response = await authFetch(`/api/admin/library/tasks/${id}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });
  return handleApiError(response);
};

export const adminDeleteLibraryTask = async (id) => {
  const response = await authFetch(`/api/admin/library/tasks/${id}`, {
    method: 'DELETE',
  });
  return handleApiError(response);
};
