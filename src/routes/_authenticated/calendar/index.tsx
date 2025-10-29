import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { lazy, Suspense } from "react";

// Lazy load Calendar component (includes FullCalendar ~250KB)
const Calendar = lazy(() => import("@/features/dashboardRelated/calendar"));

const calendarSearchSchema = z.object({});

export const Route = createFileRoute("/_authenticated/calendar/")({
  validateSearch: calendarSearchSchema,
  component: () => (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading calendar...</div>}>
      <Calendar />
    </Suspense>
  ),
});


