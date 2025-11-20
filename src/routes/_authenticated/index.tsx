import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

// Lazy load dashboard to enable code splitting
const Dashboard = lazy(() => import('@/features/dashboardRelated/dashboard').then(m => ({ default: m.Dashboard })))

export const Route = createFileRoute('/_authenticated/')({
  component: Dashboard,
})
