import { Automations } from "@/features/dashboardRelated/automations";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/automations/")({
  component: Automations,
});

