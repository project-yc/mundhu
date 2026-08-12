import axios from 'axios';

import { forceLogout, getAccessToken, refreshAccessToken } from './session';

const authAxios = axios.create({
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: inject Authorization header ───────────────────────────
authAxios.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Let axios auto-set Content-Type for FormData (don't override)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// ── Error message extractor ───────────────────────────────────────────────────
function extractErrorMessage(error) {
  if (error.response?.data) {
    const d = error.response.data;
    return d.message || d.detail || d.error || `HTTP Error: ${error.response.status}`;
  }
  return error.message || `HTTP Error: ${error.response?.status || 'Network Error'}`;
}

// ── Response interceptor ──────────────────────────────────────────────────────
//
// Refresh is delegated to lib/session, which owns the single-flight lock and
// persists rotated refresh tokens. This file used to run its own refresh with
// its own lock — see docs/audits/01-account-creation-auth.md (L5).
authAxios.interceptors.response.use(
  (response) => {
    if (response.status === 204) return {};
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Not a 401, or we already retried this one — normalise and throw
    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      throw new Error(extractErrorMessage(error));
    }

    originalRequest._retry = true;

    const newToken = await refreshAccessToken();
    if (!newToken) {
      forceLogout();
      throw new Error(extractErrorMessage(error));
    }

    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return authAxios(originalRequest);
  },
);

export { authAxios, forceLogout };
