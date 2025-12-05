import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

// Lazy load Payments to enable code splitting
const Payments = lazy(() => import('@/features/dashboardRelated/payments').then(m => ({ default: m.Payments })))

// Payments route for dashboard
export const Route = createFileRoute('/_authenticated/payments/')({
  component: Payments,
})

