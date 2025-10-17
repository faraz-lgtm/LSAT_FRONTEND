/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/dashboard/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/dashboard/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/dashboard/data-table'
import {  useDeleteOrderMutation } from '@/redux/apiSlices/Order/orderSlice'
import type { OrderOutput } from '@/types/api/data-contracts'
import { OrdersMultiDeleteDialog } from './orders-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteOrder] = useDeleteOrderMutation()
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkDelete = async () => {
    const selectedOrders = selectedRows.map((row) => row.original as OrderOutput)
    
    try {
      console.log("🗑️ Bulk deleting orders:", selectedOrders.map(o => o.id))
      
      // Delete orders in parallel
      const deletePromises = selectedOrders.map(order => 
        deleteOrder(order.id).unwrap()
      )
      
      await Promise.all(deletePromises)
      
      console.log("✅ Bulk delete success")
      toast.success(`Successfully deleted ${selectedOrders.length} order${selectedOrders.length > 1 ? 's' : ''}`)
      table.resetRowSelection()
    } catch (error: any) {
      console.error("❌ Bulk delete error:", error)
      toast.error(error?.data?.message || 'Failed to delete orders')
    }
  }

  if (selectedRows.length === 0) {
    return null
  }

  return (
    <>
      <BulkActionsToolbar
        table={table as Table<unknown>}
        entityName="orders"
      >
        <div className='flex items-center gap-2'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowDeleteConfirm(true)}
                className='h-8'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Delete ({selectedRows.length})
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete selected orders</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </BulkActionsToolbar>
      <OrdersMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleBulkDelete}
        selectedCount={selectedRows.length}
      />
    </>
  )
}
