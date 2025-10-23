import type { BaseApiResponse } from "@/shared/BaseApiResponse";
import type { GetOrdersQueryParams, OrderOutput, StripeCheckoutSession } from "@/types/api/data-contracts";
import { api } from "../../api";
import type { CartItem } from "../../cartSlice";
import type { InformationState } from "../../informationSlice";

// Order interfaces based on API structure
// export interface ItemOutput {
//   id: number;
//   price: number;
//   name: string;
//   Duration: string;
//   Description: string;
//   DateTime: string[];
//   quantity: number;
//   assignedEmployeeId: number;
//   badge?: {
//     text: string;
//     color: string;
//   };
//   save?: number;
// }

// export interface UserOutput {
//   id: number;
//   name: string;
//   // password: string | null;
//   username: string;
//   roles: ("USER" | "ADMIN" | "CUST")[];
//   isAccountDisabled: boolean;
//   // ghlUserId: string | null;
//   email: string;
//   phone: string;
//   workHours?: Record<string, string[]>;
//   // serviceIds: string[];
//   // lastAssignedOrderCount: number;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface OrderOutput {
//   id: number;
//   // user: Customer;
//   customer: UserOutput;
//   items: ItemOutput[];
// }

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
// export interface AvailableEmployee {
//   id: number;
//   name: string;
//   email: string;
// }

// export interface AvailableSlot {
//   slot: string; // ISO string format
//   availableEmployees: AvailableEmployee[];
// }

// export interface Slot {
//   availableSlots: AvailableSlot[];
//   bookedSlots:string[],
//   slotDurationMinutes: number;
//   warning?: string;
// }

// export interface SlotsQueryParams {
//   month: number;
//   year: number;
//   packageId: number;
//   date: number; // Day number as string (e.g., "03")
// }

// // Query parameters interface for getOrders
// export interface GetOrdersQueryParams {
//   orderStatus?: string;
//   limit?: number;
//   offset?: number;
// }

export const ordersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<BaseApiResponse<OrderOutput[]>, GetOrdersQueryParams | void>({
      query: (params) => ({
        url: "order",
        params: params || {},
      }),
      providesTags: ['Orders'],
    }),
    getOrderById: builder.query<BaseApiResponse<OrderOutput>, number>({
      query: (id) => `order/${id}`,
      providesTags: ['Orders'],
    }),
    


    //Mutations
    createOrder: builder.mutation<
      BaseApiResponse<StripeCheckoutSession>, // 👈 replace `any` with your API response type
      { items: CartItem[]; user: InformationState } // 👈 request body type
    >({
      query: (orderData) => ({
        url: "order", // relative to baseUrl in your api.ts
        method: "POST", // since we're creating
        body: orderData, // request payload
      }),
      invalidatesTags: ["Orders", "AvailableSlots"], // auto-refetch orders and slots
    }),

    deleteOrder: builder.mutation<BaseApiResponse<{ message: string }>, number>({
      query: (id) => ({
        url: `order/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Orders', 'AvailableSlots'],
    }),
  }),
});

export const { 
  useGetOrdersQuery, 
  useGetOrderByIdQuery, 
  useCreateOrderMutation,
  useDeleteOrderMutation,
} = ordersApi;
