import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

// Define the filter options directly here since we removed the data folder
const statuses = [
  { label: 'Pending', value: 'pending' as const },
  { label: 'In Progress', value: 'in_progress' as const },
  { label: 'Completed', value: 'completed' as const },
  { label: 'Cancelled', value: 'cancelled' as const },
]

const priorities = [
  { label: 'Low', value: 'low' as const },
  { label: 'Medium', value: 'medium' as const },
  { label: 'High', value: 'high' as const },
]

const taskSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(z.enum(statuses.map((status) => status.value)))
    .optional()
    .catch([]),
  priority: z
    .array(z.enum(priorities.map((priority) => priority.value)))
    .optional()
    .catch([]),
  filter: z.string().optional().catch(''),
})

// Lazy load Tasks to enable code splitting
const Tasks = lazy(() => import('@/features/dashboardRelated/tasks').then(m => ({ default: m.Tasks })))

export const Route = createFileRoute('/_authenticated/tasks/')({
  validateSearch: taskSearchSchema,
  component: Tasks,
})
