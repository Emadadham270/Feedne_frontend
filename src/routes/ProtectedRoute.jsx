import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ROUTE_PATHS } from './routes.constants';

/**
 * Redirects to /login if user is not authenticated.
 * Wrap protected routes with this component.
 */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to={ROUTE_PATHS.LOGIN} replace />;
}
