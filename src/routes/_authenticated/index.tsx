import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/features/dashboardRelated/dashboard'

export const Route = createFileRoute('/_authenticated/')({
  component: Dashboard,
})
