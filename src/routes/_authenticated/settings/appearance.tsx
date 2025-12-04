import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

// Lazy load SettingsAppearance to enable code splitting
const SettingsAppearance = lazy(() => import('@/features/dashboardRelated/settings/appearance').then(m => ({ default: m.SettingsAppearance })))

export const Route = createFileRoute('/_authenticated/settings/appearance')({
  component: SettingsAppearance,
})
