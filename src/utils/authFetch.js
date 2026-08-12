/**
 * authFetch — auth-aware fetch wrapper with silent token refresh.
 *
 * On a 401 it asks `lib/session` for a fresh access token and retries once.
 * The refresh itself (single-flight lock, rotated-token persistence, cross-tab
 * recovery) lives in that module so this and `lib/axios` cannot drift apart —
 * they previously held separate locks and could fire two refreshes at once,
 * which with token rotation logs the user out.
 *
 * See docs/audits/01-account-creation-auth.md (L5).
 */

import { forceLogout, getAccessToken, refreshAccessToken } from '../lib/session';

export { forceLogout };

/**
 * Drop-in replacement for fetch() that injects the Authorization header and
 * handles silent token refresh on 401.
 *
 * The Authorization header is always injected/overwritten — callers should
 * not include it manually. All other options (method, body, headers) are
 * passed through unchanged.
 */
export const authFetch = async (url, options = {}) => {
  const withAuth = (token) => ({
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const response = await fetch(url, withAuth(getAccessToken()));

  if (response.status !== 401) {
    return response;
  }

  const newToken = await refreshAccessToken();
  if (!newToken) {
    forceLogout();
    return response;
  }

  return fetch(url, withAuth(newToken));
};
