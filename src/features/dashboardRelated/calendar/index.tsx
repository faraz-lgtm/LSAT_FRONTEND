"use client";

import "@/styles/calendar.css";
import type {
  DateSelectArg,
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
import React, { useEffect, useRef, useState } from "react";
import CalendarNav from "./components/calendar-nav";

// Import UI components for event dialogs
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel } from "@/components/dashboard/ui/alert-dialog";
import { Button } from "@/components/ui/button";

// Import Google Calendar integration
import { OrderCreateForm } from "@/components/google-calendar/OrderCreateForm";
import { GoogleCalendarEventEditForm } from "@/components/google-calendar/GoogleCalendarEventEditForm";
import { useGoogleCalendarContext } from "@/services/google-calendar/GoogleCalendarProvider";

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
  // Google Calendar integration
  const {
    isAuthenticated,
    events: googleEvents,
    loading: googleLoading,
    error: googleError,
    authUrl,
    fetchEvents,
    deleteEvent,
    updateEvent,
    selectedCalendarId,
    calendars,
  } = useGoogleCalendarContext();

  const calendarRef = useRef<FullCalendar | null>(null);

  // Simple state tracking
  const [viewedDate, setViewedDate] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState(new Date());
  const [selectedEnd, setSelectedEnd] = useState(() => {
    const endTime = new Date();
    endTime.setMinutes(endTime.getMinutes() + 15);
    return endTime;
  });

  // Event creation form state
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [selectedDateForEvent, setSelectedDateForEvent] = useState<
    Date | undefined
  >();
  const [selectedStartTimeForEvent, setSelectedStartTimeForEvent] = useState<
    Date | undefined
  >();
  const [selectedEndTimeForEvent, setSelectedEndTimeForEvent] = useState<
    Date | undefined
  >();

  // Event editing state
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventViewOpen, setEventViewOpen] = useState(false);
  const [eventEditOpen, setEventEditOpen] = useState(false);
  const [eventDeleteOpen, setEventDeleteOpen] = useState(false);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [isUpdatingEvent, setIsUpdatingEvent] = useState(false);

  // Debug: Log when googleEvents changes
  console.log("🔄 Calendar render - googleEvents:", {
    count: googleEvents.length,
    isAuthenticated,
    selectedCalendarId,
    calendarsCount: calendars.length,
    events: googleEvents.map((e: any) => ({ id: e.id, summary: e.summary })),
  });

  // Convert Google Calendar events to FullCalendar format
  const convertGoogleEventsToCalendarEvents = (
    googleEvents: any[]
  ): CalendarEvent[] => {
    console.log(
      "🔄 convertGoogleEventsToCalendarEvents called with:",
      googleEvents.length,
      "events"
    );
    console.log("🔍 Raw Google Calendar events:", googleEvents);
    console.log("📊 Number of Google events:", googleEvents.length);

    const convertedEvents = googleEvents.map((event, index) => {
      console.log(`📅 Converting event ${index + 1}:`, {
        id: event.id,
        summary: event.summary,
        start: event.start,
        end: event.end,
        description: event.description,
      });

      const convertedEvent = {
        id: event.id,
        title: event.summary || "No Title",
        start: new Date(event.start.dateTime || event.start.date),
        end: new Date(event.end.dateTime || event.end.date),
        backgroundColor: event.colorId ? `#${event.colorId}` : "#3788d8",
        description: event.description || "",
        allDay: !event.start.dateTime, // If no time, it's an all-day event
      };

      console.log(`✅ Converted event ${index + 1}:`, convertedEvent);
      return convertedEvent;
    });

    console.log("✅ All converted events:", convertedEvents);
    console.log(
      "📊 Conversion complete - input:",
      googleEvents.length,
      "output:",
      convertedEvents.length
    );
    return convertedEvents;
  };

  // Use Google Calendar events if authenticated, otherwise use empty array
  // const displayEvents = React.useMemo(() => {
  //   console.log('🔄 useMemo triggered - converting events:', {
  //     isAuthenticated,
  //     googleEventsCount: googleEvents.length
  //   });

  //   if (!isAuthenticated) {
  //     console.log('❌ Not authenticated, returning empty array');
  //     return [];
  //   }

  //   console.log('✅ Authenticated, converting events...');
  //   const converted = convertGoogleEventsToCalendarEvents(googleEvents);
  //   console.log('🎯 Conversion complete:', {
  //     inputCount: googleEvents.length,
  //     outputCount: converted.length
  //   });

  //   return converted;
  // }, [isAuthenticated, googleEvents]);
  const displayEvents = React.useMemo(() => {
    console.log("🔄 useMemo triggered - converting events:", {
      isAuthenticated,
      googleEventsCount: googleEvents.length,
    });

    if (!isAuthenticated) {
      console.log("❌ Not authenticated, returning empty array");
      return [];
    }

    console.log("✅ Authenticated, converting events...");
    const converted = convertGoogleEventsToCalendarEvents(googleEvents);
    console.log("🎯 Conversion complete:", {
      inputCount: googleEvents.length,
      outputCount: converted.length,
    });

    return converted;
  }, [isAuthenticated, googleEvents]); // ✅ This dependency array is crucial!

  useEffect(() => {
    console.log("🔄 Calendar component detected events change:", {
      count: googleEvents.length,
      events: googleEvents.map((e: any) => ({ id: e.id, summary: e.summary }))
    });
  }, [googleEvents]);

  // Debug: Log displayEvents
  console.log("🎯 displayEvents for FullCalendar:", {
    isAuthenticated,
    displayEventsCount: displayEvents.length,
  });

  // Fetch Google Calendar events when authenticated or when viewed date changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log("🚀 Fetching Google Calendar events...");
      console.log("📅 Current viewed date:", viewedDate);

      // Get the first day of the viewed month
      const startDate = new Date(
        viewedDate.getFullYear(),
        viewedDate.getMonth(),
        1
      );

      // Get the last day of the viewed month
      const endDate = new Date(
        viewedDate.getFullYear(),
        viewedDate.getMonth() + 1,
        0
      );

      console.log("📅 Fetching events from:", startDate, "to:", endDate);
      console.log(
        "📅 Month being viewed:",
        viewedDate.getMonth() + 1,
        "Year:",
        viewedDate.getFullYear()
      );
      console.log("📍 Calendar useEffect calling fetchEvents with date range");
      fetchEvents(startDate, endDate);
    }
  }, [isAuthenticated, fetchEvents, viewedDate]);

  const handleEventClick = (info: EventClickArg) => {
    console.log("🖱️ Event clicked:", info.event);
    console.log("📅 Event details:", {
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      backgroundColor: info.event.backgroundColor,
    });

    // Create CalendarEvent object from FullCalendar event
    const event: CalendarEvent = {
      id: info.event.id,
      title: info.event.title,
      description: info.event.extendedProps?.description || '',
      backgroundColor: info.event.backgroundColor || '#3788d8',
      start: info.event.start!,
      end: info.event.end!,
    };

    // Set event editing state
    setSelectedEvent(event);
    setEventViewOpen(true);
    
    console.log("📋 Event selected for viewing:", event);
  };

  const handleEventChange = (info: EventChangeArg) => {
    console.log("🔄 Event changed:", info.event);
    console.log("📅 Event change details:", {
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      backgroundColor: info.event.backgroundColor,
    });
  };

  const EventItem = ({ info }: EventItemProps) => {
    const { event } = info;

    // Calculate event duration in minutes
    const startTime = new Date(event.start!);
    const endTime = new Date(event.end!);
    const durationMinutes =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60);

    // Hide time for events shorter than 45 minutes (like Google Calendar)
    const shouldShowTime = durationMinutes >= 45;

    // Format time manually since displayEventEnd={false} doesn't provide timeText
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };

    const startTimeFormatted = formatTime(startTime);
    const endTimeFormatted = formatTime(endTime);

    return (
      <div className="overflow-hidden w-full">
        {info.view.type == "dayGridMonth" ? (
          <div
            style={{ backgroundColor: info.backgroundColor }}
            className={`flex flex-col rounded-md w-full px-2 py-1 line-clamp-1 text-[0.5rem] sm:text-[0.6rem] md:text-xs`}
          >
            <p className="font-semibold text-gray-950 line-clamp-1 w-11/12">
              {event.title}
            </p>
            {shouldShowTime && (
              <>
                <p className="text-gray-800">{startTimeFormatted}</p>
                <p className="text-gray-800">{endTimeFormatted}</p>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col space-y-0 text-[0.5rem] sm:text-[0.6rem] md:text-xs">
            <p className="font-semibold w-full text-gray-950 line-clamp-1">
              {event.title}
            </p>
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
                <p className="font-light dark:text-black text-white">
                  {info.date.getDate()}
                </p>
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
          <div className="flex h-7 w-7 rounded-full items-center justify-center text-sm">
            {info.dayNumberText}
          </div>
        )}
      </div>
    );
  };

  const handleDateSelect = (info: DateSelectArg) => {
    console.log("📅 Date selected:", info);
    setSelectedStart(info.start);
    setSelectedEnd(info.end);

    // Set the selected date and times for event creation
    setSelectedDateForEvent(info.start);
    setSelectedStartTimeForEvent(info.start);
    setSelectedEndTimeForEvent(info.end);

    // Open the event creation form
    setIsEventFormOpen(true);
  };

  const handleDateClick = (info: any) => {
    console.log("🖱️ Date clicked:", info);
    const clickedDate = info.date;

    // Set default times (1 hour slot)
    const startTime = new Date(clickedDate);
    startTime.setHours(clickedDate.getHours(), 0, 0, 0);

    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1);

    setSelectedDateForEvent(clickedDate);
    setSelectedStartTimeForEvent(startTime);
    setSelectedEndTimeForEvent(endTime);

    // Open the event creation form
    setIsEventFormOpen(true);
  };


  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      setIsDeletingEvent(true);
      console.log("🗑️ Deleting event:", selectedEvent);
      
      // Call the Google Calendar deleteEvent method
      await deleteEvent(selectedEvent.id);
      
      console.log("✅ Event deleted successfully");
      
      // Close the delete dialog
      setEventDeleteOpen(false);
      setSelectedEvent(null);
      
      // The events will be automatically refreshed by the useGoogleCalendar hook
    } catch (error) {
      console.error("❌ Error deleting event:", error);
      // TODO: Show error toast to user
    } finally {
      setIsDeletingEvent(false);
    }
  };

  const handleUpdateEvent = async (updatedEvent: CalendarEvent) => {
    if (!selectedEvent) return;

    try {
      setIsUpdatingEvent(true);
      console.log("📝 Updating event:", { original: selectedEvent, updated: updatedEvent });
      
      // Convert CalendarEvent to Google Calendar format
      const googleEventData = {
        summary: updatedEvent.title,
        description: updatedEvent.description,
        start: {
          dateTime: updatedEvent.start.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: updatedEvent.end.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        colorId: getColorIdFromHex(updatedEvent.backgroundColor || '#3788d8'),
      };
      
      console.log("📝 Google Calendar event data:", googleEventData);
      
      // Call the Google Calendar updateEvent method
      await updateEvent(selectedEvent.id, googleEventData);
      
      console.log("✅ Event updated successfully");
      
      // Close the edit dialog
      setEventEditOpen(false);
      setSelectedEvent(null);
      
      // The events will be automatically refreshed by the useGoogleCalendar hook
    } catch (error) {
      console.error("❌ Error updating event:", error);
      // TODO: Show error toast to user
    } finally {
      setIsUpdatingEvent(false);
    }
  };

  // Helper function to convert hex color to Google Calendar color ID
  const getColorIdFromHex = (hexColor: string): string => {
    const colorMap: { [key: string]: string } = {
      '#3788d8': '1', // Blue
      '#d73a49': '2', // Red
      '#28a745': '3', // Green
      '#ffc107': '4', // Yellow
      '#6f42c1': '5', // Purple
      '#fd7e14': '6', // Orange
      '#20c997': '7', // Teal
      '#6c757d': '8', // Gray
      '#dc3545': '9', // Dark Red
      '#198754': '10', // Dark Green
      '#0d6efd': '11', // Dark Blue
    };
    
    return colorMap[hexColor] || '1'; // Default to blue
  };

  // Show all 24 hours (00:00 to 23:59)
  const calendarEarliestTime = "00:00";
  const calendarLatestTime = "23:59";

  // If not authenticated, show connect button
  if (!isAuthenticated) {
    return (
      <div className="py-4">
        <div className="w-full px-5 space-y-5">
          <div className="space-y-0">
            <h2 className="flex items-center text-2xl font-semibold tracking-tight md:text-3xl">
              Calendar
            </h2>
            <p className="text-xs md:text-sm font-medium">
              Connect your Google Calendar to view and manage your events
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="p-8 max-w-md w-full text-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">
                    Connect Google Calendar
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Connect your Google Calendar to view your events and manage
                    your schedule
                  </p>
                </div>

                {googleLoading && (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm">Connecting...</span>
                  </div>
                )}

                {googleError && (
                  <div className="text-red-600 text-sm">
                    Error: {googleError}
                  </div>
                )}

                {authUrl && !googleLoading && (
                  <button
                    onClick={() => (window.location.href = authUrl)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Connect Google Calendar
                  </button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated, show the calendar
  return (
    <div className="py-4">
      <div className="w-full px-5 space-y-5">
        <div className="space-y-0">
          <h2 className="flex items-center text-2xl font-semibold tracking-tight md:text-3xl">
            Calendar
          </h2>
          <p className="text-xs md:text-sm font-medium">
            Your Google Calendar events are displayed below
          </p>
        </div>

        <Separator />

        <div className="space-y-5">
          <CalendarNav
            calendarRef={calendarRef}
            start={selectedStart}
            end={selectedEnd}
            viewedDate={viewedDate}
          />

          <Card className="p-3">
            <FullCalendar
              // key={`calendar-${googleEvents.length}`}
              
              ref={calendarRef}
              timeZone="local"
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                multiMonthPlugin,
                interactionPlugin,
                listPlugin,
              ]}
              initialView="timeGridWeek"
              headerToolbar={false}
              slotMinTime={calendarEarliestTime}
              slotMaxTime={calendarLatestTime}
              allDaySlot={false}
              firstDay={1}
              height={"auto"}
              displayEventEnd={false}
              windowResizeDelay={0}
              events={displayEvents}
              slotLabelFormat={{
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }}
              eventContent={(info) => {
                console.log("🎯 FullCalendar eventContent called:", {
                  eventId: info.event.id,
                  eventTitle: info.event.title,
                  eventStart: info.event.start,
                  eventEnd: info.event.end,
                  displayEventsCount: displayEvents.length,
                });
                return <EventItem info={info} />;
              }}
              slotLabelInterval="01:00:00"
              slotMinWidth={60}
              slotDuration="00:30:00"
              eventTimeFormat={{
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }}
              eventDisplay="block"
              eventMinHeight={20}
              eventBorderColor={"black"}
              contentHeight={"auto"}
              expandRows={true}
              dayCellContent={(dayInfo) => <DayRender info={dayInfo} />}
              dayHeaderContent={(headerInfo) => <DayHeader info={headerInfo} />}
              eventClick={(eventInfo) => handleEventClick(eventInfo)}
              eventChange={(eventInfo) => handleEventChange(eventInfo)}
              select={handleDateSelect}
              datesSet={(dates) => setViewedDate(dates.view.currentStart)}
              dateClick={handleDateClick}
              nowIndicator
              editable
              selectable
            />
          </Card>
        </div>
      </div>

      {/* Order Creation Form */}
      <OrderCreateForm
        isOpen={isEventFormOpen}
        onClose={() => setIsEventFormOpen(false)}
      />

      {/* Event View Dialog */}
      <AlertDialog open={eventViewOpen} onOpenChange={setEventViewOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Event Details</AlertDialogTitle>
          </AlertDialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <strong>Title:</strong> {selectedEvent.title}
              </div>
              <div>
                <strong>Description:</strong> {selectedEvent.description || 'No description'}
              </div>
              <div>
                <strong>Start:</strong> {selectedEvent.start.toLocaleString()}
              </div>
              <div>
                <strong>End:</strong> {selectedEvent.end.toLocaleString()}
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEventViewOpen(false);
                setEventEditOpen(true);
              }}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setEventViewOpen(false);
                setEventDeleteOpen(true);
              }}
            >
              Delete
            </Button>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Event Edit Dialog */}
      {selectedEvent && (
        <GoogleCalendarEventEditForm
          isOpen={eventEditOpen}
          onClose={() => setEventEditOpen(false)}
          event={selectedEvent}
          onUpdate={handleUpdateEvent}
          loading={isUpdatingEvent}
        />
      )}

      {/* Event Delete Dialog */}
      <AlertDialog open={eventDeleteOpen} onOpenChange={setEventDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete this event?</p>
            <p><strong>{selectedEvent?.title}</strong></p>
            <p className="text-sm text-gray-600">This action cannot be undone.</p>
          </div>
          <AlertDialogFooter>
            <Button
              variant="destructive"
              onClick={handleDeleteEvent}
              disabled={isDeletingEvent}
            >
              {isDeletingEvent ? "Deleting..." : "Delete Event"}
            </Button>
            <AlertDialogCancel disabled={isDeletingEvent}>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
