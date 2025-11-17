import React, { useState } from 'react'
import useDialogState from '@/hooks/dashboardRelated/use-dialog-state'
import { type OrganizationOutput } from '@/redux/apiSlices/Organization/organizationSlice'

type OrganizationsDialogType = 'add' | 'edit' | 'delete'

type OrganizationsContextType = {
  open: OrganizationsDialogType | null
  setOpen: (str: OrganizationsDialogType | null) => void
  currentRow: OrganizationOutput | null
  setCurrentRow: React.Dispatch<React.SetStateAction<OrganizationOutput | null>>
}

const OrganizationsContext = React.createContext<OrganizationsContextType | null>(null)

type OrganizationsProviderProps = {
  children: React.ReactNode
}

export function OrganizationsProvider({ children }: OrganizationsProviderProps) {
  const [open, setOpen] = useDialogState<OrganizationsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<OrganizationOutput | null>(null)

  return (
    <OrganizationsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </OrganizationsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useOrganizations = () => {
  const organizationsContext = React.useContext(OrganizationsContext)

  if (!organizationsContext) {
    throw new Error('useOrganizations has to be used within <OrganizationsProvider>')
  }

  return organizationsContext
}

