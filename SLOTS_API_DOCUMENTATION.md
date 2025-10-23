# Slots API Documentation

## Overview

The Slots API provides endpoints for managing appointment slot availability, employee assignments, and time slot bookings. This API is designed to handle the complex logic of scheduling appointments while considering employee availability, time zones, and package durations.

## Base URL

```
/api/v1/slots
```

## Authentication

All endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Data Types

### SlotsQueryDto

Query parameters for slot-related requests.

```typescript
interface SlotsQueryDto {
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
```

### AvailableEmployee

Information about an employee available for a specific time slot.

```typescript
interface AvailableEmployee {
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
   * @example "john.doe@company.com"
   */
  email: string;
}
```

### AvailableSlot

A specific time slot with available employees.

```typescript
interface AvailableSlot {
  /**
   * Time slot in HH:MM format
   * @example "09:00"
   */
  slot: string;
  
  /** Available employees for this slot */
  availableEmployees: AvailableEmployee[];
}
```

### Slot

Complete slot information for a specific date and package.

```typescript
interface Slot {
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
```

## API Endpoints

### 1. Get Available Slots

**Endpoint:** `GET /slots`

**Description:** Retrieves available time slots for a specific package and date.

**Query Parameters:**
- `packageId` (required): Service/package ID
- `date` (required): Date in ISO 8601 format (UTC timezone)
- `customerTimezone` (optional): Customer timezone for proper time conversion

**Example Request:**
```bash
GET /api/v1/slots?packageId=5&date=2025-01-15T00:00:00.000Z&customerTimezone=America/New_York
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "bookedSlots": ["09:00", "10:00"],
    "availableSlots": [
      {
        "slot": "08:00",
        "availableEmployees": [
          {
            "id": 1,
            "name": "John Doe",
            "email": "john.doe@company.com"
          }
        ]
      },
      {
        "slot": "11:00",
        "availableEmployees": [
          {
            "id": 1,
            "name": "John Doe",
            "email": "john.doe@company.com"
          },
          {
            "id": 2,
            "name": "Jane Smith",
            "email": "jane.smith@company.com"
          }
        ]
      }
    ],
    "slotDurationMinutes": 60,
    "warning": "Limited availability for this date"
  },
  "message": "Slots retrieved successfully"
}
```

### 2. Get Multiple Available Slots (Batch)

**Endpoint:** `POST /slots/batch`

**Description:** Retrieves available slots for multiple packages and dates in a single request.

**Request Body:**
```typescript
SlotsQueryDto[]
```

**Example Request:**
```bash
POST /api/v1/slots/batch
Content-Type: application/json

[
  {
    "packageId": 5,
    "date": "2025-01-15T00:00:00.000Z",
    "customerTimezone": "America/New_York"
  },
  {
    "packageId": 6,
    "date": "2025-01-16T00:00:00.000Z",
    "customerTimezone": "America/New_York"
  }
]
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "bookedSlots": ["09:00"],
      "availableSlots": [
        {
          "slot": "08:00",
          "availableEmployees": [
            {
              "id": 1,
              "name": "John Doe",
              "email": "john.doe@company.com"
            }
          ]
        }
      ],
      "slotDurationMinutes": 60
    },
    {
      "bookedSlots": [],
      "availableSlots": [
        {
          "slot": "09:00",
          "availableEmployees": [
            {
              "id": 2,
              "name": "Jane Smith",
              "email": "jane.smith@company.com"
            }
          ]
        }
      ],
      "slotDurationMinutes": 90
    }
  ],
  "message": "Batch slots retrieved successfully"
}
```

### 3. Check Slot Availability

**Endpoint:** `GET /slots/check`

**Description:** Checks if a specific time slot is available for booking.

**Query Parameters:**
- `packageId` (required): Service/package ID
- `date` (required): Date in ISO 8601 format (UTC timezone)
- `timeSlot` (required): Specific time slot to check (HH:MM format)
- `customerTimezone` (optional): Customer timezone

**Example Request:**
```bash
GET /api/v1/slots/check?packageId=5&date=2025-01-15T00:00:00.000Z&timeSlot=09:00&customerTimezone=America/New_York
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "employee": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@company.com"
    }
  },
  "message": "Slot is available"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request parameters",
  "errors": [
    {
      "field": "packageId",
      "message": "Package ID must be a positive integer"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Package not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Usage Examples

### React Hook Usage

```typescript
import { useGetAvailableSlotsQuery } from '@/redux/apiSlices/Slot';

