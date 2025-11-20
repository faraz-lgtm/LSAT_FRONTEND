import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Suspense } from 'react'
import { Toaster } from '@/components/dashboard/ui/sonner'
import { NavigationProgress } from '@/components/dashboard/navigation-progress'
import { GeneralError } from '@/features/dashboardRelated/errors/general-error'
import { NotFoundError } from '@/features/dashboardRelated/errors/not-found-error'

// Loading fallback for lazy-loaded routes
const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
)

export const Route = createRootRoute({
  component: () => {
    return (
      <>
        <NavigationProgress />
        <Suspense fallback={<RouteLoader />}>
          <Outlet />
        </Suspense>
        <Toaster duration={5000} />
        {import.meta.env.MODE === 'development' && (
          <TanStackRouterDevtools position='bottom-right' />
        )}
      </>
    )
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})
