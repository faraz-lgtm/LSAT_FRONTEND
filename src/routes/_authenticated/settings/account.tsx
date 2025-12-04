import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

// Lazy load SettingsAccount to enable code splitting
const SettingsAccount = lazy(() => import('@/features/dashboardRelated/settings/account').then(m => ({ default: m.SettingsAccount })))

export const Route = createFileRoute('/_authenticated/settings/account')({
  component: SettingsAccount,
})
