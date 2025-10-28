import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/dashboard/ui/dialog'
import { RefundStatusBadge } from '@/components/dashboard/ui/refund-status-badge'
import { formatCurrency } from '@/utils/currency'
import { formatDateTime } from '@/utils/currency'
import type { RefundOutput } from '@/redux/apiSlices/Refunds/refundsSlice'

type RefundsViewDialogProps = {
  currentRow: RefundOutput
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RefundsViewDialog({
  currentRow,
  open,
  onOpenChange,
}: RefundsViewDialogProps) {
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] flex flex-col'>
        <DialogHeader className='text-start flex-shrink-0'>
          <DialogTitle>Refund #{currentRow.refundNumber}</DialogTitle>
          <DialogDescription>
            View refund details and customer information.
          </DialogDescription>
        </DialogHeader>
        
        <div className='space-y-6 overflow-y-auto flex-1 min-h-0 pr-2'>
          {/* Customer Information */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold'>Customer Information</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Name</label>
                <p className='text-sm'>{currentRow.customerName}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Email</label>
                <p className='text-sm'>{currentRow.customerEmail}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Customer ID</label>
                <p className='text-sm'>{currentRow.customerId}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Original Order ID</label>
                <p className='text-sm'>{currentRow.originalOrderId}</p>
              </div>
            </div>
          </div>

          {/* Refund Summary */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold'>Refund Summary</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Status</label>
                <div className='mt-1'>
                  <RefundStatusBadge status={currentRow.status} />
                </div>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Amount</label>
                <p className='text-sm font-semibold'>{formatCurrency(currentRow.amount)}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Reason</label>
                <p className='text-sm capitalize'>{currentRow.reason.replace('_', ' ')}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Created</label>
                <p className='text-sm'>{formatDateTime(currentRow.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          {currentRow.reasonDetails && (
            <div className='space-y-3'>
              <h3 className='text-lg font-semibold'>Reason Details</h3>
              <p className='text-sm text-muted-foreground'>{currentRow.reasonDetails}</p>
            </div>
          )}

          {/* Stripe Information */}
          {currentRow.stripeRefundId && (
            <div className='space-y-3'>
              <h3 className='text-lg font-semibold'>Stripe Information</h3>
              <div className='grid grid-cols-1 gap-4'>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>Stripe Refund ID</label>
                  <p className='text-sm font-mono'>{currentRow.stripeRefundId}</p>
                </div>
                {currentRow.processedAt && (
                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>Processed At</label>
                    <p className='text-sm'>{formatDateTime(currentRow.processedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
