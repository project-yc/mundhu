import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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
  (error) => Promise.reject(normalizeApiError(error)),
);

export default userApi;
