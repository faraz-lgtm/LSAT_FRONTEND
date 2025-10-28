import { AutomationLogs } from "@/features/dashboardRelated/automation-logs";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/automation-logs/")({
  component: AutomationLogs,
});

