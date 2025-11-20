import z from "zod";
import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const customersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  username: z.string().optional().catch(""),
  name: z.string().optional().catch(""),
  roles: z.array(z.string()).optional().catch([]),
  status: z.array(z.string()).optional().catch([]),
  leads: z.array(z.string()).optional().catch([]),
});

// Lazy load CustomersPage to enable code splitting
const CustomersPage = lazy(() => import("@/features/dashboardRelated/users/pages/customers").then(m => ({ default: m.CustomersPage })));

export const Route = createFileRoute("/_authenticated/users/customers")({
  validateSearch: customersSearchSchema,
  component: CustomersPage,
});


