import { TransactionsViewDialog } from './transactions-view-dialog'
import { useTransactions } from './transactions-provider'

export function TransactionsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useTransactions()
  
  return (
    <>
      {currentRow && (
        <TransactionsViewDialog
          key={`transaction-view-${currentRow.id}`}
          open={open === 'view'}
          onOpenChange={() => {
            setOpen('view')
            setTimeout(() => {
              setCurrentRow(null)
            }, 500)
          }}
          currentRow={currentRow}
        />
      )}
    </>
  )
}
