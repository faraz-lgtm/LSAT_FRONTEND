import z from "zod";
import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const packagesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // Facet filters
  name: z.string().optional().catch(""),
  price: z.string().optional().catch(""),
});

// Lazy load Packages to enable code splitting
const Packages = lazy(() => import('@/features/dashboardRelated/packages').then(m => ({ default: m.Packages })))

export const Route = createFileRoute('/_authenticated/packages/')({
  validateSearch: packagesSearchSchema,
  component: Packages,
})
