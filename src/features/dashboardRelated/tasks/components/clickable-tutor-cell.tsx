import { useNavigate } from '@tanstack/react-router'
import type { UserOutput } from '@/types/api/data-contracts'
import { cn } from '@/lib/dashboardRelated/utils'

interface ClickableTutorCellProps {
  tutorId: number | undefined
  userIdToUser?: Record<number, UserOutput>
  displayName: string
}

export function ClickableTutorCell({ tutorId, userIdToUser, displayName }: ClickableTutorCellProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (!tutorId || !userIdToUser) return

    const user = userIdToUser[tutorId]
    if (!user) return

    // Check user roles: if 'ADMIN' or 'USER' → navigate to employees page, if 'CUST' → navigate to customers page
    const isEmployee = user.roles?.some(role => role === 'ADMIN' || role === 'USER')
    
    if (isEmployee) {
      navigate({
        to: '/users/employees',
        search: {
          name: user.name || '',
        }
      })
    } else if (user.roles?.some(role => role === 'CUST')) {
      navigate({
        to: '/users/customers',
        search: {
          name: user.name || '',
        }
      })
    }
  }

  const user = tutorId && userIdToUser ? userIdToUser[tutorId] : undefined
  const isClickable = !!user

  return (
    <div 
      className={cn(
        'w-[160px]',
        isClickable && 'cursor-pointer hover:underline text-blue-600 dark:text-blue-400'
      )}
      onClick={isClickable ? handleClick : undefined}
    >
      {displayName}
    </div>
  )
}

