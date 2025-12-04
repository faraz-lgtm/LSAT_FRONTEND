import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

// Lazy load Automations to enable code splitting
const Automations = lazy(() => import("@/features/dashboardRelated/automations").then(m => ({ default: m.Automations })));

export const Route = createFileRoute("/_authenticated/automations/")({
  component: Automations,
});

