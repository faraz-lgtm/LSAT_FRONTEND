import { AutomationLogsViewDialog } from './automation-logs-view-dialog'
import { useAutomationLogs } from './automation-logs-provider'

export function AutomationLogsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAutomationLogs()
  
  return (
    <>
      {currentRow && (
        <AutomationLogsViewDialog
          key={`automation-log-view-${currentRow.id}`}
          open={open === 'view'}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            } else {
              setOpen('view')
            }
          }}
          currentRow={currentRow}
        />
      )}
    </>
  )
}



