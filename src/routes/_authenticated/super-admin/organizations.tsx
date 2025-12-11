import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

// Lazy load SuperAdminOrganizations to enable code splitting
const SuperAdminOrganizationsPage = lazy(() => import("@/features/dashboardRelated/super-admin/pages/organizations").then((m) => ({ default: m.SuperAdminOrganizationsPage })));

export const Route = createFileRoute("/_authenticated/super-admin/organizations")({
  component: SuperAdminOrganizationsPage,
});
