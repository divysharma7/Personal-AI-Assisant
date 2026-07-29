import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import AppLayout from './AppLayout'
import RequireAuth from './RequireAuth'
import NotFoundPage from '@/app/not-found'

/**
 * Lazy route helper.
 *
 * Every page.tsx in `src/app/**` exports a default React component.
 * React Router v7's `lazy` route API expects the function to return a
 * partial route object — here we extract the module's default export
 * as `Component` so the router renders it automatically.
 */
const lazyRoute = (importFn: () => Promise<{ default: React.ComponentType }>) => ({
  lazy: () => importFn().then((m) => ({ Component: m.default })),
})

const routes: RouteObject[] = [
  // ── Public routes ───────────────────────────────────────────────────
  { path: '/login', ...lazyRoute(() => import('@/app/login/page')) },
  { path: '/signup', ...lazyRoute(() => import('@/app/signup/page')) },
  { path: '/onboarding', ...lazyRoute(() => import('@/app/onboarding/page')) },
  { path: '/getting-started', ...lazyRoute(() => import('@/app/getting-started/page')) },

  // ── Protected routes ───────────────────────────────────────────────
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', ...lazyRoute(() => import('@/app/page')) },
          { path: '/agenda', ...lazyRoute(() => import('@/app/agenda/page')) },
          { path: '/calendar', ...lazyRoute(() => import('@/app/calendar/page')) },
          { path: '/chat', ...lazyRoute(() => import('@/app/chat/page')) },
          { path: '/focus', ...lazyRoute(() => import('@/app/focus/page')) },
          { path: '/habits', ...lazyRoute(() => import('@/app/habits/page')) },
          { path: '/habits/checkin', ...lazyRoute(() => import('@/app/habits/checkin/page')) },
          { path: '/lists', ...lazyRoute(() => import('@/app/lists/page')) },
          { path: '/lists/:id', ...lazyRoute(() => import('@/app/lists/[id]/page')) },
          { path: '/matrix', ...lazyRoute(() => import('@/app/matrix/page')) },
          { path: '/profile', ...lazyRoute(() => import('@/app/profile/page')) },
          { path: '/settings', ...lazyRoute(() => import('@/app/settings/page')) },
          { path: '/statistics', ...lazyRoute(() => import('@/app/statistics/page')) },
          { path: '/tasks', ...lazyRoute(() => import('@/app/tasks/page')) },
          { path: '/today', ...lazyRoute(() => import('@/app/today/page')) },
          { path: '/workflows/:id', ...lazyRoute(() => import('@/app/workflows/[id]/page')) },
        ],
      },
    ],
  },

  // ── Top-level 404 (outside auth) ───────────────────────────────────
  { path: '*', element: <NotFoundPage /> },
]

export const router = createBrowserRouter(routes)
