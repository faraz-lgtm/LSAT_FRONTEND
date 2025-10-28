import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Refunds } from '@/features/dashboardRelated/refunds'

const refundSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled']))
    .optional()
    .catch([]),
  customerId: z.number().optional().catch(undefined),
  orderId: z.number().optional().catch(undefined),
  filter: z.string().optional().catch(''),
})

// Refunds route
export const Route = createFileRoute('/_authenticated/refunds/')({
  validateSearch: refundSearchSchema,
  component: Refunds,
})