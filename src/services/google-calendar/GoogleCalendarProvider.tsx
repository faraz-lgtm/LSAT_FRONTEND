import React, { createContext, useContext, type ReactNode } from 'react';
import { useGoogleCalendar, type UseGoogleCalendarReturn } from './useGoogleCalendar';

const GoogleCalendarContext = createContext<UseGoogleCalendarReturn | undefined>(undefined);

export const useGoogleCalendarContext = () => {
  const context = useContext(GoogleCalendarContext);
  if (!context) {
    throw new Error('useGoogleCalendarContext must be used within a GoogleCalendarProvider');
  }
  return context;
};

interface GoogleCalendarProviderProps {
  children: ReactNode;
}

export const GoogleCalendarProvider: React.FC<GoogleCalendarProviderProps> = ({ children }) => {
  const googleCalendarData = useGoogleCalendar();

  // Ensure we always provide a value
  const contextValue = googleCalendarData || {
    service: null,
    isAuthenticated: false,
    authUrl: null,
    authenticate: async () => {},
    signOut: () => {},
    events: [],
    loading: false,
    error: null,
    fetchEvents: async () => {},
    fetchTodayEvents: async () => {},
    fetchMonthEvents: async () => {},
    isTimeSlotAvailable: async () => true,
    getBusyTimes: async () => [],
    createEvent: async () => {},
    updateEvent: async () => {},
    deleteEvent: async () => {},
  };

  return (
    <GoogleCalendarContext.Provider value={contextValue}>
      {children}
    </GoogleCalendarContext.Provider>
  );
};
