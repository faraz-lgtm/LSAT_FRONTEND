import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/dashboard/ui/dialog'
import { Button } from '@/components/dashboard/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/dashboard/ui/alert'
import { CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useProcessRefundMutation } from '@/redux/apiSlices/Refunds/refundsSlice'
import { formatCurrency } from '@/utils/currency'
import type { RefundOutput } from '@/redux/apiSlices/Refunds/refundsSlice'

type RefundsProcessDialogProps = {
  currentRow: RefundOutput
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RefundsProcessDialog({
  currentRow,
  open,
  onOpenChange,
}: RefundsProcessDialogProps) {
  const [processRefund, { isLoading: isProcessing }] = useProcessRefundMutation()

  const handleProcess = async () => {
    try {
      await processRefund(currentRow.id).unwrap()
      toast.success('Refund processed successfully')
      onOpenChange(false)
    } catch (error) {
      console.error('Error processing refund:', error)
      toast.error('Failed to process refund')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>Process Refund #{currentRow.refundNumber}</DialogTitle>
          <DialogDescription>
            Process this refund through Stripe. This will initiate the refund to the customer.
          </DialogDescription>
        </DialogHeader>
        
        <Alert>
          <CheckCircle className='h-4 w-4' />
          <AlertTitle>Confirm Processing</AlertTitle>
          <AlertDescription>
            You are about to process refund #{currentRow.refundNumber} for customer {currentRow.customerName} 
            with an amount of {formatCurrency(currentRow.amount)}. This will initiate the refund through Stripe.
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleProcess} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Process Refund'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
