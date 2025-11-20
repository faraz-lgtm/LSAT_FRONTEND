import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

// Lazy load Organizations to enable code splitting
const Organizations = lazy(() => import("@/features/dashboardRelated/organizations").then(m => ({ default: m.Organizations })));

export const Route = createFileRoute("/_authenticated/organizations/")({
  component: Organizations,
});


