import { useEffect, useState } from 'react'
import {
  type ColumnDef,
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
import { MoreHorizontal, Eye } from 'lucide-react'
import { Button } from '@/components/dashboard/ui/button'
import { DataTableToolbar, DataTablePagination } from '@/components/dashboard/data-table'
import { DataTableBulkActions } from '@/components/dashboard/data-table/bulk-actions'
import { useNavigate } from '@tanstack/react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/dashboard/ui/table'
import { Badge } from '@/components/dashboard/ui/badge'
import { cn } from '@/lib/dashboardRelated/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/dashboardRelated/use-table-url-state'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/dashboard/ui/dropdown-menu'
import { useAutomationLogs } from './automation-logs-provider'
import type { AutomationLogOutputDto } from '@/redux/apiSlices/Automation/automationSlice'

type DataTableProps = {
  data: AutomationLogOutputDto[]
  search: Record<string, unknown>
  navigate: NavigateFn
}

function AutomationLogsStatusBadge({ status }: { status: string }) {
  const statusColors = {
    success: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400',
    failure: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400',
    pending: 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400',
  }
  
  return (
    <Badge className={cn('text-xs', statusColors[status as keyof typeof statusColors] || 'bg-gray-500/10')}>
      {status.toUpperCase()}
    </Badge>
  )
}

export function AutomationLogsTable({ data, search, navigate }: DataTableProps) {
  const { setOpen, setCurrentRow } = useAutomationLogs()
  const routerNavigate = useNavigate()
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // Helper function to extract order ID from eventData
  const getOrderId = (log: AutomationLogOutputDto): number | null => {
    return log.eventData?.order?.id ?? null
  }

  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
    globalFilter,
    onGlobalFilterChange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'search' },
    columnFilters: [
      { columnId: 'status', searchKey: 'status', type: 'array' },
      { 
        columnId: 'orderId', 
        searchKey: 'orderId', 
        type: 'string',
        serialize: (v) => v,
        deserialize: (v) => typeof v === 'number' ? String(v) : v,
      },
    ],
  })

  const columns: ColumnDef<AutomationLogOutputDto>[] = [
    {
      accessorKey: 'automationKey',
      header: 'Automation',
      cell: ({ row }) => {
        return (
          <div className="font-medium font-mono text-sm">
            {row.getValue('automationKey')}
          </div>
        )
      },
    },
    {
      id: 'orderId',
      header: 'Order ID',
      cell: ({ row }) => {
        const log = row.original
        const orderId = getOrderId(log)
        
        if (!orderId) {
          return <div className="text-sm text-muted-foreground">—</div>
        }
        
        return (
          <button
            onClick={(e) => {
              e.stopPropagation()
              routerNavigate({
                to: '/orders',
                search: {
                  orderId: orderId,
                },
              })
            }}
            className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            #{orderId}
          </button>
        )
      },
      filterFn: (row, id, filterValue) => {
        const orderId = getOrderId(row.original)
        if (!orderId) return false
        const filterStr = String(filterValue).trim()
        if (!filterStr) return true
        return String(orderId).includes(filterStr)
      },
      accessorFn: (row) => {
        const orderId = getOrderId(row)
        return orderId ? String(orderId) : ''
      },
    },
    {
      accessorKey: 'executedAt',
      header: 'Executed At',
      cell: ({ row }) => {
        const date = row.getValue('executedAt') as string
        return (
          <div>
            <div className="font-medium">
              {new Date(date).toLocaleDateString()}
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date(date).toLocaleTimeString()}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return <AutomationLogsStatusBadge status={status} />
      },
    },
    {
      accessorKey: 'metadata',
      header: 'Details',
      cell: ({ row }) => {
        const metadata = row.getValue('metadata') as object | undefined
        const error = row.original.error
        
        if (error) {
          return (
            <div className="max-w-[300px] truncate text-red-600 dark:text-red-400">
              {error}
            </div>
          )
        }
        
        if (metadata) {
          return (
            <div className="max-w-[300px] truncate text-sm text-muted-foreground">
              {JSON.stringify(metadata)}
            </div>
          )
        }
        
        return <div className="text-sm text-muted-foreground">—</div>
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const log = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setCurrentRow(log)
                  setOpen('view')
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange,
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase().trim()
      if (!searchValue) return true
      
      // Search in automation key
      const automationKey = String(row.getValue('automationKey') || '').toLowerCase()
      if (automationKey.includes(searchValue)) return true
      
      // Search in order ID
      const orderId = getOrderId(row.original)
      if (orderId && String(orderId).includes(searchValue)) return true
      
      return false
    },
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange])

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder="Search by automation key or order ID..."
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: [
              { label: 'Success', value: 'success' },
              { label: 'Failure', value: 'failure' },
              { label: 'Pending', value: 'pending' },
            ],
          },
        ]}
      />
      {table.getState().rowSelection && Object.keys(table.getState().rowSelection).length > 0 && (
        <DataTableBulkActions table={table} entityName="log">
          <></>
        </DataTableBulkActions>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(header.column.columnDef.meta?.className)}
                    >
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='cursor-pointer'
                  onDoubleClick={() => {
                    setCurrentRow(row.original)
                    setOpen('view')
                  }}
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No logs found.
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

