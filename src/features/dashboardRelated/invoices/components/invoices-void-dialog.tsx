import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/dashboard/ui/dialog'
import { Button } from '@/components/dashboard/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/dashboard/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useVoidInvoiceMutation } from '@/redux/apiSlices/Invoicing/invoicingSlice'
import { formatCurrency } from '@/utils/currency'
import type { InvoiceOutput } from '@/redux/apiSlices/Invoicing/invoicingSlice'

type InvoicesVoidDialogProps = {
  currentRow: InvoiceOutput
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoicesVoidDialog({
  currentRow,
  open,
  onOpenChange,
}: InvoicesVoidDialogProps) {
  const [voidInvoice, { isLoading: isVoiding }] = useVoidInvoiceMutation()

  const handleVoid = async () => {
    try {
      await voidInvoice(currentRow.id).unwrap()
      toast.success('Invoice voided successfully')
      onOpenChange(false)
    } catch (error) {
      console.error('Error voiding invoice:', error)
      toast.error('Failed to void invoice')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>Void Invoice #{currentRow.invoiceNumber}</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently void the invoice.
          </DialogDescription>
        </DialogHeader>
        
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            You are about to void invoice #{currentRow.invoiceNumber}{currentRow.customerName && ` for customer ${currentRow.customerName}`}
            {currentRow.amount && ` with a total value of ${formatCurrency(typeof currentRow.amount === 'string' ? parseFloat(currentRow.amount) * 100 : currentRow.amount * 100)}`}. This action cannot be undone.
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isVoiding}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={handleVoid} disabled={isVoiding}>
            {isVoiding ? 'Voiding...' : 'Void Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
