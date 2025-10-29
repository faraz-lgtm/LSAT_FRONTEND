import type { BaseApiResponse } from "@/shared/BaseApiResponse";
import { api } from "../../api";
import type { AutomationConfigOutputDto, UpdateAutomationConfigDto } from "@/types/api/data-contracts";

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
    getAutomations: builder.query<BaseApiResponse<AutomationConfigOutputDto[]>, void>({
      query: () => ({
        url: "automation",
        method: "GET",
      }),
      providesTags: ['Automation'],
    }),

    // PATCH /api/v1/automation/:key - Update automation configuration
    updateAutomation: builder.mutation<BaseApiResponse<AutomationConfigOutputDto>, { key: string; data: UpdateAutomationConfigDto }>({
      query: ({ key, data }) => ({
        url: `automation/${key}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ['Automation'],
    }),

    // GET /api/v1/automation/:key/logs - Get automation logs
    getAutomationLogs: builder.query<BaseApiResponse<AutomationLogOutputDto[]>, { key: string; params?: AutomationLogsQueryParams }>({
      query: ({ key, params }) => ({
        url: `automation/${key}/logs`,
        method: "GET",
        params: params || {},
      }),
    }),

    // GET /api/v1/automation/logs - Get all automation logs (optional endpoint)
    getAllAutomationLogs: builder.query<BaseApiResponse<AutomationLogOutputDto[]>, AutomationLogsQueryParams | void>({
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

