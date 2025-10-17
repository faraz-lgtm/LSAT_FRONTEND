import { Trash2 } from 'lucide-react'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/dashboard/ui/button'
import { PackagesMultiDeleteDialog } from './packages-multi-delete-dialog'
import { useState } from 'react'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  if (selectedRows.length === 0) {
    return null
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">
          {selectedRows.length} row(s) selected
        </span>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Selected
        </Button>
      </div>

      <PackagesMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}
