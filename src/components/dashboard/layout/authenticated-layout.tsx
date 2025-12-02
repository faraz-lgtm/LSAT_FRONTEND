import { Outlet, useNavigate, useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/store'
import { getCookie } from '@/lib/dashboardRelated/cookies'
import { cn } from '@/lib/dashboardRelated/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { EventsProvider } from '@/context/event-context'
import { SidebarInset, SidebarProvider } from '@/components/dashboard/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/layout/app-sidebar'
import { SkipToMain } from '@/components/dashboard/skip-to-main'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user, refreshToken } = useSelector((state: RootState) => state.auth)
  const defaultOpen = getCookie('sidebar_state') !== 'false'

  useEffect(() => {
    // Only redirect if we truly have no way to authenticate
    // If we have refreshToken but no user yet, allow app to load
    // User will be populated after first API call triggers token refresh
    if (!isAuthenticated && !refreshToken) {
      // Preserve the current pathname for redirect after sign-in (avoid query param loops)
      const currentPath = location.pathname
      navigate({
        to: '/sign-in',
        search: { redirect: currentPath },
        replace: true,
      })
    }
  }, [isAuthenticated, refreshToken, navigate, location.pathname])

  // Show loading spinner only if we have no way to authenticate
  // If we have refreshToken, allow app to load (user will be populated after refresh)
  if (!isAuthenticated && !refreshToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <SearchProvider>
      <LayoutProvider>
        <EventsProvider>
          <SidebarProvider defaultOpen={defaultOpen}>
            <SkipToMain />
            <AppSidebar />
            <SidebarInset
              className={cn(
                // Set content container, so we can use container queries
                '@container/content',

                // If layout is fixed, set the height
                // to 100svh to prevent overflow
                'has-[[data-layout=fixed]]:h-svh',

                // If layout is fixed and sidebar is inset,
                // set the height to 100svh - spacing (total margins) to prevent overflow
                'peer-data-[variant=inset]:has-[[data-layout=fixed]]:h-[calc(100svh-(var(--spacing)*4))]'
              )}
            >
              {children ?? <Outlet />}
            </SidebarInset>
          </SidebarProvider>
        </EventsProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
