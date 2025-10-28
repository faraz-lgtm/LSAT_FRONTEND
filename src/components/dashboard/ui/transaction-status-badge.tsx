import { Badge } from '@/components/dashboard/ui/badge'
import type { TransactionOutput } from '@/redux/apiSlices/Transactions/transactionsSlice'

interface TransactionStatusBadgeProps {
  status: TransactionOutput['status']
}

export function TransactionStatusBadge({ status }: TransactionStatusBadgeProps) {
  const getStatusConfig = (status: TransactionOutput['status']) => {
    switch (status) {
      case 'succeeded':
        return { variant: 'default' as const, label: 'Succeeded', className: 'bg-green-100 text-green-800 hover:bg-green-200' }
      case 'failed':
        return { variant: 'destructive' as const, label: 'Failed' }
      case 'pending':
        return { variant: 'default' as const, label: 'Pending', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' }
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
