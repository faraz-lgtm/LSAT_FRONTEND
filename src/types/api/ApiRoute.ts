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
  CancelRefundDto,
  CreateInvoiceDto,
  CreateProductInput,
  CreateRefundDto,
  InvoiceOutputDto,
  LoginInput,
  ModifyOrderDto,
  OrderInput,
  ProcessRefundDto,
  RefreshTokenInput,
  Refund,
  RegisterInput,
  Slot,
  SwaggerBaseApiResponseForClassAuthTokenOutput,
  SwaggerBaseApiResponseForClassAutomationConfig,
  SwaggerBaseApiResponseForClassAutomationConfigOutputDto,
  SwaggerBaseApiResponseForClassAutomationLog,
  SwaggerBaseApiResponseForClassBaseUserOutput,
  SwaggerBaseApiResponseForClassDashboardOutputDto,
  SwaggerBaseApiResponseForClassLoginOutput,
  SwaggerBaseApiResponseForClassOrderOutput,
  SwaggerBaseApiResponseForClassPaymentTransactionExtendsBaseFinancialEntity1BaseOrderRelatedEntity,
  SwaggerBaseApiResponseForClassProductOutput,
  SwaggerBaseApiResponseForClassRegisterOutputExtendsBaseUserOutputDto1BaseUserOutput,
  SwaggerBaseApiResponseForClassSlackPlaceholdersResponseDto,
  SwaggerBaseApiResponseForClassStripeCheckoutSession,
  SwaggerBaseApiResponseForClassStripePaymentIntent,
  SwaggerBaseApiResponseForClassTaskOutputDto,
  SwaggerBaseApiResponseForClassUserOutputExtendsBaseUserOutputDto1BaseUserOutput,
  TaskInputDto,
  UpdateAutomationConfigDto,
  UpdateInvoiceStatusDto,
  UpdateProductInput,
  UpdateUserInput,
  UserInput,
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
      role?: "USER" | "ADMIN" | "CUST";
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
   * @description Refunds the original order and creates a new one with different items
   * @tags order
   * @name OrderControllerModifyOrder
   * @summary Modify an existing order
   * @request POST:/api/v1/order/modify
   * @secure
   */
  export namespace OrderControllerModifyOrder {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ModifyOrderDto;
    export type RequestHeaders = {};
    export type ResponseBody = {
      data?: {
        refund?: object;
        newOrder?: object;
        newInvoice?: object;
      };
      meta?: object;
    };
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
   * @description Retrieve a list of all available products. This endpoint is public and does not require authentication.
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
   * @description Retrieve a specific product by its ID. This endpoint is public and does not require authentication.
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
    export type ResponseBody = SwaggerBaseApiResponseForClassAutomationConfig;
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
   * @description Retrieve execution history for all automations. Returns last 100 logs.
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
}
