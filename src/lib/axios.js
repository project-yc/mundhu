import axios from 'axios';
import { forceLogout } from '../utils/authFetch';

const REFRESH_ENDPOINT = '/api/auth/refresh';

let isRefreshing = false;
let pendingRequests = [];

const authAxios = axios.create({
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: inject Authorization header ───────────────────────────
authAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
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
authAxios.interceptors.response.use(
  (response) => {
    if (response.status === 204) return {};
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Not 401 or already retried — normalise and throw
    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      throw new Error(extractErrorMessage(error));
    }

    // ── Queue concurrent 401s while refresh is in-flight ────────────────────
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return authAxios(originalRequest);
        })
        .catch(() => {
          throw new Error(extractErrorMessage(error));
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      isRefreshing = false;
      pendingRequests.forEach(({ reject }) => reject());
      pendingRequests = [];
      forceLogout();
      throw new Error(extractErrorMessage(error));
    }

    try {
      const res = await fetch(REFRESH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) throw new Error('Refresh failed');

      const data = await res.json();
      const newToken = data.access_token;
      localStorage.setItem('authToken', newToken);

      isRefreshing = false;
      pendingRequests.forEach(({ resolve }) => resolve(newToken));
      pendingRequests = [];

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return authAxios(originalRequest);
    } catch {
      isRefreshing = false;
      pendingRequests.forEach(({ reject }) => reject());
      pendingRequests = [];
      forceLogout();
      throw new Error(extractErrorMessage(error));
    }
  },
);

export { authAxios, forceLogout };
