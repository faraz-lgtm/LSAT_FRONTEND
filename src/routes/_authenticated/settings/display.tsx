import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

// Lazy load SettingsDisplay to enable code splitting
const SettingsDisplay = lazy(() => import('@/features/dashboardRelated/settings/display').then(m => ({ default: m.SettingsDisplay })))

export const Route = createFileRoute('/_authenticated/settings/display')({
  component: SettingsDisplay,
})
