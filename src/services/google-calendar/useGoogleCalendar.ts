import React, { useState, useEffect, useCallback } from 'react';
import GoogleCalendarService, { type GoogleCalendarEvent } from './googleCalendarService';
import { GOOGLE_CALENDAR_CONFIG } from './config';

export interface UseGoogleCalendarReturn {
  // Service instance
  service: GoogleCalendarService | null;
  
  // Authentication
  isAuthenticated: boolean;
  authUrl: string | null;
  authenticate: (code: string) => Promise<void>;
  signOut: () => void;
  
  // Events
  events: GoogleCalendarEvent[];
  loading: boolean;
  error: string | null;
  
  // Methods
  fetchEvents: (startDate?: Date, endDate?: Date) => Promise<void>;
  fetchTodayEvents: () => Promise<void>;
  fetchMonthEvents: (year: number, month: number) => Promise<void>;
  isTimeSlotAvailable: (startTime: Date, endTime: Date) => Promise<boolean>;
  getBusyTimes: (startDate: Date, endDate: Date) => Promise<Array<{ start: Date; end: Date }>>;
  
  // Event management
  createEvent: (event: Partial<GoogleCalendarEvent>) => Promise<void>;
  updateEvent: (eventId: string, event: Partial<GoogleCalendarEvent>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
}

export const useGoogleCalendar = (): UseGoogleCalendarReturn => {
  const [service, setService] = useState<GoogleCalendarService | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize service
  useEffect(() => {
    try {
      const googleService = new GoogleCalendarService(GOOGLE_CALENDAR_CONFIG);
      setService(googleService);
      setAuthUrl(googleService.getAuthUrl());
      
      // Check if we have stored tokens
      const storedTokens = localStorage.getItem('google_calendar_tokens');
      if (storedTokens) {
        try {
          const tokens = JSON.parse(storedTokens);
          googleService.setCredentials(tokens);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Error parsing stored tokens:', err);
          localStorage.removeItem('google_calendar_tokens');
        }
      }
    } catch (error) {
      console.error('Error initializing Google Calendar service:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize Google Calendar service');
    }
  }, []);

  // Authenticate with Google
  const authenticate = useCallback(async (code: string) => {
    if (!service) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const tokens = await service.getTokens(code);
      localStorage.setItem('google_calendar_tokens', JSON.stringify(tokens));
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Fetch events
  const fetchEvents = useCallback(async (startDate?: Date, endDate?: Date) => {
    console.log('🔄 fetchEvents called with:', { startDate, endDate });
    console.log('📍 fetchEvents call stack:', new Error().stack);
    console.log('🔐 Service available:', !!service);
    console.log('🔐 Is authenticated:', isAuthenticated);
    
    if (!service || !isAuthenticated) {
      console.log('❌ Cannot fetch events - service or auth not available');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('📅 Fetching events...');
      const fetchedEvents = startDate && endDate
        ? await service.getEventsInRange(startDate, endDate)
        : await service.getEvents();
      
      console.log('📊 Fetched events:', fetchedEvents.length);
      console.log('📋 Events data:', fetchedEvents);

      // Create a new array reference to ensure React detects the change
      setEvents([...fetchedEvents]);
      console.log('✅ Events state updated with new array reference:', fetchedEvents.length);
    } catch (err) {
      console.error('❌ Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [service, isAuthenticated]);

  // Fetch today's events
  const fetchTodayEvents = useCallback(async () => {
    if (!service || !isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const todayEvents = await service.getTodayEvents();
      setEvents(todayEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch today\'s events');
    } finally {
      setLoading(false);
    }
  }, [service, isAuthenticated]);

  // Fetch month events
  const fetchMonthEvents = useCallback(async (year: number, month: number) => {
    if (!service || !isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const monthEvents = await service.getMonthEvents(year, month);
      setEvents(monthEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch month events');
    } finally {
      setLoading(false);
    }
  }, [service, isAuthenticated]);

  // Check if time slot is available
  const isTimeSlotAvailable = useCallback(async (startTime: Date, endTime: Date): Promise<boolean> => {
    if (!service || !isAuthenticated) return true;
    
    try {
      return await service.isTimeSlotAvailable(startTime, endTime);
    } catch (err) {
      console.error('Error checking time slot availability:', err);
      return true; // Default to available if we can't check
    }
  }, [service, isAuthenticated]);

  // Get busy times
  const getBusyTimes = useCallback(async (startDate: Date, endDate: Date): Promise<Array<{ start: Date; end: Date }>> => {
    if (!service || !isAuthenticated) return [];
    
    try {
      return await service.getBusyTimes(startDate, endDate);
    } catch (err) {
      console.error('Error getting busy times:', err);
      return [];
    }
  }, [service, isAuthenticated]);

  // Create event
  const createEvent = useCallback(async (event: Partial<GoogleCalendarEvent>) => {
    console.log('🎯 useGoogleCalendar createEvent called:', event);
    console.log('🔐 Service available:', !!service);
    console.log('🔐 Is authenticated:', isAuthenticated);
    
    if (!service || !isAuthenticated) {
      console.log('❌ Cannot create event - service or auth not available');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Calling service.createEvent...');
      await service.createEvent(event);
      console.log('✅ Service createEvent completed, refreshing events...');
      
      // Refresh events after creating - fetch current month
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      console.log('🔄 Refreshing events for current month:', { startDate, endDate });
      console.log('📍 About to call fetchEvents with date range');
      console.log('🕐 Timestamp:', new Date().toISOString());
      await fetchEvents(startDate, endDate);
      console.log('✅ Events refreshed after creation');
    } catch (err) {
      console.error('❌ Error in createEvent:', err);
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setLoading(false);
    }
  }, [service, isAuthenticated, fetchEvents]);

  // Update event
  const updateEvent = useCallback(async (eventId: string, event: Partial<GoogleCalendarEvent>) => {
    console.log('📝 useGoogleCalendar updateEvent called:', { eventId, event });
    console.log('🔐 Service available:', !!service);
    console.log('🔐 Is authenticated:', isAuthenticated);
    
    if (!service || !isAuthenticated) {
      console.log('❌ Cannot update event - service or auth not available');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Calling service.updateEvent...');
      await service.updateEvent(eventId, event);
      console.log('✅ Service updateEvent completed, refreshing events...');
      
      // Refresh events after updating - fetch current month
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      console.log('🔄 Refreshing events for current month:', { startDate, endDate });
      await fetchEvents(startDate, endDate);
      console.log('✅ Events refreshed after update');
    } catch (err) {
      console.error('❌ Error in updateEvent:', err);
      setError(err instanceof Error ? err.message : 'Failed to update event');
    } finally {
      setLoading(false);
    }
  }, [service, isAuthenticated, fetchEvents]);

  // Delete event
  const deleteEvent = useCallback(async (eventId: string) => {
    console.log('🗑️ useGoogleCalendar deleteEvent called:', eventId);
    console.log('🔐 Service available:', !!service);
    console.log('🔐 Is authenticated:', isAuthenticated);
    
    if (!service || !isAuthenticated) {
      console.log('❌ Cannot delete event - service or auth not available');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Calling service.deleteEvent...');
      await service.deleteEvent(eventId);
      console.log('✅ Service deleteEvent completed, refreshing events...');
      
      // Refresh events after deleting - fetch current month
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      console.log('🔄 Refreshing events for current month:', { startDate, endDate });
      await fetchEvents(startDate, endDate);
      console.log('✅ Events refreshed after deletion');
    } catch (err) {
      console.error('❌ Error in deleteEvent:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  }, [service, isAuthenticated, fetchEvents]);

  // Sign out (disconnect from Google Calendar)
  const signOut = useCallback(() => {
    console.log('🚪 Signing out from Google Calendar...');
    
    if (service) {
      service.signOut();
    }
    
    // Clear local state
    setIsAuthenticated(false);
    setEvents([]);
    setError(null);
    
    // Clear localStorage
    localStorage.removeItem('google_calendar_tokens');
    
    console.log('✅ Successfully signed out from Google Calendar');
  }, [service]);

  // Update timestamp when events change
  React.useEffect(() => {
    console.log('🔄 Hook events updated:');
  }, [events]);

  return {
    service,
    isAuthenticated,
    authUrl,
    authenticate,
    signOut,
    events,
    loading,
    error,
    fetchEvents,
    fetchTodayEvents,
    fetchMonthEvents,
    isTimeSlotAvailable,
    getBusyTimes,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};
