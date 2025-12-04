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
import { Label } from '@/components/dashboard/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/dashboard/ui/select'
import { Textarea } from '@/components/dashboard/ui/textarea'
import { useCancelOrderMutation } from '@/redux/apiSlices/Order/orderSlice'
import type { OrderOutput, CancelOrderDto } from '@/types/api/data-contracts'
import { formatCurrency } from '@/utils/currency'

type OrdersCancelDialogProps = {
  currentRow: OrderOutput
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrdersCancelDialog({
  currentRow,
  open,
  onOpenChange,
}: OrdersCancelDialogProps) {
  const [cancelOrder, { isLoading: isCanceling }] = useCancelOrderMutation()
  
  const [formData, setFormData] = useState({
    refundReason: 'customer_request' as const,
    reasonDetails: '',
  })

  // Calculate order total
  const orderTotal = currentRow.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleSubmit = async () => {
    try {
      // Validate form
      if (!formData.reasonDetails.trim()) {
        toast.error('Please provide a reason for the cancellation')
        return
      }

      const cancelData: CancelOrderDto = {
        refundReason: formData.refundReason,
        reasonDetails: formData.reasonDetails,
      }

      await cancelOrder({ orderId: currentRow.id, body: cancelData }).unwrap()

      toast.success('Order canceled successfully! Refund has been processed and invoice voided.')
      onOpenChange(false)
      
      // Reset form
      setFormData({
        refundReason: 'customer_request',
        reasonDetails: '',
      })
    } catch (error: any) {
      console.error('Error canceling order:', error)
      // Error toast is handled centrally in api.ts
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>Cancel Order #{currentRow.id}</DialogTitle>
          <DialogDescription>
            This will cancel the order by refunding it, voiding the invoice, and canceling slot reservations.
          </DialogDescription>
        </DialogHeader>
        
        <div className='space-y-6'>
          {/* Order Summary */}
          <div className='p-4 bg-muted rounded-lg'>
            <h3 className='text-lg font-semibold mb-3'>Order Summary</h3>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='font-medium text-muted-foreground'>Customer:</span>
                <div className='text-foreground'>{currentRow.customer.name}</div>
              </div>
              <div>
                <span className='font-medium text-muted-foreground'>Order Total:</span>
                <div className='text-foreground font-semibold'>{formatCurrency(orderTotal * 100)}</div>
              </div>
              <div>
                <span className='font-medium text-muted-foreground'>Items:</span>
                <div className='text-foreground'>{currentRow.items.length}</div>
              </div>
              <div>
                <span className='font-medium text-muted-foreground'>Refund Amount:</span>
                <div className='text-red-600 font-semibold'>-{formatCurrency(orderTotal * 100)}</div>
              </div>
            </div>
          </div>

          {/* Cancellation Details */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Cancellation Details</h3>
            
            <div className='space-y-2'>
              <Label htmlFor='refundReason'>Reason for Cancellation</Label>
              <Select
                value={formData.refundReason}
                onValueChange={(value: any) => setFormData({ ...formData, refundReason: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select reason' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='customer_request'>Customer Request</SelectItem>
                  <SelectItem value='duplicate'>Duplicate Order</SelectItem>
                  <SelectItem value='fraudulent'>Fraudulent Transaction</SelectItem>
                  <SelectItem value='other'>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='reasonDetails'>Reason Details *</Label>
              <Textarea
                id='reasonDetails'
                value={formData.reasonDetails}
                onChange={(e) => setFormData({ ...formData, reasonDetails: e.target.value })}
                placeholder='Provide detailed reason for the order cancellation'
                rows={4}
              />
            </div>
          </div>

          {/* Warning */}
          <div className='p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800'>
            <p className='text-sm text-yellow-800 dark:text-yellow-200'>
              <strong>Warning:</strong> This action will refund the order, void the invoice, and cancel all slot reservations. This action cannot be undone.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isCanceling}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isCanceling || !formData.reasonDetails.trim()} variant='destructive'>
            {isCanceling ? 'Processing...' : 'Cancel Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


