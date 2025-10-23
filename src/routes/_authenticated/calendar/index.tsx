import Calendar from "@/features/dashboardRelated/calendar";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const calendarSearchSchema = z.object({});

export const Route = createFileRoute("/_authenticated/calendar/")({
  validateSearch: calendarSearchSchema,
  component: () => <Calendar />,
});


