import { createContext, useContext, useState } from 'react'
import useDialogState from '@/hooks/dashboardRelated/use-dialog-state'
import type { ProductOutput } from '@/types/api/data-contracts'

type DialogType = 'add' | 'edit' | 'delete'

type PackagesContextType = {
  open: DialogType | null
  setOpen: (open: DialogType | null) => void
  currentRow: ProductOutput | null
  setCurrentRow: (row: ProductOutput | null) => void
}

const PackagesContext = createContext<PackagesContextType | undefined>(undefined)

export function PackagesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<DialogType>(null)
  const [currentRow, setCurrentRow] = useState<ProductOutput | null>(null)

  return (
    <PackagesContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </PackagesContext.Provider>
  )
}

export function usePackages() {
  const context = useContext(PackagesContext)
  if (context === undefined) {
    throw new Error('usePackages must be used within a PackagesProvider')
  }
  return context
}
