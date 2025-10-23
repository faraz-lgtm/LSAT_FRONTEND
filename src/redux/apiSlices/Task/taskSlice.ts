/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BaseApiResponse } from '@/shared/BaseApiResponse';
import type {
    TaskInputDto,
    TaskOutputDto,
    TaskQueryDto,
} from '@/types/api/data-contracts';
import { api } from '../../api';

export const taskApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all tasks with optional filtering
    getTasks: builder.query<
      BaseApiResponse<TaskOutputDto[]>,
      TaskQueryDto
    >({
      query: (params) => {
        // Filter out false boolean values to avoid API validation issues
        const filteredParams = Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            // Only include googleCalendar if it's explicitly true
            if (key === 'googleCalendar' && value === false) {
              return acc;
            }
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>);

        // Ensure required date parameters are always present
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        // Set end date to end of day to include tasks on the last day of the month
        endOfMonth.setHours(23, 59, 59, 999);
        
        if (!filteredParams.startDate) {
          filteredParams.startDate = startOfMonth.toISOString();
        }
        if (!filteredParams.endDate) {
          filteredParams.endDate = endOfMonth.toISOString();
        }

        return {
          url: '/task',
          method: 'GET',
          params: filteredParams,
        };
      },
      providesTags: ['Tasks'],
    }),

    // Get task by ID
    getTaskById: builder.query<
      BaseApiResponse<TaskOutputDto>,
      number
    >({
      query: (id) => ({
        url: `/task/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Tasks', id }],
    }),



    // Create new task
    createTask: builder.mutation<
      BaseApiResponse<TaskOutputDto>,
      TaskInputDto
    >({
      query: (taskData) => ({
        url: '/task',
        method: 'POST',
        body: taskData,
      }),
      invalidatesTags: ['Tasks'],
    }),

    // Update task
    updateTask: builder.mutation<
      BaseApiResponse<TaskOutputDto>,
      { id: number; data: Partial<TaskInputDto> }
    >({
      query: ({ id, data }) => ({
        url: `/task/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Tasks', id },
        'Tasks',
      ],
    }),

    // Delete task
    deleteTask: builder.mutation<
      BaseApiResponse<{ message: string }>,
      number
    >({
      query: (id) => ({
        url: `/task/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Tasks', id },
        'Tasks',
      ],
    }),
  }),
})

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,

  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = taskApi
