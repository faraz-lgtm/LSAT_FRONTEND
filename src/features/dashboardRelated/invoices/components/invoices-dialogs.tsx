import { InvoicesViewDialog } from './invoices-view-dialog'
import { InvoicesCreateDialog } from './invoices-create-dialog'
import { InvoicesVoidDialog } from './invoices-void-dialog'
import { useInvoices } from './invoices-provider'

export function InvoicesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useInvoices()
  
  return (
    <>
      {currentRow && (
        <>
          <InvoicesViewDialog
            key={`invoice-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={() => {
              setOpen('view')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <InvoicesVoidDialog
            key={`invoice-void-${currentRow.id}`}
            open={open === 'void'}
            onOpenChange={() => {
              setOpen('void')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}

      <InvoicesCreateDialog
        open={open === 'create'}
        onOpenChange={() => {
          setOpen('create')
        }}
      />
    </>
  )
}
