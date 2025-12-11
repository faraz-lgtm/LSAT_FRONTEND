import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

// Lazy load SuperAdminDashboardPage to enable code splitting
const SuperAdminDashboardPage = lazy(() => import("@/features/dashboardRelated/super-admin/pages/dashboard").then((m) => ({ default: m.SuperAdminDashboardPage })));

export const Route = createFileRoute("/_authenticated/super-admin/dashboard")({
  component: SuperAdminDashboardPage,
});
