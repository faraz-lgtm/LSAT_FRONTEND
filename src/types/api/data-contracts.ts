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
}

export interface SwaggerBaseApiResponseForClassUserOutputExtendsBaseUserOutputDto1BaseUserOutputWorkHoursOrdersCount {
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

export interface SwaggerBaseApiResponseForClassBaseUserOutputIdNameUsernameRolesEmailIsAccountDisabledPhoneCreatedAtUpdatedAt {
  meta: MetaResponse;
  data: BaseUserOutput;
}

export interface SwaggerBaseApiResponseForClassUserOutputExtendsBaseUserOutputDto1BaseUserOutputWorkHoursOrdersCount {
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

export interface SwaggerBaseApiResponseForClassLoginOutputAuthUser {
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

export interface SwaggerBaseApiResponseForClassAuthTokenOutputAccessTokenRefreshToken {
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

export interface SlotsQueryDto {
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
   * Session duration
   * @example "60 minutes"
   */
  Duration: string;
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
  assignedEmployeeId?: number;
}

export interface OrderInput {
  items: ItemInput[];
  user: UserInput;
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
   * Session duration
   * @example "60 minutes"
   */
  Duration: string;
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
   * Assigned employee ID
   * @example 5
   */
  assignedEmployeeId: number;
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
  slot_reservation_status?: "RESERVED" | "CONFIRMED" | "EXPIRED" | null;
}

export interface SwaggerBaseApiResponseForClassOrderOutputIdCustomerItemsSlotReservationExpiresAtSlotReservationStatus {
  meta: MetaResponse;
  data: OrderOutput;
}

export interface SwaggerBaseApiResponseForClassOrderOutputIdCustomerItemsSlotReservationExpiresAtSlotReservationStatus {
  meta: MetaResponse;
  data: OrderOutput[];
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

export interface SwaggerBaseApiResponseForClassSlotBookedSlotsAvailableSlotsSlotDurationMinutesWarning {
  meta: MetaResponse;
  data: Slot;
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
   * Session duration
   * @example "Unlimited"
   */
  Duration: string;
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

export interface SwaggerBaseApiResponseForClassProductOutputIdNamePriceSaveSessionsDurationDescriptionBadgeCreatedAtUpdatedAt {
  meta: MetaResponse;
  data: ProductOutput[];
}

export interface SwaggerBaseApiResponseForClassProductOutputIdNamePriceSaveSessionsDurationDescriptionBadgeCreatedAtUpdatedAt {
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
   * Session duration
   * @example "Unlimited"
   */
  Duration: string;
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
   * Session duration
   * @example "Unlimited"
   */
  Duration?: string;
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
