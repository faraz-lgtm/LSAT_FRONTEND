import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

// Lazy load SettingsNotifications to enable code splitting
const SettingsNotifications = lazy(() => import('@/features/dashboardRelated/settings/notifications').then(m => ({ default: m.SettingsNotifications })))

export const Route = createFileRoute('/_authenticated/settings/notifications')({
  component: SettingsNotifications,
})
