export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  location?: string;
  status?: string;
  transparency?: string;
  colorId?: string;
}

export interface GoogleCalendarConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

class GoogleCalendarService {
  private config: GoogleCalendarConfig;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(config: GoogleCalendarConfig) {
    this.config = config;
    // Try to load tokens from localStorage
    this.loadTokensFromStorage();
  }

  /**
   * Generate the authorization URL for OAuth2 flow
   */
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(code: string) {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: this.config.redirectUri,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const tokens = await response.json();
      this.accessToken = tokens.access_token;
      this.refreshToken = tokens.refresh_token;
      
      // Store tokens in localStorage
      this.saveTokensToStorage();
      
      return tokens;
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw error;
    }
  }

  /**
   * Set access tokens (for when you already have them)
   */
  setCredentials(tokens: any) {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    this.saveTokensToStorage();
  }

  /**
   * Load tokens from localStorage
   */
  private loadTokensFromStorage() {
    try {
      const stored = localStorage.getItem('google_calendar_tokens');
      if (stored) {
        const tokens = JSON.parse(stored);
        this.accessToken = tokens.access_token;
        this.refreshToken = tokens.refresh_token;
      }
    } catch (error) {
      console.error('Error loading tokens from storage:', error);
    }
  }

  /**
   * Save tokens to localStorage
   */
  private saveTokensToStorage() {
    try {
      const tokens = {
        access_token: this.accessToken,
        refresh_token: this.refreshToken,
      };
      localStorage.setItem('google_calendar_tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Error saving tokens to storage:', error);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        return false;
      }

      const tokens = await response.json();
      this.accessToken = tokens.access_token;
      this.saveTokensToStorage();
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }

  /**
   * Make authenticated request to Google Calendar API
   */
  private async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    console.log('🌐 Making API request to:', url);
    console.log('📝 Request options:', options);
    
    if (!this.accessToken) {
      console.error('❌ No access token available');
      throw new Error('Not authenticated');
    }

    console.log('🔑 Using access token:', this.accessToken.substring(0, 20) + '...');

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.status === 401) {
      console.log('🔄 Token expired, attempting refresh...');
      // Token expired, try to refresh
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        console.log('✅ Token refreshed, retrying request...');
        // Retry the request
        return this.makeRequest(url, options);
      } else {
        console.error('❌ Token refresh failed');
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API request failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    // Handle DELETE requests (204 No Content) - no body to parse
    if (response.status === 204) {
      console.log('✅ API request successful (DELETE - no content)');
      return null;
    }

    // Handle other successful responses with JSON body
    const data = await response.json();
    console.log('✅ API request successful, response data:', data);
    return data;
  }

  /**
   * Get list of calendars
   */
  async getCalendars() {
    try {
      const response = await this.makeRequest('https://www.googleapis.com/calendar/v3/users/me/calendarList');
      return response.items || [];
    } catch (error) {
      console.error('Error fetching calendars:', error);
      throw error;
    }
  }

  /**
   * Get events from a specific calendar
   */
  async getEvents(
    calendarId: string = 'primary',
    options: {
      timeMin?: string;
      timeMax?: string;
      maxResults?: number;
      singleEvents?: boolean;
      orderBy?: string;
    } = {}
  ): Promise<GoogleCalendarEvent[]> {
    try {
      const {
        timeMin = new Date().toISOString(),
        timeMax,
        maxResults = 100,
        singleEvents = true,
        orderBy = 'startTime',
      } = options;

      const params = new URLSearchParams({
        timeMin,
        maxResults: maxResults.toString(),
        singleEvents: singleEvents.toString(),
        orderBy,
      });

      if (timeMax) {
        params.append('timeMax', timeMax);
      }

      const response = await this.makeRequest(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`
      );

      return response.items || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  /**
   * Get events for a specific date range
   */
  async getEventsInRange(
    startDate: Date,
    endDate: Date,
    calendarId: string = 'primary'
  ): Promise<GoogleCalendarEvent[]> {
    return this.getEvents(calendarId, {
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
    });
  }

  /**
   * Get events for today
   */
  async getTodayEvents(calendarId: string = 'primary'): Promise<GoogleCalendarEvent[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return this.getEventsInRange(startOfDay, endOfDay, calendarId);
  }

  /**
   * Get events for a specific month
   */
  async getMonthEvents(
    year: number,
    month: number,
    calendarId: string = 'primary'
  ): Promise<GoogleCalendarEvent[]> {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 1);

    return this.getEventsInRange(startOfMonth, endOfMonth, calendarId);
  }

  /**
   * Check if a time slot is available
   */
  async isTimeSlotAvailable(
    startTime: Date,
    endTime: Date,
    calendarId: string = 'primary'
  ): Promise<boolean> {
    try {
      const events = await this.getEventsInRange(startTime, endTime, calendarId);
      
      // Check if any events overlap with the requested time slot
      return !events.some(event => {
        const eventStart = new Date(event.start.dateTime || event.start.date || '');
        const eventEnd = new Date(event.end.dateTime || event.end.date || '');
        
        // Check for overlap
        return (
          (startTime < eventEnd && endTime > eventStart) ||
          (eventStart < endTime && eventEnd > startTime)
        );
      });
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      return false;
    }
  }

  /**
   * Get busy times for a date range
   */
  async getBusyTimes(
    startDate: Date,
    endDate: Date,
    calendarId: string = 'primary'
  ): Promise<Array<{ start: Date; end: Date }>> {
    try {
      const events = await this.getEventsInRange(startDate, endDate, calendarId);
      
      return events
        .filter(event => event.status !== 'cancelled')
        .map(event => ({
          start: new Date(event.start.dateTime || event.start.date || ''),
          end: new Date(event.end.dateTime || event.end.date || ''),
        }))
        .sort((a, b) => a.start.getTime() - b.start.getTime());
    } catch (error) {
      console.error('Error getting busy times:', error);
      return [];
    }
  }

  /**
   * Create a new event
   */
  async createEvent(
    event: Partial<GoogleCalendarEvent>,
    calendarId: string = 'primary'
  ) {
    try {
      console.log('🚀 Creating event in Google Calendar:', event);
      console.log('🔐 Authentication status:', this.isAuthenticated());
      console.log('🔑 Access token available:', !!this.accessToken);
      console.log('📅 Calendar ID:', calendarId);
      
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;
      console.log('🌐 API URL:', url);
      
      const requestBody = JSON.stringify(event);
      console.log('📝 Request body:', requestBody);
      
      const response = await this.makeRequest(url, {
        method: 'POST',
        body: requestBody,
      });
      
      console.log('✅ Event created successfully:', response);
      console.log('🆔 Created event ID:', response.id);
      console.log('📅 Event start:', response.start);
      console.log('📅 Event end:', response.end);
      
      return response;
    } catch (error) {
      console.error('❌ Error creating event:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.status,
        response: (error as any)?.response
      });
      throw error;
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(
    eventId: string,
    event: Partial<GoogleCalendarEvent>,
    calendarId: string = 'primary'
  ) {
    try {
      const response = await this.makeRequest(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
        {
          method: 'PUT',
          body: JSON.stringify(event),
        }
      );
      return response;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string, calendarId: string = 'primary') {
    try {
      await this.makeRequest(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
        {
          method: 'DELETE',
        }
      );
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Sign out (clear tokens)
   */
  signOut() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('google_calendar_tokens');
  }
}

export default GoogleCalendarService;