import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');

  console.log('[AdminRoute] Token:', token ? 'exists' : 'missing');
  console.log('[AdminRoute] User role:', userRole);

  if (!token) {
    console.log('[AdminRoute] No token, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'ADMIN') {
    console.log('[AdminRoute] Not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('[AdminRoute] Admin verified, allowing access');
  return children;
}
