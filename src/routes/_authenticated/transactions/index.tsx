import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Transactions } from '@/features/dashboardRelated/transactions'

const transactionSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  type: z
    .array(z.enum(['payment', 'refund', 'chargeback', 'adjustment']))
    .optional()
    .catch([]),
  status: z
    .array(z.enum(['succeeded', 'failed', 'pending']))
    .optional()
    .catch([]),
  customerId: z.number().optional().catch(undefined),
  orderId: z.number().optional().catch(undefined),
  startDate: z.string().optional().catch(''),
  endDate: z.string().optional().catch(''),
  filter: z.string().optional().catch(''),
})

// Transactions route
export const Route = createFileRoute('/_authenticated/transactions/')({
  validateSearch: transactionSearchSchema,
  component: Transactions,
})
