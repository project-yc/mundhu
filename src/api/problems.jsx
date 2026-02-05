// API functions for B2C problem library

const API_BASE = '/api/v1/problems';

// Get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Get all problems (public)
export const getProblems = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.difficulty) params.append('difficulty', filters.difficulty);
  if (filters.category) params.append('category', filters.category);
  if (filters.search) params.append('search', filters.search);

  const queryString = params.toString();
  const url = queryString ? `${API_BASE}/?${queryString}` : `${API_BASE}/`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Failed to fetch problems');
  }

  return response.json();
};

// Get problem detail (public)
export const getProblemDetail = async (slug) => {
  const response = await fetch(`${API_BASE}/${slug}/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Failed to fetch problem');
  }

  return response.json();
};

// Get categories (public)
export const getCategories = async () => {
  const response = await fetch(`${API_BASE}/categories/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Failed to fetch categories');
  }

  return response.json();
};

// Start practice session (requires auth)
export const startPractice = async (slug) => {
  const response = await fetch(`${API_BASE}/${slug}/start/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Failed to start practice session');
  }

  return response.json();
};

// Get user dashboard (requires auth)
export const getUserDashboard = async () => {
  const response = await fetch(`${API_BASE}/me/dashboard/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Failed to fetch dashboard');
  }

  return response.json();
};

// Get user progress (requires auth)
export const getUserProgress = async () => {
  const response = await fetch(`${API_BASE}/me/progress/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Failed to fetch progress');
  }

  return response.json();
};

// Get active sessions (requires auth)
export const getActiveSessions = async () => {
  const response = await fetch(`${API_BASE}/me/sessions/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Failed to fetch sessions');
  }

  return response.json();
};

// Close a specific session (requires auth)
export const closeSession = async (sessionId) => {
  const response = await fetch(`${API_BASE}/me/sessions/${sessionId}/close/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Failed to close session');
  }

  return response.json();
};

// Close all active sessions (requires auth)
export const closeAllSessions = async () => {
  const response = await fetch(`${API_BASE}/me/sessions/close-all/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Failed to close sessions');
  }

  return response.json();
};

// Submit solution (requires auth)
export const submitSolution = async (slug, code, language) => {
  const response = await fetch(`${API_BASE}/${slug}/submit/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ code, language }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Failed to submit solution');
  }

  return response.json();
};
