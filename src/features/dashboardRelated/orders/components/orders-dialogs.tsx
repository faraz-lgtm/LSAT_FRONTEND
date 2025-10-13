import { OrdersViewDialog } from './orders-view-dialog'
import { OrdersDeleteDialog } from './orders-delete-dialog'
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
