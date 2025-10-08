import { createFileRoute } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/dashboard/config-drawer'
import { Header } from '@/components/dashboard/layout/header'
import { ProfileDropdown } from '@/components/dashboard/profile-dropdown'
import { Search } from '@/components/dashboard/search'
import { ThemeSwitch } from '@/components/dashboard/theme-switch'
import { ForbiddenError } from '@/features/dashboardRelated/errors/forbidden'
import { GeneralError } from '@/features/dashboardRelated/errors/general-error'
import { MaintenanceError } from '@/features/dashboardRelated/errors/maintenance-error'
import { NotFoundError } from '@/features/dashboardRelated/errors/not-found-error'
import { UnauthorisedError } from '@/features/dashboardRelated/errors/unauthorized-error'

export const Route = createFileRoute('/_authenticated/errors/$error')({
  component: RouteComponent,
})

function RouteComponent() {
  const { error } = Route.useParams()

  const errorMap: Record<string, React.ComponentType> = {
    unauthorized: UnauthorisedError,
    forbidden: ForbiddenError,
    'not-found': NotFoundError,
    'internal-server-error': GeneralError,
    'maintenance-error': MaintenanceError,
  }
  const ErrorComponent = errorMap[error] || NotFoundError

  return (
    <>
      <Header fixed className='border-b'>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <div className='flex-1 [&>div]:h-full'>
        <ErrorComponent />
      </div>
    </>
  )
}
