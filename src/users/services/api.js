import axios from 'axios';
import { forceLogout } from '../../utils/authFetch';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const REFRESH_ENDPOINT = '/api/auth/refresh';

let isRefreshing = false;
let pendingRequests = [];

const userApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const normalizeApiError = (error) => {
  const message =
    error.response?.data?.detail ||
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    'Something went wrong. Please try again.';

  const normalizedError = new Error(message);
  normalizedError.status = error.response?.status;
  return normalizedError;
};

userApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(normalizeApiError(error));
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return userApi(originalRequest);
        })
        .catch(() => Promise.reject(normalizeApiError(error)));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      isRefreshing = false;
      pendingRequests.forEach(({ reject }) => reject());
      pendingRequests = [];
      forceLogout();
      return Promise.reject(normalizeApiError(error));
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
      return userApi(originalRequest);
    } catch {
      isRefreshing = false;
      pendingRequests.forEach(({ reject }) => reject());
      pendingRequests = [];
      forceLogout();
      return Promise.reject(normalizeApiError(error));
    }
  },
);

export default userApi;
