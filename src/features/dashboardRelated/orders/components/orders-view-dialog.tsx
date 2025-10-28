/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Button } from '@/components/dashboard/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/dashboard/ui/dialog'
import { Badge } from '@/components/dashboard/ui/badge'
import type { OrderOutput } from '@/types/api/data-contracts'
import { useGetRefundsByOrderQuery } from '@/redux/apiSlices/Refunds/refundsSlice'
import { formatCurrency } from '@/utils/currency'
import { formatDateTime } from '@/utils/currency'
import { RefundStatusBadge } from '@/components/dashboard/ui/refund-status-badge'

type OrdersViewDialogProps = {
  currentRow: OrderOutput
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrdersViewDialog({
  currentRow,
  open,
  onOpenChange,
}: OrdersViewDialogProps) {
  // Use formatCurrency directly for CAD display
  const totalAmount = currentRow.items.reduce((sum:number, item:any) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price
    return sum + (price * item.quantity)
  }, 0)
  const totalItems = currentRow.items.reduce((sum:number, item:any) => sum + item.quantity, 0)
  
  // Fetch refunds for this order
  const { data: refundsData, isLoading: isLoadingRefunds } = useGetRefundsByOrderQuery(currentRow.id, {
    skip: !open, // Only fetch when dialog is open
  })
  
  const refunds = refundsData?.data || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] flex flex-col'>
        <DialogHeader className='text-start flex-shrink-0'>
          <DialogTitle>Order #{currentRow.id}</DialogTitle>
          <DialogDescription>
            View order details and customer information.
          </DialogDescription>
        </DialogHeader>
        
        <div className='space-y-6 overflow-y-auto flex-1 min-h-0 pr-2'>
          {/* Customer Information */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold'>Customer Information</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Name</label>
                <p className='text-sm'>{currentRow.customer.name}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Email</label>
                <p className='text-sm'>{currentRow.customer.email}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Phone</label>
                <p className='text-sm'>{currentRow.customer.phone}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Status</label>
                <Badge variant={currentRow.customer.isAccountDisabled ? 'destructive' : 'default'}>
                  {currentRow.customer.isAccountDisabled ? 'Disabled' : 'Active'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold'>Order Summary</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Total Items</label>
                <p className='text-sm'>{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Total Amount</label>
                <p className='text-sm font-semibold text-green-600'>{formatCurrency(totalAmount * 100)}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold'>Order Items</h3>
            <div className='space-y-3'>
              {currentRow.items.map((item:any, index:number) => (
                <div key={index} className='border rounded-lg p-4 bg-muted/30'>
                  <div className='flex justify-between items-start mb-3'>
                    <h4 className='font-medium text-base'>{item.name}</h4>
                    <div className='text-right'>
                      <div className='text-sm font-semibold text-green-600'>
                        {formatCurrency((typeof item.price === 'string' ? parseFloat(item.price) : item.price) * 100)}
                      </div>
                      <div className='text-xs text-muted-foreground'>Qty: {item.quantity}</div>
                    </div>
                  </div>
                  
                  {item.Description && (
                    <p className='text-sm text-muted-foreground mb-3'>{item.Description}</p>
                  )}
                  
                  <div className='grid grid-cols-2 gap-3 text-sm mb-3'>
                    <div>
                      <span className='font-medium text-muted-foreground'>Duration:</span>
                      <div className='text-foreground'>{item.Duration} minutes</div>
                    </div>
                    <div>
                      <span className='font-medium text-muted-foreground'>Employee ID:</span>
                      <div className='text-foreground'>{item.assignedEmployeeIds.join(', ')}</div>
                    </div>
                  </div>
                  
                  {item.DateTime.length > 0 && (
                    <div className='border-t pt-3'>
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-sm font-medium'>Scheduled Sessions ({item.DateTime.length})</span>
                      </div>
                      <div className='space-y-1 max-h-32 overflow-y-auto'>
                        {item.DateTime.map((dateTime:any, idx:number) => (
                          <div key={idx} className='text-sm text-muted-foreground bg-background/50 rounded px-2 py-1'>
                            {new Date(dateTime).toLocaleString()}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Refund History */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold'>Refund History</h3>
            {isLoadingRefunds ? (
              <div className='text-center text-muted-foreground py-4'>
                Loading refunds...
              </div>
            ) : refunds.length > 0 ? (
              <div className='space-y-2'>
                {refunds.map((refund) => (
                  <div key={refund.id} className='flex justify-between items-center p-3 border rounded-lg'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <span className='font-medium'>#{refund.refundNumber}</span>
                        <RefundStatusBadge status={refund.status} />
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        {refund.reason} - {refund.reasonDetails}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        Created: {formatDateTime(refund.createdAt)}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='font-semibold text-red-600'>
                        -{formatCurrency(
                          typeof refund.amount === 'string' 
                            ? parseFloat(refund.amount) 
                            : refund.amount
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center text-muted-foreground py-4'>
                No refunds found for this order
              </div>
            )}
          </div>
        </div>

        <DialogFooter className='flex-shrink-0'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
