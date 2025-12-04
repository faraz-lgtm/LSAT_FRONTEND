import { AutomationsEditDialog } from './automations-edit-dialog'
import { AutomationsCreateDialog } from './automations-create-dialog'
import { AutomationsDeleteDialog } from './automations-delete-dialog'
import { useAutomations } from './automations-provider'

export function AutomationsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, deleteRow, setDeleteRow } = useAutomations()
  
  return (
    <>
      <AutomationsCreateDialog
        open={open === 'create'}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(null)
          }
        }}
      />
      {currentRow && (
        <>
          <AutomationsEditDialog
            key={`automation-edit-${currentRow.key}`}
            open={open === 'edit'}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setOpen(null)
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />
        </>
      )}
      {deleteRow && (
        <AutomationsDeleteDialog
          open={!!deleteRow}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setDeleteRow(null)
            }
          }}
          currentRow={deleteRow}
        />
      )}
    </>
  )
}

