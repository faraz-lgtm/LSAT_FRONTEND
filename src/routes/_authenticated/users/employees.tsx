import z from "zod";
import { createFileRoute } from "@tanstack/react-router";
import { EmployeesPage } from "@/features/dashboardRelated/users/pages/employees";

const usersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  username: z.string().optional().catch(""),
  roles: z.array(z.string()).optional().catch([]),
  status: z.array(z.string()).optional().catch([]),
});

export const Route = createFileRoute("/_authenticated/users/employees")({
  validateSearch: usersSearchSchema,
  component: EmployeesPage,
});


