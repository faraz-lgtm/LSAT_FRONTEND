import { OrdersViewDialog } from './orders-view-dialog'
import { OrdersDeleteDialog } from './orders-delete-dialog'
import { OrdersRefundDialog } from './orders-refund-dialog'
import { OrdersCancelDialog } from './orders-cancel-dialog'
import { useOrders } from './orders-provider'

export function OrdersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useOrders()
  
  return (
    <>
      {currentRow && (
        <>
          <OrdersViewDialog
            key={`order-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={() => {
              setOpen('view')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <OrdersCancelDialog
            key={`order-cancel-${currentRow.id}`}
            open={open === 'cancel'}
            onOpenChange={() => {
              setOpen('cancel')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <OrdersRefundDialog
            key={`order-refund-${currentRow.id}`}
            open={open === 'refund'}
            onOpenChange={() => {
              setOpen('refund')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <OrdersDeleteDialog
            key={`order-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
