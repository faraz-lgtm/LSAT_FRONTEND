import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/dashboard/ui/dialog'
import { InvoiceStatusBadge } from '@/components/dashboard/ui/invoice-status-badge'
import { formatDollarsToCurrency } from '@/utils/currency'
import { formatDate, formatDateTime } from '@/utils/currency'
import type { InvoiceOutput } from '@/redux/apiSlices/Invoicing/invoicingSlice'

type InvoicesViewDialogProps = {
  currentRow: InvoiceOutput
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoicesViewDialog({
  currentRow,
  open,
  onOpenChange,
}: InvoicesViewDialogProps) {
  // API returns amounts as strings in DOLLARS in the invoice's native currency
  // No need to parse here, we'll use formatDollarsToCurrency directly

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] flex flex-col'>
        <DialogHeader className='text-start flex-shrink-0'>
          <DialogTitle>Invoice #{currentRow.invoiceNumber}</DialogTitle>
          <DialogDescription>
            View invoice details and customer information.
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

          {/* Invoice Summary */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold'>Invoice Summary</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Status</label>
                <div className='mt-1'>
                  <InvoiceStatusBadge status={currentRow.status} />
                </div>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Due Date</label>
                <p className='text-sm'>{formatDate(currentRow.dueDate)}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Subtotal</label>
                <p className='text-sm font-semibold'>{formatDollarsToCurrency(currentRow.subtotal, currentRow.currency)}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Tax</label>
                <p className='text-sm font-semibold'>{formatDollarsToCurrency(currentRow.tax, currentRow.currency)}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Total Amount</label>
                <p className='text-sm font-bold'>{formatDollarsToCurrency(currentRow.total, currentRow.currency)}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Currency</label>
                <p className='text-sm'>{currentRow.currency}</p>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold'>Line Items</h3>
            <div className='space-y-2'>
              {currentRow.items && currentRow.items.length > 0 ? (
                currentRow.items.map((item, index) => {
                  // Backend sends amounts in dollars as strings
                  // unitPrice and totalPrice are in dollars (e.g., "12500.00")
                  const unitPrice = String(item.unitPrice || item.price || 0)
                  const itemTotal = String(item.totalPrice || item.total || 0)
                  
                  return (
                    <div key={item.id || index} className='flex justify-between items-center p-3 border rounded-lg'>
                      <div className='flex-1'>
                        <p className='font-medium'>{item.description || item.name || 'Item'}</p>
                        <p className='text-sm text-muted-foreground'>
                          Quantity: {item.quantity} × {formatDollarsToCurrency(unitPrice, currentRow.currency)}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='font-semibold'>{formatDollarsToCurrency(itemTotal, currentRow.currency)}</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className='text-center text-muted-foreground py-4'>
                  No line items found
                </div>
              )}
            </div>
            <div className='flex justify-between items-center pt-2 border-t'>
              <span className='text-lg font-semibold'>Total</span>
              <span className='text-lg font-bold'>{formatDollarsToCurrency(currentRow.total, currentRow.currency)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
