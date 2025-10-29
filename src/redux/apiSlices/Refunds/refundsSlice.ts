import type { BaseApiResponse } from "@/shared/BaseApiResponse";

// Type definition for CreateRefundDto (not in API contracts yet)
export type CreateRefundDto = any;
import { api } from "../../api";
import type { ExchangeRates } from "../Invoicing/invoicingSlice";

// Refund interfaces
export interface RefundOutput {
  id: number;
  refundNumber: string;
  originalOrderId: number;
  invoiceId?: number;
  customerId: number;
  amount: number | string; // could be in cents (number) or dollars (string)
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'canceled';
  reason: 'customer_request' | 'duplicate' | 'fraudulent' | 'other';
  reasonDetails: string;
  stripeRefundId?: string;
  exchangeRates?: ExchangeRates; // Historical exchange rates at time of refund
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  newOrderId?: number;
}

// Using CreateRefundDto from generated types instead of custom interface

export interface RefundQueryParams {
  status?: string[];
  customerId?: number;
  orderId?: number;
  limit?: number;
  offset?: number;
}

export const refundsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/refunds - List all refunds (with status filter)
    getRefunds: builder.query<BaseApiResponse<RefundOutput[]>, RefundQueryParams | void>({
      query: (params) => ({
        url: "refunds",
        method: "GET",
        params: params || {},
      }),
      providesTags: ['Refunds'],
    }),

    // GET /api/v1/refunds/:id - Get specific refund
    getRefundById: builder.query<BaseApiResponse<RefundOutput>, number>({
      query: (id) => ({
        url: `refunds/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: 'Refunds', id }],
    }),

    // GET /api/v1/refunds/order/:orderId - Get refunds for an order
    getRefundsByOrder: builder.query<BaseApiResponse<RefundOutput[]>, number>({
      query: (orderId) => ({
        url: `refunds/order/${orderId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, orderId) => [{ type: 'Refunds', id: `order-${orderId}` }],
    }),

    // GET /api/v1/refunds/customer/:customerId - Get customer's refunds
    getRefundsByCustomer: builder.query<BaseApiResponse<RefundOutput[]>, number>({
      query: (customerId) => ({
        url: `refunds/customer/${customerId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, customerId) => [{ type: 'Refunds', id: `customer-${customerId}` }],
    }),

    // POST /api/v1/refunds - Create new refund
    createRefund: builder.mutation<BaseApiResponse<RefundOutput>, CreateRefundDto>({
      query: (refundData) => ({
        url: "refunds",
        method: "POST",
        body: refundData,
      }),
      invalidatesTags: ['Refunds', 'Orders', 'Invoices', 'Transactions'],
    }),

    // POST /api/v1/refunds/:id/process - Process refund
    processRefund: builder.mutation<BaseApiResponse<RefundOutput>, number>({
      query: (id) => ({
        url: `refunds/${id}/process`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Refunds', id },
        'Refunds',
        'Orders',
        'Invoices',
        'Transactions'
      ],
    }),

    // POST /api/v1/refunds/:id/cancel - Cancel refund
    cancelRefund: builder.mutation<BaseApiResponse<RefundOutput>, number>({
      query: (id) => ({
        url: `refunds/${id}/cancel`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Refunds', id },
        'Refunds',
        'Orders',
        'Invoices',
        'Transactions'
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetRefundsQuery,
  useGetRefundByIdQuery,
  useGetRefundsByOrderQuery,
  useGetRefundsByCustomerQuery,
  useCreateRefundMutation,
  useProcessRefundMutation,
  useCancelRefundMutation,
} = refundsApi;
