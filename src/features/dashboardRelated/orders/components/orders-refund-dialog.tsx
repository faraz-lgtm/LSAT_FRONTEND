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
import { Input } from '@/components/dashboard/ui/input'
import { Label } from '@/components/dashboard/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/dashboard/ui/select'
import { Textarea } from '@/components/dashboard/ui/textarea'
import { useCreateRefundMutation } from '@/redux/apiSlices/Refunds/refundsSlice'
import type { OrderOutput } from '@/types/api/data-contracts'
import { formatCurrency } from '@/utils/currency'

type OrdersRefundDialogProps = {
  currentRow: OrderOutput
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrdersRefundDialog({
  currentRow,
  open,
  onOpenChange,
}: OrdersRefundDialogProps) {
  const [createRefund, { isLoading: isCreating }] = useCreateRefundMutation()
  
  // Calculate total order amount
  const orderTotal = currentRow.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  const [formData, setFormData] = useState({
    amount: orderTotal.toString(),
    reason: 'customer_request' as const,
    reasonDescription: '',
  })

  const handleSubmit = async () => {
    try {
      // Validate form
      if (!formData.amount || !formData.reason) {
        toast.error('Please fill in all required fields')
        return
      }

      const amount = parseFloat(formData.amount)
      if (amount <= 0) {
        toast.error('Amount must be greater than 0')
        return
      }

      if (amount > orderTotal) {
        toast.error('Refund amount cannot exceed order total')
        return
      }

      const refundData: any = {
        originalOrderId: currentRow.id,
        customerId: currentRow.customer.id,
        amount: Math.round(amount * 100), // Convert to cents
        reason: formData.reason,
        reasonDetails: formData.reasonDescription || 'No additional details provided',
      }

      await createRefund(refundData).unwrap()

      toast.success('Refund created successfully')
      onOpenChange(false)
      
      // Reset form
      setFormData({
        amount: orderTotal.toString(),
        reason: 'customer_request',
        reasonDescription: '',
      })
    } catch (error) {
      console.error('Error creating refund:', error)
      toast.error('Failed to create refund')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>Create Simple Refund for Order #{currentRow.id}</DialogTitle>
          <DialogDescription>
            Create a simple refund for this order. This will cancel the order and process a refund. 
            For order modifications (changing items), use "Modify Order" instead.
          </DialogDescription>
        </DialogHeader>
        
        <div className='space-y-4'>
          {/* Order Information */}
          <div className='p-3 bg-muted rounded-lg'>
            <div className='text-sm text-muted-foreground mb-2'>Order Details</div>
            <div className='space-y-1'>
              <div className='flex justify-between'>
                <span className='text-sm'>Customer:</span>
                <span className='text-sm font-medium'>{currentRow.customer.name}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm'>Order Total:</span>
                <span className='text-sm font-medium'>{formatCurrency(orderTotal * 100)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm'>Items:</span>
                <span className='text-sm font-medium'>{currentRow.items.length}</span>
              </div>
            </div>
          </div>

          {/* Refund Amount */}
          <div className='space-y-2'>
            <Label htmlFor='amount'>Refund Amount ($)</Label>
            <Input
              id='amount'
              type='number'
              step='0.01'
              min='0'
              max={orderTotal}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder='Enter refund amount'
            />
            <div className='text-xs text-muted-foreground'>
              Maximum: {formatCurrency(orderTotal * 100)}
            </div>
          </div>

          {/* Refund Reason */}
          <div className='space-y-2'>
            <Label htmlFor='reason'>Reason</Label>
            <Select
              value={formData.reason}
              onValueChange={(value: any) => setFormData({ ...formData, reason: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select reason' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='customer_request'>Customer Request</SelectItem>
                <SelectItem value='duplicate'>Duplicate Payment</SelectItem>
                <SelectItem value='fraudulent'>Fraudulent Transaction</SelectItem>
                <SelectItem value='other'>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reason Description */}
          <div className='space-y-2'>
            <Label htmlFor='reasonDescription'>Additional Details (Optional)</Label>
            <Textarea
              id='reasonDescription'
              value={formData.reasonDescription}
              onChange={(e) => setFormData({ ...formData, reasonDescription: e.target.value })}
              placeholder='Provide additional details about the refund reason'
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Refund'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
