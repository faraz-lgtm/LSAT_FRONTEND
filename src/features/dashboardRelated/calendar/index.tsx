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
import type { CalendarEventOutputDto } from "@/types/api/data-contracts";
import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dashboard/ui/select";
import { Loader2, RefreshCw } from "lucide-react";
import CalendarNav from "./components/calendar-nav";
import {
  useVerifyCalendarAuthorizationQuery,
  useSaveCalendarCredentialsMutation,
  useLazyGetUserCalendarsQuery,
  useLazyGetCalendarEventsQuery,
} from "@/redux/apiSlices/Calendar";
import { useGoogleCalendarContext } from "@/services/google-calendar/GoogleCalendarProvider";
import { GOOGLE_CALENDAR_CONFIG, EVENT_COLORS } from "@/services/google-calendar/config";

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
  const { authUrl, authenticate } = useGoogleCalendarContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const [viewRange, setViewRange] = useState<{ start: Date; end: Date }>(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start, end };
  });

  const [selectedCalendarId, setSelectedCalendarId] = useState<string>("");

  const {
    data: verificationData,
    isLoading: verifyLoading,
    isFetching: verifyFetching,
    refetch: refetchVerification,
    error: verifyError,
  } = useVerifyCalendarAuthorizationQuery();

  const [saveCredentials, { isLoading: savingCredentials }] =
    useSaveCalendarCredentialsMutation();

  const [
    fetchCalendars,
    {
      data: calendarsData,
      isFetching: calendarsFetching,
      isLoading: calendarsLoading,
    },
  ] = useLazyGetUserCalendarsQuery();

  const [
    fetchEvents,
    {
      data: eventsResponse,
      isFetching: eventsFetching,
      isLoading: eventsLoading,
      error: eventsError,
    },
  ] = useLazyGetCalendarEventsQuery();

  const authCode = searchParams.get("code");

  useEffect(() => {
    if (!authCode) return;

    const finalizeOAuth = async () => {
      try {
        await authenticate(authCode);

        const tokensRaw = localStorage.getItem("google_calendar_tokens");
        if (!tokensRaw) {
          throw new Error("OAuth tokens missing after authentication.");
        }

        const tokens = JSON.parse(tokensRaw);

        const resolvedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        await saveCredentials({
          clientId: GOOGLE_CALENDAR_CONFIG.clientId,
          clientSecret: GOOGLE_CALENDAR_CONFIG.clientSecret,
          redirectUri: GOOGLE_CALENDAR_CONFIG.redirectUri,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          defaultTimezone: resolvedTimezone,
        }).unwrap();

        await refetchVerification();
      } catch (error) {
        console.error("Failed to complete Google Calendar OAuth flow", error);
      } finally {
        const nextParams = new URLSearchParams(window.location.search);
        nextParams.delete("code");
        nextParams.delete("scope");
        setSearchParams(nextParams, { replace: true });
      }
    };

    void finalizeOAuth();
  }, [authCode, authenticate, refetchVerification, saveCredentials, setSearchParams]);

  const isCalendarConfigured = verificationData?.data?.isValid ?? false;

  useEffect(() => {
    if (!isCalendarConfigured) {
      setSelectedCalendarId("");
      return;
    }
    fetchCalendars();
  }, [fetchCalendars, isCalendarConfigured]);

  useEffect(() => {
    const calendarList = calendarsData?.data ?? [];
    if (!calendarList.length) return;

    const hasSelected = calendarList.some(
      (calendar) => calendar.id === selectedCalendarId
    );

    if (!hasSelected) {
      const primaryCalendar = calendarList.find((calendar) => calendar.primary);
      const calendarId = primaryCalendar?.id ?? calendarList[0]?.id;
      if (calendarId) {
        setSelectedCalendarId(calendarId);
      }
    }
  }, [calendarsData, selectedCalendarId]);

  const loadEvents = useCallback(() => {
    if (!isCalendarConfigured || !selectedCalendarId) {
      return;
    }
    return fetchEvents({
      calendarId: selectedCalendarId,
      startDate: viewRange.start.toISOString(),
      endDate: viewRange.end.toISOString(),
    });
  }, [fetchEvents, isCalendarConfigured, selectedCalendarId, viewRange.end, viewRange.start]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const events: CalendarEvent[] = useMemo(() => {
    const googleEvents = eventsResponse?.data ?? [];
    return googleEvents
      .map((event) => {
        const startDate = parseGoogleDate(event.start);
        const endDate = parseGoogleDate(event.end) ?? startDate;

        if (!startDate || !endDate) {
          return null;
        }

        return {
          id: event.id,
          title: event.summary ?? "(no title)",
          start: startDate,
          end: endDate,
          backgroundColor: getEventColor((event as any).colorId),
          description: event.description ?? "",
          extendedProps: {
            googleEvent: event,
          },
        } as CalendarEvent;
      })
      .filter(Boolean) as CalendarEvent[];
  }, [eventsResponse]);

  const calendarList = calendarsData?.data ?? [];
  const connectionChecking = verifyLoading || verifyFetching || savingCredentials;
  const connectButtonDisabled =
    connectionChecking || isCalendarConfigured || !authUrl;
  const connectButtonLabel = connectionChecking
    ? "Checking..."
    : isCalendarConfigured
    ? "Connected"
    : "Connect Google Calendar";

  const handleManualRefresh = () => {
    void loadEvents();
  };

  const verificationErrorMessage = getErrorMessage(verifyError);
  const eventsErrorMessage = getErrorMessage(eventsError);
  const isEventLoading = eventsFetching || eventsLoading;
  const calendarsBusy = calendarsFetching || calendarsLoading;

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
    const googleEvent = event.extendedProps?.googleEvent as CalendarEventOutputDto | undefined;
    const location = googleEvent?.location;

    return (
      <div className="w-full overflow-hidden">
        {info.view.type == "dayGridMonth" ? (
          <div
            style={{ backgroundColor: info.backgroundColor }}
            className="flex w-full flex-col rounded-md px-2 py-1 text-[0.5rem] sm:text-[0.6rem] md:text-xs"
          >
            <p className="w-11/12 line-clamp-1 font-semibold text-gray-950">{event.title}</p>
            {shouldShowTime ? (
              <>
                <p className="text-gray-800">{startTimeFormatted}</p>
                <p className="text-gray-800">{endTimeFormatted}</p>
              </>
            ) : (
              <p className="text-gray-800">All day</p>
            )}
            {location && <p className="line-clamp-1 text-[10px] text-gray-700">{location}</p>}
          </div>
        ) : (
          <div className="flex flex-col space-y-0 text-[0.5rem] sm:text-[0.6rem] md:text-xs">
            <p className="w-full line-clamp-1 font-semibold text-gray-950">{event.title}</p>
            {shouldShowTime ? (
              <p className="line-clamp-1 text-gray-800">{`${startTimeFormatted} - ${endTimeFormatted}`}</p>
            ) : (
              <p className="text-gray-800">All day</p>
            )}
            {location && <p className="line-clamp-1 text-[10px] text-gray-700">{location}</p>}
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
          <p className="text-xs font-medium md:text-sm">Events synced from your Google Calendar via Better LSAT backend.</p>
        </div>

        <Separator />

        <div className="space-y-5">
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-card/40 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Google Calendar</p>
              <div className="mt-2 flex items-center gap-3">
                <Badge variant={isCalendarConfigured ? "default" : "secondary"}>
                  {isCalendarConfigured ? "Connected" : "Not connected"}
                </Badge>
                {verificationErrorMessage && (
                  <span className="text-xs text-destructive">{verificationErrorMessage}</span>
                )}
              </div>
              {!isCalendarConfigured && !connectionChecking && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Connect your Google account to pull in upcoming events.
                </p>
              )}
            </div>
            <Button
              disabled={connectButtonDisabled}
              onClick={() => {
                if (authUrl && !connectButtonDisabled) {
                  window.location.href = authUrl;
                }
              }}
              variant={isCalendarConfigured ? "outline" : "default"}
              className="w-full md:w-auto"
            >
              {connectionChecking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {connectButtonLabel}
            </Button>
          </div>

          {isCalendarConfigured && (
            <div className="flex flex-col gap-4 rounded-lg border border-border bg-card/40 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                <span className="text-sm font-medium text-muted-foreground">Active calendar</span>
                <Select
                  value={selectedCalendarId}
                  onValueChange={setSelectedCalendarId}
                  disabled={!calendarList.length || calendarsBusy}
                >
                  <SelectTrigger className="w-full min-w-[220px] md:w-64">
                    <SelectValue placeholder="Select calendar" />
                  </SelectTrigger>
                  <SelectContent>
                    {calendarList.map((calendar) => (
                      <SelectItem key={calendar.id} value={calendar.id}>
                        {calendar.summary} {calendar.primary ? "(Primary)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isEventLoading || !calendarList.length}
              >
                {isEventLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Refresh events
              </Button>
            </div>
          )}

          {!isCalendarConfigured && !connectionChecking && (
            <div className="rounded-md border border-dashed border-muted-foreground/40 bg-muted/30 p-4 text-sm text-muted-foreground">
              Once connected, your primary Google Calendar events will appear here.
            </div>
          )}

          <CalendarNav
            calendarRef={calendarRef}
            viewedDate={viewRange.start}
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

          {isEventLoading && (
            <div className="px-2 text-xs text-muted-foreground">Loading events…</div>
          )}
          {!isEventLoading && isCalendarConfigured && events.length === 0 && (
            <div className="px-2 text-xs text-muted-foreground">
              No events found for the selected date range.
            </div>
          )}
          {eventsErrorMessage && (
            <div className="px-2 text-xs text-destructive">{eventsErrorMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function parseGoogleDate(date?: { dateTime?: string; date?: string }) {
  if (date?.dateTime) return new Date(date.dateTime);
  if (date?.date) return new Date(date.date);
  return null;
}

function getEventColor(colorId?: string) {
  if (!colorId) return "#3788d8";
  return EVENT_COLORS[colorId as keyof typeof EVENT_COLORS] ?? "#3788d8";
}

function getErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (typeof error === "string") return error;

  const dataMessage = (error as { data?: { message?: string } })?.data?.message;
  if (typeof dataMessage === "string") {
    return dataMessage;
  }

  const errorMessage = (error as { error?: string })?.error;
  if (typeof errorMessage === "string") {
    return errorMessage;
  }

  const message = (error as { message?: string })?.message;
  return typeof message === "string" ? message : null;
}


