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
  CreateProductInput,
  LoginInput,
  OrderInput,
  RefreshTokenInput,
  RegisterInput,
  SwaggerBaseApiResponseForClassAuthTokenOutputAccessTokenRefreshToken,
  SwaggerBaseApiResponseForClassBaseUserOutputIdNameUsernameRolesEmailIsAccountDisabledPhoneCreatedAtUpdatedAt,
  SwaggerBaseApiResponseForClassLoginOutputAuthUser,
  SwaggerBaseApiResponseForClassOrderOutputIdCustomerItemsSlotReservationExpiresAtSlotReservationStatus,
  SwaggerBaseApiResponseForClassProductOutputIdNamePriceSaveSessionsDurationDescriptionBadgeCreatedAtUpdatedAt,
  SwaggerBaseApiResponseForClassRegisterOutputExtendsBaseUserOutputDto1BaseUserOutput,
  SwaggerBaseApiResponseForClassSlotBookedSlotsAvailableSlotsSlotDurationMinutesWarning,
  SwaggerBaseApiResponseForClassUserOutputExtendsBaseUserOutputDto1BaseUserOutputWorkHoursOrdersCount,
  UpdateProductInput,
  UpdateUserInput,
  UserInput,
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
      SwaggerBaseApiResponseForClassUserOutputExtendsBaseUserOutputDto1BaseUserOutputWorkHoursOrdersCount;
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
    export type ResponseBody =
      SwaggerBaseApiResponseForClassBaseUserOutputIdNameUsernameRolesEmailIsAccountDisabledPhoneCreatedAtUpdatedAt;
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassUserOutputExtendsBaseUserOutputDto1BaseUserOutputWorkHoursOrdersCount;
  }

  /**
   * No description
   * @tags users
   * @name UserControllerGetUser
   * @summary Get user by id API
   * @request GET:/api/v1/users/{id}
   */
  export namespace UserControllerGetUser {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassUserOutputExtendsBaseUserOutputDto1BaseUserOutputWorkHoursOrdersCount;
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
      SwaggerBaseApiResponseForClassUserOutputExtendsBaseUserOutputDto1BaseUserOutputWorkHoursOrdersCount;
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
    export type ResponseBody =
      SwaggerBaseApiResponseForClassLoginOutputAuthUser;
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
    export type ResponseBody =
      SwaggerBaseApiResponseForClassAuthTokenOutputAccessTokenRefreshToken;
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
      SwaggerBaseApiResponseForClassOrderOutputIdCustomerItemsSlotReservationExpiresAtSlotReservationStatus;
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
    export type ResponseBody =
      SwaggerBaseApiResponseForClassOrderOutputIdCustomerItemsSlotReservationExpiresAtSlotReservationStatus;
  }

  /**
   * No description
   * @tags order
   * @name OrderControllerFindBookings
   * @summary Get Slots
   * @request GET:/api/v1/order/slots
   */
  export namespace OrderControllerFindBookings {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Day of the month (1-31)
       * @min 1
       * @max 31
       * @example 15
       */
      date: number;
      /**
       * Month (1-12)
       * @min 1
       * @max 12
       * @example 1
       */
      month: number;
      /**
       * Year (2020-2030)
       * @min 2025
       * @max 2050
       * @example 2025
       */
      year: number;
      /**
       * Service/package ID
       * @min 1
       * @example 5
       */
      packageId: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SwaggerBaseApiResponseForClassSlotBookedSlotsAvailableSlotsSlotDurationMinutesWarning;
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
    export type ResponseBody =
      SwaggerBaseApiResponseForClassOrderOutputIdCustomerItemsSlotReservationExpiresAtSlotReservationStatus;
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
    export type ResponseBody = void;
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
    export type ResponseBody = void;
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
    export type ResponseBody =
      SwaggerBaseApiResponseForClassProductOutputIdNamePriceSaveSessionsDurationDescriptionBadgeCreatedAtUpdatedAt;
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
    export type ResponseBody =
      SwaggerBaseApiResponseForClassProductOutputIdNamePriceSaveSessionsDurationDescriptionBadgeCreatedAtUpdatedAt;
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
    export type ResponseBody =
      SwaggerBaseApiResponseForClassProductOutputIdNamePriceSaveSessionsDurationDescriptionBadgeCreatedAtUpdatedAt;
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
    export type ResponseBody =
      SwaggerBaseApiResponseForClassProductOutputIdNamePriceSaveSessionsDurationDescriptionBadgeCreatedAtUpdatedAt;
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
}
