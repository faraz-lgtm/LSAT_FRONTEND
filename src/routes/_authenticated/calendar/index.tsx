import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { lazy } from "react";

const calendarSearchSchema = z.object({});

// Lazy load Calendar to enable code splitting (Calendar is large with FullCalendar)
const Calendar = lazy(() => import("@/features/dashboardRelated/calendar").then(m => ({ default: m.default })));

export const Route = createFileRoute("/_authenticated/calendar/")({
  validateSearch: calendarSearchSchema,
  component: () => <Calendar />,
});


