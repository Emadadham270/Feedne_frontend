import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { ROUTE_PATHS } from './routes.constants';
import { Spinner } from '@/components/ui/Skeleton';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { OfflineDetector } from '@/components/shared/OfflineDetector';

// Error pages
import { NotFoundPage } from '@/pages/error/NotFoundPage';
import { ServerErrorPage } from '@/pages/error/ServerErrorPage';
import { NoInternetPage } from '@/pages/error/NoInternetPage';
import { ForbiddenPage } from '@/pages/error/ForbiddenPage';

// Lazy-load pages for code splitting
const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const ExplorePage = lazy(() => import('@/pages/ExplorePage').then((m) => ({ default: m.ExplorePage })));
const TrendingPage = lazy(() => import('@/pages/TrendingPage').then((m) => ({ default: m.TrendingPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const MessagesPage = lazy(() => import('@/pages/MessagesPage').then((m) => ({ default: m.MessagesPage })));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const GroupPage = lazy(() => import('@/pages/GroupPage').then((m) => ({ default: m.GroupPage })));
const JoinGroupPage = lazy(() => import('@/pages/JoinGroupPage').then((m) => ({ default: m.JoinGroupPage })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('@/pages/SignupPage').then((m) => ({ default: m.SignupPage })));
const AdminPage = lazy(() => import('@/features/admin/AdminPage').then((m) => ({ default: m.AdminPage })));

const PageFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Spinner size="lg" />
  </div>
);

const router = createBrowserRouter([
  // Public routes
  {
    path: ROUTE_PATHS.LOGIN,
    element: <Suspense fallback={<PageFallback />}><LoginPage /></Suspense>,
  },
  {
    path: ROUTE_PATHS.SIGNUP,
    element: <Suspense fallback={<PageFallback />}><SignupPage /></Suspense>,
  },

  // Explicit Error Pages
  { path: '/404', element: <NotFoundPage /> },
  { path: '/500', element: <ServerErrorPage /> },
  { path: '/offline', element: <NoInternetPage /> },
  { path: '/403', element: <ForbiddenPage /> },

  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: ROUTE_PATHS.HOME,
        element: <Suspense fallback={<PageFallback />}><HomePage /></Suspense>,
      },
      {
        path: ROUTE_PATHS.EXPLORE,
        element: <Suspense fallback={<PageFallback />}><ExplorePage /></Suspense>,
      },
      {
        path: ROUTE_PATHS.TRENDING,
        element: <Suspense fallback={<PageFallback />}><TrendingPage /></Suspense>,
      },
      {
        path: ROUTE_PATHS.PROFILE,
        element: <Suspense fallback={<PageFallback />}><ProfilePage /></Suspense>,
      },
      {
        path: ROUTE_PATHS.SETTINGS,
        element: <Suspense fallback={<PageFallback />}><SettingsPage /></Suspense>,
      },
      {
        path: ROUTE_PATHS.MESSAGES,
        element: <Suspense fallback={<PageFallback />}><MessagesPage /></Suspense>,
      },
      {
        path: ROUTE_PATHS.NOTIFICATIONS,
        element: <Suspense fallback={<PageFallback />}><NotificationsPage /></Suspense>,
      },
      {
        path: ROUTE_PATHS.GROUP,
        element: <Suspense fallback={<PageFallback />}><GroupPage /></Suspense>,
      },
      {
        path: ROUTE_PATHS.GROUP_JOIN,
        element: <Suspense fallback={<PageFallback />}><JoinGroupPage /></Suspense>,
      },
    ],
  },

  // Admin-only routes
  {
    element: <AdminRoute />,
    children: [
      {
        path: ROUTE_PATHS.ADMIN,
        element: <Suspense fallback={<PageFallback />}><AdminPage /></Suspense>,
      },
    ],
  },

  // Wildcard 404 Not Found Catch-All Route
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export function AppRouter() {
  return (
    <ErrorBoundary>
      <OfflineDetector>
        <RouterProvider router={router} />
      </OfflineDetector>
    </ErrorBoundary>
  );
}
