import { Navigate } from 'react-router-dom';

const ROLE_HOME = {
  ADMIN: '/admin',
  RECRUITER: '/recruiter/dashboard',
  USER: '/user/dashboard',
};

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Always keep admins in their area
  if (userRole === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  // If this route requires a specific role and the user doesn't have it,
  // send them to their own dashboard
  if (requiredRole && userRole !== requiredRole) {
    const home = ROLE_HOME[userRole] || '/user/dashboard';
    return <Navigate to={home} replace />;
  }

  return children;
};

export default ProtectedRoute;
