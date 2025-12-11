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

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { user } = useSelector((state: RootState) => state.auth)
  const isAdmin = isAdminOrSuperAdmin(user?.roles) || false
  // Check for SUPER_ADMIN role
  const isSuperAdmin = user?.roles?.some(role => 
    role === ROLE.SUPER_ADMIN
  ) || false
  // Check for COMPANY_ADMIN or SUPER_ADMIN (for Packages and Automations)
  const isCompanyAdmin = isCompanyAdminOrSuperAdmin(user?.roles) || false

  // Filter sidebar items based on user role
  const filteredNavGroups = useMemo(() => {
    return sidebarData.navGroups.map((group) => {
      return {
        ...group,
        items: group.items.filter((item) => {
          // Hide items marked as hideForSuperAdmin for super-admin users
          if (item.hideForSuperAdmin && isSuperAdmin) {
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
          // Hide items marked as superAdminOnly for non-super-admin users
          if (item.superAdminOnly && !isSuperAdmin) {
            return false
          }
          return true
        }),
      }
    }).filter((group) => group.items.length > 0) // Remove empty groups
  }, [isAdmin, isSuperAdmin, isCompanyAdmin])

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
