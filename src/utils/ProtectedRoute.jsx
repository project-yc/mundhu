import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  
  console.log('[ProtectedRoute] Token:', token ? 'exists' : 'missing');
  console.log('[ProtectedRoute] User role:', userRole);
  
  if (!token) {
    console.log('[ProtectedRoute] No token, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Redirect admins to their dashboard
  if (userRole === 'ADMIN') {
    console.log('[ProtectedRoute] Admin detected, redirecting to /admin');
    return <Navigate to="/admin" replace />;
  }
  
  console.log('[ProtectedRoute] Regular user, allowing access');
  return children;
};

export default ProtectedRoute;
