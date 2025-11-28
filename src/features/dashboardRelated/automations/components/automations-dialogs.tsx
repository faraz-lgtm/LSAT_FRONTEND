import { AutomationsEditDialog } from './automations-edit-dialog'
import { AutomationsCreateDialog } from './automations-create-dialog'
import { useAutomations } from './automations-provider'

export function AutomationsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAutomations()
  
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
    </>
  )
}

