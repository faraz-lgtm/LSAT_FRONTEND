import { useEffect, useState } from 'react'
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
import { cn } from '@/lib/dashboardRelated/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/dashboardRelated/use-table-url-state'
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
import { createOrdersColumns } from './orders-columns'
import type { OrderOutput, UserOutput } from '@/types/api/data-contracts'
import { formatCurrency } from '@/utils/currency'
import { useOrders } from './orders-provider'
import { useGetUsersQuery } from '@/redux/apiSlices/User/userSlice'
import { useMemo } from 'react'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    className: string
  }
}

type DataTableProps = {
  data: OrderOutput[]
  search: Record<string, unknown>
  navigate: NavigateFn
} 

export function OrdersTable({ data, search, navigate }: DataTableProps) {
  console.log("OrdersTable received data:", data);
  console.log("OrdersTable data length:", data?.length);
  
  const { setOpen, setCurrentRow } = useOrders()
  const { data: usersData } = useGetUsersQuery(undefined)
  
  // Create user ID to user mapping
  const userIdToUser = useMemo(() => {
    return (usersData?.data || []).reduce<Record<number, UserOutput>>((acc, user) => {
      acc[user.id] = user
      return acc
    }, {})
  }, [usersData?.data])
  
  const columns = createOrdersColumns(formatCurrency, userIdToUser);
  
  // Filter orders by assignedEmployeeId if present
  // Note: Efficient filtering requires server-side support or fetching appointments for all orders
  // For now, we show all orders and users can see assigned tutors in the column
  // TODO: Implement efficient filtering when backend supports filtering orders by assignedEmployeeId
  const filteredData = useMemo(() => {
    const assignedEmployeeId = search.assignedEmployeeId as number | undefined
    if (!assignedEmployeeId) {
      return data
    }
    
    // Return all data - filtering by assignedEmployeeId requires checking appointments
    // which is expensive to do client-side for all orders
    // The Assigned Tutors column will show which employees are assigned to each order
    return data
  }, [data, search.assignedEmployeeId])
  
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  // Synced with URL states (keys/defaults mirror orders route search schema)
  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: false },
    columnFilters: [
      { columnId: 'customer', searchKey: 'customer', type: 'string' },
      { columnId: 'orderStatus', searchKey: 'orderStatus', type: 'array' },
      { 
        columnId: 'id', 
        searchKey: 'orderId', 
        type: 'string',
        serialize: (v) => v,
        deserialize: (v) => typeof v === 'number' ? String(v) : v,
      },
    ],
  })

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
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

  // Debug table state
  console.log("Table rows:", table.getRowModel().rows);
  console.log("Table rows length:", table.getRowModel().rows?.length);
  console.log("Table column filters:", columnFilters);
  console.log("Table pagination:", pagination);

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Search by customer name, email, or phone...'
        searchKey='customer'
        filters={[
          {
            columnId: 'orderStatus',
            title: 'Reservation Status',
            options: [
              { label: 'Reserved', value: 'reserved' },
              { label: 'Confirmed', value: 'confirmed' },
              { label: 'Expired', value: 'expired' },
              { label: 'Failed', value: 'failed' },
              { label: 'Canceled', value: 'canceled' },
              {label:'Completed', value: 'completed'}
            ],
          },
        ]}
      />
      <div className='overflow-hidden rounded-md border bg-white'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row bg-gray-50/80'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'text-xs font-medium text-gray-500 uppercase tracking-wider',
                        header.column.columnDef.meta?.className ?? ''
                      )}
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
                  className='group/row cursor-pointer hover:bg-blue-50/50 border-l-4 border-l-transparent hover:border-l-blue-500 transition-all'
                  onDoubleClick={() => {
                    setCurrentRow(row.original)
                    setOpen('view')
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'py-3 group-data-[state=selected]/row:bg-blue-50',
                        cell.column.columnDef.meta?.className ?? ''
                      )}
                    >
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
      <DataTableBulkActions table={table} />
    </div>
  )
}
