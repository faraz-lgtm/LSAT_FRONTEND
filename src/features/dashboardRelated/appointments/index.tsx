import { ConfigDrawer } from '@/components/dashboard/config-drawer'
import { Header } from '@/components/dashboard/layout/header'
import { Main } from '@/components/dashboard/layout/main'
import { ProfileDropdown } from '@/components/dashboard/profile-dropdown'
import { Search } from '@/components/dashboard/search'
import { ThemeSwitch } from '@/components/dashboard/theme-switch'
import { AppointmentsTable } from './components/appointments-table'
import { useGetOrderAppointmentsQuery, type OrderAppointmentQueryDto } from '@/redux/apiSlices/OrderAppointment/orderAppointmentSlice'
import { useState } from 'react'
import type { TaskOutputDto, UserOutput } from '@/types/api/data-contracts'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/store'
import { useGetUsersQuery } from '@/redux/apiSlices/User/userSlice'
import { isAdminOrSuperAdmin } from '@/utils/rbac'
import { AppointmentsViewDialog } from '@/features/dashboardRelated/tasks/components/appointments-view-dialog'

export function Appointments() {
  const user = useSelector((state: RootState) => state.auth.user)
  const isAdmin = isAdminOrSuperAdmin(user?.roles)
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({})
  const [filters, setFilters] = useState<OrderAppointmentQueryDto>(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    endOfMonth.setHours(23, 59, 59, 999)
    
    return {
      limit: 50,
      startDate: startOfMonth.toISOString(),
      endDate: endOfMonth.toISOString(),
      assignedEmployeeId: isAdmin ? undefined : user?.id ? Number(user.id) : undefined
    }
  })

  // Dialog state management
  type AppointmentsDialogOpenState = 'view' | null
  const [open, setOpen] = useState<AppointmentsDialogOpenState>(null)
  const [currentRow, setCurrentRow] = useState<TaskOutputDto | undefined>(undefined)

  const { data: appointmentsData, isSuccess, isLoading, error } = useGetOrderAppointmentsQuery(filters)

  let appointments: TaskOutputDto[] = []

  if (isSuccess && appointmentsData) {
    appointments = appointmentsData.data || []
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading appointments...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Error loading appointments</div>
      </div>
    )
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Appointments</h2>
            <p className='text-muted-foreground'>
              View and manage customer appointments from orders.
            </p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <AppointmentsTable 
            data={appointments} 
            filters={filters}
            onFiltersChange={setFilters}
            onView={(row) => {
              setCurrentRow(row)
              setOpen('view')
            }}
            isAdmin={isAdmin}
            usersData={usersData}
            usersLoading={usersLoading}
          />
        </div>
      </Main>

      {currentRow && (
        <AppointmentsViewDialog
          currentRow={currentRow}
          open={open === 'view'}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(undefined)
              }, 500)
            } else {
              setOpen('view')
            }
          }}
          userIdToUser={(usersData?.data || []).reduce<Record<number, UserOutput>>((acc, u) => {
            acc[u.id] = u
            return acc
          }, {})}
          emailToUser={(usersData?.data || []).reduce<Record<string, UserOutput>>((acc, u) => {
            if (u.email) {
              acc[u.email.toLowerCase()] = u
            }
            return acc
          }, {})}
        />
      )}
    </>
  )
}

