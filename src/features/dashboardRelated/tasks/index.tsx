import { ConfigDrawer } from '@/components/dashboard/config-drawer'
import { Header } from '@/components/dashboard/layout/header'
import { Main } from '@/components/dashboard/layout/main'
import { ProfileDropdown } from '@/components/dashboard/profile-dropdown'
import { Search } from '@/components/dashboard/search'
import { ThemeSwitch } from '@/components/dashboard/theme-switch'
import { TasksDialogs } from './components/tasks-dialogs'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons'
import { TasksTable } from './components/tasks-table'
import { useGetTasksQuery } from '@/redux/apiSlices/Task/taskSlice'
import { useState } from 'react'
import type { TaskOutputDto, TaskQueryDto } from '@/types/api/data-contracts'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/store'
import { SelectDropdown } from '@/components/dashboard/select-dropdown'
import { useGetUsersQuery } from '@/redux/apiSlices/User/userSlice'
import { ROLE } from '@/constants/roles'
import { OrderCreateForm } from '@/components/google-calendar/OrderCreateForm'

export function Tasks() {
  const user=useSelector((state: RootState) => state.auth.user)
  const isAdmin = (user?.roles || []).includes(ROLE.ADMIN)
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery()
  const [filters, setFilters] = useState<TaskQueryDto>(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    // Set end date to end of day to include tasks on the last day of the month
    endOfMonth.setHours(23, 59, 59, 999)
    
    return {
      limit: 50,
      startDate: startOfMonth.toISOString(),
      googleCalendar:true as boolean,
      endDate: endOfMonth.toISOString(),
      tutorId: isAdmin ? undefined : user?.id
    }
  })

  // Dialog state management
  type TasksDialogOpenState = 'create' | 'import' | 'update' | 'delete' | null
  const [open, setOpen] = useState<TasksDialogOpenState>(null)
  const [currentRow, setCurrentRow] = useState<TaskOutputDto | undefined>(undefined)
  const [createOrderOpen, setCreateOrderOpen] = useState(false)

  const { data: tasksData, isSuccess, isLoading, error } = useGetTasksQuery(filters)

  console.log("Tasks data:", tasksData)
  console.log("Tasks loading:", isLoading)
  console.log("Tasks error:", error)

  let tasks: TaskOutputDto[] = []

  if (isSuccess && tasksData) {
    tasks = tasksData.data || []
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading tasks...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Error loading tasks</div>
      </div>
    )
  }

  return (<>
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
            <h2 className='text-2xl font-bold tracking-tight'>Tasks</h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of your tasks for this month!
            </p>
          </div>
          {isAdmin && (
            <div className='flex items-center gap-2'>
              <SelectDropdown
                className='min-w-[220px]'
                placeholder='Filter by tutor'
                isPending={usersLoading}
                defaultValue={filters.tutorId ? String(filters.tutorId) : undefined}
                isControlled
                onValueChange={(val) => {
                  setFilters((prev) => ({
                    ...prev,
                    tutorId: val === 'all' ? undefined : Number(val),
                  }))
                }}
                items={[
                  { label: 'All Tasks', value: 'all' },
                  ...(usersData?.data
                    ?.filter((u) => (u.roles || []).some(r => r === ROLE.USER || r === ROLE.ADMIN))
                    .map((u) => ({ label: `${u.name} (@${u.username})`, value: String(u.id) })) || []),
                ]}
              />
            </div>
          )}
          <TasksPrimaryButtons 
            onCreateTask={() => {
              setCurrentRow(undefined)
              setOpen('create')
            }}
            onCreateOrder={() => {
              setCreateOrderOpen(true)
            }}
            onImport={() => {
              setOpen('import')
            }}
          />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <TasksTable 
            data={tasks} 
            filters={filters}
            onFiltersChange={setFilters}
            onEdit={(row) => {
              setCurrentRow(row)
              setOpen('update')
            }}
            onDelete={(row) => {
              setCurrentRow(row)
              setOpen('delete')
            }}
          />
        </div>
      </Main>

      <TasksDialogs 
        open={open}
        setOpen={setOpen}
        currentRow={currentRow}
        setCurrentRow={(row) => setCurrentRow(row ?? undefined)}
      />
      <OrderCreateForm isOpen={createOrderOpen} onClose={() => setCreateOrderOpen(false)} />
      </>
  )
}
