import { useEffect, useState, useRef } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useTableUrlState } from '@/hooks/dashboardRelated/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/dashboard/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/dashboard/data-table'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { createTasksColumns } from './tasks-columns'
import type { TaskQueryDto, TaskOutputDto, UserOutput } from '@/types/api/data-contracts'
import { Button } from '@/components/dashboard/ui/button'
import { Calendar } from '@/components/dashboard/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/dashboard/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/dashboardRelated/utils'
import { ArrowDown, ArrowRight, ArrowUp, Circle, CheckCircle, Timer, CircleOff } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { ROLE } from '@/constants/roles'
import { useGetUsersQuery } from '@/redux/apiSlices/User/userSlice'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/store'

const route = getRouteApi('/_authenticated/tasks/')

// Filter options for the table
const labels = [
  { value: 'meeting', label: 'Meeting' },
  { value: 'personal', label: 'Personal' },
  { value: 'preparation', label: 'Preparation' },
  { value: 'grading', label: 'Grading' },
]

const statuses = [
  { label: 'Pending', value: 'pending' as const, icon: Circle },
  { label: 'In Progress', value: 'in_progress' as const, icon: Timer },
  { label: 'Completed', value: 'completed' as const, icon: CheckCircle },
  { label: 'Cancelled', value: 'cancelled' as const, icon: CircleOff },
]

const priorities = [
  { label: 'Low', value: 'low' as const, icon: ArrowDown },
  { label: 'Medium', value: 'medium' as const, icon: ArrowRight },
  { label: 'High', value: 'high' as const, icon: ArrowUp },
]

type DataTableProps = {
  data: TaskOutputDto[]
  filters: TaskQueryDto
  onFiltersChange: (filters: TaskQueryDto) => void
  onEdit: (row: TaskOutputDto) => void
  onDelete: (row: TaskOutputDto) => void
}

export function TasksTable({ data, filters, onFiltersChange, onEdit, onDelete }: DataTableProps) {
  // Current user and users map for resolving tutor names
  const user = useSelector((state: RootState) => state.auth.user)
  const isAdmin = (user?.roles || []).includes(ROLE.ADMIN)
  const { data: usersData } = useGetUsersQuery()
  const userIdToUser = (usersData?.data || []).reduce<Record<number, UserOutput>>((acc, u) => {
    acc[u.id] = u
    return acc
  }, {})

  // Client-side filter by tutor for admins using already-fetched tasks
  const clientFilteredData = isAdmin && filters.tutorId
    ? data.filter((t) => {
        const attendeeId = t.invitees?.find((i) => typeof i?.id === 'number')?.id
        if (attendeeId) return attendeeId === filters.tutorId
        return t.tutorId === filters.tutorId
      })
    : data
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { from: startOfMonth, to: endOfMonth }
  })

  // Synced with URL states
  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search: route.useSearch(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigate: route.useNavigate() as any,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [
      { columnId: 'status', searchKey: 'status', type: 'array' },
      { columnId: 'priority', searchKey: 'priority', type: 'array' },
      { columnId: 'label', searchKey: 'label', type: 'array' },
    ],
  })

  // Track previous date range to avoid unnecessary updates
  const prevDateRangeRef = useRef<DateRange | undefined>(dateRange)

  // Update API filters when date range changes
  useEffect(() => {
    // Only update if date range has actually changed
    const prevDateRange = prevDateRangeRef.current
    const hasDateRangeChanged = 
      prevDateRange?.from?.getTime() !== dateRange?.from?.getTime() ||
      prevDateRange?.to?.getTime() !== dateRange?.to?.getTime()

    if (hasDateRangeChanged) {
      const newFilters = { ...filters }
      
      // Always ensure we have startDate and endDate since API requires them
      if (dateRange?.from) {
        newFilters.startDate = dateRange.from.toISOString()
      } else if (!newFilters.startDate) {
        // Default to start of current month if no date range selected
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        newFilters.startDate = startOfMonth.toISOString()
      }
      
      if (dateRange?.to) {
        // Set end date to end of day (23:59:59.999) to include tasks on the selected date
        const endOfDay = new Date(dateRange.to)
        endOfDay.setHours(23, 59, 59, 999)
        newFilters.endDate = endOfDay.toISOString()
      } else if (!newFilters.endDate) {
        // Default to end of current month if no date range selected
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        endOfMonth.setHours(23, 59, 59, 999)
        newFilters.endDate = endOfMonth.toISOString()
      }
      
      onFiltersChange(newFilters)
      prevDateRangeRef.current = dateRange
    }
  }, [dateRange, onFiltersChange, filters])

  // Create columns with handlers
  const columns = createTasksColumns(onEdit, onDelete, userIdToUser)

  const table = useReactTable({
    data: clientFilteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: (row, _columnId, filterValue) => {
      const id = String(row.getValue('id')).toLowerCase()
      const title = String(row.getValue('title')).toLowerCase()
      const searchValue = String(filterValue).toLowerCase()

      return id.includes(searchValue) || title.includes(searchValue)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
  })

  const pageCount = table.getPageCount()
  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <div className="flex items-center justify-between">
        <DataTableToolbar
          table={table}
          searchPlaceholder='Filter by title or ID...'
          filters={[
            {
              columnId: 'status',
              title: 'Status',
              options: statuses,
            },
            {
              columnId: 'priority',
              title: 'Priority',
              options: priorities,
            },
            {
              columnId: 'label',
              title: 'Label',
              options: labels,
            },
          ]}
        />
        
        {/* Date Range Filter */}
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !dateRange?.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => setDateRange(range)}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          
          {dateRange?.from && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDateRange(undefined)}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
      
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              (() => {
                const now = new Date()
                const rows = table.getRowModel().rows
                
                // Separate and sort tasks
                const activeTasks = rows
                  .filter(row => {
                    const endDateTime = new Date(row.original.endDateTime)
                    return endDateTime > now
                  })
                  .sort((a, b) => {
                    const dateA = new Date(a.original.endDateTime)
                    const dateB = new Date(b.original.endDateTime)
                    return dateA.getTime() - dateB.getTime() // Ascending order (earliest first)
                  })
                
                const expiredTasks = rows
                  .filter(row => {
                    const endDateTime = new Date(row.original.endDateTime)
                    return endDateTime <= now
                  })
                  .sort((a, b) => {
                    const dateA = new Date(a.original.endDateTime)
                    const dateB = new Date(b.original.endDateTime)
                    return dateB.getTime() - dateA.getTime() // Descending order (most recent first)
                  })
                
                return (
                  <>
                    {/* Active Tasks - Upcoming tasks in ascending order */}
                    {activeTasks.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    
                    {/* Expired Tasks - Past tasks in descending order */}
                    {expiredTasks.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        className="bg-muted/20 hover:bg-muted/30 border-l-4 border-l-muted-foreground/40"
                      >
                        {row.getVisibleCells().map((cell, index) => (
                          <TableCell 
                            key={cell.id}
                            className="text-muted-foreground relative"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                            {/* Add expired indicator to the first cell */}
                            {index === 0 && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-muted-foreground/60 rounded-full" 
                                   title="Expired task" />
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </>
                )
              })()
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      <DataTableBulkActions table={table} />
    </div>
  )
}
