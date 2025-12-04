import { useNavigate } from '@tanstack/react-router'
import type { UserOutput } from '@/types/api/data-contracts'
import { cn } from '@/lib/dashboardRelated/utils'

interface ClickableCustomerCellProps {
  customerEmail: string | undefined
  emailToUser?: Record<string, UserOutput>
  displayValue: string
}

export function ClickableCustomerCell({ customerEmail, emailToUser, displayValue }: ClickableCustomerCellProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (!customerEmail || !emailToUser) return

    const user = emailToUser[customerEmail.toLowerCase()]
    if (!user) return

    // Check user roles: if 'ADMIN' or 'USER' → navigate to employees page, if 'CUST' → navigate to customers page
    const isEmployee = user.roles?.some(role => role === 'ADMIN' || role === 'USER' || role === 'SUPER_ADMIN')
    
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

  const user = customerEmail && emailToUser ? emailToUser[customerEmail.toLowerCase()] : undefined
  const isClickable = !!user

  return (
    <div 
      className={cn(
        'w-[200px] truncate',
        isClickable && 'cursor-pointer hover:underline text-blue-600 dark:text-blue-400'
      )}
      onClick={isClickable ? handleClick : undefined}
    >
      {displayValue}
    </div>
  )
}

