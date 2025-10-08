import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Apps } from '@/features/dashboardRelated/apps'

const appsSearchSchema = z.object({
  type: z
    .enum(['all', 'connected', 'notConnected'])
    .optional()
    .catch(undefined),
  filter: z.string().optional().catch(''),
  sort: z.enum(['asc', 'desc']).optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/apps/')({
  validateSearch:  appsSearchSchema,
  // validateSearch: (s: Record<string, unknown>) => ({
  //   filter: typeof s.filter === 'string' ? s.filter : '',
  //   type:
  //     s.type === 'connected' || s.type === 'notConnected' || s.type === 'all'
  //       ? (s.type as 'all' | 'connected' | 'notConnected')
  //       : 'all',
  //   sort: s.sort === 'desc' ? 'desc' : 'asc',
  // }),
  component: Apps,
})
