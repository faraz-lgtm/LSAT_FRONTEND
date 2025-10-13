// Google Calendar API Configuration
// You'll need to set these up in your Google Cloud Console

export const GOOGLE_CALENDAR_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
  redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5173/dashboard/auth/google/callback',
  scopes: [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
  ],
};

// Default calendar settings
export const CALENDAR_SETTINGS = {
  defaultCalendarId: 'primary',
  maxResults: 100,
  timeZone: 'America/New_York', // Change this to your timezone
};

// Event colors mapping (Google Calendar colors)
export const EVENT_COLORS = {
  '1': '#a4bdfc', // Lavender
  '2': '#7ae7bf', // Sage
  '3': '#dbadff', // Grape
  '4': '#ff887c', // Flamingo
  '5': '#fbd75b', // Banana
  '6': '#ffb878', // Tangerine
  '7': '#46d6db', // Peacock
  '8': '#e1e1e1', // Graphite
  '9': '#5484ed', // Blueberry
  '10': '#51b749', // Basil
  '11': '#dc2127', // Tomato
} as const;

// Debug logging for environment variables
console.log('🔧 Google Calendar Config:', {
  clientId: GOOGLE_CALENDAR_CONFIG.clientId ? '✅ Set' : '❌ Missing',
  clientSecret: GOOGLE_CALENDAR_CONFIG.clientSecret ? '✅ Set' : '❌ Missing',
  redirectUri: GOOGLE_CALENDAR_CONFIG.redirectUri,
  scopes: GOOGLE_CALENDAR_CONFIG.scopes
});
