import { Badge } from '@/components/dashboard/ui/badge'
import { cn } from '@/lib/dashboardRelated/utils'
import { useNavigate } from '@tanstack/react-router'
import type { UserOutput } from '@/types/api/data-contracts'

interface ClickableOrderBadgeProps {
  user: UserOutput
  ordersCount: number
}

export function ClickableOrderBadge({ user, ordersCount }: ClickableOrderBadgeProps) {
  const navigate = useNavigate()
  const isLead = ordersCount === 0
  
  const handleOrderClick = () => {
    if (ordersCount > 0) {
      // Check if user is an employee (has ADMIN, USER, COMPANY_ADMIN, or SUPER_ADMIN role)
      const isEmployee = user.roles?.some(role => 
        role === 'ADMIN' || 
        role === 'USER' || 
        role === 'COMPANY_ADMIN' || 
        role === 'SUPER_ADMIN'
      )
      
      if (isEmployee) {
        // Navigate to orders page filtered by assigned employee
        navigate({
          to: '/orders',
          search: {
            assignedEmployeeId: user.id,
          }
        })
      } else {
        // Navigate to orders page with customer filter
        navigate({
          to: '/orders',
          search: {
            customer: `${user.name} ${user.email}`.trim()
          }
        })
      }
    }
  }
  
  return (
    <div className='flex items-center justify-start'>
      <Badge 
        variant='outline' 
        className={cn(
          'text-xs',
          isLead 
            ? 'bg-orange-100/30 text-orange-900 dark:text-orange-200 border-orange-200' 
            : 'bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-200 cursor-pointer hover:bg-blue-200/50 dark:hover:bg-blue-300/50'
        )}
        onClick={ordersCount > 0 ? handleOrderClick : undefined}
      >
        {ordersCount}
      </Badge>
    </div>
  )
}
