import z from "zod";
import { createFileRoute } from '@tanstack/react-router'
import { Packages } from '@/features/dashboardRelated/packages'

const packagesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // Facet filters
  name: z.string().optional().catch(""),
  price: z.string().optional().catch(""),
});

export const Route = createFileRoute('/_authenticated/packages/')({
  validateSearch: packagesSearchSchema,
  component: Packages,
})
