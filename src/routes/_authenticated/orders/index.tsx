import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const orderSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  customer: z.string().optional().catch(''),
  orderStatus: z
    .array(z.enum(['reserved', 'confirmed', 'expired', 'no-status']))
    .optional()
    .catch([]),
  orderId: z.number().optional().catch(undefined),
  assignedEmployeeId: z.number().optional().catch(undefined),
})

// Lazy load Orders to enable code splitting
const Orders = lazy(() => import('@/features/dashboardRelated/orders').then(m => ({ default: m.Orders })))

// Orders route for dashboard
export const Route = createFileRoute('/_authenticated/orders/')({
  validateSearch: orderSearchSchema,
  component: Orders,
})
