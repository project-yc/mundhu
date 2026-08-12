import { Navigate } from 'react-router-dom';

import { useAuth } from '../auth/authContext';

/**
 * Platform-admin guard, backed by the verified session.
 *
 * The console.log calls that printed token presence and role on every render
 * are gone — they leaked session state into the browser console of anyone who
 * opened devtools, and shipped to production.
 */
export default function AdminRoute({ children }) {
  const { role, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
}
