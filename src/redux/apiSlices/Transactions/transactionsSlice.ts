import type { BaseApiResponse } from "@/shared/BaseApiResponse";
import { api } from "../../api";
import type { ExchangeRates } from "../Invoicing/invoicingSlice";

// Transaction interfaces
export interface TransactionOutput {
  id: number;
  transactionNumber: string;
  orderId: number;
  invoiceId?: number;
  refundId?: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  amount: number; // in cents
  currency?: string; // Currency of the transaction
  type: 'payment' | 'refund' | 'chargeback' | 'adjustment';
  status: 'succeeded' | 'failed' | 'pending';
  paymentMethod?: string;
  stripeTransactionId?: string;
  stripePaymentIntentId?: string;
  metadata?: Record<string, any>;
  exchangeRates?: ExchangeRates; // Historical exchange rates at time of transaction
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
}

export interface TransactionQueryParams {
  type?: string[];
  status?: string[];
  customerId?: number;
  orderId?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export const transactionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/transactions - List all transactions (with filters)
    getTransactions: builder.query<BaseApiResponse<TransactionOutput[]>, TransactionQueryParams | void>({
      query: (params) => ({
        url: "transactions",
        method: "GET",
        params: params || {},
      }),
      providesTags: ['Transactions'],
    }),

    // GET /api/v1/transactions/:id - Get specific transaction
    getTransactionById: builder.query<BaseApiResponse<TransactionOutput>, number>({
      query: (id) => ({
        url: `transactions/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: 'Transactions', id }],
    }),

    // GET /api/v1/transactions/order/:orderId - Get transactions for an order
    getTransactionsByOrder: builder.query<BaseApiResponse<TransactionOutput[]>, number>({
      query: (orderId) => ({
        url: `transactions/order/${orderId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, orderId) => [{ type: 'Transactions', id: `order-${orderId}` }],
    }),

    // GET /api/v1/transactions/customer/:customerId - Get customer's transactions
    getTransactionsByCustomer: builder.query<BaseApiResponse<TransactionOutput[]>, number>({
      query: (customerId) => ({
        url: `transactions/customer/${customerId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, customerId) => [{ type: 'Transactions', id: `customer-${customerId}` }],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetTransactionsQuery,
  useGetTransactionByIdQuery,
  useGetTransactionsByOrderQuery,
  useGetTransactionsByCustomerQuery,
} = transactionsApi;
