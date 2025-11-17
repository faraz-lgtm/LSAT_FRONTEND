/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import {
  AddParticipantDto,
  CancelOrderDto,
  CancelRefundDto,
  CreateConversationDto,
  CreateInvoiceDto,
  CreateOrganizationDto,
  CreateProductInput,
  CreateRefundDto,
  ForgotPasswordInput,
  InvoiceOutputDto,
  LoginInput,
  MarkAppointmentAttendanceDto,
  OrderInput,
  ProcessRefundDto,
  RefreshTokenInput,
  Refund,
  RegisterInput,
  ResetPasswordInput,
  SendEmailDto,
  SendMessageDto,
  Slot,
  SwaggerBaseApiResponseForClassAuthTokenOutput,
  SwaggerBaseApiResponseForClassAutomationConfigExtendsBaseEntity1BaseEntity,
  SwaggerBaseApiResponseForClassAutomationConfigOutputDto,
  SwaggerBaseApiResponseForClassAutomationLog,
  SwaggerBaseApiResponseForClassBaseUserOutput,
  SwaggerBaseApiResponseForClassCancelOrderResultDto,
  SwaggerBaseApiResponseForClassConversationOutputDto,
  SwaggerBaseApiResponseForClassDashboardOutputDto,
  SwaggerBaseApiResponseForClassForgotPasswordOutput,
  SwaggerBaseApiResponseForClassLoginOutput,
  SwaggerBaseApiResponseForClassMessageOutputDto,
  SwaggerBaseApiResponseForClassOrderOutput,
  SwaggerBaseApiResponseForClassOrganizationOutput,
  SwaggerBaseApiResponseForClassParticipantOutputDto,
  SwaggerBaseApiResponseForClassPaymentTransactionExtendsBaseFinancialEntity1BaseOrderRelatedEntity,
  SwaggerBaseApiResponseForClassProductOutput,
  SwaggerBaseApiResponseForClassRegisterOutputExtendsBaseUserOutputDto1BaseUserOutput,
  SwaggerBaseApiResponseForClassResetPasswordOutput,
  SwaggerBaseApiResponseForClassSlackPlaceholdersResponseDto,
  SwaggerBaseApiResponseForClassStripeCheckoutSession,
  SwaggerBaseApiResponseForClassStripePaymentIntent,
  SwaggerBaseApiResponseForClassSuccessResponseDto,
  SwaggerBaseApiResponseForClassTaskOutputDto,
  SwaggerBaseApiResponseForClassUserOutputExtendsBaseUserOutputDto1BaseUserOutput,
  SwaggerBaseApiResponseForClassVerifyOtpOutput,
  TaskInputDto,
  UpdateAppointmentNotesDto,
  UpdateAutomationConfigDto,
  UpdateInvoiceStatusDto,
  UpdateOrderNotesDto,
  UpdateOrderStatusDto,
  UpdateOrganizationDto,
  UpdateProductInput,
  UpdateUserInput,
  UserInput,
  VerifyOtpInput,
  VoidInvoiceDto,
} from "./data-contracts";

export namespace Api {
  /**
   * No description
   * @name AppControllerGetHello
   * @request GET:/api/v1
   */
  export namespace AppControllerGetHello {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @name AppControllerCatchAllPost
   * @request POST:/api/v1
   */
  export namespace AppControllerCatchAllPost {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * @description Retrieve a list of all organizations. Only SUPER_ADMIN can access this endpoint.
   * @tags organizations
   * @name OrganizationControllerGetAll
   * @summary Get all organizations
   * @request GET:/api/v1/organizations
   * @secure
   */
  export namespace OrganizationControllerGetAll {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassOrganizationOutput;
  }

  /**
   * @description Create a new organization with the provided details. Only SUPER_ADMIN can create organizations. Domains array is used for domain-based organization detection in unauthenticated routes.
   * @tags organizations
   * @name OrganizationControllerCreate
   * @summary Create a new organization
   * @request POST:/api/v1/organizations
   * @secure
   */
  export namespace OrganizationControllerCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateOrganizationDto;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassOrganizationOutput;
  }

  /**
   * @description Retrieve the organization associated with the current authenticated user. Organization is determined from JWT token.
   * @tags organizations
   * @name OrganizationControllerGetMyOrganization
   * @summary Get current user's organization
   * @request GET:/api/v1/organizations/my-organization
   * @secure
   */
  export namespace OrganizationControllerGetMyOrganization {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassOrganizationOutput;
  }

  /**
   * @description Retrieve a specific organization by its ID. Only SUPER_ADMIN can access this endpoint.
   * @tags organizations
   * @name OrganizationControllerGetById
   * @summary Get organization by ID
   * @request GET:/api/v1/organizations/{id}
   * @secure
   */
  export namespace OrganizationControllerGetById {
    export type RequestParams = {
      /**
       * Organization ID
       * @example 1
       */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassOrganizationOutput;
  }

  /**
   * @description Update an existing organization. Only SUPER_ADMIN can update organizations. All fields are optional - only provided fields will be updated.
   * @tags organizations
   * @name OrganizationControllerUpdate
   * @summary Update an organization
   * @request PATCH:/api/v1/organizations/{id}
   * @secure
   */
  export namespace OrganizationControllerUpdate {
    export type RequestParams = {
      /**
       * Organization ID
       * @example 1
       */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateOrganizationDto;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassOrganizationOutput;
  }

  /**
   * No description
   * @tags users
   * @name UserControllerGetMyProfile
   * @summary Get user me API
   * @request GET:/api/v1/users/me
   * @secure
   */
  export namespace UserControllerGetMyProfile {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassUserOutputExtendsBaseUserOutputDto1BaseUserOutput;
  }

  /**
   * @description Public endpoint to get existing customer by email or create a new one
   * @tags users
   * @name UserControllerGetOrCreateCustomer
   * @summary Get or create customer API
   * @request POST:/api/v1/users/get-or-create-customer
   */
  export namespace UserControllerGetOrCreateCustomer {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UserInput;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassBaseUserOutput;
  }

  /**
   * No description
   * @tags users
   * @name UserControllerGetUsers
   * @summary Get users as a list API
   * @request GET:/api/v1/users
   * @secure
   */
  export namespace UserControllerGetUsers {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Optional, defaults to 100 */
      limit?: number;
      /** Optional, defaults to 0 */
      offset?: number;
      /**
       * Filter users by role
       * @example "USER"
       */
      role?: "USER" | "ADMIN" | "COMPANY_ADMIN" | "SUPER_ADMIN" | "CUST";
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassUserOutputExtendsBaseUserOutputDto1BaseUserOutput;
  }

