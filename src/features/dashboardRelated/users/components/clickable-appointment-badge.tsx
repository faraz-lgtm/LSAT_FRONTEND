import { Badge } from '@/components/dashboard/ui/badge'
import { cn } from '@/lib/dashboardRelated/utils'
import { useNavigate } from '@tanstack/react-router'
import type { UserOutput } from '@/types/api/data-contracts'

interface ClickableAppointmentBadgeProps {
  user: UserOutput
  appointmentCount: number
}

export function ClickableAppointmentBadge({ user, appointmentCount }: ClickableAppointmentBadgeProps) {
  const navigate = useNavigate()
  
  const handleAppointmentClick = () => {
    if (appointmentCount > 0) {
      // Navigate to tasks page filtered by this employee
      navigate({
        to: '/tasks',
        search: {
          tutorId: user.id,
        }
      })
    }
  }
  
  return (
    <div className='flex items-center justify-start'>
      <Badge 
        variant='outline' 
        className={cn(
          'text-xs',
          appointmentCount > 0
            ? 'bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-200 cursor-pointer hover:bg-blue-200/50 dark:hover:bg-blue-300/50'
            : 'bg-gray-100/30 text-gray-900 dark:text-gray-200 border-gray-200'
        )}
        onClick={appointmentCount > 0 ? handleAppointmentClick : undefined}
      >
        {appointmentCount}
      </Badge>
    </div>
  )
}

