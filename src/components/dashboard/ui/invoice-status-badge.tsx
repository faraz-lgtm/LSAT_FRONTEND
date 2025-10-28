import { Badge } from '@/components/dashboard/ui/badge'
import type { InvoiceOutput } from '@/redux/apiSlices/Invoicing/invoicingSlice'

interface InvoiceStatusBadgeProps {
  status: InvoiceOutput['status']
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const getStatusConfig = (status: InvoiceOutput['status']) => {
    switch (status) {
      case 'draft':
        return { variant: 'default' as const, label: 'Draft' }
      case 'sent':
        return { variant: 'secondary' as const, label: 'Sent' }
      case 'paid':
        return { variant: 'default' as const, label: 'Paid', className: 'bg-green-100 text-green-800 hover:bg-green-200' }
      case 'overdue':
        return { variant: 'destructive' as const, label: 'Overdue' }
      case 'void':
        return { variant: 'outline' as const, label: 'Void' }
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
