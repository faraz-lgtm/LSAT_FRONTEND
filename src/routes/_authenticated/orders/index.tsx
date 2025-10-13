import { createFileRoute } from '@tanstack/react-router'
import { Orders } from '@/features/dashboardRelated/orders'

// Orders route for dashboard
export const Route = createFileRoute('/_authenticated/orders/')({
  component: Orders,
})
