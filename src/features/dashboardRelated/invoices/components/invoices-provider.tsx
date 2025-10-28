import { createContext, useContext, useState, type ReactNode } from 'react'
import type { InvoiceOutput } from '@/redux/apiSlices/Invoicing/invoicingSlice'

type InvoicesDialogType = 'view' | 'create' | 'void'

type InvoicesContextType = {
  open: InvoicesDialogType | null
  setOpen: (open: InvoicesDialogType | null) => void
  currentRow: InvoiceOutput | null
  setCurrentRow: (row: InvoiceOutput | null) => void
}

const InvoicesContext = createContext<InvoicesContextType | undefined>(undefined)

export function InvoicesProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<InvoicesDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<InvoiceOutput | null>(null)

  return (
    <InvoicesContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </InvoicesContext.Provider>
  )
}

export function useInvoices() {
  const context = useContext(InvoicesContext)
  if (context === undefined) {
    throw new Error('useInvoices must be used within an InvoicesProvider')
  }
  return context
}
