import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/dashboard/ui/dialog'
import { TransactionStatusBadge } from '@/components/dashboard/ui/transaction-status-badge'
import { formatCurrency } from '@/utils/currency'
import { formatDateTime } from '@/utils/currency'
import type { TransactionOutput } from '@/redux/apiSlices/Transactions/transactionsSlice'

type TransactionsViewDialogProps = {
  currentRow: TransactionOutput
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionsViewDialog({
  currentRow,
  open,
  onOpenChange,
}: TransactionsViewDialogProps) {
  
  // Helper function to format metadata values (convert cents to dollars for monetary fields)
  const formatMetadataValue = (key: string, value: unknown): string => {
    // Check if this is a monetary field that needs cents to dollars conversion
    const monetaryKeys = ['taxamount', 'invoicesubtotal', 'totalamountincludetax', 'amount', 'price', 'subtotal', 'tax', 'total'];
    const isMonetaryValue = monetaryKeys.some(mk => key.toLowerCase().includes(mk));
    
    if (isMonetaryValue && typeof value === 'number') {
      // Convert cents to dollars
      return formatCurrency(value);
    }
    
    // For other values, return as string
    return String(value);
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] flex flex-col'>
        <DialogHeader className='text-start flex-shrink-0'>
          <DialogTitle>Transaction #{currentRow.transactionNumber}</DialogTitle>
          <DialogDescription>
            View transaction details and customer information.
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
                <label className='text-sm font-medium text-muted-foreground'>Order ID</label>
                <p className='text-sm'>{currentRow.orderId}</p>
              </div>
            </div>
          </div>

          {/* Transaction Summary */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold'>Transaction Summary</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Type</label>
                <p className='text-sm capitalize'>{currentRow.type}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Status</label>
                <div className='mt-1'>
                  <TransactionStatusBadge status={currentRow.status} />
                </div>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Amount</label>
                <p className='text-sm font-semibold'>{formatCurrency(currentRow.amount)}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Payment Method</label>
                <p className='text-sm'>{currentRow.paymentMethod || 'N/A'}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Created</label>
                <p className='text-sm'>{formatDateTime(currentRow.createdAt)}</p>
              </div>
              {currentRow.processedAt && (
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>Processed</label>
                  <p className='text-sm'>{formatDateTime(currentRow.processedAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stripe Information */}
          {(currentRow.stripeTransactionId || currentRow.stripePaymentIntentId) && (
            <div className='space-y-3'>
              <h3 className='text-lg font-semibold'>Stripe Information</h3>
              <div className='grid grid-cols-1 gap-4'>
                {currentRow.stripeTransactionId && (
                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>Stripe Transaction ID</label>
                    <p className='text-sm font-mono'>{currentRow.stripeTransactionId}</p>
                  </div>
                )}
                {currentRow.stripePaymentIntentId && (
                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>Stripe Payment Intent ID</label>
                    <p className='text-sm font-mono'>{currentRow.stripePaymentIntentId}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Items */}
          {currentRow.metadata?.orderItems && Array.isArray(currentRow.metadata.orderItems) && currentRow.metadata.orderItems.length > 0 && (
            <div className='space-y-3'>
              <h3 className='text-lg font-semibold'>Order Items</h3>
              <div className='space-y-2'>
                {currentRow.metadata.orderItems.map((item: Record<string, unknown>, index: number) => (
                  <div key={index} className='flex justify-between items-center p-3 border rounded-lg'>
                    <div className='flex-1'>
                      <p className='font-medium'>{item.name as string}</p>
                      <p className='text-sm text-muted-foreground'>
                        {(item.Description || item.description) as string}
                      </p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Quantity: {item.quantity as number} • Duration: {item.Duration as number} min • Price: {formatCurrency((item.price as number || 0) * 100)}
                      </p>
                      {item.DateTime && Array.isArray(item.DateTime) && item.DateTime.length > 0 ? (
                        <p className='text-xs text-muted-foreground'>
                          Sessions: {(item.DateTime as unknown[]).length}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Metadata */}
          {currentRow.metadata && Object.keys(currentRow.metadata).filter(key => key !== 'orderItems').length > 0 && (
            <div className='space-y-3'>
              <h3 className='text-lg font-semibold'>Additional Information</h3>
              <div className='space-y-2'>
                {Object.entries(currentRow.metadata).map(([key, value]) => {
                  // Skip orderItems as it's handled separately above
                  if (key === 'orderItems') return null
                  
                  // Handle arrays of objects
                  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
                    return (
                      <div key={key}>
                        <span className='text-sm font-medium text-muted-foreground capitalize block mb-2'>
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <div className='ml-4 space-y-1'>
                          {value.map((item, idx) => (
                            <div key={idx} className='text-sm'>
                              {JSON.stringify(item, null, 2)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  
                  return (
                    <div key={key} className='flex justify-between'>
                      <span className='text-sm font-medium text-muted-foreground capitalize'>
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className='text-sm'>
                        {Array.isArray(value) ? value.join(', ') : formatMetadataValue(key, value)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
