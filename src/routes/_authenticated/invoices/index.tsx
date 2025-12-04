import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const invoiceSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(z.enum(['draft', 'sent', 'paid', 'overdue', 'void']))
    .optional()
    .catch([]),
  customerId: z.number().optional().catch(undefined),
  orderId: z.number().optional().catch(undefined),
  startDate: z.string().optional().catch(''),
  endDate: z.string().optional().catch(''),
  filter: z.string().optional().catch(''),
})

// Lazy load Invoices to enable code splitting
const Invoices = lazy(() => import('@/features/dashboardRelated/invoices').then(m => ({ default: m.Invoices })))

// Invoices route
export const Route = createFileRoute('/_authenticated/invoices/')({
  validateSearch: invoiceSearchSchema,
  component: Invoices,
})