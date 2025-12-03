import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const statuses = [
  { label: 'Pending', value: 'pending' as const },
  { label: 'In Progress', value: 'in_progress' as const },
  { label: 'Completed', value: 'completed' as const },
  { label: 'Cancelled', value: 'cancelled' as const },
]

const attendanceStatuses = [
  { label: 'Unknown', value: 'UNKNOWN' as const },
  { label: 'Showed', value: 'SHOWED' as const },
  { label: 'No Show', value: 'NO_SHOW' as const },
]

const appointmentSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(z.enum(statuses.map((status) => status.value)))
    .optional()
    .catch([]),
  attendanceStatus: z
    .array(z.enum(attendanceStatuses.map((status) => status.value)))
    .optional()
    .catch([]),
  filter: z.string().optional().catch(''),
})

// Lazy load Appointments to enable code splitting
const Appointments = lazy(() => import('@/features/dashboardRelated/appointments').then(m => ({ default: m.Appointments })))

export const Route = createFileRoute('/_authenticated/appointments/')({
  validateSearch: appointmentSearchSchema,
  component: Appointments,
})

