import React, { useState } from 'react'
import useDialogState from '@/hooks/dashboardRelated/use-dialog-state'
import { type UserOutput } from '@/types/api/data-contracts'

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete'
type PageType = 'customers' | 'employees' | 'all' | 'leads' | 'contacts'

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: UserOutput | null
  setCurrentRow: React.Dispatch<React.SetStateAction<UserOutput | null>>
  pageType: PageType
}

const UsersContext = React.createContext<UsersContextType | null>(null)

type UsersProviderProps = {
  children: React.ReactNode
  pageType?: PageType
}

export function UsersProvider({ children, pageType = 'all' }: UsersProviderProps) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<UserOutput | null>(null)

  return (
    <UsersContext value={{ open, setOpen, currentRow, setCurrentRow, pageType }}>
      {children}
    </UsersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUsers = () => {
  const usersContext = React.useContext(UsersContext)

  if (!usersContext) {
    throw new Error('useUsers has to be used within <UsersContext>')
  }

  return usersContext
}
