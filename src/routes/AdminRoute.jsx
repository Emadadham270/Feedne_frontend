import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/**
 * AdminRoute — wraps routes that require ADMIN role.
 * Redirects non-admins to the 403 Forbidden page.
 */
export function AdminRoute() {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/403" replace />;

  return <Outlet />;
}
