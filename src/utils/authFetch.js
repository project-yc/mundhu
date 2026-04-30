/**
 * authFetch — auth-aware fetch wrapper with silent token refresh.
 *
 * On a 401 response:
 *  1. Calls /api/auth/refresh with the stored refresh token.
 *  2. If refresh succeeds, stores the new access token and retries the
 *     original request once.
 *  3. If refresh fails (refresh token also expired), clears session and
 *     redirects to /login.
 *
 * Multiple concurrent requests that all 401 at the same time are queued
 * and resolved after a single refresh call.
 */

const REFRESH_ENDPOINT = '/api/auth/refresh';

let isRefreshing = false;
let pendingRequests = [];

const flushPending = (newToken) => {
  pendingRequests.forEach((cb) => cb(newToken));
  pendingRequests = [];
};

const rejectPending = () => {
  pendingRequests.forEach((cb) => cb(null));
  pendingRequests = [];
};

export const forceLogout = () => {
  ['authToken', 'refreshToken', 'user', 'userRole', 'org'].forEach((k) =>
    localStorage.removeItem(k),
  );
  window.location.href = '/login';
};

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  try {
    const res = await fetch(REFRESH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const newToken = data.access_token;
    if (newToken) {
      localStorage.setItem('authToken', newToken);
    }
    return newToken || null;
  } catch {
    return null;
  }
};

/**
 * Drop-in replacement for fetch() that injects the Authorization header and
 * handles silent token refresh on 401.
 *
 * The Authorization header is always injected/overwritten — callers should
 * not include it manually.  All other options (method, body, headers) are
 * passed through unchanged.
 */
export const authFetch = async (url, options = {}) => {
  const withAuth = (token) => ({
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  let response = await fetch(url, withAuth(localStorage.getItem('authToken')));

  if (response.status !== 401) {
    return response;
  }

  // ── 401 — attempt silent refresh ──────────────────────────────────────

  if (isRefreshing) {
    // Queue this request until the in-flight refresh finishes
    return new Promise((resolve) => {
      pendingRequests.push((newToken) => {
        if (!newToken) {
          resolve(response); // forceLogout already called
          return;
        }
        resolve(fetch(url, withAuth(newToken)));
      });
    });
  }

  isRefreshing = true;
  const newToken = await refreshAccessToken();
  isRefreshing = false;

  if (!newToken) {
    rejectPending();
    forceLogout();
    return response;
  }

  flushPending(newToken);
  return fetch(url, withAuth(newToken));
};
