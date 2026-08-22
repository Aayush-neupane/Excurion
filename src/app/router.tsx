import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router'
import { AppLayout } from '@/layouts/AppLayout'
import { LandingLayout } from '@/layouts/LandingLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { FullPageLoader } from '@/components/common/LoadingState'
import { ErrorBoundary } from '@/app/components/error-boundary'
import { useUserStore } from '@/store/useUserStore'

const LandingPage = lazy(() => import('@/features/landing/pages/LandingPage'))
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'))
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const MeetingRoomPage = lazy(() => import('@/features/meeting/pages/MeetingRoomPage'))
const JoinInvitePage = lazy(() => import('@/features/meeting/pages/JoinInvitePage'))
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'))
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'))
const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage'))
const NotFoundPage = lazy(() => import('@/features/not-found/pages/NotFoundPage'))

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<FullPageLoader />}>{node}</Suspense>
}

function ProtectedRoute() {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated)
  const isHydrating = useUserStore((s) => s.isHydrating)
  const location = useLocation()

  if (isHydrating) return <FullPageLoader label="Restoring session…" />
  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }
  return <Outlet />
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/app" replace />
  return children
}

export const router = createBrowserRouter([
  {
    element: <LandingLayout />,
    errorElement: (
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    ),
    children: [{ path: '/', element: withSuspense(<LandingPage />) }],
  },
  {
    path: '/login',
    element: (
      <GuestRoute>
        {withSuspense(
          <AuthLayout title="Welcome back" subtitle="Sign in to your Excurion account">
            <LoginPage />
          </AuthLayout>,
        )}
      </GuestRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestRoute>
        {withSuspense(
          <AuthLayout title="Create your account" subtitle="Start teaching or learning today">
            <RegisterPage />
          </AuthLayout>,
        )}
      </GuestRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <GuestRoute>
        {withSuspense(
          <AuthLayout title="Reset your password" subtitle="We'll email you a one-time verification code">
            <ForgotPasswordPage />
          </AuthLayout>,
        )}
      </GuestRoute>
    ),
  },
  {
    element: <ProtectedRoute />,
    errorElement: (
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    ),
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/app', element: withSuspense(<DashboardPage />) },
          { path: '/app/notifications', element: withSuspense(<NotificationsPage />) },
          { path: '/app/profile', element: withSuspense(<ProfilePage />) },
          { path: '/app/settings', element: withSuspense(<SettingsPage />) },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    errorElement: (
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    ),
    children: [
      {
        path: '/meeting/:meetingId',
        element: withSuspense(<MeetingRoomPage />),
      },
      {
        path: '/join/:roomCode',
        element: withSuspense(<JoinInvitePage />),
      },
    ],
  },
  {
    path: '*',
    element: withSuspense(<NotFoundPage />),
  },
])