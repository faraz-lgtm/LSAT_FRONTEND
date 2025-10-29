import type { BaseApiResponse } from "@/shared/BaseApiResponse";
import { api } from "../../api";

// Dashboard data interfaces based on the API response structure
export interface TopCustomer {
  customerId: number;
  customerName: string;
  email: string;
  totalRevenue: number;
  orderCount: number;
}

export interface PeriodRevenue {
  date: string;
  revenue: number;
}

export interface RevenueData {
  totalRevenue: number;
  periodRevenue: PeriodRevenue[];
}

export interface PeriodAppointment {
  date: string;
  count: number;
}

export interface AppointmentsData {
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  periodAppointments: PeriodAppointment[];
}

export interface RefundPeriod {
  date: string;
  refundAmount: number;
  refundCount: number;
}

export interface RefundData {
  totalRefunds: number;
  totalRefundCount: number;
  periodRefunds: RefundPeriod[];
}

export interface DashboardData {
  topCustomers: TopCustomer[];
  revenue: RevenueData;
  appointments: AppointmentsData;
  refunds?: RefundData;
}

export interface DashboardMeta {
  period: "DAY" | "WEEK" | "MONTH" | "QUARTER" | "YEAR";
  startDate: string;
  endDate: string;
}

export interface DashboardResponse {
  data: DashboardData;
  meta: DashboardMeta;
}

export interface DashboardQueryParams {
  period: "DAY" | "WEEK" | "MONTH" | "QUARTER" | "YEAR";
}

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardData: builder.query<BaseApiResponse<DashboardResponse>, DashboardQueryParams>({
      query: (params) => ({
        url: "dashboard",
        params: params,
      }),
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { 
  useGetDashboardDataQuery
} = dashboardApi;