function AppointmentBooking() {
  const { data, error, isLoading } = useGetAvailableSlotsQuery({
    packageId: 5,
    date: "2025-01-15T00:00:00.000Z",
    customerTimezone: "America/New_York"
  });

  if (isLoading) return <div>Loading slots...</div>;
  if (error) return <div>Error loading slots</div>;

  return (
    <div>
      <h3>Available Time Slots</h3>
      {data?.data.availableSlots.map(slot => (
        <div key={slot.slot}>
          <h4>{slot.slot}</h4>
          <p>Available employees: {slot.availableEmployees.length}</p>
        </div>
      ))}
    </div>
  );
}
```

### Batch Request Usage

```typescript
import { useGetMultipleAvailableSlotsQuery } from '@/redux/apiSlices/Slot';

function MultiDateBooking() {
  const queries = [
    { packageId: 5, date: "2025-01-15T00:00:00.000Z" },
    { packageId: 5, date: "2025-01-16T00:00:00.000Z" },
    { packageId: 6, date: "2025-01-15T00:00:00.000Z" }
  ];

  const { data, error, isLoading } = useGetMultipleAvailableSlotsQuery(queries);

  if (isLoading) return <div>Loading multiple slots...</div>;
  if (error) return <div>Error loading slots</div>;

  return (
    <div>
      {data?.data.map((slotData, index) => (
        <div key={index}>
          <h3>Date {index + 1}</h3>
          <p>Available slots: {slotData.availableSlots.length}</p>
        </div>
      ))}
    </div>
  );
}
```

### Slot Availability Check

```typescript
import { useCheckSlotAvailabilityQuery } from '@/redux/apiSlices/Slot';

function SlotChecker() {
  const { data, error, isLoading } = useCheckSlotAvailabilityQuery({
    packageId: 5,
    date: "2025-01-15T00:00:00.000Z",
    timeSlot: "09:00",
    customerTimezone: "America/New_York"
  });

  if (isLoading) return <div>Checking availability...</div>;
  if (error) return <div>Error checking availability</div>;

  return (
    <div>
      {data?.data.available ? (
        <div>
          <p>✅ Slot is available!</p>
          <p>Assigned employee: {data.data.employee?.name}</p>
        </div>
      ) : (
        <p>❌ Slot is not available</p>
      )}
    </div>
  );
}
```

## Business Logic

### Slot Generation Rules

1. **Time Zone Handling**: All dates are stored in UTC but displayed in customer timezone
2. **Employee Availability**: Only employees with matching work hours are shown
3. **Package Duration**: Slots are generated based on package duration (15, 30, 60, 90 minutes)
4. **Booking Conflicts**: Already booked slots are excluded from available slots
5. **Buffer Time**: 15-minute buffer between appointments for preparation

### Slot Duration Mapping

- **15 minutes**: Quick consultations
- **30 minutes**: Standard sessions
- **60 minutes**: Extended sessions
- **90 minutes**: Comprehensive sessions

### Employee Work Hours

Employee availability is determined by their `workHours` configuration:

```typescript
{
  "Monday": ["09:00-17:00"],
  "Tuesday": ["09:00-17:00"],
  "Wednesday": ["09:00-17:00"],
  "Thursday": ["09:00-17:00"],
  "Friday": ["09:00-17:00"],
  "Saturday": ["10:00-15:00"],
  "Sunday": []
}
```

## Caching Strategy

The slots API uses RTK Query caching with the following tags:
- `AvailableSlots`: Invalidated when orders are created/updated/deleted

## Performance Considerations

1. **Batch Requests**: Use batch endpoint for multiple slot requests
2. **Caching**: Results are cached for 5 minutes by default
3. **Pagination**: Large date ranges should be requested in batches
4. **Timezone Optimization**: Always provide customer timezone for accurate results

## Migration from Orders API

If you were previously using the slots endpoint from the orders API, update your imports:

```typescript
// Old import
import { useGetAvailableSlotsQuery } from '@/redux/apiSlices/Order/orderSlice';

// New import
import { useGetAvailableSlotsQuery } from '@/redux/apiSlices/Slot';
```

The API interface remains the same, so no code changes are required beyond the import statement.
