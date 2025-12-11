import { api } from "@/redux/api";
import type { BaseApiResponse } from "@/shared/BaseApiResponse";

export interface SuperAdminStats {
  totalOrganizations: number;
  totalLeads: number;
  totalContacts: number;
  totalCustomers: number;
  totalAppointments: number;
  totalRevenue: number;
}

export interface OrganizationUsage {
  organizationId: number;
  organizationName: string;
  smsCount: number;
  emailCount: number;
  callDuration: number; // in seconds
}

export const superAdminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSuperAdminStats: builder.query<BaseApiResponse<SuperAdminStats>, void>({
      query: () => ({
        url: '/super-admin/stats',
      }),
      providesTags: ['SuperAdminStats'],
    }),
    
    getSuperAdminUsage: builder.query<BaseApiResponse<OrganizationUsage[]>, void>({
      query: () => ({
        url: '/super-admin/usage',
      }),
      providesTags: ['SuperAdminUsage'],
    }),
  }),
});

export const { 
  useGetSuperAdminStatsQuery, 
  useGetSuperAdminUsageQuery 
} = superAdminApi;
