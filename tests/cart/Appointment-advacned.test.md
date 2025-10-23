# Appointment Advanced Test Documentation

## Overview

The `Appointment-advacned.test.ts` file contains a comprehensive Playwright test that validates the appointment booking system's slot availability logic, particularly focusing on how the system handles slots with multiple employees available.

## Test Purpose

This test verifies that:
1. **Single Employee Slots**: When a slot has only 1 employee available, booking it once removes it from future availability
2. **Multi-Employee Slots**: When a slot has multiple employees available, it can be booked multiple times (once per employee) before becoming unavailable
3. **Slot Availability Logic**: The system correctly tracks and updates slot availability based on employee capacity

## Test Flow Breakdown

### Phase 1: Initial Setup and First Booking

1. **Navigate to Appointment Page**
   - Goes to `http://localhost:5173/Appointment`
   - Verifies the appointment booking interface is loaded

2. **Add Package to Cart**
   - Navigates back to packages
   - Adds a 5x bundle package ($577) to cart
   - Proceeds to checkout

3. **Fill Customer Information**
   - First Name: "Farru"
   - Last Name: "zist" 
   - Email: "john.zist@example.com"
   - Phone: "+92 316-1504150" (Pakistan)

4. **Slot Selection and Analysis**
   - Verifies exactly 5 slots are available
   - Captures the first slot text (e.g., "8:00 AM - 8:15 AM")
   - **Key Innovation**: Parses the slot time and queries the API to determine how many employees are available for that specific slot
   - Uses `getSlotEmployeeCount()` helper function to fetch employee data

5. **Complete First Booking**
   - Selects all 5 slots
   - Completes the booking process
   - Navigates to payment success page

### Phase 2: Multi-Employee Booking Loop

The test then performs a dynamic loop based on the employee count discovered in Phase 1:

```typescript
for (let bookingIteration = 1; bookingIteration < employeeCount; bookingIteration++)
```

For each iteration:
1. **Start New Booking**
   - Navigate back to appointment page
   - Add the same package to cart
   - Fill unique customer information (`Customer2@example.com`, `Customer3@example.com`, etc.)

2. **Check Slot Availability**
   - Verify if the target slot is still available
   - If not available, break the loop early (slot fully booked)

3. **Complete Booking**
   - Select all 5 slots (including the target slot)
   - Complete the booking process
   - Navigate to payment success

### Phase 3: Final Verification

1. **Final Availability Check**
   - Start one more booking process
   - Navigate to slot selection
   - Check if the target slot is completely gone

2. **Assertions**
   - Verify the target slot is no longer available
   - Ensure 5 unique slots are still available
   - Confirm no overlap with previously booked slot

## Key Components

### Helper Function: `getSlotEmployeeCount()`

```typescript
async function getSlotEmployeeCount(packageId: number, slotTime: string): Promise<number>
```

**Purpose**: Fetches slot data from the API to determine how many employees are available for a specific time slot.

**Process**:
1. Makes API call to `/api/v1/order/slots`
2. Parses the response to find the specific slot
3. Returns the length of `availableEmployees` array
4. Handles errors gracefully with fallback to 1 employee

**API Endpoint Structure**:
```typescript
GET /api/v1/order/slots?packageId=${id}&date=${isoDate}&customerTimezone=${tz}
Response: {
  data: {
    availableSlots: [
      { 
        slot: "2025-10-03T08:00:00.000Z", 
        availableEmployees: [
          { id: 10, name: "Faraz", email: "faraz@scalebrands.ca" },
          { id: 11, name: "John", email: "john@scalebrands.ca" }
        ]
      }
    ]
  }
}
```

### Slot Time Parsing Logic

The test includes sophisticated logic to convert UI slot text to API-compatible ISO format:

```typescript
// Input: "8:00 AM - 8:15 AM"
// Output: "2025-01-15T08:00:00.000Z"

const timeMatch = firstSlotText.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
let hours = parseInt(timeMatch[1]);
const minutes = parseInt(timeMatch[2]);
const period = timeMatch[3];

// Convert to 24-hour format
if (period === 'PM' && hours !== 12) {
  hours += 12;
} else if (period === 'AM' && hours === 12) {
  hours = 0;
}

const slotDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
const slotTimeISO = slotDate.toISOString();
```

## Test Scenarios Covered

### Scenario 1: Single Employee Slot
- **Employee Count**: 1
- **Expected Behavior**: Slot disappears after 1 booking
- **Test Flow**: Book once → Verify slot gone

### Scenario 2: Multi-Employee Slot  
- **Employee Count**: 3
- **Expected Behavior**: Slot remains available for 3 bookings, then disappears
- **Test Flow**: Book 3 times → Verify slot gone after 3rd booking

### Scenario 3: Error Handling
- **API Failure**: If slot data fetch fails
- **Expected Behavior**: Defaults to 1 employee, continues test
- **Test Flow**: Graceful degradation with fallback logic

## Assertions and Validations

1. **Slot Count Validation**
   ```typescript
   await expect(slotButtons).toHaveCount(5); // Exactly 5 slots
   expect(uniqueSlots.size).toBe(5); // All slots unique
   ```

2. **Availability Logic Validation**
   ```typescript
   const isFirstSlotStillAvailable = finalSlotTexts.includes(firstSlotText);
   expect(isFirstSlotStillAvailable).toBe(false); // Slot should be gone
   ```

3. **No Overlap Validation**
   ```typescript
   const hasOverlap = finalSlotTexts.some(slot => slot === firstSlotText);
   expect(hasOverlap).toBe(false); // No overlap with booked slot
   ```

## Error Handling

The test includes robust error handling:

1. **API Call Failures**: Falls back to 1 employee count
2. **Slot Parsing Errors**: Throws descriptive error messages
3. **Early Exit Logic**: Breaks loop if slot becomes unavailable before expected
4. **TypeScript Safety**: Properly typed all API responses

## Benefits of This Test

1. **Real-World Simulation**: Tests actual user booking scenarios
2. **API Integration**: Validates real API responses and data structures
3. **Dynamic Behavior**: Adapts to different employee configurations
4. **Comprehensive Coverage**: Tests both single and multi-employee scenarios
5. **Maintainable**: Clear structure and comprehensive logging

## Running the Test

```bash
# Run this specific test
npx playwright test tests/cart/Appointment-advacned.test.ts

# Run with UI mode for debugging
npx playwright test tests/cart/Appointment-advacned.test.ts --ui

# Run with headed browser
npx playwright test tests/cart/Appointment-advacned.test.ts --headed
```

## Dependencies

- **Playwright**: Browser automation framework
- **API Endpoint**: `/api/v1/order/slots` must be available
- **Test Environment**: Local development server on port 5173
- **Package**: 5x bundle package (ID: 5) must exist in the system

## Future Enhancements

Potential improvements for this test:

1. **Parameterized Testing**: Test multiple package types
2. **Concurrent Booking**: Test race conditions with multiple users
3. **Time Zone Testing**: Validate different timezone scenarios
4. **Performance Testing**: Measure booking response times
5. **Data Cleanup**: Automatically clean up test bookings after completion
