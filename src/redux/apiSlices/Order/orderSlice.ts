import { api } from "../../api";
import type { CartItem } from "../../cartSlice";
import type { InformationState } from "../../informationSlice";
import type { WooCommerceOrderResponse } from "./types/orderPost.type";

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
  slotDurationMinutes: number;
}

export interface SlotsQueryParams {
  month: number;
  year: number;
  packageId: number;
  date: string; // Day number as string (e.g., "03")
}

export const ordersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<any[], void>({
      query: () => "order",
    }),
    getOrderById: builder.query<any, number>({
      query: (id) => `order/${id}`,
    }),
    
    // New endpoint for fetching available slots
    getAvailableSlots: builder.query<SlotsResponse, SlotsQueryParams>({
      query: ({ month, year, packageId, date }) => ({
        url: `order/slots`,
        params: { month, year, packageId, date , customerTimezone:Intl.DateTimeFormat().resolvedOptions().timeZone},
      }),
    }),

    //Mutations
    createOrder: builder.mutation<
      WooCommerceOrderResponse, // 👈 replace `any` with your API response type
      { items: CartItem[]; user: InformationState } // 👈 request body type
    >({
      query: (orderData) => ({
        url: "order", // relative to baseUrl in your api.ts
        method: "POST", // since we're creating
        body: orderData, // request payload
      }),
      invalidatesTags: ["Orders"], // optional: auto-refetch queries
    }),
  }),
});

export const { 
  useGetOrdersQuery, 
  useGetOrderByIdQuery, 
  useCreateOrderMutation,
  useGetAvailableSlotsQuery 
} = ordersApi;
