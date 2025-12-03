import { useState } from 'react'
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
import { createAppointmentsColumns } from './appointments-columns'
import type { TaskOutputDto, UserOutput } from '@/types/api/data-contracts'
import { Button } from '@/components/dashboard/ui/button'
import { Calendar } from '@/components/dashboard/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/dashboard/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns'
import { cn } from '@/lib/dashboardRelated/utils'
import { Circle, CheckCircle, Timer, CircleOff } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import type { OrderAppointmentQueryDto } from '@/redux/apiSlices/OrderAppointment/orderAppointmentSlice'

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


const statuses = [
  { label: 'Pending', value: 'pending' as const, icon: Circle },
  { label: 'In Progress', value: 'in_progress' as const, icon: Timer },
  { label: 'Completed', value: 'completed' as const, icon: CheckCircle },
  { label: 'Cancelled', value: 'cancelled' as const, icon: CircleOff },
]

const attendanceStatuses = [
  { label: 'Unknown', value: 'UNKNOWN' as const },
  { label: 'Showed', value: 'SHOWED' as const },
  { label: 'No Show', value: 'NO_SHOW' as const },
]

type DataTableProps = {
  data: TaskOutputDto[]
  filters: OrderAppointmentQueryDto
  onFiltersChange: (filters: OrderAppointmentQueryDto) => void
  onView?: (row: TaskOutputDto) => void
  isAdmin?: boolean
  usersData?: { data?: UserOutput[] }
  usersLoading?: boolean
}

export function AppointmentsTable({ 
  data, 
  filters, 
  onFiltersChange, 
  onView, 
  isAdmin = false, 
  usersData, 
}: DataTableProps) {
  // Users map for resolving names
  const userIdToUser = (usersData?.data || []).reduce<Record<number, UserOutput>>((acc, u) => {
    acc[u.id] = u
    return acc
  }, {})
  
  const emailToUser = (usersData?.data || []).reduce<Record<string, UserOutput>>((acc, u) => {
    if (u.email) {
      acc[u.email.toLowerCase()] = u
    }
    return acc
  }, {})

  // Client-side filter by assigned employee for admins
  const clientFilteredData = isAdmin && filters.assignedEmployeeId
    ? data.filter((t) => t.tutorId === filters.assignedEmployeeId)
    : data

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

  // Date range for filtering
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (filters.startDate && filters.endDate) {
      return {
        from: new Date(filters.startDate),
        to: new Date(filters.endDate),
      }
    }
    return undefined
  })

  const columns = createAppointmentsColumns(onView, userIdToUser, emailToUser)

  const table = useReactTable({
    data: clientFilteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const isFiltered = globalFilter.length > 0 || 
    (filters.status !== undefined) || 
    (filters.attendanceStatus !== undefined)

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    if (range?.from && range?.to) {
      const endOfDay = new Date(range.to)
      endOfDay.setHours(23, 59, 59, 999)
      onFiltersChange({
        ...filters,
        startDate: range.from.toISOString(),
        endDate: endOfDay.toISOString(),
      })
    }
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex flex-1 flex-wrap items-center gap-2'>
          <Input
            placeholder='Search appointments...'
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className='h-8 w-[150px] lg:w-[250px]'
          />
          
          {/* Date Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'h-8 w-[240px] justify-start text-left font-normal',
                  !dateRange && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'LLL dd, y')} -{' '}
                      {format(dateRange.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(dateRange.from, 'LLL dd, y')
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                initialFocus
                mode='range'
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {table.getColumn('status') && (
            <DataTableFacetedFilter
              column={table.getColumn('status')}
              title='Status'
              options={statuses}
            />
          )}

          {table.getColumn('attendanceStatus') && (
            <DataTableFacetedFilter
              column={table.getColumn('attendanceStatus')}
              title='Attendance'
              options={attendanceStatuses}
            />
          )}

          {isFiltered && (
            <Button
              variant='ghost'
              onClick={() => {
                setGlobalFilter('')
                table.resetColumnFilters()
              }}
              className='h-8 px-2 lg:px-3'
            >
              Reset
              <Cross2Icon className='ml-2 h-4 w-4' />
            </Button>
          )}
        </div>
        <DataTableViewOptions table={table} />
      </div>
      <div className='rounded-md border bg-white'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='bg-gray-50/80'>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan} className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              (() => {
                let currentDateKey = ''
                return table.getRowModel().rows.map((row) => {
                  const appointment = row.original as TaskOutputDto
                  const dateKey = appointment.startDateTime ? getDateKey(appointment.startDateTime) : ''
                  const showDateHeader = dateKey !== currentDateKey
                  currentDateKey = dateKey
                  
                  return (
                    <>
                      {showDateHeader && appointment.startDateTime && (
                        <TableRow key={`date-${dateKey}`} className='bg-gray-50/50 hover:bg-gray-50/50'>
                          <TableCell colSpan={columns.length} className='py-2 px-4'>
                            <div className='flex items-center gap-2'>
                              <div className='h-2 w-2 rounded-full bg-blue-500'></div>
                              <span className='text-sm font-semibold text-gray-700'>
                                {getDateLabel(appointment.startDateTime)}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        className='group hover:bg-blue-50/50 border-l-4 border-l-transparent hover:border-l-blue-500 transition-all'
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
                })
              })()
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center text-gray-500'
                >
                  No appointments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}