  /**
   * No description
   * @tags users
   * @name UserControllerGetUser
   * @summary Get user by id API
   * @request GET:/api/v1/users/{id}
   * @secure
   */
  export namespace UserControllerGetUser {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassUserOutputExtendsBaseUserOutputDto1BaseUserOutput;
  }

  /**
   * No description
   * @tags users
   * @name UserControllerUpdateUser
   * @summary Update user API
   * @request PATCH:/api/v1/users/{id}
   * @secure
   */
  export namespace UserControllerUpdateUser {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateUserInput;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassUserOutputExtendsBaseUserOutputDto1BaseUserOutput;
  }

  /**
   * No description
   * @tags users
   * @name UserControllerDeleteUser
   * @summary Delete user API
   * @request DELETE:/api/v1/users/{id}
   * @secure
   */
  export namespace UserControllerDeleteUser {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags auth
   * @name AuthControllerLogin
   * @summary User login API
   * @request POST:/api/v1/auth/login
   */
  export namespace AuthControllerLogin {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = LoginInput;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassLoginOutput;
  }

  /**
   * No description
   * @tags auth
   * @name AuthControllerRegisterLocal
   * @summary User registration API
   * @request POST:/api/v1/auth/register
   */
  export namespace AuthControllerRegisterLocal {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RegisterInput;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassRegisterOutputExtendsBaseUserOutputDto1BaseUserOutput;
  }

  /**
   * No description
   * @tags auth
   * @name AuthControllerRefreshToken
   * @summary Refresh access token API
   * @request POST:/api/v1/auth/refresh-token
   */
  export namespace AuthControllerRefreshToken {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RefreshTokenInput;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassAuthTokenOutput;
  }

  /**
   * @description Sends a 6-digit OTP code to the user via both SMS (if phone number exists) and Email (if email exists). The OTP expires in 10 minutes. Rate limited to 3 requests per identifier per 15 minutes.
   * @tags auth
   * @name AuthControllerForgotPassword
   * @summary Request password reset - sends OTP via SMS and Email
   * @request POST:/api/v1/auth/forgot-password
   */
  export namespace AuthControllerForgotPassword {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ForgotPasswordInput;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassForgotPasswordOutput;
  }

  /**
   * @description Verifies if the provided OTP code is valid without consuming it. The OTP must be verified again in the reset-password endpoint where it will be consumed.
   * @tags auth
   * @name AuthControllerVerifyOtp
   * @summary Verify OTP code
   * @request POST:/api/v1/auth/verify-otp
   */
  export namespace AuthControllerVerifyOtp {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = VerifyOtpInput;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassVerifyOtpOutput;
  }

  /**
   * @description Resets the user password after verifying the OTP code. The OTP is consumed after successful password reset and cannot be reused. Password must be at least 8 characters long.
   * @tags auth
   * @name AuthControllerResetPassword
   * @summary Reset password with verified OTP
   * @request POST:/api/v1/auth/reset-password
   */
  export namespace AuthControllerResetPassword {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ResetPasswordInput;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassResetPasswordOutput;
  }

  /**
   * No description
   * @tags order
   * @name OrderControllerUpdateNotes
   * @summary Update order notes
   * @request PATCH:/api/v1/order/{id}/notes
   * @secure
   */
  export namespace OrderControllerUpdateNotes {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateOrderNotesDto;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * @description Updates the business status of an order (PENDING, IN_PROGRESS, COMPLETED). When setting to COMPLETED, automatically sets completedAt timestamp and emits ORDER_COMPLETED event.
   * @tags order
   * @name OrderControllerUpdateStatus
   * @summary Update order business status
   * @request PATCH:/api/v1/order/{id}/status
   * @secure
   */
  export namespace OrderControllerUpdateStatus {
    export type RequestParams = {
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateOrderStatusDto;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassOrderOutput;
  }

