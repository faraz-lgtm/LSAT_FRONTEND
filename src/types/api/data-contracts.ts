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

export interface OrganizationOutput {
  /**
   * Organization ID
   * @example 1
   */
  id: number;
  /**
   * Whether the organization is archived
   * @example false
   */
  archived: boolean;
  /**
   * Organization name
   * @example "BetterLSAT"
   */
  name: string;
  /**
   * Organization slug (used in subdomain)
   * @example "betterlsat"
   */
  slug: string;
  /**
   * Organization domain (kept for backward compatibility)
   * @example "betterlsat.com"
   */
  domain?: string;
  /**
   * Array of domains for this organization
   * @example ["betterlsat.com","www.betterlsat.com"]
   */
  domains?: string[];
  /**
   * Organization settings including integrations. Twilio integration includes emailHostname in settings.integrations.twilio.emailHostname for SendGrid inbound email routing (e.g., "mail.betterlsat.com").
   * @example {"integrations":{"twilio":{"emailHostname":"mail.betterlsat.com"}}}
   */
  settings?: object;
  /**
   * Organization creation date
   * @example "2024-01-01T00:00:00.000Z"
   */
  createdAt: string;
  /**
   * Organization last update date
   * @example "2024-01-01T00:00:00.000Z"
   */
  updatedAt: string;
}

