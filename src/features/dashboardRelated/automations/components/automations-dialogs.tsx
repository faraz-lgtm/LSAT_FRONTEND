import { AutomationsEditDialog } from './automations-edit-dialog'
import { useAutomations } from './automations-provider'

export function AutomationsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAutomations()
  
  return (
    <>
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

