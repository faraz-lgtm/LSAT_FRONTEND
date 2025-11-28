import { api } from "../../api";
import type { 
  CreateAutomationDto,
  UpdateAutomationDto,
  SwaggerBaseApiResponseForClassAutomationConfigOutputDto,
  SwaggerBaseApiResponseForClassAutomationConfigExtendsBaseEntity1BaseEntity,
  SwaggerBaseApiResponseForClassAutomationLog
} from "@/types/api/data-contracts";

export interface AutomationLogOutputDto {
  id: number;
  automationKey: string;
  triggerEvent?: string;
  toolType?: string;
  eventData?: {
    order?: {
      id: number;
      [key: string]: any;
    };
    ctx?: {
      [key: string]: any;
    };
    [key: string]: any;
  };
  executedAt: string;
  createdAt?: string;
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
    getAutomations: builder.query<SwaggerBaseApiResponseForClassAutomationConfigOutputDto, void>({
      query: () => ({
        url: "automation",
        method: "GET",
      }),
      providesTags: ['Automation'],
    }),

    // POST /api/v1/automation - Create new automation
    createAutomation: builder.mutation<SwaggerBaseApiResponseForClassAutomationConfigExtendsBaseEntity1BaseEntity, CreateAutomationDto>({
      query: (data) => ({
        url: "automation",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Automation'],
    }),

    // PATCH /api/v1/automation/:key - Update automation configuration
    updateAutomation: builder.mutation<SwaggerBaseApiResponseForClassAutomationConfigExtendsBaseEntity1BaseEntity, { key: string; data: UpdateAutomationDto }>({
      query: ({ key, data }) => ({
        url: `automation/${key}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ['Automation'],
    }),

    // GET /api/v1/automation/:key/logs - Get automation logs
    getAutomationLogs: builder.query<SwaggerBaseApiResponseForClassAutomationLog, { key: string; params?: AutomationLogsQueryParams }>({
      query: ({ key, params }) => ({
        url: `automation/${key}/logs`,
        method: "GET",
        params: {
          ...(params || {})
        }
      }),
      providesTags: ['Automation'],
      // Force refetch on mount and don't keep unused data
      keepUnusedDataFor: 0,
    }),

    // GET /api/v1/automation/logs - Get all automation logs (optional endpoint)
    getAllAutomationLogs: builder.query<SwaggerBaseApiResponseForClassAutomationLog, AutomationLogsQueryParams | void>({
      query: (params) => ({
        url: "automation/logs",
        method: "GET",
        params: {
          ...(params || {})
        }
      }),
      providesTags: ['Automation'],
      // Force refetch on mount and don't keep unused data
      keepUnusedDataFor: 0,
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetAutomationsQuery,
  useCreateAutomationMutation,
  useUpdateAutomationMutation,
  useGetAutomationLogsQuery,
  useGetAllAutomationLogsQuery,
} = automationApi;

