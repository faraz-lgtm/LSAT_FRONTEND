import { useState } from 'react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/dashboard/ui/table'
import { type NavigateFn, useTableUrlState } from '@/hooks/dashboardRelated/use-table-url-state'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/dashboard/ui/dropdown-menu'
import { TransactionStatusBadge } from '@/components/dashboard/ui/transaction-status-badge'
import { formatCurrency } from '@/utils/currency'
import { useTransactions } from './transactions-provider'
import type { TransactionOutput } from '@/redux/apiSlices/Transactions/transactionsSlice'

type DataTableProps = {
  data: TransactionOutput[]
  search: Record<string, unknown>
  navigate: NavigateFn
}

// Component to display transaction amount (always in CAD for dashboard, no conversion)
function TransactionAmountCell({ amount }: { amount: number }) {
  // Amount is in cents, formatCurrency handles cents to dollars conversion
  return <div className="font-medium">{formatCurrency(amount)}</div>
}

export function TransactionsTable({ data, search, navigate }: DataTableProps) {
  const { setOpen, setCurrentRow } = useTransactions()
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

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
      { columnId: 'customerName', searchKey: 'filter', type: 'string' },
      { columnId: 'type', searchKey: 'type', type: 'array' },
      { columnId: 'status', searchKey: 'status', type: 'array' },
    ],
  })

  const columns: ColumnDef<TransactionOutput>[] = [
    {
      accessorKey: 'transactionNumber',
      header: 'Transaction #',
      cell: ({ row }) => {
        return <div className="font-medium">{row.getValue('transactionNumber')}</div>
      },
    },
    {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }) => {
        return <div>{row.getValue('customerName')}</div>
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = row.getValue('amount') as number
        return <TransactionAmountCell amount={amount} />
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as TransactionOutput['type']
        return <div className="capitalize">{type}</div>
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as TransactionOutput['status']
        return <TransactionStatusBadge status={status} />
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Payment Method',
      cell: ({ row }) => {
        const paymentMethod = row.getValue('paymentMethod') as string
        return <div>{paymentMethod || 'N/A'}</div>
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt') as string
        return <div>{new Date(createdAt).toLocaleDateString()}</div>
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const transaction = row.original

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
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(transaction.transactionNumber)}
              >
                Copy transaction number
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setCurrentRow(transaction)
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
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange,
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  ensurePageInRange(table.getPageCount())

  const typeOptions = [
    { label: 'Payment', value: 'payment' },
    { label: 'Refund', value: 'refund' },
    { label: 'Chargeback', value: 'chargeback' },
    { label: 'Adjustment', value: 'adjustment' },
  ]

  const statusOptions = [
    { label: 'Succeeded', value: 'succeeded' },
    { label: 'Failed', value: 'failed' },
    { label: 'Pending', value: 'pending' },
  ]

  const filters = [
    {
      columnId: 'type',
      title: 'Type',
      options: typeOptions,
    },
    {
      columnId: 'status',
      title: 'Status',
      options: statusOptions,
    },
  ]

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table as any}
        searchKey="customerName"
        searchPlaceholder="Filter by customer..."
        filters={filters}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table as any} />
      <DataTableBulkActions
        table={table as any}
        entityName="transaction"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const selectedRows = table.getFilteredSelectedRowModel().rows
            console.log('Exporting:', selectedRows.map(row => row.original))
          }}
        >
          Export selected
        </Button>
      </DataTableBulkActions>
    </div>
  )
}