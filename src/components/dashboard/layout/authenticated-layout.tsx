import { Outlet, useNavigate, useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/store'
import { getCookie } from '@/lib/dashboardRelated/cookies'
import { cn } from '@/lib/dashboardRelated/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/dashboard/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/layout/app-sidebar'
import { SkipToMain } from '@/components/dashboard/skip-to-main'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const defaultOpen = getCookie('sidebar_state') !== 'false'

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      // Preserve the current pathname for redirect after sign-in (avoid query param loops)
      const currentPath = location.pathname
      navigate({
        to: '/sign-in',
        search: { redirect: currentPath },
        replace: true,
      })
    }
  }, [isAuthenticated, user, navigate, location.pathname])

  // Show loading spinner while checking authentication
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <SearchProvider>
      <LayoutProvider>
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
      </LayoutProvider>
    </SearchProvider>
  )
}
