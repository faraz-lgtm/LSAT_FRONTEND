import type { AuthUser } from '@/redux/authSlice'
import type { UserOutput } from '@/types/api/data-contracts'

/**
 * Convert AuthUser from auth state to UserOutput format for RBAC functions
 * This is needed because AuthUser has a different structure than UserOutput
 * 
 * @param authUser - The user from auth state
 * @returns UserOutput format or null if authUser is null
 */
export function convertAuthUserToIUser(authUser: AuthUser | null): UserOutput | null {
  if (!authUser) {
    return null
  }

  return {
    id: authUser.id,
    name: authUser.username, // Using username as name since AuthUser doesn't have name
    username: authUser.username,
    roles: authUser.roles || [], // Convert string[] to ROLE[], handle undefined case
    email: '', // AuthUser doesn't have email
    isAccountDisabled: false,
    phone: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastAssignedOrderCount: 0,
    ordersCount: 0, // AuthUser doesn't have orders data, default to 0
  }
}
