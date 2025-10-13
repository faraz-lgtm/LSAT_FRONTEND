# Google Calendar Integration Setup Guide

## 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click on it and press "Enable"

## 2. OAuth2 Credentials Setup

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:5173/auth/google/callback` (for development)
   - `https://yourdomain.com/auth/google/callback` (for production)
5. Copy the Client ID and Client Secret

## 3. Environment Variables

Create a `.env.local` file in your project root with:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
VITE_DEFAULT_TIMEZONE=America/New_York
```

## 4. OAuth2 Scopes

The following scopes are required:
- `https://www.googleapis.com/auth/calendar.readonly` - Read calendar events
- `https://www.googleapis.com/auth/calendar.events` - Create, update, delete events

## 5. Usage

```typescript
import { useGoogleCalendar } from '@/services/google-calendar';

function MyComponent() {
  const {
    isAuthenticated,
    authUrl,
    events,
    loading,
    authenticate,
    fetchEvents,
    isTimeSlotAvailable
  } = useGoogleCalendar();

  // Check if time slot is available
  const checkAvailability = async (startTime: Date, endTime: Date) => {
    const available = await isTimeSlotAvailable(startTime, endTime);
    console.log('Time slot available:', available);
  };

  // Fetch events for a date range
  const loadEvents = async () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    await fetchEvents(startDate, endDate);
  };

  return (
    <div>
      {!isAuthenticated ? (
        <a href={authUrl}>Connect Google Calendar</a>
      ) : (
        <div>
          <p>Connected! {events.length} events loaded.</p>
          <button onClick={loadEvents}>Load Events</button>
        </div>
      )}
    </div>
  );
}
```

## 6. Integration with Existing Calendar

To integrate with your existing calendar component:

1. Use `isTimeSlotAvailable()` to check if a time slot is free
2. Use `getBusyTimes()` to get all busy periods
3. Use `events` from the hook to display Google Calendar events
4. Use `createEvent()`, `updateEvent()`, `deleteEvent()` to sync changes

## 7. Security Notes

- Never commit your `.env.local` file to version control
- Use environment variables for all sensitive data
- Consider using a backend service for production to keep client secrets secure
- Implement proper error handling for API failures

## 8. Testing

1. Start your development server
2. Navigate to a page with Google Calendar integration
3. Click "Connect Google Calendar"
4. Complete the OAuth flow
5. Verify events are loaded and displayed correctly
