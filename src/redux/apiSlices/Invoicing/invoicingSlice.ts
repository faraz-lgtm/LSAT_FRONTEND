import type { BaseApiResponse } from "@/shared/BaseApiResponse";
import { api } from "../../api";

// Exchange rates for historical currency conversion
export interface ExchangeRates {
  rates: Record<string, number>;
  effectiveAt: number; // Unix timestamp
  baseCurrency: string;
}

// Invoice interfaces
export interface InvoiceOutput {
  id: number;
  invoiceNumber: string;
  orderId: number;
  customerId: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
  issueDate: string;
  dueDate: string;
  paidDate?: string | null;
  items: InvoiceLineItem[];
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  currency: string;
  exchangeRateToCad?: number; // Deprecated: use exchangeRates instead
  exchangeRates?: ExchangeRates; // Historical exchange rates at time of invoice
  notes?: string | null;
  voidedAt?: string | null;
  voidReason?: string | null;
  createdAt: string;
  updatedAt: string;
  // Additional fields from API
  customerName?: string;
  customerEmail?: string;
  amount?: string | number;
}

export interface InvoiceLineItem {
  id: number;
  name: string;
  description?: string;
  price: string | number;
  unitPrice?: number;
  quantity: number;
  total: string | number;
  totalPrice?: number;
}

export interface CreateInvoiceInput {
  orderId: number;
  customerId: number;
  dueDate: string;
  lineItems: Omit<InvoiceLineItem, 'id'>[];
}

export interface UpdateInvoiceStatusInput {
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
}

export interface InvoiceQueryParams {
  status?: string[];
  customerId?: number;
  orderId?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export const invoicingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/invoicing - List all invoices (with filters)
    getInvoices: builder.query<BaseApiResponse<InvoiceOutput[]>, InvoiceQueryParams | void>({
      query: (params) => ({
        url: "invoicing",
        method: "GET",
        params: params || {},
      }),
      providesTags: ['Invoices'],
    }),

    // GET /api/v1/invoicing/:id - Get specific invoice
    getInvoiceById: builder.query<BaseApiResponse<InvoiceOutput>, number>({
      query: (id) => ({
        url: `invoicing/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: 'Invoices', id }],
    }),

    // GET /api/v1/invoicing/order/:orderId - Get invoices for an order
    getInvoicesByOrder: builder.query<BaseApiResponse<InvoiceOutput[]>, number>({
      query: (orderId) => ({
        url: `invoicing/order/${orderId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, orderId) => [{ type: 'Invoices', id: `order-${orderId}` }],
    }),

    // GET /api/v1/invoicing/customer/:customerId - Get customer's invoices
    getInvoicesByCustomer: builder.query<BaseApiResponse<InvoiceOutput[]>, number>({
      query: (customerId) => ({
        url: `invoicing/customer/${customerId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, customerId) => [{ type: 'Invoices', id: `customer-${customerId}` }],
    }),

    // POST /api/v1/invoicing - Create new invoice
    createInvoice: builder.mutation<BaseApiResponse<InvoiceOutput>, CreateInvoiceInput>({
      query: (invoiceData) => ({
        url: "invoicing",
        method: "POST",
        body: invoiceData,
      }),
      invalidatesTags: ['Invoices'],
    }),

    // PUT /api/v1/invoicing/:id/status - Update invoice status
    updateInvoiceStatus: builder.mutation<BaseApiResponse<InvoiceOutput>, { id: number; data: UpdateInvoiceStatusInput }>({
      query: ({ id, data }) => ({
        url: `invoicing/${id}/status`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Invoices', id },
        'Invoices'
      ],
    }),

    // PUT /api/v1/invoicing/:id/void - Void an invoice
    voidInvoice: builder.mutation<BaseApiResponse<InvoiceOutput>, number>({
      query: (id) => ({
        url: `invoicing/${id}/void`,
        method: "PUT",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Invoices', id },
        'Invoices'
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useGetInvoicesByOrderQuery,
  useGetInvoicesByCustomerQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceStatusMutation,
  useVoidInvoiceMutation,
} = invoicingApi;
