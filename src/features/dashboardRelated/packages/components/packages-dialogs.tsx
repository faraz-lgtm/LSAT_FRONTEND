import { PackagesActionDialog } from './packages-action-dialog'
import { PackagesDeleteDialog } from './packages-delete-dialog'
import { usePackages } from './packages-provider'

export function PackagesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePackages()
  
  return (
    <>
      <PackagesActionDialog
        key='package-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <PackagesActionDialog
            key={`package-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <PackagesDeleteDialog
            key={`package-delete-${currentRow.id}`}
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
