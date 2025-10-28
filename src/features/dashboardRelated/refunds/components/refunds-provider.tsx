import { createContext, useContext, useState, type ReactNode } from 'react'
import type { RefundOutput } from '@/redux/apiSlices/Refunds/refundsSlice'

type RefundsDialogType = 'view' | 'create' | 'process' | 'cancel'

type RefundsContextType = {
  open: RefundsDialogType | null
  setOpen: (open: RefundsDialogType | null) => void
  currentRow: RefundOutput | null
  setCurrentRow: (row: RefundOutput | null) => void
}

const RefundsContext = createContext<RefundsContextType | undefined>(undefined)

export function RefundsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<RefundsDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<RefundOutput | null>(null)

  return (
    <RefundsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </RefundsContext.Provider>
  )
}

export function useRefunds() {
  const context = useContext(RefundsContext)
  if (context === undefined) {
    throw new Error('useRefunds must be used within a RefundsProvider')
  }
  return context
}
