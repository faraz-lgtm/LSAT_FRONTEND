import { UsersActionDialog } from './users-action-dialog'
import { UsersDeleteDialog } from './users-delete-dialog'
import { UsersInviteDialog } from './users-invite-dialog'
import { useUsers } from './users-provider'
import type { UserOutput } from '@/types/api/data-contracts'
import type { User } from '../data/schema'

// Convert UserOutput to User type (filter out COMPANY_ADMIN role)
function convertUserOutputToUser(userOutput: UserOutput): User {
  const validRoles = userOutput.roles.filter(role => 
    role === 'USER' || role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'CUST'
  ) as ('USER' | 'ADMIN' | 'SUPER_ADMIN' | 'CUST')[]
  
  return {
    id: userOutput.id,
    name: userOutput.name,
    username: userOutput.username,
    roles: validRoles,
    email: userOutput.email,
    phone: userOutput.phone,
    isAccountDisabled: userOutput.isAccountDisabled,
    createdAt: userOutput.createdAt,
    updatedAt: userOutput.updatedAt,
  }
}

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()
  return (
    <>
      <UsersActionDialog
        key='user-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      <UsersInviteDialog
        key='user-invite'
        open={open === 'invite'}
        onOpenChange={() => setOpen('invite')}
      />

      {currentRow && (
        <>
          <UsersActionDialog
            key={`user-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <UsersDeleteDialog
            key={`user-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={convertUserOutputToUser(currentRow)}
          />
        </>
      )}
    </>
  )
}
