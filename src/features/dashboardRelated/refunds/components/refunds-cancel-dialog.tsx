import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/dashboard/ui/dialog'
import { Button } from '@/components/dashboard/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/dashboard/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useCancelRefundMutation } from '@/redux/apiSlices/Refunds/refundsSlice'
import { formatCurrency } from '@/utils/currency'
import type { RefundOutput } from '@/redux/apiSlices/Refunds/refundsSlice'

type RefundsCancelDialogProps = {
  currentRow: RefundOutput
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RefundsCancelDialog({
  currentRow,
  open,
  onOpenChange,
}: RefundsCancelDialogProps) {
  const [cancelRefund, { isLoading: isCancelling }] = useCancelRefundMutation()

  const handleCancel = async () => {
    try {
      await cancelRefund(currentRow.id).unwrap()
      toast.success('Refund cancelled successfully')
      onOpenChange(false)
    } catch (error) {
      console.error('Error cancelling refund:', error)
      toast.error('Failed to cancel refund')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>Cancel Refund #{currentRow.refundNumber}</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently cancel the refund.
          </DialogDescription>
        </DialogHeader>
        
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            You are about to cancel refund #{currentRow.refundNumber} for customer ID {currentRow.customerId} 
            {currentRow.amount && ` with an amount of ${formatCurrency(typeof currentRow.amount === 'string' ? parseFloat(currentRow.amount) * 100 : currentRow.amount * 100)}`}. This action cannot be undone.
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isCancelling}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={handleCancel} disabled={isCancelling}>
            {isCancelling ? 'Cancelling...' : 'Cancel Refund'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
