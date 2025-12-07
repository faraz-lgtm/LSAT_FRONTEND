import { ROLE } from '@/constants/roles'
import type { UserOutput } from '@/types/api/data-contracts'

/**
 * Check if user has ADMIN, COMPANY_ADMIN, or SUPER_ADMIN role
 * Helper function to check if user has admin-level permissions
 * COMPANY_ADMIN has the same access as ADMIN
 * 
 * @param userRoles - Array of user roles
 * @returns boolean indicating if user is admin, company admin, or super admin
 */
export function isAdminOrSuperAdmin(userRoles: string[] | undefined | null): boolean {
  if (!userRoles) return false
  return userRoles.includes(ROLE.ADMIN) || 
         (userRoles as string[]).includes('COMPANY_ADMIN') ||
         (userRoles as string[]).includes('SUPER_ADMIN')
}

/**
 * Check if user has COMPANY_ADMIN or SUPER_ADMIN role
 * Used for features that only COMPANY_ADMIN and SUPER_ADMIN can access (Packages, Automations)
 * Regular ADMIN cannot access these features
 * 
 * @param userRoles - Array of user roles
 * @returns boolean indicating if user is company admin or super admin
 */
export function isCompanyAdminOrSuperAdmin(userRoles: string[] | undefined | null): boolean {
  if (!userRoles) return false
  return (userRoles as string[]).includes('COMPANY_ADMIN') ||
         (userRoles as string[]).includes('SUPER_ADMIN')
}

/**
 * Check if current user can edit a target user based on role-based access control
 * 
 * Rules:
 * - SUPER_ADMIN: Can edit anyone (including themselves)
 * - ADMIN: Can edit themselves, CUSTOMER, and USER (cannot edit other admins or super admin)
 * - USER: Can edit CUSTOMER and themselves
 * - CUSTOMER: Cannot edit anyone (they don't use dashboard)
 * 
 * @param currentUser - The currently authenticated user
 * @param targetUser - The user being targeted for edit
 * @returns boolean indicating if the action is allowed
 */
export function canEditUser(currentUser: UserOutput | null, targetUser: UserOutput): boolean {
  if (!currentUser || !currentUser.roles) {
    return false
  }

  const currentUserRoles = currentUser.roles
  const targetUserRoles = targetUser.roles || []
  const isCurrentUser = currentUser.id === targetUser.id
  const isTargetAdmin = targetUserRoles.includes(ROLE.ADMIN)
  const isTargetSuperAdmin = (targetUserRoles as string[]).includes('SUPER_ADMIN')
  const isTargetCustomer = targetUserRoles.includes(ROLE.CUSTOMER)
  const isTargetUser = targetUserRoles.includes(ROLE.USER)
  const isCurrentUserSuperAdmin = (currentUserRoles as string[]).includes('SUPER_ADMIN')
  const isCurrentUserAdmin = currentUserRoles.includes(ROLE.ADMIN)

  // SUPER_ADMIN can edit anyone (including themselves)
  if (isCurrentUserSuperAdmin) {
    return true
  }

  // ADMIN can edit themselves, CUSTOMER, and USER (cannot edit other admins or super admin)
  if (isCurrentUserAdmin) {
    if (isCurrentUser) {
      return true // Can edit themselves
    }
    // Cannot edit other admins or super admin
    if (isTargetAdmin || isTargetSuperAdmin) {
      return false
    }
    // Can edit CUSTOMER and USER
    return isTargetCustomer || isTargetUser
  }

  // USER can edit CUSTOMER and themselves
  if (currentUserRoles.includes(ROLE.USER)) {
    return isCurrentUser || isTargetCustomer
  }

  // CUSTOMER cannot edit anyone
  return false
}

/**
 * Check if current user can delete a target user based on role-based access control
 * 
 * Rules:
 * - SUPER_ADMIN: Can delete anyone except themselves
 * - ADMIN: Can delete CUSTOMER and USER (cannot delete themselves, other admins, or super admin)
 * - USER: Can delete CUSTOMER only (not themselves)
 * - CUSTOMER: Cannot delete anyone (they don't use dashboard)
 * 
 * @param currentUser - The currently authenticated user
 * @param targetUser - The user being targeted for delete
 * @returns boolean indicating if the action is allowed
 */
export function canDeleteUser(currentUser: UserOutput | null, targetUser: UserOutput): boolean {
  if (!currentUser || !currentUser.roles) {
    return false
  }

  // Cannot delete yourself
  if (currentUser.id === targetUser.id) {
    return false
  }

  const currentUserRoles = currentUser.roles
  const targetUserRoles = targetUser.roles || []
  const isTargetAdmin = targetUserRoles.includes(ROLE.ADMIN)
  const isTargetSuperAdmin = (targetUserRoles as string[]).includes('SUPER_ADMIN')
  const isTargetCustomer = targetUserRoles.includes(ROLE.CUSTOMER)
  const isTargetUser = targetUserRoles.includes(ROLE.USER)
  const isCurrentUserSuperAdmin = (currentUserRoles as string[]).includes('SUPER_ADMIN')
  const isCurrentUserAdmin = currentUserRoles.includes(ROLE.ADMIN)

  // SUPER_ADMIN can delete anyone except themselves
  if (isCurrentUserSuperAdmin) {
    return true
  }

  // ADMIN can delete CUSTOMER and USER (cannot delete themselves, other admins, or super admin)
  if (isCurrentUserAdmin) {
    // Cannot delete other admins or super admin
    if (isTargetAdmin || isTargetSuperAdmin) {
      return false
    }
    // Can delete CUSTOMER and USER
    return isTargetCustomer || isTargetUser
  }

  // USER can only delete CUSTOMER
  if (currentUserRoles.includes(ROLE.USER)) {
    return isTargetCustomer
  }

  // CUSTOMER cannot delete anyone
  return false
}

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
 * - SUPER_ADMIN: Can add any user
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

  // SUPER_ADMIN and ADMIN can add any user
  if (isAdminOrSuperAdmin(currentUserRoles)) {
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
 * - SUPER_ADMIN: Can assign any role
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

  // SUPER_ADMIN and ADMIN can assign any role
  if (isAdminOrSuperAdmin(currentUserRoles)) {
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
 * - SUPER_ADMIN: Can see all users
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

  // SUPER_ADMIN and ADMIN can see all users
  if (isAdminOrSuperAdmin(currentUserRoles)) {
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
