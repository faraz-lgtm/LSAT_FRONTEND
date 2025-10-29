import { api } from "../../api";

// Type definitions for Automations (not in API contracts yet)
export type AutomationConfigOutputDto = any;
export type UpdateAutomationConfigDto = any;

export interface AutomationLogOutputDto {
  id: number;
  automationKey: string;
  executedAt: string;
  status: 'success' | 'failure' | 'pending';
  metadata?: object;
  error?: string;
}

export interface AutomationLogsQueryParams {
  automationKey?: string;
  status?: 'success' | 'failure' | 'pending';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export const automationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/automation - List all automations
    getAutomations: builder.query<AutomationConfigOutputDto[], void>({
      query: () => ({
        url: "automation",
        method: "GET",
      }),
      providesTags: ['Automation'],
    }),

    // PATCH /api/v1/automation/:key - Update automation configuration
    updateAutomation: builder.mutation<AutomationConfigOutputDto, { key: string; data: UpdateAutomationConfigDto }>({
      query: ({ key, data }) => ({
        url: `automation/${key}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ['Automation'],
    }),

    // GET /api/v1/automation/:key/logs - Get automation logs
    getAutomationLogs: builder.query<AutomationLogOutputDto[], { key: string; params?: AutomationLogsQueryParams }>({
      query: ({ key, params }) => ({
        url: `automation/${key}/logs`,
        method: "GET",
        params: params || {},
      }),
    }),

    // GET /api/v1/automation/logs - Get all automation logs (optional endpoint)
    getAllAutomationLogs: builder.query<AutomationLogOutputDto[], AutomationLogsQueryParams | void>({
      query: (params) => ({
        url: "automation/logs",
        method: "GET",
        params: params || {},
      }),
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetAutomationsQuery,
  useUpdateAutomationMutation,
  useGetAutomationLogsQuery,
  useGetAllAutomationLogsQuery,
} = automationApi;

