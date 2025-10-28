import { createContext, useContext, useState, type ReactNode } from 'react'

type AutomationLogsDialogType = 'view'

type AutomationLogsContextType = {
  open: AutomationLogsDialogType | null
  setOpen: (open: AutomationLogsDialogType | null) => void
  currentRow: any | null
  setCurrentRow: (row: any | null) => void
}

const AutomationLogsContext = createContext<AutomationLogsContextType | undefined>(undefined)

export function AutomationLogsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<AutomationLogsDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<any | null>(null)

  return (
    <AutomationLogsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </AutomationLogsContext.Provider>
  )
}

export function useAutomationLogs() {
  const context = useContext(AutomationLogsContext)
  if (context === undefined) {
    throw new Error('useAutomationLogs must be used within an AutomationLogsProvider')
  }
  return context
}

