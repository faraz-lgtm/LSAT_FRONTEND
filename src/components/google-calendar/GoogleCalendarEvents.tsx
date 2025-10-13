import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/dashboard/ui/calendarRelatedUI/ui/card';
import { Badge } from '@/components/dashboard/ui/badge';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { type GoogleCalendarEvent, EVENT_COLORS } from '@/services/google-calendar';

interface GoogleCalendarEventsProps {
  events: GoogleCalendarEvent[];
  loading: boolean;
  error: string | null;
}

export const GoogleCalendarEvents: React.FC<GoogleCalendarEventsProps> = ({
  events,
  loading,
  error,
}) => {
  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString();
  };

  const getEventColor = (colorId?: string) => {
    if (!colorId) return '#4285f4'; // Default Google blue
    return EVENT_COLORS[colorId as keyof typeof EVENT_COLORS] || '#4285f4';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google Calendar Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google Calendar Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Error loading events: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google Calendar Events</CardTitle>
          <CardDescription>No events found for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No events scheduled</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Calendar Events</CardTitle>
        <CardDescription>
          {events.length} event{events.length !== 1 ? 's' : ''} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-sm mb-2">{event.summary}</h3>
                  
                  {event.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <div className="space-y-1">
                    {event.start.dateTime && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDate(event.start.dateTime)} at {formatTime(event.start.dateTime)}
                        </span>
                        {event.end.dateTime && (
                          <span> - {formatTime(event.end.dateTime)}</span>
                        )}
                      </div>
                    )}

                    {event.start.date && !event.start.dateTime && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>All day: {formatDate(event.start.date)}</span>
                      </div>
                    )}

                    {event.location && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                    )}

                    {event.attendees && event.attendees.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {event.status === 'confirmed' && (
                    <Badge variant="secondary" className="text-xs">
                      Confirmed
                    </Badge>
                  )}
                  {event.status === 'tentative' && (
                    <Badge variant="outline" className="text-xs">
                      Tentative
                    </Badge>
                  )}
                  {event.status === 'cancelled' && (
                    <Badge variant="destructive" className="text-xs">
                      Cancelled
                    </Badge>
                  )}
                  
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getEventColor(event.colorId) }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
