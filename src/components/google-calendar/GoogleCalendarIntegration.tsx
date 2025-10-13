import React, { useState, useEffect } from 'react';
import { useGoogleCalendar } from '@/services/google-calendar';
import { GoogleCalendarAuth } from '@/components/google-calendar/GoogleCalendarAuth';
import { GoogleCalendarEvents } from '@/components/google-calendar/GoogleCalendarEvents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/dashboard/ui/calendarRelatedUI/ui/card';
import { Button } from '@/components/dashboard/ui/calendarRelatedUI/ui/button';
import { Calendar, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface GoogleCalendarIntegrationProps {
  selectedDate?: Date;
  onTimeSlotCheck?: (startTime: Date, endTime: Date, available: boolean) => void;
}

export const GoogleCalendarIntegration: React.FC<GoogleCalendarIntegrationProps> = ({
  selectedDate,
  onTimeSlotCheck,
}) => {
  const {
    isAuthenticated,
    authUrl,
    events,
    loading,
    error,
    authenticate,
    fetchEvents,
    fetchTodayEvents,
    fetchMonthEvents,
    isTimeSlotAvailable,
  } = useGoogleCalendar();

  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState<{
    startTime: Date;
    endTime: Date;
    available: boolean;
  } | null>(null);

  // Load events when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (selectedDate) {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        fetchMonthEvents(year, month);
      } else {
        fetchTodayEvents();
      }
    }
  }, [isAuthenticated, selectedDate, fetchMonthEvents, fetchTodayEvents]);

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (code && !isAuthenticated) {
      authenticate(code);
    } else if (error) {
      console.error('OAuth error:', error);
    }
  }, [authenticate, isAuthenticated]);

  const handleCheckAvailability = async (startTime: Date, endTime: Date) => {
    if (!isAuthenticated) return;

    setCheckingAvailability(true);
    try {
      const available = await isTimeSlotAvailable(startTime, endTime);
      const result = { startTime, endTime, available };
      setAvailabilityResult(result);
      onTimeSlotCheck?.(startTime, endTime, available);
    } catch (err) {
      console.error('Error checking availability:', err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleRefreshEvents = () => {
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      fetchMonthEvents(year, month);
    } else {
      fetchTodayEvents();
    }
  };

  return (
    <div className="space-y-6">
      {/* Authentication Section */}
      <GoogleCalendarAuth
        isAuthenticated={isAuthenticated}
        authUrl={authUrl}
        loading={loading}
        error={error}
        onAuthenticate={authenticate}
      />

      {/* Events Display */}
      {isAuthenticated && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Google Calendar Events</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshEvents}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <GoogleCalendarEvents
            events={events}
            loading={loading}
            error={error}
          />
        </div>
      )}

      {/* Availability Checker */}
      {isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Time Slot Availability Checker
            </CardTitle>
            <CardDescription>
              Check if a specific time slot is available in your Google Calendar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Time</label>
                <input
                  type="datetime-local"
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md"
                  onChange={(e) => {
                    const startTime = new Date(e.target.value);
                    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1 hour
                    handleCheckAvailability(startTime, endTime);
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Time</label>
                <input
                  type="datetime-local"
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md"
                  onChange={(e) => {
                    const endTime = new Date(e.target.value);
                    const startTime = new Date(endTime.getTime() - 60 * 60 * 1000); // -1 hour
                    handleCheckAvailability(startTime, endTime);
                  }}
                />
              </div>
            </div>

            {checkingAvailability && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Checking availability...
              </div>
            )}

            {availabilityResult && (
              <div className={`flex items-center gap-2 p-3 rounded-md ${
                availabilityResult.available 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {availabilityResult.available ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">
                  {availabilityResult.available 
                    ? 'Time slot is available!' 
                    : 'Time slot is already booked'
                  }
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
