import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

// Lazy load SettingsProfile to enable code splitting
const SettingsProfile = lazy(() => import('@/features/dashboardRelated/settings/profile').then(m => ({ default: m.SettingsProfile })))

export const Route = createFileRoute('/_authenticated/settings/')({
  component: SettingsProfile,
})
