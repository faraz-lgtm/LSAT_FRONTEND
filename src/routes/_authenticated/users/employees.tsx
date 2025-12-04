import z from "zod";
import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const usersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  username: z.string().optional().catch(""),
  name: z.string().optional().catch(""),
  roles: z.array(z.string()).optional().catch([]),
  status: z.array(z.string()).optional().catch([]),
});

// Lazy load EmployeesPage to enable code splitting
const EmployeesPage = lazy(() => import("@/features/dashboardRelated/users/pages/employees").then(m => ({ default: m.EmployeesPage })));

export const Route = createFileRoute("/_authenticated/users/employees")({
  validateSearch: usersSearchSchema,
  component: EmployeesPage,
});


