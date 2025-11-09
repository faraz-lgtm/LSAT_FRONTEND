import type { BaseApiResponse } from "@/shared/BaseApiResponse";
import type { GetOrdersQueryParams, OrderOutput, StripeCheckoutSession, UpdateOrderNotesDto, UpdateAppointmentNotesDto, MarkAppointmentAttendanceDto, CancelOrderDto, CancelOrderResultDto } from "@/types/api/data-contracts";
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
    
    // New APIs (appointments & notes)
    updateOrderNotes: builder.mutation<BaseApiResponse<OrderOutput> | void, { id: number; body: UpdateOrderNotesDto }>({
      query: ({ id, body }) => ({
        url: `order/${id}/notes`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Orders'],
    }),

    // Update appointment notes
    updateAppointmentNotes: builder.mutation<void, { appointmentId: number; body: UpdateAppointmentNotesDto }>({
      query: ({ appointmentId, body }) => ({
        url: `order/appointments/${appointmentId}/notes`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Orders', 'Tasks'],
    }),

    // Generate a short-lived reschedule link for customer self-service
    generateRescheduleLink: builder.mutation<
      BaseApiResponse<{ url: string }> | { data: { url: string }; meta: unknown },
      { appointmentId: number }
    >({
      query: ({ appointmentId }) => ({
        url: `order/appointments/${appointmentId}/reschedule/link`,
        method: 'POST',
      }),
    }),

    // Directly reschedule an appointment (staff-driven)
    rescheduleAppointment: builder.mutation<
      BaseApiResponse<OrderAppointmentOutput> | OrderAppointmentOutput | void,
      { appointmentId: number; newDateTimeISO: string }
    >({
      query: ({ appointmentId, newDateTimeISO }) => ({
        url: `order/appointments/${appointmentId}/reschedule`,
        method: 'PATCH',
        body: { newDateTimeISO },
      }),
      invalidatesTags: ['Orders'],
    }),

    listOrderAppointments: builder.query<
      BaseApiResponse<OrderAppointmentOutput[]> | OrderAppointmentOutput[],
      number
    >({
      query: (orderId) => `order/${orderId}/appointments`,
      providesTags: (_res, _err, orderId) => [{ type: 'Orders', id: `appointments-${orderId}` }],
    }),

    markAppointmentAttendance: builder.mutation<
      BaseApiResponse<OrderAppointmentOutput> | OrderAppointmentOutput | void,
      { appointmentId: number; body: MarkAppointmentAttendanceDto }
    >({
      query: ({ appointmentId, body }) => ({
        url: `order/appointments/${appointmentId}/attendance`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Orders'],
    }),

    // Mark order as completed
    completeOrder: builder.mutation<BaseApiResponse<OrderOutput> | void, number>({
      query: (orderId) => ({
        url: `order/${orderId}/complete`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Orders'],
    }),

    // Cancel an order
    cancelOrder: builder.mutation<BaseApiResponse<CancelOrderResultDto>, { orderId: number; body: CancelOrderDto }>({
      query: ({ orderId, body }) => ({
        url: `order/${orderId}/cancel`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Orders', 'Refunds', 'Invoices', 'AvailableSlots'],
    }),

    //Mutations
    createOrder: builder.mutation<
      BaseApiResponse<StripeCheckoutSession>, // 👈 replace `any` with your API response type
      { items: CartItem[]; user: InformationState,currency: string | undefined } // 👈 request body type
    >({
      query: (orderData) => ({
        url: "order", // relative to baseUrl in your api.ts
        method: "POST", // since we're creating
        body: orderData, // request payload
      }),
      invalidatesTags: ["Orders", "Invoices", "AvailableSlots"], // auto-refetch orders, invoices, and slots
    }),

    deleteOrder: builder.mutation<BaseApiResponse<{ message: string }>, number>({
      query: (id) => ({
        url: `order/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Orders', 'AvailableSlots'],
    }),


    // Public reschedule endpoints (used by /reschedule page)
    getPublicRescheduleSlots: builder.query<
      BaseApiResponse<{ availableSlots: { slot: string; availableEmployees: { id: number; name: string; email: string }[] }[]; slotDurationMinutes: number }>,
      { token: string; dateISO?: string }
    >({
      query: ({ token, dateISO }) => ({
        url: `public/reschedule/slots`,
        params: dateISO ? { token, date: dateISO } : { token },
      }),
    }),

    confirmPublicReschedule: builder.mutation<
      BaseApiResponse<{ appointmentId: number }>,
      { token: string; newDateTimeISO: string }
    >({
      query: (body) => ({
        url: `public/reschedule/confirm`,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { 
  useGetOrdersQuery, 
  useGetOrderByIdQuery,
  useUpdateOrderNotesMutation,
  useUpdateAppointmentNotesMutation,
  useListOrderAppointmentsQuery,
  useMarkAppointmentAttendanceMutation,
  useGenerateRescheduleLinkMutation,
  useRescheduleAppointmentMutation,
  useCreateOrderMutation,
  useDeleteOrderMutation,
  useCompleteOrderMutation,
  useCancelOrderMutation,
  useGetPublicRescheduleSlotsQuery,
  useConfirmPublicRescheduleMutation,
} = ordersApi;

// Local DTO until swagger adds explicit type
export interface OrderAppointmentOutput {
  id: number;
  orderId: number;
  itemId: number;
  slotDateTime: string;
  assignedEmployeeId?: number | null;
  attendanceStatus: 'UNKNOWN' | 'SHOWED' | 'NO_SHOW';
}
