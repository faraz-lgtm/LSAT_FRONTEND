import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/dashboard/ui/dialog'
import { Button } from '@/components/dashboard/ui/button'
import { Input } from '@/components/dashboard/ui/input'
import { Label } from '@/components/dashboard/ui/label'
import { Textarea } from '@/components/dashboard/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/dashboard/ui/select'
import { toast } from 'sonner'
import { useCreateRefundMutation } from '@/redux/apiSlices/Refunds/refundsSlice'
import { formatCurrency } from '@/utils/currency'

type RefundsCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RefundsCreateDialog({
  open,
  onOpenChange,
}: RefundsCreateDialogProps) {
  const [createRefund, { isLoading: isCreating }] = useCreateRefundMutation()
  
  const [formData, setFormData] = useState({
    orderId: '',
    invoiceId: '',
    customerId: '',
    amount: '',
    reason: 'customer_request' as const,
    reasonDescription: '',
  })

  const handleSubmit = async () => {
    try {
      // Validate form
      if (!formData.orderId || !formData.customerId || !formData.amount) {
        toast.error('Please fill in all required fields')
        return
      }

      const amount = parseFloat(formData.amount)
      if (amount <= 0) {
        toast.error('Amount must be greater than 0')
        return
      }

      const refundData: any = {
        originalOrderId: parseInt(formData.orderId),
        customerId: parseInt(formData.customerId),
        amount: Math.round(amount * 100), // Convert to cents
        reason: formData.reason,
        reasonDetails: formData.reasonDescription || 'No additional details provided',
      }

      // Only include invoiceId if it's provided and valid
      if (formData.invoiceId && formData.invoiceId.trim() !== '' && !isNaN(parseInt(formData.invoiceId))) {
        refundData.invoiceId = parseInt(formData.invoiceId)
      }

      await createRefund(refundData).unwrap()

      toast.success('Refund created successfully')
      onOpenChange(false)
      
      // Reset form
      setFormData({
        orderId: '',
        invoiceId: '',
        customerId: '',
        amount: '',
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
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>Create New Refund</DialogTitle>
          <DialogDescription>
            Create a new refund for a customer order.
          </DialogDescription>
        </DialogHeader>
        
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='orderId'>Order ID *</Label>
              <Input
                id='orderId'
                type='number'
                value={formData.orderId}
                onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                placeholder='Enter order ID'
              />
            </div>
            <div>
              <Label htmlFor='invoiceId'>Invoice ID</Label>
              <Input
                id='invoiceId'
                type='number'
                value={formData.invoiceId}
                onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
                placeholder='Enter invoice ID (optional)'
              />
            </div>
          </div>

          <div>
            <Label htmlFor='customerId'>Customer ID *</Label>
            <Input
              id='customerId'
              type='number'
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              placeholder='Enter customer ID'
            />
          </div>

          <div>
            <Label htmlFor='amount'>Refund Amount *</Label>
            <Input
              id='amount'
              type='number'
              step='0.01'
              min='0'
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder='0.00'
            />
            {formData.amount && (
              <p className='text-sm text-muted-foreground mt-1'>
                {formatCurrency(Math.round(parseFloat(formData.amount) * 100))}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor='reason'>Refund Reason *</Label>
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

          <div>
            <Label htmlFor='reasonDescription'>Reason Description</Label>
            <Textarea
              id='reasonDescription'
              value={formData.reasonDescription}
              onChange={(e) => setFormData({ ...formData, reasonDescription: e.target.value })}
              placeholder='Additional details about the refund reason...'
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
