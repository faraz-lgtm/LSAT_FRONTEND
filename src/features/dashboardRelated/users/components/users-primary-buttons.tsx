import { MailPlus, UserPlus } from 'lucide-react'
import { Button } from '@/components/dashboard/ui/button'
import { useUsers } from './users-provider'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/store'
import { canAddUser } from '@/utils/rbac'
import { convertAuthUserToIUser } from '@/utils/authUserConverter'

export function UsersPrimaryButtons() {
  const { setOpen, pageType } = useUsers()
  
  // Get current user from auth state
  const currentUser = useSelector((state: RootState) => state.auth.user)
  
  // Convert AuthUser to UserOutput format for RBAC functions
  const currentUserForRBAC = convertAuthUserToIUser(currentUser)
  
  // Check if current user can add users
  const canAdd = canAddUser(currentUserForRBAC)
  
  // Don't show buttons if user can't add users
  if (!canAdd) {
    return null
  }
  
  // Hide add button for contacts and customers pages
  const hideAddButton = pageType === 'contacts' || pageType === 'customers'
  
  // Show add button only for leads page with "Add Lead" text
  const addButtonText = pageType === 'leads' ? 'Add Lead' : pageType === 'customers' ? 'Add Customer' : 'Add User'
  const showInviteButton = pageType !== 'employees' && pageType !== 'customers' && pageType !== 'contacts' && pageType !== 'leads'
  
  // Don't render anything if add button should be hidden
  if (hideAddButton) {
    return null
  }
  
  return (
    <div className='flex gap-2'>
      {showInviteButton && (
        <Button
          variant='outline'
          className='space-x-1'
          onClick={() => setOpen('invite')}
        >
          <span>Invite User</span> <MailPlus size={18} />
        </Button>
      )}
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>{addButtonText}</span> <UserPlus size={18} />
      </Button>
    </div>
  )
}
