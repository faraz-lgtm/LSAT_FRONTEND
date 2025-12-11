import * as React from 'react'
import { ChevronsUpDown, Building2, Shield } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/dashboard/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/dashboard/ui/sidebar'
import { useGetAllOrganizationsQuery, useGetMyOrganizationQuery } from '@/redux/apiSlices/Organization/organizationSlice'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '@/redux/store'
import { setOrganization } from '@/redux/authSlice'
import { ROLE } from '@/constants/roles'
import { Loader2 } from 'lucide-react'
import { useLocation, useNavigate } from '@tanstack/react-router'

type TeamSwitcherProps = {
  teams?: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}

export function TeamSwitcher({ teams: fallbackTeams }: TeamSwitcherProps) {
  const { isMobile } = useSidebar()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, organizationId } = useSelector((state: RootState) => state.auth)
  
  // Check if user is SUPER_ADMIN
  const isSuperAdmin = user?.roles?.some(role => 
    role === ROLE.SUPER_ADMIN
  ) || false
  
  // Check if we're on a super-admin route
  const isOnSuperAdminRoute = location.pathname.startsWith('/super-admin')

  // Fetch all organizations for Super Admin (without domain filter for switcher)
  const { data: allOrganizationsData, isLoading: isLoadingAll } = useGetAllOrganizationsQuery(
    undefined, // Pass undefined to fetch all organizations (no hasDomain filter)
    {
      skip: !isSuperAdmin,
    }
  )

  // Fetch current organization for non-Super Admins
  const { data: myOrganizationData, isLoading: isLoadingMy } = useGetMyOrganizationQuery(undefined, {
    skip: isSuperAdmin,
  })

  // Determine which organizations to show
  const organizations = React.useMemo(() => {
    if (isSuperAdmin && allOrganizationsData?.data) {
      return allOrganizationsData.data
    } else if (!isSuperAdmin && myOrganizationData?.data) {
      return [myOrganizationData.data]
    }
    return []
  }, [isSuperAdmin, allOrganizationsData, myOrganizationData])

  // Find active organization
  const activeOrganization = React.useMemo(() => {
    // If on super-admin route, no active organization
    if (isOnSuperAdminRoute) return null
    if (organizations.length === 0) return null
    // For Super Admin, use the one matching current organizationId, or first one
    if (isSuperAdmin) {
      return organizations.find(org => org.id === organizationId) || organizations[0]
    }
    // For non-Super Admin, use their organization
    return organizations[0]
  }, [organizations, organizationId, isSuperAdmin, isOnSuperAdminRoute])

  const isLoading = isSuperAdmin ? isLoadingAll : isLoadingMy

  // Handle organization switch
  const handleOrganizationSwitch = React.useCallback((org: typeof activeOrganization) => {
    if (!org) return
    
    // Update Redux state and cookies
    dispatch(setOrganization({
      organizationId: org.id,
      organizationSlug: org.slug,
    }))

    // If on super-admin route, navigate to dashboard
    if (isOnSuperAdminRoute) {
      navigate({ to: '/' })
      // Reload to apply the new organization context
      setTimeout(() => window.location.reload(), 100)
    } else {
      // Reload the page to apply the new organization context
      window.location.reload()
    }
  }, [dispatch, navigate, isOnSuperAdminRoute])
  
  // Handle going back to Admin Dashboard
  const handleGoToAdminDashboard = React.useCallback(() => {
    // Clear organization selection
    dispatch(setOrganization({
      organizationId: null,
      organizationSlug: null,
    }))
    navigate({ to: '/super-admin' })
    setTimeout(() => window.location.reload(), 100)
  }, [dispatch, navigate])

  // Convert organizations to teams format for display
  const teams = React.useMemo(() => {
    if (organizations.length > 0) {
      return organizations.map(org => ({
        name: org.name,
        logo: Building2, // Use Building2 icon for all organizations
        plan: org.domain || org.slug || 'No domain',
        id: org.id,
        slug: org.slug,
      }))
    }
    // Show fallback teams if organizations haven't loaded yet
    if (fallbackTeams && fallbackTeams.length > 0) {
      return fallbackTeams.map(team => ({
        ...team,
        id: team.name.toLowerCase().replace(/\s+/g, '-'),
        slug: team.name.toLowerCase().replace(/\s+/g, '-'),
      }))
    }
    return []
  }, [organizations, fallbackTeams])

  // Show loading state
  if (isLoading && organizations.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' disabled>
            <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
              <Loader2 className='size-4 animate-spin' />
            </div>
            <div className='grid flex-1 text-start text-sm leading-tight'>
              <span className='truncate font-semibold'>Loading...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // If no organizations found, show fallback or nothing
  if (teams.length === 0) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              disabled={!isSuperAdmin && teams.length === 1}
            >
              <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                {isOnSuperAdminRoute 
                  ? React.createElement(Shield, { className: 'size-4' })
                  : activeOrganization && React.createElement(Building2, { className: 'size-4' })
                }
              </div>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {isOnSuperAdminRoute 
                    ? 'Admin Dashboard' 
                    : activeOrganization 
                      ? activeOrganization.name 
                      : 'No organization'}
                </span>
                <span className='truncate text-xs'>
                  {isOnSuperAdminRoute 
                    ? 'Global Administration' 
                    : activeOrganization 
                      ? (activeOrganization.domain || activeOrganization.slug || 'No domain') 
                      : ''}
                </span>
              </div>
              <ChevronsUpDown className='ms-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-muted-foreground text-xs'>
              {isSuperAdmin ? 'Switch View' : 'Organizations'}
            </DropdownMenuLabel>
            {isSuperAdmin && (
              <>
                <DropdownMenuItem
                  onClick={handleGoToAdminDashboard}
                  className='gap-2 p-2'
                  disabled={isOnSuperAdminRoute}
                >
                  <div className='flex size-6 items-center justify-center rounded-sm border'>
                    <Shield className='size-4 shrink-0' />
                  </div>
                  <div className='flex-1'>
                    <div className='font-medium'>Admin Dashboard</div>
                    <div className='text-xs text-muted-foreground'>
                      Global Administration
                    </div>
                  </div>
                  {isOnSuperAdminRoute && (
                    <span className='text-xs text-muted-foreground'>Current</span>
                  )}
                </DropdownMenuItem>
                {organizations.length > 0 && <DropdownMenuSeparator />}
              </>
            )}
            {organizations.length === 0 ? (
              <DropdownMenuItem disabled className='gap-2 p-2'>
                <div className='text-sm text-muted-foreground'>No organizations found</div>
              </DropdownMenuItem>
            ) : (
              organizations.map((org, index) => {
                  const isActive = org.id === activeOrganization?.id
                  return (
                    <DropdownMenuItem
                      key={org.id}
                      onClick={() => handleOrganizationSwitch(org)}
                      className='gap-2 p-2'
                      disabled={isActive}
                    >
                      <div className='flex size-6 items-center justify-center rounded-sm border'>
                        <Building2 className='size-4 shrink-0' />
                      </div>
                      <div className='flex-1'>
                        <div className='font-medium'>{org.name}</div>
                        <div className='text-xs text-muted-foreground'>
                          {org.domain || org.slug || 'No domain'}
                        </div>
                      </div>
                      {isActive && (
                        <span className='text-xs text-muted-foreground'>Current</span>
                      )}
                      {!isActive && (
                        <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                      )}
                    </DropdownMenuItem>
                  )
                })
              )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
