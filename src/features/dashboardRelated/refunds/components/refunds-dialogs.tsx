import { RefundsViewDialog } from './refunds-view-dialog'
import { RefundsCreateDialog } from './refunds-create-dialog'
import { RefundsProcessDialog } from './refunds-process-dialog'
import { RefundsCancelDialog } from './refunds-cancel-dialog'
import { useRefunds } from './refunds-provider'

export function RefundsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useRefunds()
  
  return (
    <>
      {currentRow && (
        <>
          <RefundsViewDialog
            key={`refund-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={() => {
              setOpen('view')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <RefundsProcessDialog
            key={`refund-process-${currentRow.id}`}
            open={open === 'process'}
            onOpenChange={() => {
              setOpen('process')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <RefundsCancelDialog
            key={`refund-cancel-${currentRow.id}`}
            open={open === 'cancel'}
            onOpenChange={() => {
              setOpen('cancel')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}

      <RefundsCreateDialog
        open={open === 'create'}
        onOpenChange={() => {
          setOpen('create')
        }}
      />
    </>
  )
}
