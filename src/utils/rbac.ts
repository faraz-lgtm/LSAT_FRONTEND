import { ROLE } from '@/constants/roles'
import type { UserOutput } from '@/types/api/data-contracts'

/**
 * Check if current user can edit/delete a target user based on role-based access control
 * 
 * Rules:
 * - ADMIN: Can edit/delete any user except themselves
 * - USER: Can edit/delete CUSTOMER only
 * - CUSTOMER: Cannot edit/delete anyone (they don't use dashboard)
 * 
 * @param currentUser - The currently authenticated user
 * @param targetUser - The user being targeted for edit/delete
 * @returns boolean indicating if the action is allowed
 */
export function canEditOrDeleteUser(currentUser: UserOutput | null, targetUser: UserOutput): boolean {
  if (!currentUser || !currentUser.roles) {
    return false
  }

  // Cannot edit/delete yourself
  if (currentUser.id === targetUser.id) {
    return false
  }

  const currentUserRoles = currentUser.roles
  const targetUserRoles = targetUser.roles || []

  // ADMIN can edit/delete any user except themselves
  if (currentUserRoles.includes(ROLE.ADMIN)) {
    return true
  }

  // USER can only edit/delete CUSTOMER
  if (currentUserRoles.includes(ROLE.USER)) {
    return targetUserRoles.includes(ROLE.CUSTOMER)
  }

  // CUSTOMER cannot edit/delete anyone
  return false
}

/**
 * Check if current user can add new users
 * 
 * Rules:
 * - ADMIN: Can add any user
 * - USER: Can add CUSTOMER only
 * - CUSTOMER: Cannot add users
 * 
 * @param currentUser - The currently authenticated user
 * @returns boolean indicating if adding users is allowed
 */
export function canAddUser(currentUser: UserOutput | null): boolean {
  if (!currentUser || !currentUser.roles) {
    return false
  }

  const currentUserRoles = currentUser.roles

  // ADMIN can add any user
  if (currentUserRoles.includes(ROLE.ADMIN)) {
    return true
  }

  // USER can add CUSTOMER only
  if (currentUserRoles.includes(ROLE.USER)) {
    return true // USER can add CUSTOMER
  }

  // CUSTOMER cannot add users
  return false
}

/**
 * Get available roles that current user can assign to new users
 * 
 * Rules:
 * - ADMIN: Can assign any role
 * - USER: Can only assign CUSTOMER role
 * - CUSTOMER: Cannot assign roles
 * 
 * @param currentUser - The currently authenticated user
 * @returns Array of roles that can be assigned
 */
export function getAvailableRolesForNewUser(currentUser: UserOutput | null): ROLE[] {
  if (!currentUser || !currentUser.roles) {
    return []
  }

  const currentUserRoles = currentUser.roles

  // ADMIN can assign any role
  if (currentUserRoles.includes(ROLE.ADMIN)) {
    return [ROLE.ADMIN, ROLE.USER, ROLE.CUSTOMER]
  }

  // USER can only assign CUSTOMER role
  if (currentUserRoles.includes(ROLE.USER)) {
    return [ROLE.CUSTOMER]
  }

  // CUSTOMER cannot assign roles
  return []
}

/**
 * Filter users based on current user's role
 * 
 * Rules:
 * - ADMIN: Can see all users
 * - USER: Can see USER and CUSTOMER
 * - CUSTOMER: Cannot see anyone (they don't use dashboard)
 * 
 * @param users - Array of all users
 * @param currentUser - The currently authenticated user
 * @returns Filtered array of users
 */
export function filterUsersByRole(users: UserOutput[], currentUser: UserOutput | null): UserOutput[] {
  if (!currentUser || !currentUser.roles) {
    return []
  }

  const currentUserRoles = currentUser.roles

  // ADMIN can see all users
  if (currentUserRoles.includes(ROLE.ADMIN)) {
    return users
  }

  // USER can see USER and CUSTOMER
  if (currentUserRoles.includes(ROLE.USER)) {
    return users.filter(user => 
      (user.roles || []).includes(ROLE.USER) || 
      (user.roles || []).includes(ROLE.CUSTOMER)
    )
  }

  // CUSTOMER cannot see anyone
  return []
}
