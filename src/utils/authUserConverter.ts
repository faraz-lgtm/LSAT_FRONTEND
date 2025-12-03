import type { AuthUser } from '@/redux/authSlice'
import type { UserOutput } from '@/types/api/data-contracts'

/**
 * Convert AuthUser from auth state to UserOutput format for RBAC functions
 * This is needed because AuthUser has a different structure than UserOutput
 * 
 * @param authUser - The user from auth state
 * @param organizationId - Optional organization ID from auth state
 * @returns UserOutput format or null if authUser is null
 */
export function convertAuthUserToIUser(authUser: AuthUser | null, organizationId?: number | null): UserOutput | null {
  if (!authUser) {
    return null
  }

  return {
    id: authUser.id,
    name: authUser.username, // Using username as name since AuthUser doesn't have name
    username: authUser.username,
    // Filter out SUPER_ADMIN since UserOutput.roles type only allows "USER" | "ADMIN" | "CUST"
    roles: (authUser.roles || []) || [],
    email: '', // AuthUser doesn't have email
    isAccountDisabled: false,
    phone: '',
    organizationId: organizationId || 0, // Default to 0 if not provided
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastAssignedOrderCount: 0,
    ordersCount: 0, // AuthUser doesn't have orders data, default to 0
    googleCalendarIntegration: false, // Default to false since AuthUser doesn't have this info
    hasPaidOrder: false, // Default to false since AuthUser doesn't have this info
  }
}
