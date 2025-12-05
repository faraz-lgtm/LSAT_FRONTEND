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
import { DataTablePagination, DataTableViewOptions } from '@/components/dashboard/data-table'
import { DataTableFacetedFilter } from '@/components/dashboard/data-table/faceted-filter'
import { Input } from '@/components/dashboard/ui/input'
import { Cross2Icon } from '@radix-ui/react-icons'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { createTasksColumns } from './tasks-columns'
import type { TaskQueryDto, TaskOutputDto, UserOutput } from '@/types/api/data-contracts'
import { Button } from '@/components/dashboard/ui/button'
import { Calendar } from '@/components/dashboard/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/dashboard/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns'
import { cn } from '@/lib/dashboardRelated/utils'

// Helper function to get date label
function getDateLabel(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMMM d, yyyy')
}

// Helper function to get date key for grouping
function getDateKey(dateStr: string): string {
  return format(parseISO(dateStr), 'yyyy-MM-dd')
}
import { ArrowDown, ArrowRight, ArrowUp, Circle, CheckCircle, Timer, CircleOff } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { ROLE } from '@/constants/roles'
import { SelectDropdown } from '@/components/dashboard/select-dropdown'
import { isTask } from '@/utils/task-helpers'

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
  onView?: (row: TaskOutputDto) => void
  isAdmin?: boolean
  usersData?: { data?: UserOutput[] }
  usersLoading?: boolean
}

