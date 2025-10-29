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

export interface GetUsersQueryParams {
  /** Optional, defaults to 100 */
  limit?: number;
  /** Optional, defaults to 0 */
  offset?: number;
  /**
   * Filter users by role
   * @example "USER"
   */
  role?: "USER" | "ADMIN" | "CUST";
}

export interface MetaResponse {
  /**
   * Current page number
   * @example 1
   */
  page?: number;
  /**
   * Number of items per page
   * @example 10
   */
  limit?: number;
  /**
   * Total number of items
   * @example 100
   */
  total?: number;
}

export interface UserOutput {
  id: number;
  name: string;
  username: string;
  /**
   * User roles
   * @example ["USER"]
   */
  roles: ("USER" | "ADMIN" | "CUST")[];
  email: string;
  isAccountDisabled: boolean;
  phone: string;
  createdAt: string;
  updatedAt: string;
  /**
   * Work hours for employees
   * @example {"Monday":["09:00-17:00"],"Tuesday":["09:00-17:00"]}
   */
  workHours?: Record<string, string[]>;
  /**
   * Total count of orders for this user
   * @example 5
   */
  ordersCount: number;
  /**
   * Last assigned order count for round-robin assignment
   * @example 5
   */
  lastAssignedOrderCount: number;
}

export interface SwaggerBaseApiResponseForClassUserOutputExtendsBaseUserOutputDto1BaseUserOutput {
  meta: MetaResponse;
  data: UserOutput;
}

export interface BaseApiErrorObject {
  statusCode: number;
  message: string;
  localizedMessage?: string;
  errorName: string;
  details: object;
  path: string;
  requestId: string;
  timestamp: string;
}

export interface BaseApiErrorResponse {
  error: BaseApiErrorObject;
}

export interface UserInput {
  /**
   * First name
   * @example "John"
   */
  firstName: string;
  /**
   * Last name
   * @example "Doe"
   */
  lastName: string;
  /**
   * Email
   * @example "john.doe@example.com"
   */
  email: string;
  /**
   * Phone number
   * @example "+1234567890"
   */
  phone: string;
}

