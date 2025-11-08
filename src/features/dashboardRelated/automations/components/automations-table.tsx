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
import { MoreHorizontal, Edit, Zap } from 'lucide-react'
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
import { Switch } from '@/components/dashboard/ui/switch'
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
import { useAutomations } from './automations-provider'
import { useUpdateAutomationMutation } from '@/redux/apiSlices/Automation/automationSlice'
import type { AutomationConfigOutputDto } from '@/types/api/data-contracts'
import { toast } from 'sonner'

type DataTableProps = {
  data: AutomationConfigOutputDto[]
  search: Record<string, unknown>
  navigate: NavigateFn
}

const ToolTypeColors: Record<string, string> = {
  slack: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
  email: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  sms: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400',
  whatsapp: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
}

function formatToolType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
}

export function AutomationsTable({ data, search, navigate }: DataTableProps) {
  const { setOpen, setCurrentRow } = useAutomations()
  const [updateAutomation] = useUpdateAutomationMutation()
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [updatingKeys, setUpdatingKeys] = useState<Set<string>>(new Set())

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
      { columnId: 'name', searchKey: 'name', type: 'string' },
      { columnId: 'toolType', searchKey: 'toolType', type: 'string' },
    ],
  })

  const handleToggleStatus = async (row: AutomationConfigOutputDto) => {
    setUpdatingKeys(prev => new Set(prev).add(row.key))
    try {
      await updateAutomation({
        key: row.key,
        data: { isEnabled: !row.isEnabled }
      }).unwrap()
      toast.success(`Automation ${!row.isEnabled ? 'enabled' : 'disabled'} successfully`)
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update automation')
    } finally {
      setUpdatingKeys(prev => {
        const next = new Set(prev)
        next.delete(row.key)
        return next
      })
    }
  }

  const columns: ColumnDef<AutomationConfigOutputDto>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const name = row.getValue('name') as string
        const description = row.original.description
        return (
          <div>
            <div className="font-medium">{name}</div>
            {description && (
              <div className="text-sm text-muted-foreground">{description}</div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'toolType',
      header: 'Type',
      cell: ({ row }) => {
        const toolType = row.getValue('toolType') as string
        return (
          <Badge className={cn('text-xs', ToolTypeColors[toolType.toLowerCase()] || 'bg-gray-500/10 text-gray-600')}>
            {formatToolType(toolType)}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'triggerEvent',
      header: 'Trigger',
      cell: ({ row }) => {
        const trigger = row.getValue('triggerEvent') as string
        return (
          <div className="font-mono text-sm">
            {trigger.replace('.', ' → ')}
          </div>
        )
      },
    },
    {
      accessorKey: 'isEnabled',
      header: 'Status',
      cell: ({ row }) => {
        const isEnabled = row.getValue('isEnabled') as boolean
        const automation = row.original
        const isUpdating = updatingKeys.has(automation.key)
        
        return (
          <Switch
            checked={isEnabled}
            onCheckedChange={() => handleToggleStatus(automation)}
            disabled={isUpdating}
            aria-label={`Toggle ${automation.name}`}
          />
        )
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const automation = row.original

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
                  setCurrentRow(automation)
                  setOpen('edit')
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit configuration
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  window.location.href = `/dashboard/automation-logs?key=${automation.key}`
                }}
              >
                <Zap className="mr-2 h-4 w-4" />
                View logs
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

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchKey="name"
        searchPlaceholder="Search automations..."
      />
      {table.getState().rowSelection && Object.keys(table.getState().rowSelection).length > 0 && (
        <DataTableBulkActions table={table} entityName="automation">
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
                    setOpen('edit')
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
                  No automations found.
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

