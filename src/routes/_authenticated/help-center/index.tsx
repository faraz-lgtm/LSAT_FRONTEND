import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

// Lazy load ComingSoon to enable code splitting
const ComingSoon = lazy(() => import('@/components/dashboard/coming-soon').then(m => ({ default: m.ComingSoon })))

export const Route = createFileRoute('/_authenticated/help-center/')({
  component: ComingSoon,
})
