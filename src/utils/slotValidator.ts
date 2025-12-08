import type { ItemInput } from "@/types/api/data-contracts";
import type { Slot } from "@/types/api/data-contracts";

const BASE_URL = import.meta.env.VITE_SERVER_URL;

export interface SlotValidationResult {
  isValid: boolean;
  unavailableSlots: string[];
  availableSlots: string[];
}

/**
 * Validates if the selected DateTime slots for a cart item are still available
 * @param item - Cart item with selected DateTime slots
 * @returns Promise<SlotValidationResult> - Validation result with available/unavailable slots
 */
export async function validateCartItemSlots(item: ItemInput): Promise<SlotValidationResult> {
  if (!item.DateTime || item.DateTime.length === 0) {
    return {
      isValid: true,
      unavailableSlots: [],
      availableSlots: []
    };
  }

  try {
    console.log(`🔍 Validating ${item.DateTime.length} slots for package ${item.id}`);
    
    // Get all unique dates from the selected slots
    const selectedDates = new Set(
      item.DateTime
        .filter((slot: SlotInput) => slot && slot.dateTime)
        .map((slot: SlotInput) => new Date(slot.dateTime).toISOString())
    );
    
    // Fetch available slots for all dates
    const allAvailableSlots: string[] = [];
    
    for (const dateStr of selectedDates) {
      try {
        const response = await fetch(
          `${BASE_URL}/api/v1/slots?packageId=${item.id}&date=${dateStr}&customerTimezone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const slotData: Slot = data.data;
          
          if (slotData?.availableSlots && slotData.availableSlots.length > 0) {
            const daySlots = slotData.availableSlots.map(availableSlot => availableSlot.slot);
            allAvailableSlots.push(...daySlots);
            console.log(`✅ Found ${daySlots.length} available slots for ${dateStr}`);
          } else {
            console.log(`❌ No slots available for ${dateStr}`);
          }
        } else {
          console.warn(`⚠️ Failed to fetch slots for ${dateStr}: ${response.status}`);
        }
      } catch (error) {
        console.error(`❌ Error fetching slots for ${dateStr}:`, error);
      }
    }
    
    // Check which selected slots are no longer available
    const unavailableSlots = item.DateTime
      .filter((slot: SlotInput) => slot && slot.dateTime)
      .filter((slot: SlotInput) => !allAvailableSlots.includes(slot.dateTime))
      .map((slot: SlotInput) => slot.dateTime);
    
    const isValid = unavailableSlots.length === 0;
    
    console.log(`📊 Validation result for package ${item.id}:`, {
      totalSelected: item.DateTime.length,
      unavailable: unavailableSlots.length,
      isValid
    });
    
    return {
      isValid,
      unavailableSlots,
      availableSlots: allAvailableSlots
    };
    
  } catch (error) {
    console.error(`❌ Error validating slots for package ${item.id}:`, error);
    // If validation fails, assume slots are invalid to be safe
    return {
      isValid: false,
      unavailableSlots: item.DateTime || [],
      availableSlots: []
    };
  }
}
