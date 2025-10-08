import { createFileRoute } from '@tanstack/react-router'
import { Settings } from '@/features/dashboardRelated/settings'

export const Route = createFileRoute('/_authenticated/settings')({
  component: Settings,
})
