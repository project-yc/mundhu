import { Navigate } from 'react-router-dom';

import { useAuth } from '../auth/authContext';

const ROLE_HOME = {
  ORG_ADMIN: '/recruiter/dashboard',
  ADMIN: '/admin',
  RECRUITER: '/recruiter/dashboard',
  USER: '/user/dashboard',
};

// Roles that are allowed to access RECRUITER-gated routes.
// ORG_ADMIN is the workspace creator — a superset of RECRUITER permissions.
//
// KNOWN GAP (pre-existing, not introduced by the auth audit): REVIEWER and
// OBSERVER are absent from both this set and ROLE_HOME, so they match no
// protected route and fall through to `/user/dashboard`, which rejects them
// too — an infinite redirect. They can be invited (orgs/serializers.py) and
// the backend grants them read access via IsOrgViewerOrAdmin, but the UI has
// no home for them. Fixing it means deciding what a read-only member should
// see, which is a product call rather than a security one.
const RECRUITER_FAMILY = new Set(['RECRUITER', 'ORG_ADMIN']);

/**
 * Route guard backed by the verified session rather than localStorage.
 *
 * This used to test only that an `authToken` key existed, so an expired or
 * hand-edited token still rendered the entire recruiter shell until the first
 * API call happened to fail. It now waits for `/api/auth/v1/me`.
 *
 * See docs/audits/01-account-creation-auth.md (M4).
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { role, isLoading, isAuthenticated } = useAuth();

  // Session still being verified — render nothing rather than guessing.
  // Guessing right is a flash of the dashboard; guessing wrong is a bogus
  // redirect that loses the user's destination.
  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Always keep platform admins in their area (ORG_ADMIN routes normally)
  if (role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  if (requiredRole) {
    const required = new Set(Array.isArray(requiredRole) ? requiredRole : [requiredRole]);
    const allowed =
      required.has(role) ||
      (RECRUITER_FAMILY.has(role) && [...required].some((r) => RECRUITER_FAMILY.has(r)));

    if (!allowed) {
      const home = ROLE_HOME[role] || '/user/dashboard';
      return <Navigate to={home} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
