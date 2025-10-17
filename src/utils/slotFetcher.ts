import type { Slot } from "@/types/api/data-contracts";

const BASE_URL = import.meta.env.VITE_SERVER_URL;

/**
 * Fetches available slots for a package across multiple days
 * @param packageId - The package ID to fetch slots for
 * @param requiredSlots - Number of slots needed
 * @param startDate - Starting date to search from (defaults to today)
 * @param excludeSlots - Array of already booked slots to exclude
 * @returns Promise<string[]> - Array of ISO datetime strings
 * @throws Error if not enough slots found within 30 days
 */
export async function fetchSlotsForPackage(
  packageId: number,
  requiredSlots: number,
  startDate: Date = new Date(),
  excludeSlots: string[] = []
): Promise<string[]> {
  const slots: string[] = [];
  let currentDate = new Date(startDate);
  let daysChecked = 0;
  const MAX_DAYS = 30;

  console.log(`🔍 Fetching ${requiredSlots} slots for package ${packageId} starting from ${currentDate.toDateString()}`);

  while (slots.length < requiredSlots && daysChecked < MAX_DAYS) {
    try {
      // Format date for API call
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // JavaScript months are 0-based
      const date = currentDate.getDate();

      console.log(`📅 Checking slots for ${year}-${month.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`);

      // Fetch slots for current date
      const response = await fetch(
        `${BASE_URL}/api/v1/order/slots?month=${month}&year=${year}&packageId=${packageId}&date=${date}&customerTimezone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.warn(`⚠️ Failed to fetch slots for ${currentDate.toDateString()}: ${response.status}`);
        // Continue to next day instead of throwing error
        currentDate.setDate(currentDate.getDate() + 1);
        daysChecked++;
        continue;
      }

      const data = await response.json();
      const slotData: Slot = data.data;

      if (slotData?.availableSlots && slotData.availableSlots.length > 0) {
        // Extract slot times from available slots
        const daySlots = slotData.availableSlots.map(availableSlot => availableSlot.slot);
        
        // Filter out already booked slots
        const availableDaySlots = daySlots.filter(slot => !excludeSlots.includes(slot));
        
        console.log(`✅ Found ${daySlots.length} slots for ${currentDate.toDateString()}, ${availableDaySlots.length} available after filtering`);
        
        // Add available slots to our collection
        slots.push(...availableDaySlots);
        
        console.log(`📊 Total slots collected so far: ${slots.length}/${requiredSlots}`);
      } else {
        console.log(`❌ No slots available for ${currentDate.toDateString()}`);
      }

    } catch (error) {
      console.error(`❌ Error fetching slots for ${currentDate.toDateString()}:`, error);
      // Continue to next day instead of throwing error
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
    daysChecked++;
  }

  // Check if we have enough slots
  if (slots.length < requiredSlots) {
    const errorMessage = `Not enough slots available within the next 30 days. Found ${slots.length} slots but need ${requiredSlots}.`;
    console.error(`❌ ${errorMessage}`);
    throw new Error(errorMessage);
  }

  // Return only the required number of slots
  const finalSlots = slots.slice(0, requiredSlots);
  console.log(`🎉 Successfully fetched ${finalSlots.length} slots for package ${packageId}`);
  
  return finalSlots;
}

/**
 * Helper function to get authentication token from Redux store
 * This will be used when we need to make authenticated requests
 */
export function getAuthToken(): string | null {
  // This will be implemented when we integrate with Redux store
  // For now, we'll rely on the API's token refresh mechanism
  return null;
}
