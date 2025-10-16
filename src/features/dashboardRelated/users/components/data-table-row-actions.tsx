import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Trash2, UserPen } from 'lucide-react'
import { Button } from '@/components/dashboard/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/dashboard/ui/dropdown-menu'
import { type UserOutput } from '@/redux/apiSlices/User/userSlice'
import { useUsers } from './users-provider'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/store'
import { canEditOrDeleteUser } from '@/utils/rbac'
import { convertAuthUserToIUser } from '@/utils/authUserConverter'

type DataTableRowActionsProps = {
  row: Row<UserOutput>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useUsers()
  
  // Get current user from auth state
  const currentUser = useSelector((state: RootState) => state.auth.user)
  
  // Convert AuthUser to UserOutput format for RBAC functions
  const currentUserForRBAC = convertAuthUserToIUser(currentUser)
  
  // Check if current user can edit/delete this user
  const canEditDelete = canEditOrDeleteUser(currentUserForRBAC, row.original)
  
  // Don't show actions if user can't edit/delete
  if (!canEditDelete) {
    return null
  }
  
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('edit')
            }}
          >
            Edit
            <DropdownMenuShortcut>
              <UserPen size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('delete')
            }}
            className='text-red-500!'
          >
            Delete
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
