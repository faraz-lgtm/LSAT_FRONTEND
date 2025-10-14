import { api } from "../../api";
import type { CartItem } from "../../cartSlice";
import type { InformationState } from "../../informationSlice";
import type { StripeOrderResponse } from "./types/orderPost.type";
import type { BaseApiResponse } from "@/shared/BaseApiResponse";

// Order interfaces based on API structure
export interface OrderItem {
  id: number;
  price: number;
  name: string;
  Duration: string;
  Description: string;
  DateTime: string[];
  quantity: number;
  assignedEmployeeId: number;
}

export interface Customer {
  id: number;
  name: string;
  password: string | null;
  username: string | null;
  roles: string[];
  isAccountDisabled: boolean;
  ghlUserId: string | null;
  email: string;
  phone: string;
  workHours: Record<string, string[]>;
  serviceIds: string[];
  lastAssignedOrderCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  customer: Customer;
  customerId: number;
  items: OrderItem[];
}

// Define types for slots API
// Expected API response format:
// GET /api/v1/order/slots?month=10&year=2025&packageId=5&date=03
// Response: {
//   "availableSlots": [
//     {
//       "slot": "2025-10-03T08:00:00.000Z",
//       "availableEmployees": [
//         {
//           "id": 10,
//           "name": "Faraz",
//           "email": "faraz@scalebrands.ca"
//         }
//       ]
//     }
//   ],
//   "slotDurationMinutes": 15
// }
export interface Employee {
  id: number;
  name: string;
  email: string;
}

export interface AvailableSlot {
  slot: string; // ISO string format
  availableEmployees: Employee[];
}

export interface SlotsResponse {
  availableSlots: AvailableSlot[];
  bookedSlots:string[],
  slotDurationMinutes: number;
}

export interface SlotsQueryParams {
  month: number;
  year: number;
  packageId: number;
  date: string; // Day number as string (e.g., "03")
}

// Query parameters interface for getOrders
export interface GetOrdersQueryParams {
  orderStatus?: string;
  limit?: number;
  offset?: number;
}

export const ordersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<BaseApiResponse<Order[]>, GetOrdersQueryParams | void>({
      query: (params) => ({
        url: "order",
        params: params || {},
      }),
      providesTags: ['Orders'],
    }),
    getOrderById: builder.query<BaseApiResponse<Order>, number>({
      query: (id) => `order/${id}`,
      providesTags: ['Orders'],
    }),
    
    // New endpoint for fetching available slots
    getAvailableSlots: builder.query<BaseApiResponse<SlotsResponse>, SlotsQueryParams>({
      query: ({ month, year, packageId, date }) => ({
        url: `order/slots`,
        params: { month, year, packageId, date , customerTimezone:Intl.DateTimeFormat().resolvedOptions().timeZone},
      }),
    }),

    //Mutations
    createOrder: builder.mutation<
      BaseApiResponse<StripeOrderResponse>, // 👈 replace `any` with your API response type
      { items: CartItem[]; user: InformationState } // 👈 request body type
    >({
      query: (orderData) => ({
        url: "order", // relative to baseUrl in your api.ts
        method: "POST", // since we're creating
        body: orderData, // request payload
      }),
      invalidatesTags: ["Orders"], // optional: auto-refetch queries
    }),

    deleteOrder: builder.mutation<BaseApiResponse<{ message: string }>, number>({
      query: (id) => ({
        url: `order/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const { 
  useGetOrdersQuery, 
  useGetOrderByIdQuery, 
  useCreateOrderMutation,
  useDeleteOrderMutation,
  useGetAvailableSlotsQuery 
} = ordersApi;
