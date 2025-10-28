import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Orders } from '@/features/dashboardRelated/orders'

const orderSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  customer: z.string().optional().catch(''),
  orderStatus: z
    .array(z.enum(['reserved', 'confirmed', 'expired', 'no-status']))
    .optional()
    .catch([]),
  orderId: z.number().optional().catch(undefined),
})

// Orders route for dashboard
export const Route = createFileRoute('/_authenticated/orders/')({
  validateSearch: orderSearchSchema,
  component: Orders,
})
