import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

// Lazy load SuperAdminUsage to enable code splitting
const SuperAdminUsagePage = lazy(() => import("@/features/dashboardRelated/super-admin/pages/usage").then((m) => ({ default: m.SuperAdminUsagePage })));

export const Route = createFileRoute("/_authenticated/super-admin/usage")({
  component: SuperAdminUsagePage,
});
