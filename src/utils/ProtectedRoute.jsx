import { Navigate } from 'react-router-dom';

const ROLE_HOME = {
  ORG_ADMIN: '/recruiter/dashboard',
  ADMIN: '/admin',
  RECRUITER: '/recruiter/dashboard',
  USER: '/user/dashboard',
};

// Roles that are allowed to access RECRUITER-gated routes.
// ORG_ADMIN is the workspace creator — a superset of RECRUITER permissions.
const RECRUITER_FAMILY = new Set(['RECRUITER', 'ORG_ADMIN']);

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Always keep system admins in their area (ORG_ADMIN goes through normal routing)
  if (userRole === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  // If a required role is specified, check access.
  // ORG_ADMIN satisfies any RECRUITER-family route requirement.
  if (requiredRole) {
    const required = new Set(Array.isArray(requiredRole) ? requiredRole : [requiredRole]);
    const allowed =
      required.has(userRole) ||
      (RECRUITER_FAMILY.has(userRole) && [...required].some(r => RECRUITER_FAMILY.has(r)));

    if (!allowed) {
      const home = ROLE_HOME[userRole] || '/user/dashboard';
      return <Navigate to={home} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
