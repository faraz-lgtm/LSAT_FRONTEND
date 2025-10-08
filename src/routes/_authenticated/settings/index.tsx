import { createFileRoute } from '@tanstack/react-router'
import { SettingsProfile } from '@/features/dashboardRelated/settings/profile'

export const Route = createFileRoute('/_authenticated/settings/')({
  component: SettingsProfile,
})
