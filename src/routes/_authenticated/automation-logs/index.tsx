import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

// Lazy load AutomationLogs to enable code splitting
const AutomationLogs = lazy(() => import("@/features/dashboardRelated/automation-logs").then(m => ({ default: m.AutomationLogs })));

export const Route = createFileRoute("/_authenticated/automation-logs/")({
  component: AutomationLogs,
});

