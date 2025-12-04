import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Eye, Trash2, ReceiptText, XCircle, CheckCircle2 } from 'lucide-react'
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
import { useCompleteOrderMutation } from '@/redux/apiSlices/Order/orderSlice'
import { toast } from 'sonner'

type DataTableRowActionsProps = {
  row: Row<OrderOutput>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useOrders()
  const user = useSelector((state: RootState) => state.auth.user)
  const isAdmin = isAdminOrSuperAdmin(user?.roles)
  const [completeOrder, { isLoading: isCompleting }] = useCompleteOrderMutation()
  
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
