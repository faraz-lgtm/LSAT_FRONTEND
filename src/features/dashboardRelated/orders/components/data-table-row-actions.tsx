import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Eye, Trash2, ReceiptText, XCircle, CheckCircle2, CalendarClock, Check } from 'lucide-react'
import { Button } from '@/components/dashboard/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/dashboard/ui/dropdown-menu'
import { useOrders } from './orders-provider'
import type { OrderOutput } from '@/types/api/data-contracts'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/store'
import { isAdminOrSuperAdmin } from '@/utils/rbac'
import { useCompleteOrderMutation, useGenerateOrderRescheduleLinkMutation } from '@/redux/apiSlices/Order/orderSlice'
import { toast } from 'sonner'
import { useState } from 'react'

type DataTableRowActionsProps = {
  row: Row<OrderOutput>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useOrders()
  const user = useSelector((state: RootState) => state.auth.user)
  const isAdmin = isAdminOrSuperAdmin(user?.roles)
  const [completeOrder, { isLoading: isCompleting }] = useCompleteOrderMutation()
  const [generateOrderRescheduleLink, { isLoading: isGeneratingLink }] = useGenerateOrderRescheduleLinkMutation()
  const [isCopied, setIsCopied] = useState(false)
  
  const orderStatus = row.original.orderStatus
  const isCompleted = orderStatus === 'COMPLETED'
  
  // Calculate total order amount
  const orderTotal = row.original.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  const handleCompleteOrder = async () => {
    try {
      await completeOrder(row.original.id).unwrap()
      toast.success('Order marked as completed')
    } catch (error) {
      toast.error('Failed to mark order as completed')
      console.error('Error completing order:', error)
    }
  }

  const handleRescheduleOrder = async () => {
    try {
      const resp = await generateOrderRescheduleLink({ orderId: row.original.id }).unwrap()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const url = (resp as any)?.data?.url ?? (resp as any)?.url
      
      if (url) {
        // Copy to clipboard
        await navigator.clipboard.writeText(url)
        setIsCopied(true)
        toast.success('Reschedule link copied to clipboard!')
        setTimeout(() => setIsCopied(false), 2000)
        
        // Open in new tab
        window.open(url, '_blank', 'noopener')
      } else {
        toast.error('Could not generate reschedule link')
      }
    } catch (error) {
      console.error('Error generating order reschedule link:', error)
      toast.error('Failed to generate reschedule link')
    }
  }
  
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('view')
            }}
          >
            View Details
            <DropdownMenuShortcut>
              <Eye size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          {!isCompleted && (
            <DropdownMenuItem
              onClick={handleRescheduleOrder}
              disabled={isGeneratingLink}
              className='text-blue-600'
            >
              {isGeneratingLink ? 'Generating...' : isCopied ? 'Link Copied!' : 'Reschedule Order'}
              <DropdownMenuShortcut>
                {isCopied ? <Check size={16} /> : <CalendarClock size={16} />}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {isAdmin && (
            <>
              <DropdownMenuItem
                onClick={() => {
                  setCurrentRow(row.original)
                  setOpen('cancel')
                }}
                className='text-orange-600'
              >
                Cancel Order
                <DropdownMenuShortcut>
                  <XCircle size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              {!isCompleted && (
                <DropdownMenuItem
                  onClick={handleCompleteOrder}
                  disabled={isCompleting}
                  className='text-purple-600'
                >
                  Mark as Completed
                  <DropdownMenuShortcut>
                    <CheckCircle2 size={16} />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              )}
              {orderTotal > 0 && (
                <DropdownMenuItem
                  onClick={() => {
                    setCurrentRow(row.original)
                    setOpen('refund')
                  }}
                  className='text-blue-600'
                >
                  Simple Refund
                  <DropdownMenuShortcut>
                    <ReceiptText size={16} />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setCurrentRow(row.original)
                  setOpen('delete')
                }}
                className='text-red-500!'
              >
                Delete Order
                <DropdownMenuShortcut>
                  <Trash2 size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
