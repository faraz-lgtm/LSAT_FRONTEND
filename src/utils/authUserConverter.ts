import type { AuthUser } from '@/redux/authSlice'
import type { IUser } from '@/redux/apiSlices/User/userSlice'

/**
 * Convert AuthUser from auth state to IUser format for RBAC functions
 * This is needed because AuthUser has a different structure than IUser
 * 
 * @param authUser - The user from auth state
 * @returns IUser format or null if authUser is null
 */
export function convertAuthUserToIUser(authUser: AuthUser | null): IUser | null {
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
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}
