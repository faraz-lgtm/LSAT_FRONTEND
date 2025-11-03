import { useEffect, useRef, useState } from 'react'
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
import { roles } from '../data/data'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { usersColumns as columns } from './users-columns'
import type { UserOutput } from '@/types/api/data-contracts'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    className: string
  }
}

type DataTableProps = {
  data: UserOutput[]
  search: Record<string, unknown>
  navigate: NavigateFn
  hideCustomerTypeFilter?: boolean
  hideRolesFilter?: boolean
  hideUsernameColumn?: boolean
  excludeRolesFromFilter?: string[]
} 

export function UsersTable({ data, search, navigate, hideCustomerTypeFilter, hideRolesFilter, hideUsernameColumn, excludeRolesFromFilter }: DataTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  // Local state management for table (uncomment to use local-only state, not synced with URL)
  // const [columnFilters, onColumnFiltersChange] = useState<ColumnFiltersState>([])
  // const [pagination, onPaginationChange] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  // Synced with URL states (keys/defaults mirror users route search schema)
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
      // username per-column text filter
      ...(hideUsernameColumn ? [] : [{ columnId: 'username', searchKey: 'username', type: 'string' as const }]),
      { columnId: 'isAccountDisabled', searchKey: 'status', type: 'array' as const },
      ...(hideRolesFilter ? [] : [{ columnId: 'roles', searchKey: 'roles', type: 'array' as const }]),
      ...(hideCustomerTypeFilter ? [] : [{ columnId: 'ordersCount', searchKey: 'leads', type: 'array' as const }]),
    ],
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    manualPagination: false,
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

  // Track previous values to avoid unnecessary checks
  const prevStateRef = useRef({
    dataLength: data.length,
    pageSize: pagination.pageSize,
    filtersKey: JSON.stringify(columnFilters),
    initialized: false,
  })

  // Only check page range when data, filters, or pageSize change - NOT when pageIndex changes
  // This prevents the effect from interfering with normal pagination navigation
  useEffect(() => {
    const currentState = {
      dataLength: data.length,
      pageSize: pagination.pageSize,
      filtersKey: JSON.stringify(columnFilters),
    }

    // Only run if something actually changed that affects page count (not just reference equality)
    // Explicitly exclude pageIndex changes from triggering this effect
    const hasChanged =
      !prevStateRef.current.initialized ||
      prevStateRef.current.dataLength !== currentState.dataLength ||
      prevStateRef.current.pageSize !== currentState.pageSize ||
      prevStateRef.current.filtersKey !== currentState.filtersKey

    if (hasChanged) {
      prevStateRef.current = { ...currentState, initialized: true }
      const pageCount = table.getPageCount()
      
      // Only check and fix page if we have data and pageCount is valid
      if (pageCount > 0) {
        // Use a small delay to ensure any pending navigation from pagination clicks has completed
        const timeoutId = setTimeout(() => {
          const currentPageNum = (search as Record<string, unknown>).page as number | undefined
          const defaultPage = 1
          const pageNum = typeof currentPageNum === 'number' ? currentPageNum : defaultPage
          
          // Only call ensurePageInRange if page is actually out of range
          // This prevents unnecessary navigation calls that cause flickering
          if (pageNum > pageCount) {
            ensurePageInRange(pageCount)
          }
        }, 100)
        return () => clearTimeout(timeoutId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.length, pagination.pageSize, columnFilters])

  useEffect(() => {
    if (hideUsernameColumn) {
      setColumnVisibility((prev) => ({ ...prev, username: false }))
    }
  }, [hideUsernameColumn])

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Filter users...'
        searchKey={hideUsernameColumn ? undefined : 'username'}
        filters={[
          {
            columnId: 'isAccountDisabled',
            title: 'Status',
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Disabled', value: 'disabled' },
            ],
          },
          ...(
            hideRolesFilter ? [] : [{
              columnId: 'roles',
              title: 'Roles',
              options: roles
                .filter((r) => !(excludeRolesFromFilter || []).includes(r.value))
                .map((role) => ({ ...role })),
            }]
          ),
          ...(
            hideCustomerTypeFilter ? [] : [{
              columnId: 'ordersCount',
              title: 'Customer Type',
              options: [
                { label: 'Leads', value: 'leads' },
                { label: 'Customers', value: 'customers' },
              ],
            }]
          ),
        ]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted text-left',
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
                  className='group/row'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted text-left',
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
