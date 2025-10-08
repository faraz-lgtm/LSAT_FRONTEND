import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from '@/components/dashboard/ui/sonner'
import { NavigationProgress } from '@/components/dashboard/navigation-progress'
import { GeneralError } from '@/features/dashboardRelated/errors/general-error'
import { NotFoundError } from '@/features/dashboardRelated/errors/not-found-error'

export const Route = createRootRoute({
  component: () => {
    return (
      <>
        <NavigationProgress />
        <Outlet />
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
