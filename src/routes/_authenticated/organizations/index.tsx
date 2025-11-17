import { createFileRoute } from "@tanstack/react-router";
import { Organizations } from "@/features/dashboardRelated/organizations";

export const Route = createFileRoute("/_authenticated/organizations/")({
  component: Organizations,
});


