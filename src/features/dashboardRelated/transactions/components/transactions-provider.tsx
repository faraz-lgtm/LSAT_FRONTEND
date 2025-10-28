import { createContext, useContext, useState, type ReactNode } from 'react'
import type { TransactionOutput } from '@/redux/apiSlices/Transactions/transactionsSlice'

type TransactionsDialogType = 'view'

type TransactionsContextType = {
  open: TransactionsDialogType | null
  setOpen: (open: TransactionsDialogType | null) => void
  currentRow: TransactionOutput | null
  setCurrentRow: (row: TransactionOutput | null) => void
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined)

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<TransactionsDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<TransactionOutput | null>(null)

  return (
    <TransactionsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </TransactionsContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionsContext)
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider')
  }
  return context
}
