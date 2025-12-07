import type { BaseApiResponse } from '@/shared/BaseApiResponse';
import type { TaskOutputDto } from '@/types/api/data-contracts';
import { api } from '../../api';

export interface OrderAppointmentQueryDto {
  assignedEmployeeId?: number;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  label?: 'meeting' | 'personal' | 'preparation' | 'grading';
  attendanceStatus?: 'UNKNOWN' | 'SHOWED' | 'NO_SHOW';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export const orderAppointmentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all order appointments with optional filtering
    getOrderAppointments: builder.query<
      BaseApiResponse<TaskOutputDto[]>,
      OrderAppointmentQueryDto
    >({
      query: (params) => {
        // Filter out undefined/null values
        const filteredParams = Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = value;
          }
          return acc;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }, {} as Record<string, any>);

        // Ensure required date parameters are always present
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        
        if (!filteredParams.startDate) {
          filteredParams.startDate = startOfMonth.toISOString();
        }
        if (!filteredParams.endDate) {
          filteredParams.endDate = endOfMonth.toISOString();
        }

        return {
          url: '/order-appointments',
          method: 'GET',
          params: filteredParams,
        };
      },
      providesTags: ['Orders'],
    }),

    // Get order appointment by ID
    getOrderAppointmentById: builder.query<
      BaseApiResponse<TaskOutputDto>,
      number
    >({
      query: (id) => ({
        url: `/order-appointments/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Orders', id: `appointment-${id}` }],
    }),
  }),
});

export const {
  useGetOrderAppointmentsQuery,
  useGetOrderAppointmentByIdQuery,
} = orderAppointmentApi;

