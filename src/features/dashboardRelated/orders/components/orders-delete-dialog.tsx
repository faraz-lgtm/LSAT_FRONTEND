'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/dashboard/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/dashboard/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/dashboard/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { type Order, useDeleteOrderMutation } from '@/redux/apiSlices/Order/orderSlice'

type OrdersDeleteDialogProps = {
  currentRow: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrdersDeleteDialog({
  currentRow,
  open,
  onOpenChange,
}: OrdersDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteOrder] = useDeleteOrderMutation()

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      console.log("🗑️ Deleting order:", currentRow.id)
      const result = await deleteOrder(currentRow.id).unwrap()
      console.log("✅ Delete order success:", result)
      
      toast.success(`Order #${currentRow.id} deleted successfully`)
      onOpenChange(false)
    } catch (error: any) {
      console.error("❌ Delete order error:", error)
      toast.error(error?.data?.message || 'Failed to delete order')
    } finally {
      setIsDeleting(false)
    }
  }

  const totalAmount = currentRow.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>Delete Order #{currentRow.id}</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the order.
          </DialogDescription>
        </DialogHeader>
        
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            You are about to delete order #{currentRow.id} for customer {currentRow.customer.name} 
            with a total value of ${totalAmount.toFixed(2)}. This action cannot be undone.
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
