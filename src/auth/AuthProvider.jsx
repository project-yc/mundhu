/**
 * The app's single source of truth for "who is signed in".
 *
 * Previously there was none: role, org, and `is_onboarded` were read from
 * localStorage at ~8 call sites and never re-validated, so an expired token
 * still rendered the full recruiter shell until the first API call failed, and
 * editing `localStorage.userRole` changed what the UI would render.
 *
 * localStorage is now a cache for first paint only — `/api/auth/v1/me` is the
 * authority, and it reads membership from the database rather than the token's
 * claims, so a suspension or role change lands on the next load.
 *
 * See docs/audits/01-account-creation-auth.md (M3, M4).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import { authFetch } from '../utils/authFetch';
import {
  clearSession,
  forceLogout as sessionLogout,
  getAccessToken,
  storeAuthData,
} from '../lib/session';
import { AuthContext } from './authContext';

const ME_ENDPOINT = '/api/auth/v1/me';

const EMPTY_SESSION = { user: null, org: null, role: null, permissions: {} };

/** Optimistic read of the cached session, so the first paint isn't a spinner. */
function readCachedSession() {
  const parse = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null');
    } catch {
      return null;
    }
  };
  return {
    user: parse('user'),
    org: parse('org'),
    role: localStorage.getItem('userRole'),
    permissions: parse('permissions') || {},
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readCachedSession);
  // 'loading' until /me answers; the guards wait rather than guessing.
  const [state, setState] = useState(() => (getAccessToken() ? 'loading' : 'anonymous'));

  const applyMe = useCallback((data) => {
    setSession({
      user: data.user,
      org: data.org,
      role: data.role,
      permissions: data.permissions || {},
    });
    storeAuthData(data); // keep the cache warm for the next first paint
    setState('authenticated');
  }, []);

  // Clear silently — never redirect from here, or a background revalidation
  // could yank a candidate out of an assessment.
  const clearAuth = useCallback(() => {
    clearSession();
    setSession(EMPTY_SESSION);
    setState('anonymous');
  }, []);

  /** Ask the server who we are. Returns null if the session is gone. */
  const fetchMe = useCallback(async () => {
    const res = await authFetch(ME_ENDPOINT);
    // authFetch already attempted a refresh; a failure here is terminal.
    return res.ok ? res.json() : null;
  }, []);

  const revalidate = useCallback(async () => {
    if (!getAccessToken()) {
      clearAuth();
      return null;
    }
    try {
      const data = await fetchMe();
      if (!data) {
        clearAuth();
        return null;
      }
      applyMe(data);
      return data;
    } catch {
      // Network blip — keep whatever we had rather than logging the user out.
      setState((prev) => (prev === 'loading' ? 'authenticated' : prev));
      return null;
    }
  }, [applyMe, clearAuth, fetchMe]);

  useEffect(() => {
    // With no token the initial state is already 'anonymous', so there is
    // nothing to do. Otherwise every state update below happens after an
    // await, so this effect never triggers a synchronous cascading render.
    if (!getAccessToken()) return undefined;

    let cancelled = false;
    (async () => {
      try {
        const data = await fetchMe();
        if (cancelled) return;
        if (data) applyMe(data);
        else clearAuth();
      } catch {
        if (!cancelled) {
          setState((prev) => (prev === 'loading' ? 'authenticated' : prev));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchMe, applyMe, clearAuth]);

  // Keep tabs in step: signing out in one tab must not leave another rendering
  // a populated dashboard.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === 'authToken' || event.key === null) {
        revalidate();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [revalidate]);

  const login = useCallback((data) => {
    storeAuthData(data);
    setSession({
      user: data.user,
      org: data.org,
      role: data.role,
      permissions: data.permissions || {},
    });
    setState('authenticated');
  }, []);

  const logout = useCallback(async () => {
    setState('anonymous');
    setSession(EMPTY_SESSION);
    await sessionLogout();
  }, []);

  const value = useMemo(
    () => ({
      ...session,
      state,
      isLoading: state === 'loading',
      isAuthenticated: state === 'authenticated',
      login,
      logout,
      revalidate,
    }),
    [session, state, login, logout, revalidate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
