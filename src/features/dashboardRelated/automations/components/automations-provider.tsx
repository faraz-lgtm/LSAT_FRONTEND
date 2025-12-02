import { createContext, useContext, useState, type ReactNode } from 'react'
type AutomationConfigOutputDto = any

type AutomationsDialogType = 'create' | 'edit' | 'view'

type AutomationsContextType = {
  open: AutomationsDialogType | null
  setOpen: (open: AutomationsDialogType | null) => void
  currentRow: AutomationConfigOutputDto | null
  setCurrentRow: (row: AutomationConfigOutputDto | null) => void
  deleteRow: AutomationConfigOutputDto | null
  setDeleteRow: (row: AutomationConfigOutputDto | null) => void
}

const AutomationsContext = createContext<AutomationsContextType | undefined>(undefined)

export function AutomationsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<AutomationsDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<AutomationConfigOutputDto | null>(null)
  const [deleteRow, setDeleteRow] = useState<AutomationConfigOutputDto | null>(null)

  return (
    <AutomationsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow, deleteRow, setDeleteRow }}>
      {children}
    </AutomationsContext.Provider>
  )
}

export function useAutomations() {
  const context = useContext(AutomationsContext)
  if (context === undefined) {
    throw new Error('useAutomations must be used within an AutomationsProvider')
  }
  return context
}

