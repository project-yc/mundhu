/**
 * Auth context object and its hook.
 *
 * Kept apart from the provider component so this module exports no components
 * — otherwise React Fast Refresh cannot hot-reload the provider.
 */

import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