  /**
   * No description
   * @tags order
   * @name OrderControllerListAppointments
   * @summary List appointments for an order
   * @request GET:/api/v1/order/{id}/appointments
   * @secure
   */
  export namespace OrderControllerListAppointments {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags order
   * @name OrderControllerMarkAppointmentAttendance
   * @summary Mark appointment attendance
   * @request PATCH:/api/v1/order/appointments/{appointmentId}/attendance
   * @secure
   */
  export namespace OrderControllerMarkAppointmentAttendance {
    export type RequestParams = {
      appointmentId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = MarkAppointmentAttendanceDto;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags order
   * @name OrderControllerUpdateAppointmentNotes
   * @summary Update appointment notes
   * @request PATCH:/api/v1/order/appointments/{appointmentId}/notes
   * @secure
   */
  export namespace OrderControllerUpdateAppointmentNotes {
    export type RequestParams = {
      appointmentId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateAppointmentNotesDto;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags order
   * @name OrderControllerGenerateRescheduleLink
   * @summary Generate reschedule link for an appointment
   * @request POST:/api/v1/order/appointments/{appointmentId}/reschedule/link
   * @secure
   */
  export namespace OrderControllerGenerateRescheduleLink {
    export type RequestParams = {
      appointmentId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags order
   * @name OrderControllerRescheduleAppointment
   * @summary Reschedule an appointment (admin)
   * @request PATCH:/api/v1/order/appointments/{appointmentId}/reschedule
   * @secure
   */
  export namespace OrderControllerRescheduleAppointment {
    export type RequestParams = {
      appointmentId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags order
   * @name OrderControllerMarkOrderCompleted
   * @summary Mark order as completed
   * @request PATCH:/api/v1/order/{orderId}/complete
   * @secure
   */
  export namespace OrderControllerMarkOrderCompleted {
    export type RequestParams = {
      orderId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags order
   * @name OrderControllerCreate
   * @summary Create Order
   * @request POST:/api/v1/order
   */
  export namespace OrderControllerCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = OrderInput;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassStripeCheckoutSession;
  }

  /**
   * No description
   * @tags order
   * @name OrderControllerFindAll
   * @summary Get Orders as a list API
   * @request GET:/api/v1/order
   * @secure
   */
  export namespace OrderControllerFindAll {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Optional, defaults to 100 */
      limit?: number;
      /** Optional, defaults to 0 */
      offset?: number;
      /** Filter orders by payment status */
      orderStatus?: "pending" | "succeeded" | "failed" | "canceled";
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassOrderOutput;
  }

  /**
   * No description
   * @tags order
   * @name OrderControllerFindOne
   * @summary Get order by id API
   * @request GET:/api/v1/order/{id}
   * @secure
   */
  export namespace OrderControllerFindOne {
    export type RequestParams = {
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassOrderOutput;
  }

  /**
   * @description Updates an existing order - currently returns placeholder response
   * @tags order
   * @name OrderControllerUpdate
   * @summary Update order API (Placeholder)
   * @request PATCH:/api/v1/order/{id}
   * @secure
   */
  export namespace OrderControllerUpdate {
    export type RequestParams = {
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = OrderInput;
    export type RequestHeaders = {};
    export type ResponseBody = string;
  }

  /**
   * No description
   * @tags order
   * @name OrderControllerRemove
   * @summary Delete order by id API
   * @request DELETE:/api/v1/order/{id}
   * @secure
   */
  export namespace OrderControllerRemove {
    export type RequestParams = {
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags order
   * @name OrderControllerCreateStripeCheckout
   * @summary Create Stripe checkout session for order
   * @request POST:/api/v1/order/{id}/stripe/checkout
   */
  export namespace OrderControllerCreateStripeCheckout {
    export type RequestParams = {
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassStripeCheckoutSession;
  }

  /**
   * No description
   * @tags order
   * @name OrderControllerCreateStripePaymentIntent
   * @summary Create Stripe payment intent for order
   * @request POST:/api/v1/order/{id}/stripe/payment-intent
   */
  export namespace OrderControllerCreateStripePaymentIntent {
    export type RequestParams = {
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassStripePaymentIntent;
  }

  /**
   * No description
   * @tags order
   * @name OrderControllerConfirmStripePayment
   * @summary Confirm Stripe payment
   * @request POST:/api/v1/order/stripe/confirm-payment
   */
  export namespace OrderControllerConfirmStripePayment {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * @description Note: Cleanup runs automatically every 5 minutes via cron job. This endpoint is for manual testing only.
   * @tags order
   * @name OrderControllerRunReservationCleanup
   * @summary Manually run reservation cleanup job (for testing/debugging)
   * @request POST:/api/v1/order/cleanup/reservations
   * @secure
   */
  export namespace OrderControllerRunReservationCleanup {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * @description Returns current reservation statistics. Cleanup runs automatically every 5 minutes.
   * @tags order
   * @name OrderControllerGetReservationStats
   * @summary Get reservation statistics (for monitoring)
   * @request GET:/api/v1/order/cleanup/stats
   * @secure
   */
  export namespace OrderControllerGetReservationStats {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * @description Cancels an order by refunding it, voiding the invoice, and canceling slot reservations
   * @tags order
   * @name OrderControllerCancelOrder
   * @summary Cancel an existing order
   * @request PATCH:/api/v1/order/{id}/cancel
   * @secure
   */
  export namespace OrderControllerCancelOrder {
    export type RequestParams = {
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = CancelOrderDto;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassCancelOrderResultDto;
  }

  /**
   * No description
   * @tags public
   * @name OrderPublicControllerGetSlots
   * @summary Get available slots for rescheduling (public)
   * @request GET:/api/v1/public/reschedule/slots
   */
  export namespace OrderPublicControllerGetSlots {
    export type RequestParams = {};
    export type RequestQuery = {
      token: string;
      date: string;
      graceHours: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags public
   * @name OrderPublicControllerConfirm
   * @summary Confirm reschedule (public)
   * @request POST:/api/v1/public/reschedule/confirm
   */
  export namespace OrderPublicControllerConfirm {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * @description Returns available and booked slots for the specified date and package. Used by Orders, Tasks, and Appointments.
   * @tags slots
   * @name SlotControllerGetAvailableSlots
   * @summary Get available slots for a package
   * @request GET:/api/v1/slots
   */
  export namespace SlotControllerGetAvailableSlots {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Date in ISO 8601 format (UTC timezone)
       * @format date-time
       * @example "2025-01-15T00:00:00.000Z"
       */
      date: string;
      /**
       * Service/package ID
       * @min 1
       * @example 5
       */
      packageId: number;
      /**
       * Customer timezone (e.g., America/New_York, Europe/London)
       * @example "America/New_York"
       */
      customerTimezone?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Slot;
  }

  /**
   * @description Retrieve a list of all available products. This endpoint is public and does not require authentication. Products are filtered by organization based on the request origin domain.
   * @tags products
   * @name ProductControllerFindAll
   * @summary Get all products
   * @request GET:/api/v1/products
   */
  export namespace ProductControllerFindAll {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassProductOutput;
  }

  /**
   * @description Create a new product. This endpoint requires admin authentication.
   * @tags products
   * @name ProductControllerCreate
   * @summary Create a new product
   * @request POST:/api/v1/products
   * @secure
   */
  export namespace ProductControllerCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateProductInput;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassProductOutput;
  }

  /**
   * @description Retrieve a specific product by its ID. This endpoint is public and does not require authentication. Product is filtered by organization based on the request origin domain.
   * @tags products
   * @name ProductControllerFindOne
   * @summary Get product by ID
   * @request GET:/api/v1/products/{id}
   */
  export namespace ProductControllerFindOne {
    export type RequestParams = {
      /**
       * Product ID
       * @example 5
       */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassProductOutput;
  }

  /**
   * @description Update an existing product. This endpoint requires admin authentication.
   * @tags products
   * @name ProductControllerUpdate
   * @summary Update a product
   * @request PATCH:/api/v1/products/{id}
   * @secure
   */
  export namespace ProductControllerUpdate {
    export type RequestParams = {
      /**
       * Product ID
       * @example 5
       */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateProductInput;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassProductOutput;
  }

  /**
   * @description Delete a product. This endpoint requires admin authentication.
   * @tags products
   * @name ProductControllerDelete
   * @summary Delete a product
   * @request DELETE:/api/v1/products/{id}
   * @secure
   */
  export namespace ProductControllerDelete {
    export type RequestParams = {
      /**
       * Product ID
       * @example 5
       */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * @description Creates a new refund request for an order
   * @tags refunds
   * @name RefundControllerCreateRefund
   * @summary Create a new refund
   * @request POST:/api/v1/refunds
   * @secure
   */
  export namespace RefundControllerCreateRefund {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateRefundDto;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 1 */
      id?: number;
      /** @example "REF-2025-0001" */
      refundNumber?: string;
      /** @example 383 */
      originalOrderId?: number;
      /** @example 174 */
      customerId?: number;
      /** @example 10000 */
      amount?: number;
      /** @example "USD" */
      currency?: string;
      /** @example "customer_request" */
      reason?: string;
      /** @example "Customer requested refund due to scheduling conflict" */
      reasonDetails?: string;
      /** @example "pending" */
      status?: string;
      /** @example "2024-01-15T10:30:00Z" */
      createdAt?: string;
    };
  }

  /**
   * @description Retrieve refunds with optional filtering by status, reason, customer, or date range
   * @tags refunds
   * @name RefundControllerGetRefunds
   * @summary Get refunds with filters
   * @request GET:/api/v1/refunds
   * @secure
   */
  export namespace RefundControllerGetRefunds {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Filter by refund status */
      status?: "pending" | "processing" | "completed" | "failed" | "cancelled";
      /** Filter by refund reason */
      reason?: "customer_request" | "duplicate" | "fraudulent" | "other";
      /**
       * Filter by customer ID
       * @example 174
       */
      customerId?: number;
      /**
       * Filter by original order ID
       * @example 383
       */
      originalOrderId?: number;
      /**
       * Start date for filtering (YYYY-MM-DD)
       * @example "2024-01-01"
       */
      startDate?: string;
      /**
       * End date for filtering (YYYY-MM-DD)
       * @example "2024-12-31"
       */
      endDate?: string;
      /**
       * Number of refunds to return (1-100)
       * @min 1
       * @max 100
       * @example 10
       */
      limit?: number;
      /**
       * Number of refunds to skip
       * @min 0
       * @example 0
       */
      offset?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Refund[];
  }

  /**
   * @description Retrieve refund statistics including counts by status, reason, and recent activity
   * @tags refunds
   * @name RefundControllerGetRefundStats
   * @summary Get refund statistics
   * @request GET:/api/v1/refunds/stats
   * @secure
   */
  export namespace RefundControllerGetRefundStats {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 25 */
      total?: number;
      /** @example {"pending":5,"processing":2,"completed":15,"cancelled":2,"failed":1} */
      byStatus?: object;
      /** @example {"customer_request":20,"duplicate":3,"fraudulent":1,"other":1} */
      byReason?: object;
      /** @example 8 */
      recentCount?: number;
    };
  }

  /**
   * @description Retrieve a specific refund by its unique identifier
   * @tags refunds
   * @name RefundControllerGetRefundById
   * @summary Get refund by ID
   * @request GET:/api/v1/refunds/{id}
   * @secure
   */
  export namespace RefundControllerGetRefundById {
    export type RequestParams = {
      /**
       * Refund ID
       * @example 1
       */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Refund;
  }

  /**
   * @description Retrieve a specific refund by its refund number
   * @tags refunds
   * @name RefundControllerGetRefundByNumber
   * @summary Get refund by refund number
   * @request GET:/api/v1/refunds/number/{refundNumber}
   * @secure
   */
  export namespace RefundControllerGetRefundByNumber {
    export type RequestParams = {
      /**
       * Refund number
       * @example "REF-2025-0001"
       */
      refundNumber: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Refund;
  }

  /**
   * @description Retrieve all refunds associated with a specific original order
   * @tags refunds
   * @name RefundControllerGetRefundsByOrderId
   * @summary Get refunds for an order
   * @request GET:/api/v1/refunds/order/{orderId}
   * @secure
   */
  export namespace RefundControllerGetRefundsByOrderId {
    export type RequestParams = {
      /**
       * Original Order ID
       * @example 383
       */
      orderId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Refund[];
  }

  /**
   * @description Retrieve all refunds associated with a specific customer
   * @tags refunds
   * @name RefundControllerGetRefundsByCustomerId
   * @summary Get refunds for a customer
   * @request GET:/api/v1/refunds/customer/{customerId}
   * @secure
   */
  export namespace RefundControllerGetRefundsByCustomerId {
    export type RequestParams = {
      /**
       * Customer ID
       * @example 174
       */
      customerId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Refund[];
  }

  /**
   * @description Mark a refund as processing and initiate the refund process
   * @tags refunds
   * @name RefundControllerProcessRefund
   * @summary Process a refund
   * @request PUT:/api/v1/refunds/{id}/process
   * @secure
   */
  export namespace RefundControllerProcessRefund {
    export type RequestParams = {
      /**
       * Refund ID
       * @example 1
       */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = ProcessRefundDto;
    export type RequestHeaders = {};
    export type ResponseBody = Refund;
  }

  /**
   * @description Cancel a pending or processing refund
   * @tags refunds
   * @name RefundControllerCancelRefund
   * @summary Cancel a refund
   * @request PUT:/api/v1/refunds/{id}/cancel
   * @secure
   */
  export namespace RefundControllerCancelRefund {
    export type RequestParams = {
      /**
       * Refund ID
       * @example 1
       */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = CancelRefundDto;
    export type RequestHeaders = {};
    export type ResponseBody = Refund;
  }

  /**
   * @description Retrieve payment transactions with optional filtering and pagination. Supports filtering by type, status, customer, order, date range, amount range, payment method, and currency.
   * @tags transactions
   * @name PaymentTransactionControllerGetTransactions
   * @summary Get payment transactions
   * @request GET:/api/v1/transactions
   * @secure
   */
  export namespace PaymentTransactionControllerGetTransactions {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Number of transactions to return (max 100)
       * @example 10
       */
      limit?: number;
      /**
       * Number of transactions to skip
       * @example 0
       */
      offset?: number;
      /** Filter by transaction type */
      type?: "payment" | "refund" | "chargeback" | "adjustment";
      /**
       * Filter by transaction status
       * @example "succeeded"
       */
      status?: string;
      /**
       * Filter by customer ID
       * @example 123
       */
      customerId?: number;
      /**
       * Filter by order ID
       * @example 383
       */
      orderId?: number;
      /**
       * Filter by invoice ID
       * @example 1
       */
      invoiceId?: number;
      /**
       * Filter by transactions created after this date (YYYY-MM-DD)
       * @example "2024-01-01"
       */
      startDate?: string;
      /**
       * Filter by transactions created before this date (YYYY-MM-DD)
       * @example "2024-12-31"
       */
      endDate?: string;
      /**
       * Minimum amount in cents
       * @min 0
       * @example 1000
       */
      minAmount?: number;
      /**
       * Maximum amount in cents
       * @min 0
       * @example 100000
       */
      maxAmount?: number;
      /**
       * Filter by payment method
       * @example "card"
       */
      paymentMethod?: string;
      /**
       * Filter by currency code
       * @example "USD"
       */
      currency?: string;
      /** Sort by field */
      sortBy?: "createdAt" | "amount" | "status" | "type";
      /** Sort order */
      sortOrder?: "ASC" | "DESC";
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassPaymentTransactionExtendsBaseFinancialEntity1BaseOrderRelatedEntity;
  }

  /**
   * @description Retrieve a single payment transaction by its ID
   * @tags transactions
   * @name PaymentTransactionControllerGetTransactionById
   * @summary Get transaction by ID
   * @request GET:/api/v1/transactions/{id}
   * @secure
   */
  export namespace PaymentTransactionControllerGetTransactionById {
    export type RequestParams = {
      /**
       * The ID of the transaction
       * @example 1
       */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassPaymentTransactionExtendsBaseFinancialEntity1BaseOrderRelatedEntity;
  }

  /**
   * @description Get overview statistics for payment transactions including totals, counts by type and status, and revenue metrics
   * @tags transactions
   * @name PaymentTransactionControllerGetTransactionStats
   * @summary Get transaction statistics
   * @request GET:/api/v1/transactions/stats/overview
   * @secure
   */
  export namespace PaymentTransactionControllerGetTransactionStats {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      data?: {
        /** @example 150 */
        total?: number;
        /** @example {"PAYMENT":120,"REFUND":30} */
        byType?: object;
        /** @example {"succeeded":140,"failed":10} */
        byStatus?: object;
        /** @example 25 */
        recentCount?: number;
        /** @example 500000 */
        totalRevenue?: number;
        /** @example 50000 */
        totalRefunds?: number;
      };
      meta?: object;
    };
  }

  /**
   * @description Retrieves current exchange rates from Stripe with CAD as the base currency
   * @tags Currency
   * @name CurrencyControllerGetExchangeRates
   * @summary Get exchange rates from CAD to other currencies
   * @request GET:/api/v1/currency/exchange-rates
   * @secure
   */
  export namespace CurrencyControllerGetExchangeRates {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Base currency code (default: CAD)
       * @example "CAD"
       */
      baseCurrency?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example "CAD" */
      baseCurrency?: string;
      /** @example {"USD":0.73,"EUR":0.68,"GBP":0.58} */
      rates?: object;
      /** @format date-time */
      lastUpdated?: string;
    };
  }

  /**
   * @description Converts an amount from one currency to another using Stripe exchange rates
   * @tags Currency
   * @name CurrencyControllerConvertCurrency
   * @summary Convert currency amount
   * @request GET:/api/v1/currency/convert
   * @secure
   */
  export namespace CurrencyControllerConvertCurrency {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Amount to convert
       * @example 100
       */
      amount: number;
      /**
       * Source currency code
       * @example "CAD"
       */
      from: string;
      /**
       * Target currency code
       * @example "USD"
       */
      to: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 73.5 */
      convertedAmount?: number;
      /** @example "CAD" */
      fromCurrency?: string;
      /** @example "USD" */
      toCurrency?: string;
      /** @example 100 */
      originalAmount?: number;
    };
  }

  /**
   * @description Creates a new invoice for an order with detailed line items
   * @tags invoicing
   * @name InvoiceControllerCreateInvoice
   * @summary Create a new invoice
   * @request POST:/api/v1/invoicing
   * @secure
   */
  export namespace InvoiceControllerCreateInvoice {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateInvoiceDto;
    export type RequestHeaders = {};
    export type ResponseBody = InvoiceOutputDto;
  }

  /**
   * @description Retrieve invoices with optional filtering by status, customer, order, or date range
   * @tags invoicing
   * @name InvoiceControllerGetInvoices
   * @summary Get invoices with filters
   * @request GET:/api/v1/invoicing
   * @secure
   */
  export namespace InvoiceControllerGetInvoices {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Filter by invoice status */
      status?: "draft" | "issued" | "paid" | "void" | "overdue";
      /**
       * Filter by customer ID
       * @example 174
       */
      customerId?: number;
      /**
       * Filter by order ID
       * @example 383
       */
      orderId?: number;
      /**
       * Start date for filtering (YYYY-MM-DD)
       * @example "2024-01-01"
       */
      startDate?: string;
      /**
       * End date for filtering (YYYY-MM-DD)
       * @example "2024-12-31"
       */
      endDate?: string;
      /**
       * Number of invoices to return (1-100)
       * @min 1
       * @max 100
       * @example 10
       */
      limit?: number;
      /**
       * Number of invoices to skip
       * @min 0
       * @example 0
       */
      offset?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = InvoiceOutputDto[];
  }

  /**
   * @description Retrieve invoice statistics including counts by status and recent activity
   * @tags invoicing
   * @name InvoiceControllerGetInvoiceStats
   * @summary Get invoice statistics
   * @request GET:/api/v1/invoicing/stats
   * @secure
   */
  export namespace InvoiceControllerGetInvoiceStats {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      /** @example 150 */
      total?: number;
      /** @example {"draft":5,"issued":20,"paid":120,"void":3,"overdue":2} */
      byStatus?: object;
      /** @example 25 */
      recentCount?: number;
    };
  }

  /**
   * @description Retrieve a specific invoice by its unique identifier
   * @tags invoicing
   * @name InvoiceControllerGetInvoiceById
   * @summary Get invoice by ID
   * @request GET:/api/v1/invoicing/{id}
   * @secure
   */
  export namespace InvoiceControllerGetInvoiceById {
    export type RequestParams = {
      /**
       * Invoice ID
       * @example 1
       */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = InvoiceOutputDto;
  }

  /**
   * @description Retrieve a specific invoice by its invoice number
   * @tags invoicing
   * @name InvoiceControllerGetInvoiceByNumber
   * @summary Get invoice by invoice number
   * @request GET:/api/v1/invoicing/number/{invoiceNumber}
   * @secure
   */
  export namespace InvoiceControllerGetInvoiceByNumber {
    export type RequestParams = {
      /**
       * Invoice number
       * @example "INV-20250115-0001"
       */
      invoiceNumber: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = InvoiceOutputDto;
  }

  /**
   * @description Retrieve all invoices associated with a specific order
   * @tags invoicing
   * @name InvoiceControllerGetInvoicesByOrderId
   * @summary Get invoices for an order
   * @request GET:/api/v1/invoicing/order/{orderId}
   * @secure
   */
  export namespace InvoiceControllerGetInvoicesByOrderId {
    export type RequestParams = {
      /**
       * Order ID
       * @example 383
       */
      orderId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = InvoiceOutputDto[];
  }

  /**
   * @description Retrieve all invoices associated with a specific customer
   * @tags invoicing
   * @name InvoiceControllerGetInvoicesByCustomerId
   * @summary Get invoices for a customer
   * @request GET:/api/v1/invoicing/customer/{customerId}
   * @secure
   */
  export namespace InvoiceControllerGetInvoicesByCustomerId {
    export type RequestParams = {
      /**
       * Customer ID
       * @example 174
       */
      customerId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = InvoiceOutputDto[];
  }

  /**
   * @description Update the status of an existing invoice
   * @tags invoicing
   * @name InvoiceControllerUpdateInvoiceStatus
   * @summary Update invoice status
   * @request PUT:/api/v1/invoicing/{id}/status
   * @secure
   */
  export namespace InvoiceControllerUpdateInvoiceStatus {
    export type RequestParams = {
      /**
       * Invoice ID
       * @example 1
       */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateInvoiceStatusDto;
    export type RequestHeaders = {};
    export type ResponseBody = InvoiceOutputDto;
  }

  /**
   * @description Void an existing invoice with a reason
   * @tags invoicing
   * @name InvoiceControllerVoidInvoice
   * @summary Void an invoice
   * @request PUT:/api/v1/invoicing/{id}/void
   * @secure
   */
  export namespace InvoiceControllerVoidInvoice {
    export type RequestParams = {
      /**
       * Invoice ID
       * @example 1
       */
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = VoidInvoiceDto;
    export type RequestHeaders = {};
    export type ResponseBody = InvoiceOutputDto;
  }

  /**
   * @description Automatically generate an invoice for an existing order
   * @tags invoicing
   * @name InvoiceControllerGenerateInvoiceForOrder
   * @summary Generate invoice for an order
   * @request POST:/api/v1/invoicing/generate/{orderId}
   * @secure
   */
  export namespace InvoiceControllerGenerateInvoiceForOrder {
    export type RequestParams = {
      /**
       * Order ID
       * @example 383
       */
      orderId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = InvoiceOutputDto;
  }

  /**
   * No description
   * @tags task
   * @name TaskControllerCreate
   * @summary Create Task
   * @request POST:/api/v1/task
   * @secure
   */
  export namespace TaskControllerCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TaskInputDto;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassTaskOutputDto;
  }

  /**
   * No description
   * @tags task
   * @name TaskControllerFindAll
   * @summary Get Tasks List
   * @request GET:/api/v1/task
   * @secure
   */
  export namespace TaskControllerFindAll {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Filter by tutor ID
       * @example 1
       */
      tutorId?: number;
      /** Filter by task status */
      status?: "pending" | "in_progress" | "completed" | "cancelled";
      /** Filter by task priority */
      priority?: "low" | "medium" | "high";
      /** Filter by task label */
      label?: "meeting" | "personal" | "preparation" | "grading";
      /**
       * Filter tasks from this date
       * @example "2024-01-15T00:00:00.000Z"
       */
      startDate?: string;
      /**
       * Filter tasks to this date
       * @example "2024-01-31T23:59:59.000Z"
       */
      endDate?: string;
      /**
       * Number of tasks to return
       * @min 1
       * @max 100
       * @example 10
       */
      limit?: number;
      /**
       * Include tasks from Calendar
       * @example true
       */
      googleCalendar?: boolean;
      /**
       * Number of tasks to skip
       * @min 0
       * @example 0
       */
      offset?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassTaskOutputDto;
  }

  /**
   * No description
   * @tags task
   * @name TaskControllerFindByTutor
   * @summary Get Tasks by Tutor
   * @request GET:/api/v1/task/tutor/{tutorId}
   * @secure
   */
  export namespace TaskControllerFindByTutor {
    export type RequestParams = {
      tutorId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassTaskOutputDto;
  }

  /**
   * No description
   * @tags task
   * @name TaskControllerFindOne
   * @summary Get Task by ID
   * @request GET:/api/v1/task/{id}
   * @secure
   */
  export namespace TaskControllerFindOne {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassTaskOutputDto;
  }

  /**
   * No description
   * @tags task
   * @name TaskControllerUpdate
   * @summary Update Task
   * @request PATCH:/api/v1/task/{id}
   * @secure
   */
  export namespace TaskControllerUpdate {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassTaskOutputDto;
  }

  /**
   * No description
   * @tags task
   * @name TaskControllerRemove
   * @summary Delete Task
   * @request DELETE:/api/v1/task/{id}
   * @secure
   */
  export namespace TaskControllerRemove {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * @description Retrieve aggregated dashboard metrics including top customers, revenue, and appointments data with optional toggles for each section.
   * @tags dashboard
   * @name DashboardControllerGetDashboardData
   * @summary Get dashboard data
   * @request GET:/api/v1/dashboard
   * @secure
   */
  export namespace DashboardControllerGetDashboardData {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Time period for dashboard data
       * @example "MONTH"
       */
      period: "DAY" | "WEEK" | "MONTH" | "QUARTER" | "YEAR";
      /**
       * Include top customers data
       * @default true
       * @example true
       */
      includeTopCustomers?: boolean;
      /**
       * Include revenue metrics
       * @default true
       * @example true
       */
      includeRevenue?: boolean;
      /**
       * Include appointments overview
       * @default true
       * @example true
       */
      includeAppointments?: boolean;
      /**
       * Number of top customers to return
       * @min 1
       * @max 100
       * @default 10
       * @example 10
       */
      topCustomersLimit?: number;
      /**
       * Include tax collection metrics
       * @default true
       * @example true
       */
      includeTaxCollection?: boolean;
      /**
       * Include refund metrics
       * @default true
       * @example true
       */
      includeRefunds?: boolean;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassDashboardOutputDto;
  }

  /**
   * @description Processes Stripe payment webhook events
   * @tags webhooks
   * @name WebhookControllerHandleStripeWebhook
   * @summary Handle Stripe webhooks
   * @request POST:/api/v1/webhooks/stripe
   */
  export namespace WebhookControllerHandleStripeWebhook {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {
      "stripe-signature": string;
    };
    export type ResponseBody = {
      /** @example true */
      success?: boolean;
      /** @example "Webhook processed" */
      message?: string;
    };
  }

  /**
   * No description
   * @tags webhooks
   * @name WebhookControllerCatchAllPost
   * @summary Catch-all POST route for debugging
   * @request POST:/api/v1/webhooks
   */
  export namespace WebhookControllerCatchAllPost {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      error?: string;
      message?: string;
      received?: boolean;
      body?: object;
      headers?: string[];
    };
  }

  /**
   * No description
   * @tags webhooks
   * @name WebhookControllerWebhookHealthCheck
   * @summary Webhook health check
   * @request GET:/api/v1/webhooks/health
   */
  export namespace WebhookControllerWebhookHealthCheck {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags webhooks
   * @name WebhookControllerTestStripeWebhook
   * @summary Test Stripe webhook without signature verification
   * @request POST:/api/v1/webhooks/stripe/test
   */
  export namespace WebhookControllerTestStripeWebhook {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * @description Returns all available automations with their current configuration. Includes enabled/disabled status and parameters.
   * @tags automation
   * @name AutomationConfigControllerListAll
   * @summary List all automations with their configurations
   * @request GET:/api/v1/automation
   * @secure
   */
  export namespace AutomationConfigControllerListAll {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassAutomationConfigOutputDto;
  }

  /**
   * @description Retrieve execution history for all automations. Returns last 100 logs. USER role: only logs for their assigned orders. ADMIN role: all logs.
   * @tags automation
   * @name AutomationConfigControllerGetAllLogs
   * @summary Get all automation execution logs
   * @request GET:/api/v1/automation/logs
   * @secure
   */
  export namespace AutomationConfigControllerGetAllLogs {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassAutomationLog;
  }

  /**
   * @description Returns list of available placeholders that can be used in customMessage and customBlockMessage parameters. Use {{placeholder}} format in messages.
   * @tags automation
   * @name AutomationConfigControllerGetSlackPlaceholders
   * @summary Get available placeholders for Slack automations
   * @request GET:/api/v1/automation/placeholders/slack
   * @secure
   */
  export namespace AutomationConfigControllerGetSlackPlaceholders {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassSlackPlaceholdersResponseDto;
  }

  /**
   * @description Returns list of available placeholders that can be used in subject and message parameters. Use {{placeholder}} format in messages.
   * @tags automation
   * @name AutomationConfigControllerGetEmailPlaceholders
   * @summary Get available placeholders for Email automations
   * @request GET:/api/v1/automation/placeholders/email
   * @secure
   */
  export namespace AutomationConfigControllerGetEmailPlaceholders {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassSlackPlaceholdersResponseDto;
  }

  /**
   * @description Returns list of available placeholders that can be used in message parameters. Use {{placeholder}} format in messages.
   * @tags automation
   * @name AutomationConfigControllerGetSmsPlaceholders
   * @summary Get available placeholders for SMS automations
   * @request GET:/api/v1/automation/placeholders/sms
   * @secure
   */
  export namespace AutomationConfigControllerGetSmsPlaceholders {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassSlackPlaceholdersResponseDto;
  }

  /**
   * @description Retrieve configuration for a specific automation by its key
   * @tags automation
   * @name AutomationConfigControllerGetOne
   * @summary Get specific automation configuration
   * @request GET:/api/v1/automation/{key}
   * @secure
   */
  export namespace AutomationConfigControllerGetOne {
    export type RequestParams = {
      /**
       * Automation key (e.g., slack-new-order, order-confirmation-email)
       * @example "slack-new-order"
       */
      key: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassAutomationConfigOutputDto;
  }

  /**
   * @description Enable/disable automation or modify its parameters. Use ToolType and TriggerEvent enums for reference.
   * @tags automation
   * @name AutomationConfigControllerUpdate
   * @summary Update automation configuration
   * @request PATCH:/api/v1/automation/{key}
   * @secure
   */
  export namespace AutomationConfigControllerUpdate {
    export type RequestParams = {
      /**
       * Automation key
       * @example "slack-new-order"
       */
      key: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateAutomationConfigDto;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassAutomationConfigExtendsBaseEntity1BaseEntity;
  }

  /**
   * @description Retrieve execution history for a specific automation. Returns last 100 logs.
   * @tags automation
   * @name AutomationConfigControllerGetLogs
   * @summary Get automation execution logs
   * @request GET:/api/v1/automation/{key}/logs
   * @secure
   */
  export namespace AutomationConfigControllerGetLogs {
    export type RequestParams = {
      /**
       * Automation key
       * @example "slack-new-order"
       */
      key: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassAutomationLog;
  }

  /**
   * No description
   * @tags message-templates
   * @name MessageTemplateControllerGetAll
   * @summary Get all message templates
   * @request GET:/api/v1/message-templates
   * @secure
   */
  export namespace MessageTemplateControllerGetAll {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags message-templates
   * @name MessageTemplateControllerCreate
   * @summary Create a new message template
   * @request POST:/api/v1/message-templates
   * @secure
   */
  export namespace MessageTemplateControllerCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags message-templates
   * @name MessageTemplateControllerGetByKey
   * @summary Get message template by key
   * @request GET:/api/v1/message-templates/{key}
   * @secure
   */
  export namespace MessageTemplateControllerGetByKey {
    export type RequestParams = {
      key: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags message-templates
   * @name MessageTemplateControllerUpdate
   * @summary Update a message template
   * @request PUT:/api/v1/message-templates/{key}
   * @secure
   */
  export namespace MessageTemplateControllerUpdate {
    export type RequestParams = {
      key: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags message-templates
   * @name MessageTemplateControllerDelete
   * @summary Delete a message template
   * @request DELETE:/api/v1/message-templates/{key}
   * @secure
   */
  export namespace MessageTemplateControllerDelete {
    export type RequestParams = {
      key: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags SMS Conversations
   * @name ChatControllerListConversations
   * @summary List all conversations
   * @request GET:/api/v1/chat/conversations
   * @secure
   */
  export namespace ChatControllerListConversations {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Maximum number of conversations to return
       * @example 50
       */
      limit?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassConversationOutputDto;
  }

  /**
   * No description
   * @tags SMS Conversations
   * @name ChatControllerCreateConversation
   * @summary Create a new conversation
   * @request POST:/api/v1/chat/conversations
   * @secure
   */
  export namespace ChatControllerCreateConversation {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateConversationDto;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassConversationOutputDto;
  }

  /**
   * No description
   * @tags SMS Conversations
   * @name ChatControllerGetConversation
   * @summary Get conversation details
   * @request GET:/api/v1/chat/conversations/{sid}
   * @secure
   */
  export namespace ChatControllerGetConversation {
    export type RequestParams = {
      /**
       * Conversation SID
       * @example "CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
       */
      sid: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassConversationOutputDto;
  }

  /**
   * No description
   * @tags SMS Conversations
   * @name ChatControllerDeleteConversation
   * @summary Delete a conversation
   * @request DELETE:/api/v1/chat/conversations/{sid}
   * @secure
   */
  export namespace ChatControllerDeleteConversation {
    export type RequestParams = {
      /**
       * Conversation SID
       * @example "CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
       */
      sid: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassSuccessResponseDto;
  }

  /**
   * No description
   * @tags SMS Conversations
   * @name ChatControllerGetConversationHistory
   * @summary Get conversation message history, optionally filtered by channel
   * @request GET:/api/v1/chat/conversations/{sid}/messages
   * @secure
   */
  export namespace ChatControllerGetConversationHistory {
    export type RequestParams = {
      /**
       * Conversation SID
       * @example "CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
       */
      sid: string;
    };
    export type RequestQuery = {
      /**
       * Maximum number of messages to return
       * @example 50
       */
      limit?: number;
      /** Sort order for messages */
      order?: "asc" | "desc";
      /** Filter messages by channel (SMS, EMAIL, WHATSAPP). If not specified, returns all messages. */
      channel?: "SMS" | "WHATSAPP" | "EMAIL";
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassMessageOutputDto;
  }

  /**
   * No description
   * @tags SMS Conversations
   * @name ChatControllerSendMessage
   * @summary Send a message in a conversation
   * @request POST:/api/v1/chat/conversations/{sid}/messages
   * @secure
   */
  export namespace ChatControllerSendMessage {
    export type RequestParams = {
      /**
       * Conversation SID
       * @example "CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
       */
      sid: string;
    };
    export type RequestQuery = {};
    export type RequestBody = SendMessageDto;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassMessageOutputDto;
  }

  /**
   * No description
   * @tags SMS Conversations
   * @name ChatControllerAddParticipant
   * @summary Add a participant to a conversation
   * @request POST:/api/v1/chat/conversations/{sid}/participants
   * @secure
   */
  export namespace ChatControllerAddParticipant {
    export type RequestParams = {
      /**
       * Conversation SID
       * @example "CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
       */
      sid: string;
    };
    export type RequestQuery = {};
    export type RequestBody = AddParticipantDto;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassParticipantOutputDto;
  }

  /**
   * No description
   * @tags SMS Conversations
   * @name ChatControllerRemoveParticipant
   * @summary Remove a participant from a conversation
   * @request DELETE:/api/v1/chat/conversations/{sid}/participants/{participantSid}
   * @secure
   */
  export namespace ChatControllerRemoveParticipant {
    export type RequestParams = {
      /**
       * Conversation SID
       * @example "CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
       */
      sid: string;
      /**
       * Participant SID
       * @example "MBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
       */
      participantSid: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassSuccessResponseDto;
  }

  /**
   * No description
   * @tags SMS Conversations
   * @name ChatControllerSendEmail
   * @summary Send an email in conversation context
   * @request POST:/api/v1/chat/conversations/{sid}/emails
   * @secure
   */
  export namespace ChatControllerSendEmail {
    export type RequestParams = {
      /**
       * Conversation SID
       * @example "CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
       */
      sid: string;
    };
    export type RequestQuery = {};
    export type RequestBody = SendEmailDto;
    export type RequestHeaders = {};
    export type ResponseBody = SwaggerBaseApiResponseForClassSuccessResponseDto;
  }

  /**
   * No description
   * @tags SMS Webhooks
   * @name TwilioWebhookControllerHandleTwilioWebhook
   * @summary Handle Twilio webhook events
   * @request POST:/api/v1/chat/webhooks/twilio
   */
  export namespace TwilioWebhookControllerHandleTwilioWebhook {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {
      "x-twilio-signature": string;
    };
    export type ResponseBody = void;
  }

  /**
   * @description Use this endpoint to test email receiving without SendGrid Inbound Parse. Requires domain authentication.
   * @tags SMS Webhooks
   * @name TwilioWebhookControllerHandleManualEmailReceive
   * @summary Manually add a received email to a conversation (testing endpoint)
   * @request POST:/api/v1/chat/webhooks/sendgrid/inbound/manual
   */
  export namespace TwilioWebhookControllerHandleManualEmailReceive {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags SMS Webhooks
   * @name TwilioWebhookControllerTestSendGridInboundGet
   * @summary Test if SendGrid inbound webhook endpoint is accessible (GET)
   * @request GET:/api/v1/chat/webhooks/sendgrid/inbound/test
   */
  export namespace TwilioWebhookControllerTestSendGridInboundGet {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags SMS Webhooks
   * @name TwilioWebhookControllerTestSendGridInbound
   * @summary Test if SendGrid inbound webhook endpoint is accessible
   * @request POST:/api/v1/chat/webhooks/sendgrid/inbound/test
   */
  export namespace TwilioWebhookControllerTestSendGridInbound {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * @description Requires SendGrid domain authentication. See: https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-inbound-parse
   * @tags SMS Webhooks
   * @name TwilioWebhookControllerHandleSendGridInbound
   * @summary Handle SendGrid inbound email webhook
   * @request POST:/api/v1/chat/webhooks/sendgrid/inbound
   */
  export namespace TwilioWebhookControllerHandleSendGridInbound {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }
}
