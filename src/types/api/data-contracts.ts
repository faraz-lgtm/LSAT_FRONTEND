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
}

export interface SwaggerBaseApiResponseForClassUserOutputExtendsBaseUserOutputDto1BaseUserOutputWorkHours {
  meta: object;
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

export interface SwaggerBaseApiResponseForClassUserOutputExtendsBaseUserOutputDto1BaseUserOutputWorkHours {
  meta: object;
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
   * User password
   * @minLength 6
   * @maxLength 100
   * @example "securePassword123"
   */
  password: string;
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
  meta: object;
  data: LoginOutput;
}

export interface RegisterInput {
  name: string;
  phone: string;
  username: string;
  password: string;
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
  meta: object;
  data: RegisterOutput;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface SwaggerBaseApiResponseForClassAuthTokenOutputAccessTokenRefreshToken {
  meta: object;
  data: AuthTokenOutput;
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
   * ID of assigned employee
   * @example 5
   */
  assignedEmployeeId?: number;
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
}

export interface SwaggerBaseApiResponseForClassOrderOutputIdCustomerItems {
  meta: object;
  data: OrderOutput;
}

export interface SwaggerBaseApiResponseForClassOrderOutputIdCustomerItems {
  meta: object;
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
  meta: object;
  data: Slot;
}