export interface BaseUserOutput {
  id: number;
  name: string;
  username: string;
  /**
   * User roles
   * @example ["USER"]
   */
  roles: ("USER" | "ADMIN" | "CUST")[];
  email: string;
  isAccountDisabled: boolean;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface SwaggerBaseApiResponseForClassBaseUserOutput {
  meta: MetaResponse;
  data: BaseUserOutput;
}

export interface SwaggerBaseApiResponseForClassUserOutputExtendsBaseUserOutputDto1BaseUserOutput {
  meta: MetaResponse;
  data: UserOutput[];
}

export interface UpdateUserInput {
  /**
   * User full name
   * @maxLength 100
   * @example "John Doe"
   */
  name: string;
  /**
   * Username (alphanumeric)
   * @maxLength 100
   * @example "john_doe"
   */
  username: string;
  /**
   * Phone number
   * @maxLength 100
   * @example "+1234567890"
   */
  phone: string;
  /**
   * User email address
   * @maxLength 100
   * @example "john.doe@example.com"
   */
  email: string;
  /**
   * User roles
   * @example ["USER"]
   */
  roles: ("USER" | "ADMIN" | "CUST")[];
  /**
   * Account disabled status
   * @example false
   */
  isAccountDisabled?: boolean;
  /**
   * Employee working hours in UTC format (HH:MM-HH:MM)
   * @example {"Monday":["09:00-17:00"],"Tuesday":["09:00-17:00"]}
   */
  workHours?: Record<string, string[]>;
  /**
   * Last assigned order count for round-robin assignment
   * @example 5
   */
  lastAssignedOrderCount?: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokenOutput {
  /**
   * JWT access token
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  accessToken: string;
  /**
   * JWT refresh token
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  refreshToken: string;
}

export interface UserAccessTokenClaims {
  /**
   * User ID
   * @example 1
   */
  id: number;
  /**
   * Username
   * @example "john_doe"
   */
  username: string;
  /**
   * User roles
   * @example ["USER"]
   */
  roles: ("USER" | "ADMIN" | "CUST")[];
}

export interface LoginOutput {
  auth: AuthTokenOutput;
  user: UserAccessTokenClaims;
}

export interface SwaggerBaseApiResponseForClassLoginOutput {
  meta: MetaResponse;
  data: LoginOutput;
}

export interface RegisterInput {
  name: string;
  phone: string;
  username: string;
  password?: string;
  email: string;
  /**
   * User roles
   * @example ["USER"]
   */
  roles: ("USER" | "ADMIN" | "CUST")[];
  /**
   * Employee working hours in UTC format (HH:MM-HH:MM)
   * @example {"Monday":["09:00-17:00"],"Tuesday":["09:00-17:00"]}
   */
  workHours?: Record<string, string[]>;
}

export interface RegisterOutput {
  id: number;
  name: string;
  username: string;
  /**
   * User roles
   * @example ["USER"]
   */
  roles: ("USER" | "ADMIN" | "CUST")[];
  email: string;
  isAccountDisabled: boolean;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface SwaggerBaseApiResponseForClassRegisterOutputExtendsBaseUserOutputDto1BaseUserOutput {
  meta: MetaResponse;
  data: RegisterOutput;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface SwaggerBaseApiResponseForClassAuthTokenOutput {
  meta: MetaResponse;
  data: AuthTokenOutput;
}

export interface GetOrdersQueryParams {
  /** Optional, defaults to 100 */
  limit?: number;
  /** Optional, defaults to 0 */
  offset?: number;
  /**
   * Filter orders by payment status
   * @example "succeeded"
   */
  orderStatus?: "pending" | "succeeded" | "failed" | "canceled";
}

export interface ItemInput {
  /**
   * Item ID
   * @example 1
   */
  id: number;
  /**
   * Item price
   * @example 100
   */
  price: number;
  /**
   * Item name
   * @example "60-Minute Prep Session"
   */
  name: string;
  /**
   * Session duration in minutes
   * @example 60
   */
  Duration: number;
  /**
   * Item description
   * @example "Comprehensive prep session"
   */
  Description: string;
  /**
   * Scheduled date and time slots
   * @example ["2025-10-15T12:00:00Z","2025-10-15T13:00:00Z"]
   */
  DateTime: string[];
  /**
   * Quantity of items
   * @example 1
   */
  quantity: number;
  /**
   * Number of sessions included
   * @example 1
   */
  sessions: number;
  /**
   * ID of assigned employee
   * @example 5
   */
  assignedEmployeeIds?: string[];
}

export interface OrderInput {
  items: ItemInput[];
  user: UserInput;
  /** @example "CAD" */
  currency: string;
}

export interface StripeCheckoutSession {
  /**
   * Stripe checkout session URL for payment processing
   * @example "https://checkout.stripe.com/pay/cs_test_123456789"
   */
  url: string;
  /**
   * Stripe checkout session ID
   * @example "cs_test_123456789"
   */
  sessionId: string;
}

export interface SwaggerBaseApiResponseForClassStripeCheckoutSession {
  meta: MetaResponse;
  data: StripeCheckoutSession;
}

export interface Badge {
  /**
   * Badge text
   * @example "Popular"
   */
  text: string;
  /**
   * Badge color
   * @example "#FF6B6B"
   */
  color: string;
}

export interface ItemOutput {
  /**
   * Item ID
   * @example 1
   */
  id: number;
  /**
   * Item price
   * @example 100
   */
  price: number;
  /**
   * Item name
   * @example "60-Minute Prep Session"
   */
  name: string;
  /**
   * Session duration in minutes
   * @example 60
   */
  Duration: number;
  /** Optional badge information */
  badge?: Badge;
  /** Optional save discount number */
  save?: number;
  /**
   * Number of sessions included
   * @example 1
   */
  sessions: number;
  /**
   * Item description
   * @example "Comprehensive prep session"
   */
  Description: string;
  /**
   * Scheduled date and time
   * @example ["2025-10-15T12:00:00Z"]
   */
  DateTime: string[];
  /**
   * Quantity
   * @example 1
   */
  quantity: number;
  /**
   * Assigned employee IDs
   * @example [5,6]
   */
  assignedEmployeeIds: string[];
}

export interface OrderOutput {
  /**
   * Order ID
   * @example 1
   */
  id: number;
  /** Customer information */
  customer: UserOutput;
  /** Order items */
  items: ItemOutput[];
  /**
   * Slot reservation expiration timestamp
   * @format date-time
   * @example "2024-01-15T14:30:00.000Z"
   */
  slot_reservation_expires_at?: string | null;
  /**
   * Slot reservation status indicating the current state of the reservation
   * @example "RESERVED"
   */
  slot_reservation_status?:
    | "RESERVED"
    | "CONFIRMED"
    | "EXPIRED"
    | "FAILED"
    | "CANCELED"
    | null;
  /**
   * Google Meet link shared across all calendar events in this order
   * @example "https://meet.google.com/abc-defg-hij"
   */
  googleMeetLink?: string | null;
  /**
   * Stripe checkout session URL
   * @example "https://checkout.stripe.com/pay/cs_test_123456789"
   */
  checkoutSessionUrl?: string | null;
}

export interface SwaggerBaseApiResponseForClassOrderOutput {
  meta: MetaResponse;
  data: OrderOutput[];
}

export interface SwaggerBaseApiResponseForClassOrderOutput {
  meta: MetaResponse;
  data: OrderOutput;
}

export interface StripePaymentIntent {
  /**
   * Stripe payment intent client secret for frontend confirmation
   * @example "pi_123456789_secret_abcdef"
   */
  clientSecret: string;
  /**
   * Stripe payment intent ID
   * @example "pi_123456789"
   */
  paymentIntentId: string;
}

export interface SwaggerBaseApiResponseForClassStripePaymentIntent {
  meta: MetaResponse;
  data: StripePaymentIntent;
}

export interface OrderItemDto {
  /**
   * Name of the order item
   * @example "10x Package"
   */
  name: string;
  /**
   * Quantity of the item
   * @example 1
   */
  quantity: number;
  /**
   * Price of the item in cents
   * @example 15000
   */
  price: number;
}

export interface ModifyOrderDto {
  /**
   * ID of the original order to modify
   * @example 383
   */
  originalOrderId: number;
  /**
   * New order items
   * @example [{"name":"10x Package","quantity":1,"price":15000}]
   */
  newOrderItems: OrderItemDto[];
  /**
   * Reason for the order modification
   * @example "customer_request"
   */
  refundReason: "customer_request" | "duplicate" | "fraudulent" | "other";
  /**
   * Additional details about the modification reason
   * @example "Customer wanted 10x package instead of 60-minute package"
   */
  reasonDetails: string;
  /**
   * Additional notes for the new order
   * @example "Modified order - upgraded package"
   */
  notes?: string;
}

export interface SlotsQueryDto {
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
}

export interface AvailableEmployee {
  /**
   * Employee ID
   * @example 1
   */
  id: number;
  /**
   * Employee name
   * @example "John Doe"
   */
  name: string;
  /**
   * Employee email
   * @example "john@example.com"
   */
  email: string;
}

export interface AvailableSlot {
  /**
   * Time slot
   * @example "09:00"
   */
  slot: string;
  /** Available employees for this slot */
  availableEmployees: AvailableEmployee[];
}

export interface Slot {
  /**
   * List of booked time slots
   * @example ["09:00","10:00"]
   */
  bookedSlots: string[];
  /** Available slots with employee details */
  availableSlots: AvailableSlot[];
  /**
   * Duration of each slot in minutes
   * @example 60
   */
  slotDurationMinutes: number;
  /**
   * Optional warning message
   * @example "Limited availability"
   */
  warning?: string;
}

export interface ProductOutput {
  /**
   * Product ID
   * @example 5
   */
  id: number;
  /**
   * Product name
   * @example "60-Minute Single Prep"
   */
  name: string;
  /**
   * Product price in dollars
   * @example 125
   */
  price: number;
  /**
   * Savings amount in dollars (optional)
   * @default 0
   * @example 75
   */
  save?: number;
  /**
   * Number of sessions included
   * @example 1
   */
  sessions: number;
  /**
   * Session duration in minutes
   * @example 60
   */
  Duration: number;
  /**
   * Product description
   * @example "Need flexibility? Book individual LSAT tutoring sessions as you go"
   */
  Description: string;
  /**
   * Optional badge information
   * @example {"text":"Most Popular","color":"bg-blue-600"}
   */
  badge?: Badge;
  /**
   * Product creation timestamp
   * @example "2025-01-15T10:30:00Z"
   */
  createdAt: string;
  /**
   * Product last update timestamp
   * @example "2025-01-15T10:30:00Z"
   */
  updatedAt: string;
}

export interface SwaggerBaseApiResponseForClassProductOutput {
  meta: MetaResponse;
  data: ProductOutput[];
}

export interface SwaggerBaseApiResponseForClassProductOutput {
  meta: MetaResponse;
  data: ProductOutput;
}

export interface CreateProductInput {
  /**
   * Product name
   * @example "60-Minute Single Prep"
   */
  name: string;
  /**
   * Product price in dollars
   * @min 0
   * @example 125
   */
  price: number;
  /**
   * Savings amount in dollars (optional)
   * @min 0
   * @default 0
   * @example 75
   */
  save?: number;
  /**
   * Session duration in minutes
   * @example 60
   */
  Duration: number;
  /**
   * Number of sessions included
   * @min 1
   * @example 1
   */
  sessions: number;
  /**
   * Product description
   * @example "Need flexibility? Book individual LSAT tutoring sessions as you go"
   */
  Description: string;
  /**
   * Optional badge information
   * @example {"text":"Most Popular","color":"bg-blue-600"}
   */
  badge?: {
    /** @example "Most Popular" */
    text?: string;
    /** @example "bg-blue-600" */
    color?: string;
  };
}

export interface UpdateProductInput {
  /**
   * Product name
   * @example "60-Minute Single Prep"
   */
  name?: string;
  /**
   * Product price in dollars
   * @min 0
   * @example 125
   */
  price?: number;
  /**
   * Savings amount in dollars (optional)
   * @min 0
   * @default 0
   * @example 75
   */
  save?: number;
  /**
   * Session duration in minutes
   * @example 60
   */
  Duration?: number;
  /**
   * Number of sessions included
   * @min 1
   * @example 1
   */
  sessions?: number;
  /**
   * Product description
   * @example "Need flexibility? Book individual LSAT tutoring sessions as you go"
   */
  Description?: string;
  /**
   * Optional badge information
   * @example {"text":"Most Popular","color":"bg-blue-600"}
   */
  badge?: {
    /** @example "Most Popular" */
    text?: string;
    /** @example "bg-blue-600" */
    color?: string;
  };
}

export interface CreateRefundDto {
  /**
   * ID of the original order being refunded
   * @example 383
   */
  originalOrderId: number;
  /**
   * ID of the customer requesting the refund
   * @example 174
   */
  customerId: number;
  /**
   * Refund amount in cents
   * @min 1
   * @example 10000
   */
  amount: number;
  /**
   * Currency code
   * @default "USD"
   * @example "USD"
   */
  currency?: string;
  /**
   * Reason for the refund
   * @example "customer_request"
   */
  reason: "customer_request" | "duplicate" | "fraudulent" | "other";
  /**
   * Additional details about the refund reason
   * @example "Customer requested refund due to scheduling conflict"
   */
  reasonDetails: string;
  /**
   * ID of the new order (if applicable)
   * @example 384
   */
  newOrderId?: number;
  /**
   * ID of the associated invoice (auto-found if not provided)
   * @example 1
   */
  invoiceId?: number;
}

export interface Refund {
  /**
   * Unique identifier
   * @example 1
   */
  id: number;
  /**
   * Unique refund number
   * @example "REF-20250115-0001"
   */
  refundNumber: string;
  /**
   * ID of the original order being refunded
   * @example 383
   */
  originalOrderId: number;
  /**
   * ID of the new order (if applicable)
   * @example 384
   */
  newOrderId?: number;
  /**
   * ID of the associated invoice
   * @example 1
   */
  invoiceId: number;
  /**
   * ID of the customer
   * @example 174
   */
  customerId: number;
  /**
   * Amount in cents
   * @example 10000
   */
  amount: number;
  /**
   * Currency code
   * @example "CAD"
   */
  currency: string;
  /**
   * Additional metadata including currency conversion details
   * @example {"refundAmountInCad":10000,"refundAmountInPaymentCurrency":62500,"originalPaymentCurrency":"INR"}
   */
  metadata?: object;
  /**
   * Reason for the refund
   * @example "customer_request"
   */
  reason: "customer_request" | "duplicate" | "fraudulent" | "other";
  /**
   * Additional details about the refund reason
   * @example "Customer requested refund due to scheduling conflict"
   */
  reasonDetails: string;
  /**
   * Stripe refund ID (if processed through Stripe)
   * @example "re_1234567890"
   */
  stripeRefundId?: string;
  /**
   * Current status of the refund
   * @example "pending"
   */
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  /**
   * Date when the refund was processed
   * @format date-time
   * @example "2024-01-20T10:30:00Z"
   */
  refundedAt?: string;
  /**
   * ID of the user who initiated this operation
   * @example 123
   */
  initiatedBy?: number;
  /**
   * ID of the user who last processed this operation
   * @example 124
   */
  processedBy?: number;
  /**
   * Date when the record was created
   * @format date-time
   * @example "2024-01-15T10:30:00Z"
   */
  createdAt: string;
  /**
   * Date when the record was last updated
   * @format date-time
   * @example "2024-01-15T10:30:00Z"
   */
  updatedAt: string;
}

export interface ProcessRefundDto {
  /**
   * Stripe refund ID (if processed through Stripe)
   * @example "re_1234567890"
   */
  stripeRefundId?: string;
}

export interface CancelRefundDto {
  /**
   * Reason for cancelling the refund
   * @example "Customer changed mind"
   */
  reason: string;
}

export interface TransactionQueryDto {
  /** Optional, defaults to 100 */
  limit?: number;
  /** Optional, defaults to 0 */
  offset?: number;
  /**
   * Filter by transaction type
   * @example "payment"
   */
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
  /**
   * Sort by field
   * @example "createdAt"
   */
  sortBy?: "createdAt" | "amount" | "status" | "type";
  /**
   * Sort order
   * @example "DESC"
   */
  sortOrder?: "ASC" | "DESC";
}

export interface PaymentTransaction {
  /**
   * Unique identifier
   * @example 1
   */
  id: number;
  /**
   * Amount in cents
   * @example 10000
   */
  amount: number;
  /**
   * Currency code
   * @example "USD"
   */
  currency: string;
  /**
   * Date when the record was created
   * @format date-time
   * @example "2024-01-15T10:30:00Z"
   */
  createdAt: string;
  /**
   * Date when the record was last updated
   * @format date-time
   * @example "2024-01-15T10:30:00Z"
   */
  updatedAt: string;
  /**
   * ID of the associated order
   * @example 383
   */
  orderId: number;
  /**
   * ID of the customer
   * @example 174
   */
  customerId: number;
  /**
   * ID of the user who initiated this operation
   * @example 123
   */
  initiatedBy?: number;
  /**
   * ID of the user who last processed this operation
   * @example 124
   */
  processedBy?: number;
  /**
   * Unique transaction number
   * @example "TRN-20250115-0001"
   */
  transactionNumber: string;
  /**
   * ID of the associated invoice
   * @example 1
   */
  invoiceId?: number;
  /**
   * Type of transaction
   * @example "payment"
   */
  type: "payment" | "refund" | "chargeback" | "adjustment";
  /**
   * Payment method used
   * @example "card"
   */
  paymentMethod: string;
  /**
   * Stripe payment intent ID
   * @example "pi_1234567890"
   */
  stripePaymentIntentId?: string;
  /**
   * Stripe charge ID
   * @example "ch_1234567890"
   */
  stripeChargeId?: string;
  /**
   * Transaction status
   * @example "succeeded"
   */
  status: string;
  /**
   * Additional metadata. NOTE: amount field is subtotal (no tax). Tax is in metadata.taxAmount
   * @example {"taxAmount":1441,"totalAmountIncludingTax":13941,"invoiceSubtotal":12500,"paidCurrency":"INR","convertedToCad":true}
   */
  metadata?: object;
}

export interface SwaggerBaseApiResponseForClassPaymentTransactionExtendsBaseFinancialEntity1BaseOrderRelatedEntity {
  meta: MetaResponse;
  data: PaymentTransaction[];
}

export interface SwaggerBaseApiResponseForClassPaymentTransactionExtendsBaseFinancialEntity1BaseOrderRelatedEntity {
  meta: MetaResponse;
  data: PaymentTransaction;
}

export interface InvoiceItemDto {
  /**
   * Description of the invoice item
   * @example "LSAT Prep Course - 10 Sessions"
   */
  description: string;
  /**
   * Quantity of the item
   * @min 1
   * @example 1
   */
  quantity: number;
  /**
   * Unit price in cents
   * @min 0
   * @example 10000
   */
  unitPrice: number;
  /**
   * Total price for this item in cents (quantity × unitPrice)
   * @min 0
   * @example 10000
   */
  totalPrice: number;
}

export interface CreateInvoiceDto {
  /**
   * ID of the associated order
   * @example 383
   */
  orderId: number;
  /**
   * ID of the customer
   * @example 174
   */
  customerId: number;
  /**
   * Invoice items
   * @example [{"description":"LSAT Prep Course - 10 Sessions","quantity":1,"unitPrice":10000,"totalPrice":10000}]
   */
  items: InvoiceItemDto[];
  /**
   * Subtotal amount in cents (sum of all item totalPrice)
   * @min 0
   * @example 10000
   */
  subtotal: number;
  /**
   * Tax amount in cents
   * @min 0
   * @example 1000
   */
  tax?: number;
  /**
   * Discount amount in cents
   * @min 0
   * @example 500
   */
  discount?: number;
  /**
   * Total amount in cents (subtotal + tax - discount)
   * @min 0
   * @example 10500
   */
  total: number;
  /**
   * Currency code (ISO 4217)
   * @default "USD"
   * @example "USD"
   */
  currency?: string;
  /**
   * Additional notes for the invoice
   * @example "Thank you for your business!"
   */
  notes?: string;
  /**
   * Due date for the invoice (ISO 8601 date string)
   * @example "2024-02-15"
   */
  dueDate?: string;
}

export interface InvoiceItemOutputDto {
  /** @example 1 */
  id: number;
  /** @example "Tutoring Session" */
  name: string;
  /** @example 10000 */
  price: number;
  /** @example 1 */
  quantity: number;
  /** @example 10000 */
  total: number;
}

export interface InvoiceOutputDto {
  /** @example 1 */
  id: number;
  /** @example "INV-20250115-0001" */
  invoiceNumber: string;
  /** @example 1 */
  orderId: number;
  /** @example 1 */
  customerId: number;
  /** @example "paid" */
  status: "draft" | "issued" | "paid" | "void" | "overdue";
  /**
   * @format date-time
   * @example "2025-01-15"
   */
  issueDate: string;
  /**
   * @format date-time
   * @example "2025-01-22"
   */
  dueDate: string;
  /** @example "2025-01-15" */
  paidDate?: object;
  items: InvoiceItemOutputDto[];
  /** @example 10000 */
  subtotal: number;
  /** @example 0 */
  tax: number;
  /** @example 0 */
  discount: number;
  /** @example 10000 */
  total: number;
  /** @example "USD" */
  currency: string;
  /** @example "Thank you for your business!" */
  notes?: object;
  /** @example "2025-01-15T14:30:00.000Z" */
  voidedAt?: object;
  /** @example "Customer requested refund" */
  voidReason?: object;
  /**
   * @format date-time
   * @example "2025-01-15T14:30:00.000Z"
   */
  createdAt: string;
  /**
   * @format date-time
   * @example "2025-01-15T14:30:00.000Z"
   */
  updatedAt: string;
}

export interface InvoiceQueryDto {
  /**
   * Filter by invoice status
   * @example "paid"
   */
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
   * Number of invoices to return
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
}

export interface UpdateInvoiceStatusDto {
  /**
   * New status for the invoice
   * @example "issued"
   */
  status: "draft" | "issued" | "paid" | "void" | "overdue";
}

export interface VoidInvoiceDto {
  /**
   * Reason for voiding the invoice
   * @example "Customer requested cancellation"
   */
  reason: string;
}

export interface TaskInputDto {
  /**
   * Task title
   * @maxLength 200
   * @example "Prepare lesson materials"
   */
  title: string;
  /**
   * Task description
   * @example "Review chapter 5 and prepare exercises"
   */
  description?: string;
  /**
   * Task start date and time
   * @example "2024-01-15T14:00:00.000Z"
   */
  startDateTime: string;
  /**
   * Task end date and time
   * @example "2024-01-15T15:00:00.000Z"
   */
  endDateTime: string;
  /**
   * Tutor ID who created this task
   * @example 1
   */
  tutorId: number;
  /**
   * Task label
   * @example "meeting"
   */
  label: "meeting" | "personal" | "preparation" | "grading";
  /**
   * Task priority
   * @example "medium"
   */
  priority?: "low" | "medium" | "high";
  /**
   * Task status
   * @example "pending"
   */
  status?: "pending" | "in_progress" | "completed" | "cancelled";
}

export interface TaskOutputDto {
  /**
   * Task ID
   * @example 1
   */
  id: number;
  /**
   * Task title
   * @example "Prepare lesson materials"
   */
  title: string;
  /**
   * Task description
   * @example "Review chapter 5 and prepare exercises"
   */
  description?: string;
  /**
   * Task start date and time
   * @format date-time
   * @example "2024-01-15T14:00:00.000Z"
   */
  startDateTime: string;
  /**
   * Task end date and time
   * @format date-time
   * @example "2024-01-15T15:00:00.000Z"
   */
  endDateTime: string;
  /**
   * Tutor ID who created this task
   * @example 1
   */
  tutorId: number;
  /**
   * Google Calendar event ID
   * @example "abc123def456"
   */
  googleCalendarEventId?: string;
  /**
   * Meeting link (Zoom, Google Meet, etc.)
   * @example "https://meet.google.com/abc-defg-hij"
   */
  meetingLink?: string;
  /** List of invitees/attendees */
  invitees?: {
    /** @example "john@example.com" */
    email?: string;
    /** @example "John Doe" */
    name?: string;
    /** @example "accepted" */
    responseStatus?: string;
    /** @example 5 */
    id?: number;
  }[];
  /**
   * Task label
   * @example "meeting"
   */
  label: "meeting" | "personal" | "preparation" | "grading";
  /**
   * Task priority
   * @example "medium"
   */
  priority: "low" | "medium" | "high";
  /**
   * Task status
   * @example "pending"
   */
  status: "pending" | "in_progress" | "completed" | "cancelled";
  /**
   * Task creation timestamp
   * @format date-time
   * @example "2024-01-15T10:00:00.000Z"
   */
  createdAt: string;
  /**
   * Task last update timestamp
   * @format date-time
   * @example "2024-01-15T12:00:00.000Z"
   */
  updatedAt: string;
}

export interface TaskQueryDto {
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
}

export interface SwaggerBaseApiResponseForClassTaskOutputDto {
  meta: MetaResponse;
  data: TaskOutputDto;
}

export interface SwaggerBaseApiResponseForClassTaskOutputDto {
  meta: MetaResponse;
  data: TaskOutputDto[];
}

export interface TopCustomerDto {
  /**
   * Customer ID
   * @example 1
   */
  customerId: number;
  /**
   * Customer name
   * @example "John Doe"
   */
  customerName: string;
  /**
   * Customer email
   * @example "john@example.com"
   */
  email: string;
  /**
   * Total revenue from this customer
   * @example 1500
   */
  totalRevenue: number;
  /**
   * Number of orders from this customer
   * @example 5
   */
  orderCount: number;
}

export interface RevenuePeriodDto {
  /**
   * Date for this revenue period
   * @example "2024-01-15"
   */
  date: string;
  /**
   * Revenue for this period
   * @example 500
   */
  revenue: number;
}

export interface RevenueDto {
  /**
   * Total revenue for the period
   * @example 5000
   */
  totalRevenue: number;
  /** Revenue breakdown by period */
  periodRevenue: RevenuePeriodDto[];
}

export interface AppointmentPeriodDto {
  /**
   * Date for this appointment period
   * @example "2024-01-15"
   */
  date: string;
  /**
   * Number of appointments for this period
   * @example 3
   */
  count: number;
}

export interface AppointmentsDto {
  /**
   * Total appointments for the period
   * @example 25
   */
  totalAppointments: number;
  /**
   * Number of upcoming appointments
   * @example 8
   */
  upcomingAppointments: number;
  /**
   * Number of completed appointments
   * @example 17
   */
  completedAppointments: number;
  /** Appointments breakdown by period */
  periodAppointments: AppointmentPeriodDto[];
}

export interface TaxPeriodDto {
  /**
   * Date for this tax period
   * @example "2024-01-15"
   */
  date: string;
  /**
   * Tax collected in current CAD value
   * @example 1200.25
   */
  taxCollected: number;
  /**
   * Tax collected in historical CAD value
   * @example 1180
   */
  taxCollectedHistorical: number;
}

export interface TaxCollectionDto {
  /**
   * Total tax collected in current CAD
   * @example 2500.45
   */
  totalTaxCollected: number;
  /**
   * Total tax collected in historical CAD
   * @example 2450
   */
  totalTaxHistorical: number;
  /** Tax collection breakdown by period */
  periodTaxCollection: TaxPeriodDto[];
}

export interface RefundPeriodDto {
  /**
   * Date for this refund period
   * @example "2024-01-15"
   */
  date: string;
  /**
   * Total refunds in CAD
   * @example 125
   */
  refundAmount: number;
  /**
   * Number of refunds processed
   * @example 2
   */
  refundCount: number;
}

export interface RefundDto {
  /**
   * Total refunds for the period
   * @example 500
   */
  totalRefunds: number;
  /**
   * Number of refunds processed
   * @example 3
   */
  totalRefundCount: number;
  /** Refunds breakdown by period */
  periodRefunds: RefundPeriodDto[];
}

export interface DashboardDataDto {
  /** Top customers data */
  topCustomers?: TopCustomerDto[];
  /** Revenue metrics */
  revenue?: RevenueDto;
  /** Appointments overview */
  appointments?: AppointmentsDto;
  /** Tax collection metrics */
  taxCollection?: TaxCollectionDto;
  /** Refund metrics */
  refunds?: RefundDto;
}

export interface DashboardMetaDto {
  /**
   * Time period used
   * @example "MONTH"
   */
  period: "DAY" | "WEEK" | "MONTH" | "QUARTER" | "YEAR";
  /**
   * Start date of the period
   * @example "2024-01-01T00:00:00.000Z"
   */
  startDate: string;
  /**
   * End date of the period
   * @example "2024-01-31T23:59:59.999Z"
   */
  endDate: string;
}

export interface DashboardOutputDto {
  /** Dashboard data */
  data: DashboardDataDto;
  /** Dashboard metadata */
  meta: DashboardMetaDto;
}

export interface SwaggerBaseApiResponseForClassDashboardOutputDto {
  meta: MetaResponse;
  data: DashboardOutputDto;
}

export interface SlackPlaceholderOutputDto {
  /**
   * Placeholder name without double braces
   * @example "orderId"
   */
  placeholder: string;
  /**
   * Human-readable description of what this placeholder represents
   * @example "Order ID"
   */
  description: string;
  /**
   * Example value for this placeholder
   * @example "123"
   */
  example: string;
}

export interface SlackPlaceholdersResponseDto {
  /** Array of available placeholders for Slack automation messages */
  placeholders: SlackPlaceholderOutputDto[];
  /**
   * Usage example showing how to use placeholders in messages
   * @example "Use {{orderId}} in your message template like: "New order #{{orderId}} from {{customerName}}""
   */
  example?: string;
}

export interface SlackAutomationParameters {
  /**
   * Delay in minutes before executing (0 for immediate)
   * @example 0
   */
  delayMinutes?: number;
  /**
   * Slack channel to send notification to
   * @example "#orders"
   */
  channel?: string;
  /**
   * Custom message text with placeholders. Available: {{orderId}}, {{customerName}}, {{customerEmail}}, {{total}}, {{currency}}, {{itemCount}}
   * @example "🎉 New order #{{orderId}} from {{customerName}} - ${{total}}"
   */
  customMessage?: string;
  /**
   * Custom block title with placeholders. Available: {{orderId}}, {{customerName}}, {{customerEmail}}, {{total}}, {{currency}}, {{itemCount}}
   * @example "New Order #{{orderId}}"
   */
  customBlockMessage?: string;
}

export interface EmailAutomationParameters {
  /**
   * Delay in minutes before executing (0 for immediate)
   * @example 0
   */
  delayMinutes?: number;
  /**
   * Additional CC recipients (email addresses)
   * @example ["manager@example.com"]
   */
  ccRecipients?: string[];
  /**
   * Email subject line with placeholders. Available: {{orderNumber}}, {{customerName}}, {{customerEmail}}, {{total}}, {{currency}} (always CAD), {{itemCount}}, {{orderDate}}
   * @example "Order #{{orderNumber}} Confirmed - Better LSAT MCAT"
   */
  subject?: string;
  /**
   * Email message body (fallback plain text) with placeholders. Available: {{orderNumber}}, {{customerName}}, {{customerEmail}}, {{total}}, {{currency}} (always CAD), {{itemCount}}, {{orderDate}}
   * @example "Your order #{{orderNumber}} has been confirmed. Total: ${{total}}"
   */
  message?: string;
  /**
   * Template name to use for HTML rendering
   * @example "order-confirmation"
   */
  template?: string;
}

export interface AutomationConfigOutputDto {
  /**
   * Unique identifier for the automation
   * @example "slack-new-order"
   */
  key: string;
  /**
   * Display name of the automation
   * @example "Slack New Order Notification"
   */
  name: string;
  /**
   * Detailed description of what the automation does
   * @example "Sends Slack notification when new order is created"
   */
  description: string;
  /**
   * Event that triggers this automation
   * @example "order.created"
   */
  triggerEvent:
    | "order.created"
    | "order.paid"
    | "order.canceled"
    | "order.modified"
    | "user.registered"
    | "payment.refunded"
    | "task.created"
    | "task.completed";
  /**
   * Communication tool used for this automation
   * @example "email"
   */
  toolType: "email" | "sms" | "slack" | "whatsapp";
  /**
   * Whether the automation is enabled
   * @example true
   */
  isEnabled: boolean;
  /**
   * Configuration parameters for the automation
   * @example {"delayMinutes":0,"channel":"#orders"}
   */
  parameters?: object;
}

export interface SwaggerBaseApiResponseForClassAutomationConfigOutputDto {
  meta: MetaResponse;
  data: AutomationConfigOutputDto[];
}

export interface SwaggerBaseApiResponseForClassAutomationConfigOutputDto {
  meta: MetaResponse;
  data: AutomationConfigOutputDto;
}

export interface UpdateAutomationConfigDto {
  /**
   * Enable or disable the automation
   * @example true
   */
  isEnabled?: boolean;
  /**
   * Configuration parameters for the automation. For Slack automations, available placeholders: {{orderId}}, {{customerName}}, {{customerEmail}}, {{total}}, {{currency}}, {{itemCount}}. For Email automations, available placeholders: {{orderNumber}}, {{customerName}}, {{customerEmail}}, {{total}}, {{currency}}, {{itemCount}}, {{orderDate}}
   * @example {"delayMinutes":0,"channel":"#orders","customMessage":"🎉 New order #{{orderId}} from {{customerName}} - ${{total}}","customBlockMessage":"New Order #{{orderId}}"}
   */
  parameters?: object;
}

export type AutomationConfig = object;

export interface SwaggerBaseApiResponseForClassAutomationConfig {
  meta: MetaResponse;
  data: AutomationConfig;
}

export type AutomationLog = object;

export interface SwaggerBaseApiResponseForClassAutomationLog {
  meta: MetaResponse;
  data: AutomationLog[];
}

export interface SwaggerBaseApiResponseForClassSlackPlaceholdersResponseDto {
  meta: MetaResponse;
  data: SlackPlaceholdersResponseDto;
}