export interface SwaggerBaseApiResponseForClassOrganizationOutput {
  meta: MetaResponse;
  data: OrganizationOutput[];
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

export interface SwaggerBaseApiResponseForClassOrganizationOutput {
  meta: MetaResponse;
  data: OrganizationOutput;
}

export interface CreateOrganizationDto {
  /**
   * Organization name
   * @example "BetterLSAT"
   */
  name: string;
  /**
   * Organization slug (used in subdomain)
   * @example "betterlsat"
   */
  slug: string;
  /**
   * Organization domain (kept for backward compatibility)
   * @example "betterlsat.com"
   */
  domain?: string;
  /**
   * Array of domains for this organization (e.g., ["betterlsat.com", "www.betterlsat.com"])
   * @example ["betterlsat.com","www.betterlsat.com"]
   */
  domains?: string[];
  /**
   * Organization settings including integrations (Stripe, Google Calendar, Twilio, Email). For Twilio integration, include emailHostname (e.g., "mail.betterlsat.com") in settings.integrations.twilio.emailHostname to identify the organization from SendGrid inbound emails.
   * @example {"integrations":{"stripe":{"secretKey":"sk_test_...","webhookSecret":"whsec_...","publishableKey":"pk_test_...","taxEnabled":true},"googleCalendar":{"clientId":"...","clientSecret":"...","redirectUri":"...","accessToken":"...","refreshToken":"...","calendarId":"...","businessOwnerEmail":"...","defaultTimezone":"America/New_York"},"twilio":{"accountSid":"AC...","authToken":"...","phoneNumber":"+1...","conversationsServiceSid":"IS...","sendgridApiKey":"SG...","webhookUrl":"https://...","emailHostname":"mail.betterlsat.com"},"email":{"smtpHost":"smtp.sendgrid.net","smtpPort":"587","smtpUser":"apikey","smtpPass":"SG...","smtpFromEmail":"support@betterlsat.com","smtpFromName":"Better LSAT","sendgridFromEmail":"support@betterlsat.com","sendgridFromName":"Better LSAT"}}}
   */
  settings?: object;
}

export interface UpdateOrganizationDto {
  /**
   * Organization name
   * @example "BetterLSAT"
   */
  name?: string;
  /**
   * Organization slug (used in subdomain)
   * @example "betterlsat"
   */
  slug?: string;
  /**
   * Organization domain (kept for backward compatibility)
   * @example "betterlsat.com"
   */
  domain?: string;
  /**
   * Array of domains for this organization (e.g., ["betterlsat.com", "www.betterlsat.com"])
   * @example ["betterlsat.com","www.betterlsat.com"]
   */
  domains?: string[];
  /**
   * Organization settings including integrations (Stripe, Google Calendar, Twilio, Email). For Twilio integration, include emailHostname (e.g., "mail.betterlsat.com") in settings.integrations.twilio.emailHostname to identify the organization from SendGrid inbound emails.
   * @example {"integrations":{"stripe":{"secretKey":"sk_test_...","webhookSecret":"whsec_...","publishableKey":"pk_test_...","taxEnabled":true},"googleCalendar":{"clientId":"...","clientSecret":"...","redirectUri":"...","accessToken":"...","refreshToken":"...","calendarId":"...","businessOwnerEmail":"...","defaultTimezone":"America/New_York"},"twilio":{"accountSid":"AC...","authToken":"...","phoneNumber":"+1...","conversationsServiceSid":"IS...","sendgridApiKey":"SG...","webhookUrl":"https://...","emailHostname":"mail.betterlsat.com"},"email":{"smtpHost":"smtp.sendgrid.net","smtpPort":"587","smtpUser":"apikey","smtpPass":"SG...","smtpFromEmail":"support@betterlsat.com","smtpFromName":"Better LSAT","sendgridFromEmail":"support@betterlsat.com","sendgridFromName":"Better LSAT"}}}
   */
  settings?: object;
}

export interface GetUsersQueryParams {
  /** Optional, defaults to 100 */
  limit?: number;
  /** Optional, defaults to 0 */
  offset?: number;
  /**
   * Filter users by role
   * @example "USER"
   */
  role?: "USER" | "ADMIN" | "COMPANY_ADMIN" | "SUPER_ADMIN" | "CUST";
}

export interface UserOutput {
  id: number;
  name: string;
  username: string;
  /**
   * User roles
   * @example ["USER"]
   */
  roles: ("USER" | "ADMIN" | "COMPANY_ADMIN" | "SUPER_ADMIN" | "CUST")[];
  email: string;
  isAccountDisabled: boolean;
  phone: string;
  /**
   * Organization ID
   * @example 1
   */
  organizationId: number;
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
  /**
   * Array of service IDs this employee can work on
   * @example [5,6,7,8]
   */
  serviceIds?: number[];
  /**
   * Whether Google Calendar integration is valid for this user
   * @example true
   */
  googleCalendarIntegration: boolean;
}

export interface SwaggerBaseApiResponseForClassUserOutputExtendsBaseUserOutputDto1BaseUserOutput {
  meta: MetaResponse;
  data: UserOutput;
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
  roles: ("USER" | "ADMIN" | "COMPANY_ADMIN" | "SUPER_ADMIN" | "CUST")[];
  email: string;
  isAccountDisabled: boolean;
  phone: string;
  /**
   * Organization ID
   * @example 1
   */
  organizationId: number;
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
  roles: ("USER" | "ADMIN" | "COMPANY_ADMIN" | "SUPER_ADMIN" | "CUST")[];
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
  /**
   * Array of service IDs this employee can work on
   * @example [5,6,7,8]
   */
  serviceIds?: number[];
}

export interface CalendarVerificationOutputDto {
  /**
   * Whether calendar configuration is valid
   * @example true
   */
  isValid: boolean;
  /**
   * Error message if configuration is invalid
   * @example "OAuth2 credentials not found. Please authorize the application."
   */
  error?: string;
  /**
   * Detailed error information
   * @example {"hasClientId":true,"hasClientSecret":true,"hasAccessToken":false,"hasRefreshToken":false}
   */
  details?: object;
}

export interface SwaggerBaseApiResponseForClassCalendarVerificationOutputDto {
  meta: MetaResponse;
  data: CalendarVerificationOutputDto;
}

export interface GoogleCalendarConfigInputDto {
  /**
   * Google OAuth2 Client ID
   * @example "123456789-abc.apps.googleusercontent.com"
   */
  clientId: string;
  /**
   * Google OAuth2 Client Secret
   * @example "GOCSPX-abc123"
   */
  clientSecret: string;
  /**
   * OAuth2 Redirect URI
   * @example "http://localhost:3000/auth/google/callback"
   */
  redirectUri: string;
  /**
   * OAuth2 Access Token
   * @example "ya29.a0AfH6SMC..."
   */
  accessToken: string;
  /**
   * OAuth2 Refresh Token
   * @example "1//0gabc123..."
   */
  refreshToken: string;
  /**
   * Default timezone for calendar events
   * @default "America/New_York"
   * @example "America/New_York"
   */
  defaultTimezone?: string;
}

export interface CalendarListOutputDto {
  /**
   * Calendar ID
   * @example "primary"
   */
  id: string;
  /**
   * Calendar summary/name
   * @example "My Calendar"
   */
  summary: string;
  /**
   * Calendar description
   * @example "My personal calendar"
   */
  description?: string;
  /**
   * Whether this is the primary calendar
   * @example true
   */
  primary: boolean;
  /**
   * Calendar timezone
   * @example "America/New_York"
   */
  timeZone?: string;
  /**
   * Calendar access role
   * @example "owner"
   */
  accessRole?: string;
}

export interface SwaggerBaseApiResponseForClassCalendarListOutputDto {
  meta: MetaResponse;
  data: CalendarListOutputDto[];
}

export interface CalendarEventOutputDto {
  /**
   * Event ID
   * @example "abc123def456"
   */
  id: string;
  /**
   * Event summary/title
   * @example "Meeting with Client"
   */
  summary: string;
  /**
   * Event description
   * @example "Discuss project requirements"
   */
  description?: string;
  /**
   * Event start time
   * @example {"dateTime":"2025-11-23T19:00:00.000Z","timeZone":"America/New_York"}
   */
  start: object;
  /**
   * Event end time
   * @example {"dateTime":"2025-11-23T20:00:00.000Z","timeZone":"America/New_York"}
   */
  end: object;
  /**
   * Calendar ID this event belongs to (for all calendars endpoint)
   * @example "primary"
   */
  calendarId?: string;
  /**
   * Event location
   * @example "123 Main St, New York, NY"
   */
  location?: string;
  /**
   * Event attendees
   * @example [{"email":"attendee@example.com","displayName":"John Doe","responseStatus":"accepted"}]
   */
  attendees?: string[];
  /** Conference data (for Google Meet links) */
  conferenceData?: object;
  /**
   * Event status
   * @example "confirmed"
   */
  status?: string;
}

export interface SwaggerBaseApiResponseForClassCalendarEventOutputDto {
  meta: MetaResponse;
  data: CalendarEventOutputDto[];
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
  roles: ("USER" | "ADMIN" | "COMPANY_ADMIN" | "SUPER_ADMIN" | "CUST")[];
  /**
   * Organization ID
   * @example 1
   */
  organizationId: number;
  /**
   * Google Calendar configuration
   * @example {"clientId":"123456789-abc.apps.googleusercontent.com","clientSecret":"GOCSPX-abc123","redirectUri":"http://localhost:3000/auth/google/callback","accessToken":"ya29.a0AfH6SMC...","refreshToken":"1//0gabc123...","defaultTimezone":"America/New_York"}
   */
  googleCalendarConfig?: object;
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
  roles: ("USER" | "ADMIN" | "COMPANY_ADMIN" | "SUPER_ADMIN" | "CUST")[];
  /**
   * Organization ID
   * @example 1
   */
  organizationId: number;
  /**
   * Employee working hours in UTC format (HH:MM-HH:MM)
   * @example {"Monday":["09:00-17:00"],"Tuesday":["09:00-17:00"]}
   */
  workHours?: Record<string, string[]>;
  /**
   * Array of service IDs this employee can work on
   * @example [5,6,7,8]
   */
  serviceIds?: number[];
}

export interface RegisterOutput {
  id: number;
  name: string;
  username: string;
  /**
   * User roles
   * @example ["USER"]
   */
  roles: ("USER" | "ADMIN" | "COMPANY_ADMIN" | "SUPER_ADMIN" | "CUST")[];
  email: string;
  isAccountDisabled: boolean;
  phone: string;
  /**
   * Organization ID
   * @example 1
   */
  organizationId: number;
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

export interface ForgotPasswordInput {
  /** Email address or phone number of the user requesting password reset. Use email format (e.g., user@example.com) or phone number (e.g., +1234567890) */
  identifier: string;
}

export interface ForgotPasswordOutput {
  /**
   * Success message
   * @example "If the provided email or phone number exists, an OTP code has been sent."
   */
  message: string;
}

export interface SwaggerBaseApiResponseForClassForgotPasswordOutput {
  meta: MetaResponse;
  data: ForgotPasswordOutput;
}

export interface VerifyOtpInput {
  /**
   * Email address or phone number used to request password reset. Must match the identifier used in the forgot-password request.
   * @example "user@example.com"
   */
  identifier: string;
  /**
   * 6-digit OTP code received via SMS or Email. Must be exactly 6 numeric digits.
   * @pattern ^\d{6}$
   * @example "123456"
   */
  otp: string;
}

export interface VerifyOtpOutput {
  /**
   * Whether the OTP is valid
   * @example true
   */
  isValid: boolean;
}

export interface SwaggerBaseApiResponseForClassVerifyOtpOutput {
  meta: MetaResponse;
  data: VerifyOtpOutput;
}

export interface ResetPasswordInput {
  /**
   * Email address or phone number used to request password reset. Must match the identifier used in the forgot-password request.
   * @example "user@example.com"
   */
  identifier: string;
  /**
   * 6-digit OTP code received via SMS or Email. Must be exactly 6 numeric digits. This OTP will be consumed after successful password reset.
   * @pattern ^\d{6}$
   * @example "123456"
   */
  otp: string;
  /**
   * New password for the account. Must be at least 8 characters long. The password will be hashed before storage.
   * @minLength 8
   * @maxLength 100
   * @example "NewSecurePassword123!"
   */
  newPassword: string;
}

export interface ResetPasswordOutput {
  /**
   * Success message
   * @example "Password reset successfully"
   */
  message: string;
}

export interface SwaggerBaseApiResponseForClassResetPasswordOutput {
  meta: MetaResponse;
  data: ResetPasswordOutput;
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

export interface UpdateOrderNotesDto {
  /**
   * Free-form notes for the order
   * @example "Prefers evenings; focus on logic games."
   */
  notes: string;
}

export interface UpdateOrderStatusDto {
  /**
   * Business status of the order
   * @example "COMPLETED"
   */
  orderStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED";
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
   * Quantity
   * @example 1
   */
  quantity: number;
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
  /** Free-form notes about the order */
  notes?: string | null;
  /** Derived tags summarizing appointment attendance */
  tags?: ("SHOWED" | "NO_SHOW")[];
  /** Business status of the order */
  orderStatus?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  /**
   * Timestamp when order was marked as completed
   * @format date-time
   */
  completedAt?: string | null;
}

export interface SwaggerBaseApiResponseForClassOrderOutput {
  meta: MetaResponse;
  data: OrderOutput;
}

export interface MarkAppointmentAttendanceDto {
  status: "UNKNOWN" | "SHOWED" | "NO_SHOW";
}

export interface UpdateAppointmentNotesDto {
  /**
   * Notes about the appointment
   * @example "Student needs extra help with logic games"
   */
  notes?: object;
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

export interface SwaggerBaseApiResponseForClassOrderOutput {
  meta: MetaResponse;
  data: OrderOutput[];
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

export interface CancelOrderDto {
  /**
   * Reason for the order cancellation
   * @example "customer_request"
   */
  refundReason: "customer_request" | "duplicate" | "fraudulent" | "other";
  /**
   * Additional details about the cancellation reason
   * @example "Customer requested cancellation due to scheduling conflict"
   */
  reasonDetails: string;
}

export interface CancelOrderResultDto {
  /** The refund record created for the canceled order */
  refund: object;
  /** The canceled order */
  canceledOrder: object;
}

export interface SwaggerBaseApiResponseForClassCancelOrderResultDto {
  meta: MetaResponse;
  data: CancelOrderResultDto;
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
   * List of product features
   * @example ["Feature 1","Feature 2","Feature 3"]
   */
  features?: string[];
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
  /**
   * List of product features
   * @example ["Feature 1","Feature 2","Feature 3"]
   */
  features?: string[];
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
  /**
   * List of product features
   * @example ["Feature 1","Feature 2","Feature 3"]
   */
  features?: string[];
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
   * Source type of the task (task or order_appointment)
   * @example "task"
   */
  type: "task" | "order_appointment";
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
  /**
   * Order ID (if this task is from an order appointment)
   * @example 501
   */
  orderId?: number;
  /**
   * Order item/product ID (if this task is from an order appointment)
   * @example 5
   */
  itemId?: number;
  /** Attendance status (if this task is from an order appointment) */
  attendanceStatus?: "UNKNOWN" | "SHOWED" | "NO_SHOW";
  /**
   * When the attendance was marked (if this task is from an order appointment)
   * @example "2024-01-15T14:00:00.000Z"
   */
  attendanceMarkedAt?: object;
  /**
   * User ID who marked the attendance (if this task is from an order appointment)
   * @example 1
   */
  attendanceMarkedBy?: object;
  /**
   * Notes about the appointment/task
   * @example "Student needs extra help with logic games"
   */
  notes?: object;
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

export interface CreateAutomationDto {
  /**
   * Unique automation key identifier (lowercase, hyphen-separated)
   * @pattern ^[a-z0-9-]+$
   * @example "custom-order-email"
   */
  automationKey: string;
  /**
   * Display name of the automation
   * @maxLength 200
   * @example "Custom Order Confirmation Email"
   */
  name: string;
  /**
   * Detailed description of what the automation does
   * @example "Sends a customized confirmation email when order is paid"
   */
  description?: string;
  /**
   * Event that triggers this automation
   * @example "order.paid"
   */
  triggerEvent:
    | "order.created"
    | "order.paid"
    | "order.canceled"
    | "order.modified"
    | "order.completed"
    | "user.registered"
    | "payment.refunded"
    | "task.created"
    | "task.completed"
    | "order.appointment.no_show"
    | "order.appointment.showed";
  /**
   * Communication tool type used for this automation
   * @example "email"
   */
  toolType: "email" | "sms" | "slack" | "whatsapp";
  /**
   * Default parameters for the automation (JSON object)
   * @example {"delayMinutes":0,"template":"order-confirmation","subject":"Order #{{orderNumber}} Confirmed"}
   */
  defaultParameters?: object;
  /**
   * Whether the automation is archived
   * @default false
   * @example false
   */
  archived?: boolean;
}

export interface UpdateAutomationDto {
  /**
   * Unique automation key identifier (lowercase, hyphen-separated)
   * @pattern ^[a-z0-9-]+$
   * @example "custom-order-email"
   */
  automationKey?: string;
  /**
   * Display name of the automation
   * @maxLength 200
   * @example "Custom Order Confirmation Email"
   */
  name?: string;
  /**
   * Detailed description of what the automation does
   * @example "Sends a customized confirmation email when order is paid"
   */
  description?: string;
  /**
   * Event that triggers this automation
   * @example "order.paid"
   */
  triggerEvent?:
    | "order.created"
    | "order.paid"
    | "order.canceled"
    | "order.modified"
    | "order.completed"
    | "user.registered"
    | "payment.refunded"
    | "task.created"
    | "task.completed"
    | "order.appointment.no_show"
    | "order.appointment.showed";
  /**
   * Communication tool type used for this automation
   * @example "email"
   */
  toolType?: "email" | "sms" | "slack" | "whatsapp";
  /**
   * Default parameters for the automation (JSON object)
   * @example {"delayMinutes":0,"template":"order-confirmation","subject":"Order #{{orderNumber}} Confirmed"}
   */
  defaultParameters?: object;
  /**
   * Whether the automation is archived
   * @example false
   */
  archived?: boolean;
  /**
   * Enable or disable the automation (organization-specific)
   * @example true
   */
  isEnabled?: boolean;
  /**
   * Organization-specific configuration parameters for the automation (merges with defaultParameters)
   * @example {"delayMinutes":30,"channel":"#custom-orders"}
   */
  parameters?: object;
}

export type AutomationConfig = object;

export interface AutomationConfigOutputDto {
  /**
   * Database ID of the automation config (if persisted)
   * @example 1
   */
  id?: number;
  /**
   * Unique automation key identifier (lowercase, hyphen-separated)
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
    | "order.completed"
    | "user.registered"
    | "payment.refunded"
    | "task.created"
    | "task.completed"
    | "order.appointment.no_show"
    | "order.appointment.showed";
  /**
   * Communication tool used for this automation
   * @example "email"
   */
  toolType: "email" | "sms" | "slack" | "whatsapp";
  /**
   * Whether the automation is enabled for this organization
   * @example true
   */
  isEnabled: boolean;
  /**
   * Whether the automation is archived
   * @example false
   */
  archived: boolean;
  /**
   * Configuration parameters for the automation (merged from default and org-specific)
   * @example {"delayMinutes":0,"channel":"#orders"}
   */
  parameters?: object;
  /**
   * Default parameters defined for the automation
   * @example {"delayMinutes":0,"template":"order-confirmation"}
   */
  defaultParameters?: object;
}

export interface SwaggerBaseApiResponseForClassAutomationConfigExtendsBaseEntity1BaseEntity {
  meta: MetaResponse;
  data: AutomationConfig;
}

export interface SwaggerBaseApiResponseForClassAutomationConfigOutputDto {
  meta: MetaResponse;
  data: AutomationConfigOutputDto[];
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

export interface SwaggerBaseApiResponseForClassAutomationConfigOutputDto {
  meta: MetaResponse;
  data: AutomationConfigOutputDto;
}

export interface ParticipantOutputDto {
  /** Participant SID */
  sid: string;
  /** Participant identity */
  identity: string;
  /** Attributes */
  attributes: string;
  /**
   * Date created
   * @format date-time
   */
  dateCreated: string;
  /**
   * Date updated
   * @format date-time
   */
  dateUpdated: string;
}

export interface MessageOutputDto {
  /** Message SID */
  sid: string;
  /** Index of message in conversation */
  index: number;
  /**
   * Message author user ID (numeric database ID)
   * @example 156
   */
  author?: number;
  /** Message body/content */
  body: string;
  /** Message attributes */
  attributes: string;
  /**
   * Date created
   * @format date-time
   */
  dateCreated: string;
  /**
   * Date updated
   * @format date-time
   */
  dateUpdated: string;
  /** Email sender address (for EMAIL channel messages) */
  emailFrom?: string;
  /** Email recipient address (for EMAIL channel messages) */
  emailTo?: string;
  /** Email subject (for EMAIL channel messages) */
  emailSubject?: string;
  /** Email body content (for EMAIL channel messages) */
  emailBody?: string;
  /**
   * Email HTML content with inline images as data URIs (for EMAIL channel messages)
   * @example "<p>Hello <img src="data:image/png;base64,..."></p>"
   */
  emailHtml?: string;
  /**
   * Email Message-ID header for threading (for EMAIL channel messages). Used to link email replies together.
   * @example "<1234567890-abc123@example.com>"
   */
  emailMessageId?: string;
  /**
   * In-Reply-To header value indicating which message this replies to (for EMAIL channel messages). Contains the Message-ID of the message being replied to.
   * @example "<1234567890-abc123@example.com>"
   */
  emailInReplyTo?: string;
  /**
   * References header value containing message thread history (for EMAIL channel messages). Contains space-separated Message-IDs of all messages in the thread.
   * @example "<msg1@example.com> <msg2@example.com>"
   */
  emailReferences?: string;
}

export interface ConversationOutputDto {
  /** Conversation SID */
  sid: string;
  /** Account SID */
  accountSid: string;
  /** Chat service SID */
  chatServiceSid: string;
  /** Friendly name */
  friendlyName: string;
  /** Unique name */
  uniqueName: string;
  /** Attributes */
  attributes: string;
  /** State */
  state: string;
  /**
   * Date created
   * @format date-time
   */
  dateCreated: string;
  /**
   * Date updated
   * @format date-time
   */
  dateUpdated: string;
  /** Participants */
  participants?: ParticipantOutputDto[];
  /** Latest message */
  latestMessage?: MessageOutputDto;
}

export interface AddParticipantDto {
  /**
   * Communication channel type
   * @example "SMS"
   */
  channel: "SMS" | "WHATSAPP" | "EMAIL";
  /**
   * User ID of the recipient. For SMS/WhatsApp: uses user's registered phone. Note: Email participants are NOT supported by Twilio Conversations API.
   * @example "156"
   */
  userId: string;
}

export interface SuccessResponseDto {
  /**
   * Operation success status
   * @example true
   */
  success: boolean;
}

export interface ParticipantDto {
  /**
   * Communication channel type
   * @example "SMS"
   */
  channel: "SMS" | "WHATSAPP" | "EMAIL";
  /**
   * User ID of the recipient. For SMS/WhatsApp: uses user's registered phone. Note: Email participants are NOT supported by Twilio Conversations API - emails are sent via SendGrid separately.
   * @example "156"
   */
  userId: string;
}

export interface CreateConversationDto {
  /**
   * Friendly name for the conversation
   * @example "Chat with John Doe"
   */
  friendlyName: string;
  /** Participants to add to the conversation */
  participants?: ParticipantDto[];
  /** Custom attributes (key-value pairs) */
  attributes?: object;
}

export interface SendMessageDto {
  /**
   * Message body/content
   * @example "Hello, how can I help you?"
   */
  body: string;
  /**
   * Delivery channel (SMS, EMAIL, WHATSAPP). Determines which delivery method to use and is stored in message attributes for filtering. If SMS/EMAIL is specified, message will be delivered to phone/email participants respectively. Used to filter message history by channel.
   * @example "SMS"
   */
  channel?: "SMS" | "WHATSAPP" | "EMAIL";
  /**
   * Author identity (user identifier)
   * @example "user_123"
   */
  author?: string;
  /** Message attributes (key-value pairs) */
  attributes?: object;
}

export interface EmailAttachmentDto {
  /** Base64 encoded content */
  content: string;
  /** File name */
  filename: string;
  /**
   * MIME type
   * @example "application/pdf"
   */
  type: string;
}

export interface SendEmailDto {
  /**
   * Recipient email address (auto-populated from conversation if not provided)
   * @example "customer@example.com"
   */
  to?: string;
  /**
   * Email subject (defaults to "Chat-BetterLSAT" if not provided)
   * @example "Re: Your inquiry"
   */
  subject?: string;
  /** Plain text content */
  text?: string;
  /** HTML content */
  html?: string;
  /** From email address (auto-populated from current user if not provided) */
  from?: string;
  /** CC recipients */
  cc?: string[];
  /** BCC recipients */
  bcc?: string[];
  /** Email attachments */
  attachments?: EmailAttachmentDto[];
}

<<<<<<< HEAD
export interface SwaggerBaseApiResponseForClassConversationOutputDto {
=======
export interface ThreadParticipantDto {
  /** User ID of the participant */
  userId: number;
  /** Full name of the participant */
  fullName?: string;
  /** Email address of the participant */
  email?: string;
  /** Phone number of the participant */
  phone?: string;
}

export interface ConversationChannelSummaryDto {
  /**
   * Channel associated with the Twilio conversation
   * @example "SMS"
   */
  channel: "SMS" | "WHATSAPP" | "EMAIL";
  /**
   * Twilio conversation SID for the given channel
   * @example "CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   */
  conversationSid: string;
}

export interface ThreadConversationOutputDto {
  /**
   * Database ID of the primary conversation (typically SMS channel)
   * @example 12
   */
  id: number;
  /** Thread identifier composed of participant IDs */
  threadId: string;
  /** Friendly name for the thread */
  friendlyName: string;
  /**
   * User ID that initiated this thread
   * @example 7
   */
  initiatorUserId: number;
  /** Participant metadata associated with this thread */
  participants: ThreadParticipantDto[];
  /**
   * User ID of the person the current user is chatting with
   * @example 42
   */
  counterpartUserId: number;
  /** Conversation SIDs grouped by communication channel */
  channels: ConversationChannelSummaryDto[];
  /**
   * Original email subject (without "Re:" prefix) for EMAIL conversations. Used to maintain consistent subject line across email thread.
   * @example "Your inquiry"
   */
  originalSubject?: string;
}

export interface SwaggerBaseApiResponseForClassThreadConversationOutputDto {
>>>>>>> b478c6f68fdaf3dc6eb9140917baf009f7c43018
  meta: MetaResponse;
  data: ConversationOutputDto[];
}

export interface SwaggerBaseApiResponseForClassConversationOutputDto {
  meta: MetaResponse;
  data: ConversationOutputDto;
}

export interface SwaggerBaseApiResponseForClassMessageOutputDto {
  meta: MetaResponse;
  data: MessageOutputDto[];
}

export interface SwaggerBaseApiResponseForClassMessageOutputDto {
  meta: MetaResponse;
  data: MessageOutputDto;
}

export interface SwaggerBaseApiResponseForClassParticipantOutputDto {
  meta: MetaResponse;
  data: ParticipantOutputDto;
}

export interface SwaggerBaseApiResponseForClassSuccessResponseDto {
  meta: MetaResponse;
  data: SuccessResponseDto;
}

export interface CallLogDto {
  /**
   * Unique identifier for the call recording
   * @example 1
   */
  id: number;
  /**
   * Twilio Recording SID (unique identifier for the recording)
   * @example "RE1234567890abcdef1234567890abcdef"
   */
  recordingSid: string;
  /**
   * Twilio Call SID associated with this recording
   * @example "CA1234567890abcdef1234567890abcdef"
   */
  callSid?: string;
  /**
   * URL to access the recording file
   * @example "https://api.twilio.com/2010-04-01/Accounts/AC.../Recordings/RE..."
   */
  recordingUrl?: string;
  /**
   * Status of the recording
   * @example "completed"
   */
  recordingStatus?: "completed" | "processing" | "failed";
  /**
   * Duration of the recording in seconds
   * @example 120
   */
  recordingDuration?: number;
  /**
   * Number of audio channels in the recording
   * @example "1"
   */
  recordingChannels?: string;
  /**
   * Source of the recording (e.g., DialVerb, RecordVerb)
   * @example "DialVerb"
   */
  recordingSource?: string;
  /**
   * Price of the recording
   * @example "0.0025"
   */
  recordingPrice?: string;
  /**
   * Currency unit for the recording price
   * @example "USD"
   */
  recordingPriceUnit?: string;
  /**
   * Timestamp when the recording was created
   * @format date-time
   * @example "2024-01-15T10:30:00.000Z"
   */
  createdAt: string;
  /**
   * Timestamp when the recording was last updated
   * @format date-time
   * @example "2024-01-15T10:35:00.000Z"
   */
  updatedAt: string;
}

export interface CallWithLogsDto {
  /**
   * Unique identifier for the call
   * @example 1
   */
  id: number;
  /**
   * Twilio Call SID (unique identifier for the call)
   * @example "CA1234567890abcdef1234567890abcdef"
   */
  callSid: string;
  /**
   * Twilio Application SID used for the call
   * @example "AP1234567890abcdef1234567890abcdef"
   */
  applicationSid?: string;
  /**
   * Twilio API version used
   * @example "2010-04-01"
   */
  apiVersion?: string;
  /**
   * Current status of the call
   * @example "completed"
   */
  callStatus?:
    | "queued"
    | "ringing"
    | "in-progress"
    | "completed"
    | "busy"
    | "failed"
    | "no-answer"
    | "canceled";
  /**
   * Direction of the call (inbound or outbound)
   * @example "outbound"
   */
  direction?: "inbound" | "outbound";
  /**
   * Twilio Account SID
   * @example "TWILIO SID"
   */
  accountSid?: string;
  /**
   * Caller phone number or identifier
   * @example "+1234567890"
   */
  caller?: string;
  /**
   * Phone number or identifier that initiated the call
   * @example "client:user123"
   */
  from?: string;
  /**
   * Phone number or identifier that received the call
   * @example "+1234567890"
   */
  to?: string;
  /**
   * Phone number that was called
   * @example "+1234567890"
   */
  called?: string;
  /**
   * ID of the user who initiated the call
   * @example 42
   */
  initiatedByUserId?: number;
  /**
   * ID of the conversation associated with this call
   * @example 11
   */
  conversationId?: number;
  /**
   * Duration of the call in seconds
   * @example 180
   */
  duration?: number;
  /**
   * Price of the call
   * @example "0.0125"
   */
  price?: string;
  /**
   * Currency unit for the call price
   * @example "USD"
   */
  priceUnit?: string;
  /**
   * Timestamp when the call was created
   * @format date-time
   * @example "2024-01-15T10:00:00.000Z"
   */
  createdAt: string;
  /**
   * Timestamp when the call was last updated
   * @format date-time
   * @example "2024-01-15T10:05:00.000Z"
   */
  updatedAt: string;
  /**
   * Array of call logs (recordings) associated with this call
   * @example [{"id":1,"recordingSid":"RE1234567890abcdef1234567890abcdef","callSid":"CA1234567890abcdef1234567890abcdef","recordingUrl":"https://api.twilio.com/2010-04-01/Accounts/AC.../Recordings/RE...","recordingStatus":"completed","recordingDuration":180,"recordingChannels":"1","recordingSource":"DialVerb","recordingPrice":"0.0025","recordingPriceUnit":"USD","createdAt":"2024-01-15T10:00:00.000Z","updatedAt":"2024-01-15T10:05:00.000Z"}]
   */
  callLogs: CallLogDto[];
}

export interface CallsByConversationResponseDto {
  /**
   * Array of calls with their associated call logs for the specified conversation
   * @example {"calls":[{"id":1,"callSid":"CA1234567890abcdef1234567890abcdef","conversationId":11,"callStatus":"completed","direction":"outbound","duration":180,"from":"client:user123","to":"+1234567890","callLogs":[{"id":1,"recordingSid":"RE1234567890abcdef1234567890abcdef","recordingStatus":"completed","recordingDuration":180,"recordingUrl":"https://api.twilio.com/..."}]}]}
   */
  calls: CallWithLogsDto[];
}

export type RequestVoiceTokenDto = object;

export type RecordingCallbackDto = object;

export type CallStatusCallbackDto = object;
