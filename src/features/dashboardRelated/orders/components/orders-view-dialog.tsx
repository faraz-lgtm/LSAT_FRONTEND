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
import { Textarea } from '@/components/dashboard/ui/textarea'
import type { OrderOutput } from '@/types/api/data-contracts'
import { useGetRefundsByOrderQuery } from '@/redux/apiSlices/Refunds/refundsSlice'
import { formatCurrency } from '@/utils/currency'
import { formatDateTime } from '@/utils/currency'
import { RefundStatusBadge } from '@/components/dashboard/ui/refund-status-badge'
import { ExternalLink, Clipboard, Check } from 'lucide-react'
import { 
  useListOrderAppointmentsQuery, 
  useMarkAppointmentAttendanceMutation, 
  useUpdateOrderNotesMutation,
  useGenerateRescheduleLinkMutation,
} from '@/redux/apiSlices/Order/orderSlice'
import { useEffect, useMemo, useState } from 'react'

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

  // Notes state + mutation
  const [notes, setNotes] = useState<string>(currentRow.notes ?? '')
  useEffect(() => {
    if (open) setNotes(currentRow.notes ?? '')
  }, [open, currentRow.notes])
  const [updateNotes, { isLoading: isSavingNotes }] = useUpdateOrderNotesMutation()

  // Appointments list + attendance mutation
  const { data: apptsData, isLoading: isLoadingAppts } = useListOrderAppointmentsQuery(currentRow.id, { skip: !open })
  const [markAttendance, { isLoading: isMarking }] = useMarkAppointmentAttendanceMutation()
  const [generateLink, { isLoading: isGenerating } ] = useGenerateRescheduleLinkMutation()
  const [copyingApptId, setCopyingApptId] = useState<number | null>(null)
  const [copiedApptId, setCopiedApptId] = useState<number | null>(null)
  const [copyErrorApptId, setCopyErrorApptId] = useState<number | null>(null)
  const appointments = useMemo(() => {
    // handle either wrapped BaseApiResponse or raw array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = (apptsData as any)?.data ?? apptsData
    return (payload ?? []) as Array<{ id: number; orderId: number; itemId: number; slotDateTime: string; assignedEmployeeId?: number | null; attendanceStatus: 'UNKNOWN' | 'SHOWED' | 'NO_SHOW' | 'RESCHEDULED' }>
  }, [apptsData])

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

          {/* Notes and Tags */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold'>Notes</h3>
            <div className='space-y-2'>
              {Array.isArray(currentRow.tags) && currentRow.tags.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {currentRow.tags.map((t, i) => (
                    <Badge key={i} variant='outline' className='uppercase'>
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
              <Textarea
                placeholder='Add order notes...'
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className='flex justify-end'>
                <Button
                  size='sm'
                  disabled={isSavingNotes}
                  onClick={async () => {
                    await updateNotes({ id: currentRow.id, body: { notes } })
                  }}
                >
                  {isSavingNotes ? 'Saving...' : 'Save Notes'}
                </Button>
              </div>
            </div>
          </div>

          {/* Google Meet Link */}
          {currentRow.googleMeetLink && (
            <div className='space-y-3'>
              <h3 className='text-lg font-semibold'>Meeting Link</h3>
              <div className='border rounded-lg p-4 bg-muted/30'>
                <a
                  href={currentRow.googleMeetLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors break-all'
                >
                  <ExternalLink className='h-4 w-4 flex-shrink-0' />
                  <span className='text-sm font-medium break-all'>{currentRow.googleMeetLink}</span>
                </a>
              </div>
            </div>
          )}

          {/* Checkout Session URL - Only show if order status is RESERVED */}
          {currentRow.checkoutSessionUrl && (currentRow.slot_reservation_status === 'RESERVED' || currentRow.slot_reservation_status === 'FAILED') && (
            <div className='space-y-3'>
              <h3 className='text-lg font-semibold'>Checkout Session</h3>
              <div className='border rounded-lg p-4 bg-muted/30'>
                <a
                  href={currentRow.checkoutSessionUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors break-all'
                >
                  <ExternalLink className='h-4 w-4 flex-shrink-0' />
                  <span className='text-sm font-medium break-all'>{currentRow.checkoutSessionUrl}</span>
                </a>
              </div>
            </div>
          )}

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
                  </div>
                  
                  {Array.isArray(item.DateTime) && item.DateTime.length > 0 && (
                    <div className='border-t pt-3'>
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-sm font-medium'>Scheduled Sessions ({item.DateTime.length})</span>
                      </div>
                      <div className='space-y-1 max-h-32 overflow-y-auto'>
                        {item.DateTime.map((slotInput:any, idx:number) => (
                          <div key={idx} className='text-sm text-muted-foreground bg-background/50 rounded px-2 py-1'>
                            {slotInput && slotInput.dateTime 
                              ? new Date(slotInput.dateTime).toLocaleString()
                              : 'Invalid slot'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Appointments */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold'>Appointments</h3>
            {isLoadingAppts ? (
              <div className='text-center text-muted-foreground py-4'>Loading appointments...</div>
            ) : appointments.length === 0 ? (
              <div className='text-center text-muted-foreground py-4'>No appointments found</div>
            ) : (
              <div className='space-y-3'>
                {appointments.map((appt) => (
                  <div key={appt.id} className='grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 border rounded-lg'>
                    <div className='col-span-2 space-y-1'>
                      <div className='text-sm font-medium'>{new Date(appt.slotDateTime).toLocaleString()}</div>
                      <div className='text-xs text-muted-foreground'>Item #{appt.itemId} • Employee: {appt.assignedEmployeeId ?? 'Unassigned'}</div>
                      <div>
                        <Badge variant='outline' className='uppercase'>
                          {appt.attendanceStatus === 'SHOWED' ? 'Completed' : 
                           appt.attendanceStatus === 'NO_SHOW' ? 'No Show' : 
                           appt.attendanceStatus === 'RESCHEDULED' ? 'Rescheduled' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                    <div className='flex flex-wrap items-center gap-2 sm:justify-end'>
                      <Button size='sm' variant='secondary' disabled={isMarking} onClick={() => markAttendance({ appointmentId: appt.id, body: { status: 'SHOWED' } })}>Completed</Button>
                      <Button size='sm' variant='secondary' disabled={isMarking} onClick={() => markAttendance({ appointmentId: appt.id, body: { status: 'NO_SHOW' } })}>No Show</Button>
                      <Button size='sm' variant='outline' disabled={isMarking} onClick={() => markAttendance({ appointmentId: appt.id, body: { status: 'UNKNOWN' } })}>Reset</Button>
                      <Button
                        size='sm'
                        variant='ghost'
                        disabled={isGenerating || copyingApptId === appt.id}
                        onClick={async () => {
                          setCopyErrorApptId(null)
                          setCopiedApptId(null)
                          setCopyingApptId(appt.id)
                          try {
                            const resp = await generateLink({ appointmentId: appt.id }).unwrap()
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const url = (resp as any)?.data?.url ?? (resp as any)?.url
                            if (url) {
                              await navigator.clipboard.writeText(url)
                              setCopiedApptId(appt.id)
                              setTimeout(() => setCopiedApptId((prev) => (prev === appt.id ? null : prev)), 1500)
                            } else {
                              setCopyErrorApptId(appt.id)
                            }
                          } catch {
                            setCopyErrorApptId(appt.id)
                          } finally {
                            setCopyingApptId(null)
                          }
                        }}
                      >
                        {copiedApptId === appt.id ? (
                          <span className='inline-flex items-center gap-1'>
                            <Check className='h-4 w-4 text-green-600' /> Copied
                          </span>
                        ) : copyingApptId === appt.id ? (
                          <span className='inline-flex items-center gap-1'>Generating…</span>
                        ) : (
                          <span className='inline-flex items-center gap-1'>
                            <Clipboard className='h-4 w-4' /> Copy reschedule link
                          </span>
                        )}
                      </Button>
                      {copyErrorApptId === appt.id && (
                        <span className='text-xs text-destructive'>Failed to copy. Try again.</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
