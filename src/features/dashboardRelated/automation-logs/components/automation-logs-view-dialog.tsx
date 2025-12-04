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
import type { AutomationLogOutputDto } from '@/redux/apiSlices/Automation/automationSlice'
import { format } from 'date-fns'
import { ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { formatCurrencyWithSymbol } from '@/utils/currency'
import { cn } from '@/lib/dashboardRelated/utils'

type AutomationLogsViewDialogProps = {
  currentRow: AutomationLogOutputDto
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AutomationLogsViewDialog({
  currentRow,
  open,
  onOpenChange,
}: AutomationLogsViewDialogProps) {
  const navigate = useNavigate()
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const order = currentRow.eventData?.order
  const customer = order?.customer
  const appointments = order?.appointments || []
  const items = order?.items || []
  const stripeMeta = order?.stripe_meta

  const statusColors = {
    success: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400',
    failure: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400',
    pending: 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400',
  }

  const toolTypeColors: Record<string, string> = {
    slack: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
    email: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    sms: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400',
    whatsapp: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-4xl max-h-[90vh] flex flex-col'>
        <DialogHeader className='text-start flex-shrink-0'>
          <DialogTitle>Automation Log Details</DialogTitle>
          <DialogDescription>
            View detailed information about this automation execution.
          </DialogDescription>
        </DialogHeader>
        
        <div className='space-y-6 overflow-y-auto flex-1 min-h-0 pr-2'>
          {/* Log Information */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold'>Log Information</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Log ID</label>
                <div className='flex items-center gap-2'>
                  <p className='text-sm font-medium'>#{currentRow.id}</p>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 w-6 p-0'
                    onClick={() => copyToClipboard(String(currentRow.id), 'logId')}
                  >
                    {copiedField === 'logId' ? (
                      <Check className='h-3 w-3' />
                    ) : (
                      <Copy className='h-3 w-3' />
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Automation Key</label>
                <div className='flex items-center gap-2'>
                  <p className='text-sm font-mono'>{currentRow.automationKey}</p>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 w-6 p-0'
                    onClick={() => copyToClipboard(currentRow.automationKey, 'automationKey')}
                  >
                    {copiedField === 'automationKey' ? (
                      <Check className='h-3 w-3' />
                    ) : (
                      <Copy className='h-3 w-3' />
                    )}
                  </Button>
                </div>
              </div>
              {currentRow.triggerEvent && (
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>Trigger Event</label>
                  <p className='text-sm font-mono'>{currentRow.triggerEvent}</p>
                </div>
              )}
              {currentRow.toolType && (
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>Tool Type</label>
                  <Badge className={cn('text-xs', toolTypeColors[currentRow.toolType.toLowerCase()] || 'bg-gray-500/10')}>
                    {currentRow.toolType}
                  </Badge>
                </div>
              )}
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Status</label>
                <Badge className={cn('text-xs', statusColors[currentRow.status])}>
                  {currentRow.status.toUpperCase()}
                </Badge>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Executed At</label>
                <p className='text-sm'>{format(new Date(currentRow.executedAt), 'PPpp')}</p>
              </div>
              {currentRow.createdAt && (
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>Created At</label>
                  <p className='text-sm'>{format(new Date(currentRow.createdAt), 'PPpp')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Error Information */}
          {currentRow.error && (
            <div className='space-y-3'>
              <h3 className='text-lg font-semibold text-red-600'>Error</h3>
              <div className='p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
                <p className='text-sm text-red-800 dark:text-red-200'>{currentRow.error}</p>
              </div>
            </div>
          )}

          {/* Order Information */}
          {order && (
            <>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-semibold'>Order Information</h3>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      navigate({
                        to: '/orders',
                        search: {
                          orderId: order.id,
                        },
                      })
                    }}
                  >
                    View Order
                    <ExternalLink className='ml-2 h-4 w-4' />
                  </Button>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>Order ID</label>
                    <p className='text-sm font-medium'>#{order.id}</p>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>Status</label>
                    <Badge variant='outline' className='uppercase'>
                      {order.orderStatus || '—'}
                    </Badge>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>Currency</label>
                    <p className='text-sm'>{order.currency || '—'}</p>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>Created At</label>
                    <p className='text-sm'>{order.createdAt ? format(new Date(order.createdAt), 'PPpp') : '—'}</p>
                  </div>
                  {order.googleMeetLink && (
                    <div className='col-span-2'>
                      <label className='text-sm font-medium text-muted-foreground'>Google Meet Link</label>
                      <div className='flex items-center gap-2'>
                        <a
                          href={order.googleMeetLink}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1'
                        >
                          {order.googleMeetLink}
                          <ExternalLink className='h-3 w-3' />
                        </a>
                      </div>
                    </div>
                  )}
                  {order.notes && (
                    <div className='col-span-2'>
                      <label className='text-sm font-medium text-muted-foreground'>Notes</label>
                      <p className='text-sm'>{order.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Information */}
              {customer && (
                <div className='space-y-3'>
                  <h3 className='text-lg font-semibold'>Customer Information</h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='text-sm font-medium text-muted-foreground'>Name</label>
                      <p className='text-sm'>{customer.name || '—'}</p>
                    </div>
                    <div>
                      <label className='text-sm font-medium text-muted-foreground'>Email</label>
                      <p className='text-sm'>{customer.email || '—'}</p>
                    </div>
                    <div>
                      <label className='text-sm font-medium text-muted-foreground'>Phone</label>
                      <p className='text-sm'>{customer.phone || '—'}</p>
                    </div>
                    <div>
                      <label className='text-sm font-medium text-muted-foreground'>Customer ID</label>
                      <p className='text-sm'>#{customer.id}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              {items.length > 0 && (
                <div className='space-y-3'>
                  <h3 className='text-lg font-semibold'>Order Items</h3>
                  <div className='space-y-2'>
                    {items.map((item: any, index: number) => (
                      <div key={index} className='p-3 border rounded-lg'>
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            <p className='font-medium'>{item.name || '—'}</p>
                            {item.Description && (
                              <p className='text-sm text-muted-foreground mt-1'>{item.Description}</p>
                            )}
                            <div className='flex gap-4 mt-2 text-sm text-muted-foreground'>
                              <span>Quantity: {item.quantity || 0}</span>
                              <span>Sessions: {item.sessions || 0}</span>
                              {item.Duration && <span>Duration: {item.Duration} min</span>}
                              {item.price && (
                                <span>Price: {item.price * (item.quantity || 1)} CAD</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stripe Payment Information */}
              {stripeMeta && (
                <div className='space-y-3'>
                  <h3 className='text-lg font-semibold'>Payment Information</h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='text-sm font-medium text-muted-foreground'>Payment Status</label>
                      <Badge variant='outline' className='uppercase'>
                        {stripeMeta.paymentStatus || '—'}
                      </Badge>
                    </div>
                    <div>
                      <label className='text-sm font-medium text-muted-foreground'>Amount Paid</label>
                      <p className='text-sm'>
                        {stripeMeta.amountPaid
                          ? formatCurrencyWithSymbol(stripeMeta.amountPaid, (stripeMeta.paidCurrency || 'CAD').toUpperCase())
                          : '—'}
                      </p>
                    </div>
                    {stripeMeta.paymentCompletedAt && (
                      <div>
                        <label className='text-sm font-medium text-muted-foreground'>Payment Completed At</label>
                        <p className='text-sm'>{format(new Date(stripeMeta.paymentCompletedAt), 'PPpp')}</p>
                      </div>
                    )}
                    {stripeMeta.checkoutSessionId && (
                      <div>
                        <label className='text-sm font-medium text-muted-foreground'>Checkout Session ID</label>
                        <div className='flex items-center gap-2'>
                          <p className='text-sm font-mono text-xs truncate'>{stripeMeta.checkoutSessionId}</p>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-6 w-6 p-0'
                            onClick={() => copyToClipboard(stripeMeta.checkoutSessionId, 'checkoutSessionId')}
                          >
                            {copiedField === 'checkoutSessionId' ? (
                              <Check className='h-3 w-3' />
                            ) : (
                              <Copy className='h-3 w-3' />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Appointments */}
              {appointments.length > 0 && (
                <div className='space-y-3'>
                  <h3 className='text-lg font-semibold'>Appointments</h3>
                  <div className='space-y-2'>
                    {appointments.map((appt: any) => (
                      <div key={appt.id} className='p-3 border rounded-lg'>
                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <label className='text-sm font-medium text-muted-foreground'>Appointment ID</label>
                            <p className='text-sm'>#{appt.id}</p>
                          </div>
                          <div>
                            <label className='text-sm font-medium text-muted-foreground'>Slot Date & Time</label>
                            <p className='text-sm'>{format(new Date(appt.slotDateTime), 'PPpp')}</p>
                          </div>
                          <div>
                            <label className='text-sm font-medium text-muted-foreground'>Item ID</label>
                            <p className='text-sm'>#{appt.itemId}</p>
                          </div>
                          <div>
                            <label className='text-sm font-medium text-muted-foreground'>Employee ID</label>
                            <p className='text-sm'>{appt.assignedEmployeeId ? `#${appt.assignedEmployeeId}` : 'Unassigned'}</p>
                          </div>
                          <div>
                            <label className='text-sm font-medium text-muted-foreground'>Attendance Status</label>
                            <Badge variant='outline' className='uppercase'>
                              {appt.attendanceStatus || 'UNKNOWN'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Metadata */}
          {currentRow.metadata && (
            <div className='space-y-3'>
              <h3 className='text-lg font-semibold'>Metadata</h3>
              <div className='p-3 bg-muted rounded-lg'>
                <pre className='text-xs overflow-x-auto'>
                  {JSON.stringify(currentRow.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
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

