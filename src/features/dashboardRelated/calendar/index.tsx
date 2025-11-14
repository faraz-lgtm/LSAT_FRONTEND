/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import "@/styles/calendar.css";
import type {
  DayCellContentArg,
  DayHeaderContentArg,
  EventChangeArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import multiMonthPlugin from "@fullcalendar/multimonth";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";

import { Card } from "@/components/dashboard/ui/calendarRelatedUI/ui/card";
import { Separator } from "@/components/dashboard/ui/calendarRelatedUI/ui/separator";
import { type CalendarEvent } from "@/utils/calendar/data";
import { useMemo, useRef, useState, useCallback } from "react";
import CalendarNav from "./components/calendar-nav";
import { TasksMutateDrawer } from "@/features/dashboardRelated/tasks/components/tasks-mutate-drawer";
import { useGetTasksQuery } from "@/redux/apiSlices/Task/taskSlice";
import { AppointmentsViewDialog } from "@/features/dashboardRelated/tasks/components/appointments-view-dialog";
import { useGetUsersQuery } from "@/redux/apiSlices/User/userSlice";
import type { TaskOutputDto, UserOutput } from "@/types/api/data-contracts";

type EventItemProps = {
  info: EventContentArg;
};

type DayHeaderProps = {
  info: DayHeaderContentArg;
};

type DayRenderProps = {
  info: DayCellContentArg;
};

export default function Calendar() {
  const calendarRef = useRef<FullCalendar | null>(null);

  // Track current FullCalendar visible range for server query
  const [viewRange, setViewRange] = useState<{ start: Date; end: Date }>(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start, end };
  });

  // Fetch tasks (including Google events via backend) for the visible range
  const { data, isLoading, isFetching } = useGetTasksQuery({
    startDate: viewRange.start.toISOString(),
    endDate: viewRange.end.toISOString(),
    googleCalendar: true,
  });

  // Fetch users for the appointment dialog
  const { data: usersData } = useGetUsersQuery({});

  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskOutputDto | undefined>(undefined);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);

  // Create user lookup maps
  const userIdToUser = useMemo(() => {
    if (!usersData?.data) return {};
    return (usersData.data || []).reduce<Record<number, UserOutput>>((acc, u) => {
      acc[u.id] = u;
      return acc;
    }, {});
  }, [usersData]);

  const emailToUser = useMemo(() => {
    if (!usersData?.data) return {};
    return (usersData.data || []).reduce<Record<string, UserOutput>>((acc, u) => {
      if (u.email) {
        acc[u.email.toLowerCase()] = u;
      }
      return acc;
    }, {});
  }, [usersData]);

  const events: CalendarEvent[] = useMemo(() => {
    const tasks = data?.data ?? [];
    return tasks.map((t: any) => ({
      id: String(t.id ?? t.googleCalendarEventId ?? Math.random()),
      title: t.title ?? "(no title)",
      start: new Date(t.startDateTime),
      end: new Date(t.endDateTime),
      backgroundColor: pickColorByLabel(t.label),
      description: t.description ?? "",
      extendedProps: {
        taskData: t as TaskOutputDto,
      },
    }));
  }, [data]);

  const calendarEarliestTime = "00:00";
  const calendarLatestTime = "23:59";

  const handleEventClick = (info: EventClickArg) => {
    // For v2, read-only view for now
    console.log("CalendarV2 event clicked", info.event.id);
  };

  const handleEventChange = (_info: EventChangeArg) => {
    // Read-only for now
  };

  const EventItem = ({ info }: EventItemProps) => {
    const { event } = info;

    const startTime = new Date(event.start!);
    const endTime = new Date(event.end!);
    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    const shouldShowTime = durationMinutes >= 45;

    const formatTime = (date: Date) =>
      date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

    const startTimeFormatted = formatTime(startTime);
    const endTimeFormatted = formatTime(endTime);

    // Handle double-click on event
    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      const taskData = event.extendedProps?.taskData as TaskOutputDto | undefined;
      if (taskData) {
        setSelectedTask(taskData);
        setAppointmentDialogOpen(true);
      }
    }, [event]);

    return (
      <div 
        className="overflow-hidden w-full"
        onDoubleClick={handleDoubleClick}
      >
        {info.view.type == "dayGridMonth" ? (
          <div
            style={{ backgroundColor: info.backgroundColor }}
            className={`flex flex-col rounded-md w-full px-2 py-1 line-clamp-1 text-[0.5rem] sm:text-[0.6rem] md:text-xs`}
          >
            <p className="font-semibold text-gray-950 line-clamp-1 w-11/12">{event.title}</p>
            {shouldShowTime && (
              <>
                <p className="text-gray-800">{startTimeFormatted}</p>
                <p className="text-gray-800">{endTimeFormatted}</p>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col space-y-0 text-[0.5rem] sm:text-[0.6rem] md:text-xs">
            <p className="font-semibold w-full text-gray-950 line-clamp-1">{event.title}</p>
            {shouldShowTime && (
              <p className="text-gray-800 line-clamp-1">{`${startTimeFormatted} - ${endTimeFormatted}`}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  const DayHeader = ({ info }: DayHeaderProps) => {
    const [weekday] = info.text.split(" ");
    return (
      <div className="flex items-center h-full overflow-hidden">
        {info.view.type == "timeGridDay" ? (
          <div className="flex flex-col rounded-sm">
            <p>
              {info.date.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        ) : info.view.type == "timeGridWeek" ? (
          <div className="flex flex-col space-y-0.5 rounded-sm items-center w-full text-xs sm:text-sm md:text-md">
            <p className="flex font-semibold">{weekday}</p>
            {info.isToday ? (
              <div className="flex bg-black dark:bg-white h-6 w-6 rounded-full items-center justify-center text-xs sm:text-sm md:text-md">
                <p className="font-light dark:text-black text-white">{info.date.getDate()}</p>
              </div>
            ) : (
              <div className="h-6 w-6 rounded-full items-center justify-center">
                <p className="font-light">{info.date.getDate()}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col rounded-sm">
            <p>{weekday}</p>
          </div>
        )}
      </div>
    );
  };

  const DayRender = ({ info }: DayRenderProps) => {
    return (
      <div className="flex">
        {info.view.type == "dayGridMonth" && info.isToday ? (
          <div className="flex h-7 w-7 rounded-full bg-black dark:bg-white items-center justify-center text-sm text-white dark:text-black">
            {info.dayNumberText}
          </div>
        ) : (
          <div className="flex h-7 w-7 rounded-full items-center justify-center text-sm">{info.dayNumberText}</div>
        )}
      </div>
    );
  };

  const handleDatesSet = (arg: any) => {
    setViewRange({ start: arg.start, end: arg.end });
  };

  return (
    <div className="py-4">
      <div className="w-full px-5 space-y-5">
        <div className="space-y-0">
          <h2 className="flex items-center text-2xl font-semibold tracking-tight md:text-3xl">Calendar</h2>
          <p className="text-xs md:text-sm font-medium">Events fetched from Tasks API (includes Google via backend)</p>
        </div>

        <Separator />

        <div className="space-y-5">
          <CalendarNav
            calendarRef={calendarRef}
            viewedDate={viewRange.start}
            onCreateTask={() => setCreateTaskOpen(true)}
          />

          <Card className="p-3">
            <FullCalendar
              ref={calendarRef}
              timeZone="local"
              plugins={[dayGridPlugin, timeGridPlugin, multiMonthPlugin, interactionPlugin, listPlugin]}
              initialView="timeGridWeek"
              headerToolbar={false}
              slotMinTime={calendarEarliestTime}
              slotMaxTime={calendarLatestTime}
              allDaySlot={false}
              firstDay={1}
              height={"auto"}
              displayEventEnd={false}
              windowResizeDelay={0}
              events={events}
              slotLabelFormat={{ hour: "numeric", minute: "2-digit", hour12: true }}
              eventContent={(info) => <EventItem info={info} />}
              slotLabelInterval="01:00:00"
              slotMinWidth={60}
              slotDuration="00:30:00"
              eventTimeFormat={{ hour: "numeric", minute: "2-digit", hour12: true }}
              eventDisplay="block"
              eventMinHeight={20}
              eventBorderColor={"black"}
              contentHeight={"auto"}
              expandRows={true}
              dayCellContent={(dayInfo) => <DayRender info={dayInfo} />}
              dayHeaderContent={(headerInfo) => <DayHeader info={headerInfo} />}
              eventClick={(eventInfo) => handleEventClick(eventInfo)}
              eventChange={(eventInfo) => handleEventChange(eventInfo)}
              datesSet={handleDatesSet}
              nowIndicator
            />
          </Card>

          {(isLoading || isFetching) && (
            <div className="px-2 text-xs text-gray-500">Loading events…</div>
          )}
        </div>
      </div>
      <TasksMutateDrawer open={createTaskOpen} onOpenChange={setCreateTaskOpen} />
      {selectedTask && (
        <AppointmentsViewDialog
          open={appointmentDialogOpen}
          onOpenChange={(open) => {
            setAppointmentDialogOpen(open);
            if (!open) {
              // Clear selected task after a delay to allow dialog to close
              setTimeout(() => setSelectedTask(undefined), 300);
            }
          }}
          currentRow={selectedTask}
          userIdToUser={userIdToUser}
          emailToUser={emailToUser}
        />
      )}
    </div>
  );
}

function pickColorByLabel(label?: string) {
  switch (label) {
    case "meeting":
      return "#AEC6E4";
    case "personal":
      return "#FFD1DC";
    case "preparation":
      return "#B2E0B2";
    case "grading":
      return "#FFDFBA";
    default:
      return "#3788d8";
  }
}


