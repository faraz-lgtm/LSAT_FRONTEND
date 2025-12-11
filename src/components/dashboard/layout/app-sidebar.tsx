import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/dashboard/ui/sidebar'
// import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/store'
import { isAdminOrSuperAdmin, isCompanyAdminOrSuperAdmin } from '@/utils/rbac'
import { ROLE } from '@/constants/roles'
import { useMemo } from 'react'
import { useLocation } from '@tanstack/react-router'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const location = useLocation()
  const { user, organizationId } = useSelector((state: RootState) => state.auth)
  const isAdmin = isAdminOrSuperAdmin(user?.roles) || false
  // Check for SUPER_ADMIN role
  const isSuperAdmin = user?.roles?.some(role => 
    role === ROLE.SUPER_ADMIN
  ) || false
  // Check for COMPANY_ADMIN or SUPER_ADMIN (for Packages and Automations)
  const isCompanyAdmin = isCompanyAdminOrSuperAdmin(user?.roles) || false
  
  // Check if we're on a super-admin route
  const isOnSuperAdminRoute = location.pathname.startsWith('/super-admin')
  // If super admin has an organization selected, treat as regular dashboard
  const isSuperAdminInOrgMode = isSuperAdmin && organizationId && !isOnSuperAdminRoute

  // Filter sidebar items based on user role and current route
  const filteredNavGroups = useMemo(() => {
    return sidebarData.navGroups.map((group) => {
      return {
        ...group,
        items: group.items.filter((item) => {
          // Show superAdminOnly items only when on super-admin routes
          if (item.superAdminOnly && !isOnSuperAdminRoute) {
            return false
          }
          // Hide superAdminOnly items for non-super-admin users
          if (item.superAdminOnly && !isSuperAdmin) {
            return false
          }
          // Hide items marked as hideForSuperAdmin when on super-admin routes
          // But show them when super admin is in org mode (has organization selected)
          if (item.hideForSuperAdmin && isSuperAdmin && isOnSuperAdminRoute) {
            return false
          }
          // Hide Packages for non-company-admin users (only COMPANY_ADMIN and SUPER_ADMIN can see)
          if (item.title === 'Packages' && !isCompanyAdmin) {
            return false
          }
          // Hide "Automations" item (but keep "Automation Logs") for non-company-admin users
          // Only COMPANY_ADMIN and SUPER_ADMIN can see Automations
          if (group.title === 'Automations' && item.title === 'Automations' && !isCompanyAdmin) {
            return false
          }
          return true
        }),
      }
    }).filter((group) => group.items.length > 0) // Remove empty groups
  }, [isAdmin, isSuperAdmin, isCompanyAdmin, isOnSuperAdminRoute, isSuperAdminInOrgMode])

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />

        {/* Replace <TeamSwitch /> with the following <AppTitle />
         /* if you want to use the normal app title instead of TeamSwitch dropdown */}
        {/* <AppTitle /> */}
      </SidebarHeader>
      <SidebarContent>
        {filteredNavGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
