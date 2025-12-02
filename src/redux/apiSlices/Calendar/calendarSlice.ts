import type { BaseApiResponse } from '@/shared/BaseApiResponse';
import type {
  CalendarEventOutputDto,
  CalendarListOutputDto,
  CalendarVerificationOutputDto,
  GoogleCalendarConfigInputDto,
  SuccessResponseDto,
} from '@/types/api/data-contracts';
import { api } from '../../api';

export interface CalendarEventsParams {
  startDate: string;
  endDate: string;
  calendarId?: string;
}

export const calendarApi = api.injectEndpoints({
  endpoints: (builder) => ({
    verifyCalendarAuthorization: builder.query<
      BaseApiResponse<CalendarVerificationOutputDto>,
      void
    >({
      query: () => ({
        url: '/users/me/calendar/verify',
        method: 'GET',
      }),
      providesTags: ['Calendar'],
    }),

    saveCalendarCredentials: builder.mutation<
      BaseApiResponse<SuccessResponseDto>,
      GoogleCalendarConfigInputDto
    >({
      query: (credentials) => ({
        url: '/users/me/calendar/credentials',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Calendar'],
    }),

    deleteCalendarCredentials: builder.mutation<
      BaseApiResponse<SuccessResponseDto>,
      void
    >({
      query: () => ({
        url: '/users/me/calendar/credentials',
        method: 'DELETE',
      }),
      invalidatesTags: ['Calendar'],
    }),

    getUserCalendars: builder.query<
      BaseApiResponse<CalendarListOutputDto[]>,
      void
    >({
      query: () => ({
        url: '/users/me/calendar/calendars',
        method: 'GET',
      }),
      providesTags: ['Calendar'],
    }),

    getCalendarEvents: builder.query<
      BaseApiResponse<CalendarEventOutputDto[]>,
      CalendarEventsParams
    >({
      query: ({ calendarId = 'primary', startDate, endDate }) => ({
        url: `/users/me/calendar/calendars/${encodeURIComponent(calendarId)}/events`,
        method: 'GET',
        params: {
          startDate,
          endDate,
        },
      }),
      providesTags: ['Calendar'],
    }),

    getAllCalendarEvents: builder.query<
      BaseApiResponse<CalendarEventOutputDto[]>,
      CalendarEventsParams
    >({
      query: ({ calendarId, startDate, endDate }) => ({
        url: '/users/me/calendar/calendars/events',
        method: 'GET',
        params: {
          startDate,
          endDate,
          ...(calendarId ? { calendarId } : {}),
        },
      }),
      providesTags: ['Calendar'],
    }),
  }),
});

export const {
  useVerifyCalendarAuthorizationQuery,
  useLazyVerifyCalendarAuthorizationQuery,
  useSaveCalendarCredentialsMutation,
  useDeleteCalendarCredentialsMutation,
  useGetUserCalendarsQuery,
  useLazyGetUserCalendarsQuery,
  useGetCalendarEventsQuery,
  useLazyGetCalendarEventsQuery,
  useGetAllCalendarEventsQuery,
  useLazyGetAllCalendarEventsQuery,
} = calendarApi;

