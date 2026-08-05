import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { ROUTE_PATHS } from './routes.constants';
import { Spinner } from '@/components/ui/Skeleton';

// Lazy-load pages for code splitting
const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const ExplorePage = lazy(() => import('@/pages/ExplorePage').then((m) => ({ default: m.ExplorePage })));
const TrendingPage = lazy(() => import('@/pages/TrendingPage').then((m) => ({ default: m.TrendingPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const MessagesPage = lazy(() => import('@/pages/MessagesPage').then((m) => ({ default: m.MessagesPage })));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('@/pages/SignupPage').then((m) => ({ default: m.SignupPage })));

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
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
