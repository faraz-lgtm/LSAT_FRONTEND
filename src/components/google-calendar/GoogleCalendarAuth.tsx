import React from "react";
import { Button } from "@/components/dashboard/ui/calendarRelatedUI/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/dashboard/ui/calendarRelatedUI/ui/card";
import { Alert, AlertDescription } from "@/components/dashboard/ui/alert";
import { Calendar, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";

interface GoogleCalendarAuthProps {
  isAuthenticated: boolean;
  authUrl: string | null;
  loading: boolean;
  error: string | null;
}

export const GoogleCalendarAuth: React.FC<GoogleCalendarAuthProps> = ({
  isAuthenticated,
  authUrl,
  loading,
  error,
}) => {
  const handleAuth = () => {
    if (authUrl) {
      window.location.href = authUrl;
    }
  };

  if (isAuthenticated) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-800">
              Google Calendar Connected
            </CardTitle>
          </div>
          <CardDescription className="text-green-700">
            Your Google Calendar is successfully connected. You can now view and
            manage your events.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <CardTitle>Connect Google Calendar</CardTitle>
        </div>
        <CardDescription>
          Connect your Google Calendar to view existing events and check
          availability.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            By connecting your Google Calendar, you can:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
            <li>• View existing events from your calendar</li>
            <li>• Check time slot availability</li>
            <li>• Sync events between platforms</li>
            <li>• Avoid double-booking</li>
          </ul>
        </div>

        <Button
          onClick={handleAuth}
          disabled={loading || !authUrl}
          className="w-full"
        >
          {loading ? (
            "Connecting..."
          ) : (
            <>
              <ExternalLink className="h-4 w-4 mr-2" />
              Connect Google Calendar
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          You'll be redirected to Google to authorize access to your calendar.
        </p>
      </CardContent>
    </Card>
  );
};
