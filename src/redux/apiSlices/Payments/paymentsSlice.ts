import type { BaseApiResponse } from "@/shared/BaseApiResponse";
import { api } from "../../api";

// Customer info for payment link
export interface CustomerInfoDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  id?: number;
}

// Request body for creating a payment link
export interface CreatePaymentLinkDto {
  currency: string;
  amount: number;
  customerInfo: CustomerInfoDto;
  description?: string;
}

// Response from payment link creation
export interface PaymentLinkResponse {
  sessionId: string;
  checkoutUrl: string;
}

export const paymentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createPaymentLink: builder.mutation<
      BaseApiResponse<PaymentLinkResponse>,
      CreatePaymentLinkDto
    >({
      query: (body) => ({
        url: "payment-links",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useCreatePaymentLinkMutation } = paymentsApi;

