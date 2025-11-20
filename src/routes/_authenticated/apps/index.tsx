import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const appsSearchSchema = z.object({
  type: z
    .enum(['all', 'connected', 'notConnected'])
    .optional()
    .catch(undefined),
  filter: z.string().optional().catch(''),
  sort: z.enum(['asc', 'desc']).optional().catch(undefined),
})

// Lazy load Apps to enable code splitting
const Apps = lazy(() => import('@/features/dashboardRelated/apps').then(m => ({ default: m.Apps })))

export const Route = createFileRoute('/_authenticated/apps/')({
  validateSearch:  appsSearchSchema,
  component: Apps,
})
