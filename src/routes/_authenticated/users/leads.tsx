import z from "zod";
import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const leadsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  name: z.string().optional().catch(""),
  status: z.array(z.string()).optional().catch([]),
});

// Lazy load LeadsPage to enable code splitting
const LeadsPage = lazy(() => import("@/features/dashboardRelated/users/pages/leads").then((m) => ({ default: m.LeadsPage })));

export const Route = createFileRoute("/_authenticated/users/leads")({
  validateSearch: leadsSearchSchema,
  component: LeadsPage,
});


