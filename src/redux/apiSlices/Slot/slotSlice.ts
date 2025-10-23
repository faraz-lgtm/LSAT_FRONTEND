import type { BaseApiResponse } from "../../../shared/BaseApiResponse";
import { api } from "../../api";
import type { Slot, SlotsQueryDto } from "../../../types/api/data-contracts";

/**
 * Slots API Slice
 * 
 * Handles all slot-related API operations including:
 * - Fetching available slots for a specific date and package
 * - Managing slot availability and employee assignments
 * 
 * API Endpoint: /api/v1/slots
 * 
 * @example
 * ```typescript
 * // Fetch available slots for a package on a specific date
 * const { data, error, isLoading } = useGetAvailableSlotsQuery({
 *   packageId: 5,
 *   date: "2025-01-15T00:00:00.000Z",
 *   customerTimezone: "America/New_York"
 * });
 * ```
 */
export const slotsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get available slots for a specific package and date
     * 
     * @param params - Query parameters for slot availability
     * @param params.packageId - Service/package ID
     * @param params.date - Date in ISO 8601 format (UTC timezone)
     * @param params.customerTimezone - Customer timezone (optional)
     * @returns Promise<BaseApiResponse<Slot>>
     * 
     * @example
     * ```typescript
     * const slots = await getAvailableSlots({
     *   packageId: 5,
     *   date: "2025-01-15T00:00:00.000Z",
     *   customerTimezone: "America/New_York"
     * });
     * ```
     */
    getAvailableSlots: builder.query<BaseApiResponse<Slot>, SlotsQueryDto>({
      query: ({ packageId, date, customerTimezone }) => ({
        url: `/slots`,
        params: { 
          packageId, 
          date,
          customerTimezone: customerTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone
        },
      }),
      providesTags: ['AvailableSlots'],
    }),


  }),
});

// Export hooks for use in components
export const { 
  useGetAvailableSlotsQuery,
} = slotsApi;

// Export the API slice for use in store configuration
export default slotsApi;
