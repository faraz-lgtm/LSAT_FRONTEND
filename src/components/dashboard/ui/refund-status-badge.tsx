import { Badge } from '@/components/dashboard/ui/badge'
import type { RefundOutput } from '@/redux/apiSlices/Refunds/refundsSlice'

interface RefundStatusBadgeProps {
  status: RefundOutput['status']
}

export function RefundStatusBadge({ status }: RefundStatusBadgeProps) {
  const getStatusConfig = (status: RefundOutput['status']) => {
    switch (status) {
      case 'pending':
        return { variant: 'default' as const, label: 'Pending', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' }
      case 'processing':
        return { variant: 'secondary' as const, label: 'Processing' }
      case 'completed':
        return { variant: 'default' as const, label: 'Completed', className: 'bg-green-100 text-green-800 hover:bg-green-200' }
      case 'failed':
        return { variant: 'destructive' as const, label: 'Failed' }
      case 'canceled':
        return { variant: 'outline' as const, label: 'Canceled' }
      default:
        return { variant: 'default' as const, label: status }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  )
}