export function TasksTable({ data, filters, onFiltersChange, onEdit, onDelete, onView, isAdmin = false, usersData, usersLoading = false }: DataTableProps) {
  // Users map for resolving tutor names (by ID)
  const userIdToUser = (usersData?.data || []).reduce<Record<number, UserOutput>>((acc, u) => {
    acc[u.id] = u
    return acc
  }, {})
  
  // Email to user map for resolving customer names (by email)
  const emailToUser = (usersData?.data || []).reduce<Record<string, UserOutput>>((acc, u) => {
    if (u.email) {
      acc[u.email.toLowerCase()] = u
    }
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
      
      if (dateRange?.from) {
        // Use selected start date
        newFilters.startDate = dateRange.from.toISOString()
      } else {
        // When cleared, default to start of current month
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        newFilters.startDate = startOfMonth.toISOString()
      }
      
      if (dateRange?.to) {
        // Set end date to end of day (23:59:59.999) to include tasks on the selected date
        const endOfDay = new Date(dateRange.to)
        endOfDay.setHours(23, 59, 59, 999)
        newFilters.endDate = endOfDay.toISOString()
      } else {
        // When cleared, default to end of current month
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        endOfMonth.setHours(23, 59, 59, 999)
        newFilters.endDate = endOfMonth.toISOString()
      }
      
      onFiltersChange(newFilters)
      prevDateRangeRef.current = dateRange
    }
  }, [dateRange, onFiltersChange, filters])

  // Create columns with handlers
  const columns = createTasksColumns(onEdit, onDelete, onView, userIdToUser, emailToUser)

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
        <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
          <Input
            placeholder='Filter by title or ID...'
            value={table.getState().globalFilter ?? ''}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className='h-8 w-[150px] lg:w-[250px]'
          />
          <div className='flex gap-x-2'>
            {[
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
            ].map((filter) => {
              const column = table.getColumn(filter.columnId)
              if (!column) return null
              return (
                <DataTableFacetedFilter
                  key={filter.columnId}
                  column={column}
                  title={filter.title}
                  options={filter.options}
                />
              )
            })}
            
            {/* Employee Filter - Beside Label */}
            {isAdmin && (
              <SelectDropdown
                className='min-w-[220px]'
                placeholder='Filter by employee'
                isPending={usersLoading}
                defaultValue={filters.tutorId ? String(filters.tutorId) : undefined}
                isControlled
                onValueChange={(val) => {
                  onFiltersChange({
                    ...filters,
                    tutorId: val === 'all' ? undefined : Number(val),
                  })
                }}
                items={[
                  { label: 'All Employees', value: 'all' },
                  ...(usersData?.data
                    ?.filter((u) => (u.roles || []).some(r => r === ROLE.USER || r === ROLE.ADMIN || r === ROLE.SUPER_ADMIN))
                    .map((u) => ({ label: `${u.name} (@${u.username})`, value: String(u.id) })) || []),
                ]}
              />
            )}
          </div>
          {(table.getState().columnFilters.length > 0 || table.getState().globalFilter) && (
            <Button
              variant='ghost'
              onClick={() => {
                table.resetColumnFilters()
                table.setGlobalFilter('')
              }}
              className='h-8 px-2 lg:px-3'
            >
              Reset
              <Cross2Icon className='ms-2 h-4 w-4' />
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <DataTableViewOptions table={table} />
          
          {/* Date Range Filter */}
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
      
      <div className='overflow-hidden rounded-md border bg-white'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='bg-gray-50/80'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan} className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
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
                const hasSorting = sorting.length > 0
                
                // If user has applied sorting, respect it and still separate active/expired
                // If no sorting, use default behavior (sort by startDateTime within each group)
                let activeTasks = rows.filter(row => {
                  const endDateTime = new Date(row.original.endDateTime)
                  return endDateTime > now
                })
                
                let expiredTasks = rows.filter(row => {
                  const endDateTime = new Date(row.original.endDateTime)
                  return endDateTime <= now
                })
                
                // If no sorting is applied, sort by startDateTime within each group
                if (!hasSorting) {
                  activeTasks = activeTasks.sort((a, b) => {
                    const dateA = new Date(a.original.startDateTime)
                    const dateB = new Date(b.original.startDateTime)
                    return dateA.getTime() - dateB.getTime() // Ascending order (earliest first)
                  })
                  
                  expiredTasks = expiredTasks.sort((a, b) => {
                    const dateA = new Date(a.original.startDateTime)
                    const dateB = new Date(b.original.startDateTime)
                    return dateB.getTime() - dateA.getTime() // Descending order (most recent first)
                  })
                }

                // Track current date key for date headers
                let currentDateKey = ''
                
                return (
                  <>
                    {/* Active Tasks with Date Headers */}
                    {activeTasks.map((row) => {
                      const task = row.original as TaskOutputDto
                      const dateKey = task.startDateTime ? getDateKey(task.startDateTime) : ''
                      const showDateHeader = dateKey !== currentDateKey
                      currentDateKey = dateKey
                      
                      return (
                        <>
                          {showDateHeader && task.startDateTime && (
                            <TableRow key={`date-${dateKey}`} className='bg-gray-50/50 hover:bg-gray-50/50'>
                              <TableCell colSpan={columns.length} className='py-2 px-4'>
                                <div className='flex items-center gap-2'>
                                  <div className='h-2 w-2 rounded-full bg-blue-500'></div>
                                  <span className='text-sm font-semibold text-gray-700'>
                                    {getDateLabel(task.startDateTime)}
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && 'selected'}
                            className={`group hover:bg-blue-50/50 border-l-4 border-l-transparent hover:border-l-blue-500 transition-all ${onView ? 'cursor-pointer' : ''}`}
                            onDoubleClick=
                            {() => {
                              if (isTask(row.original) && onEdit) {
                                onEdit(row.original)
                              } else if (onView) {
                                onView(row.original)
                              }
                            }}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id} className='py-3'>
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        </>
                      )
                    })}
                    
                    {/* Expired Tasks Header */}
                    {expiredTasks.length > 0 && (
                      <TableRow className='bg-red-50/50 hover:bg-red-50/50'>
                        <TableCell colSpan={columns.length} className='py-2 px-4'>
                          <div className='flex items-center gap-2'>
                            <div className='h-2 w-2 rounded-full bg-red-400'></div>
                            <span className='text-sm font-semibold text-red-600'>
                              Expired Tasks
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    
                    {/* Expired Tasks */}
                    {expiredTasks.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        className={`group bg-muted/20 hover:bg-red-50/50 border-l-4 border-l-red-300 hover:border-l-red-500 transition-all ${onView ? 'cursor-pointer' : ''}`}
                        onDoubleClick={() => {
                          if (isTask(row.original) && onEdit) {
                            onEdit(row.original)
                          } else if (onView) {
                            onView(row.original)
                          }
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell 
                            key={cell.id}
                            className="py-3 text-muted-foreground"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
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
                  className='h-24 text-center text-gray-500'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      <DataTableBulkActions table={table} onEdit={onEdit} onDelete={onDelete} onView={onView} />
    </div>
  )
}
