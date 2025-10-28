import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/dashboard/ui/dialog'
import { Button } from '@/components/dashboard/ui/button'
import { Input } from '@/components/dashboard/ui/input'
import { Label } from '@/components/dashboard/ui/label'
import { Textarea } from '@/components/dashboard/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/dashboard/ui/select'
import { Alert, AlertDescription } from '@/components/dashboard/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateInvoiceMutation } from '@/redux/apiSlices/Invoicing/invoicingSlice'
import { formatCurrency } from '@/utils/currency'

type InvoicesCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface LineItem {
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export function InvoicesCreateDialog({
  open,
  onOpenChange,
}: InvoicesCreateDialogProps) {
  const [createInvoice, { isLoading: isCreating }] = useCreateInvoiceMutation()
  
  const [formData, setFormData] = useState({
    orderId: '',
    customerId: '',
    dueDate: '',
  })
  
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
  ])

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const newLineItems = [...lineItems]
    newLineItems[index] = { ...newLineItems[index], [field]: value }
    
    // Recalculate total price
    if (field === 'quantity' || field === 'unitPrice') {
      newLineItems[index].totalPrice = newLineItems[index].quantity * newLineItems[index].unitPrice
    }
    
    setLineItems(newLineItems)
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  const totalAmount = lineItems.reduce((sum, item) => sum + item.totalPrice, 0)

  const handleSubmit = async () => {
    try {
      // Validate form
      if (!formData.orderId || !formData.customerId || !formData.dueDate) {
        toast.error('Please fill in all required fields')
        return
      }

      if (lineItems.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
        toast.error('Please fill in all line item details')
        return
      }

      await createInvoice({
        orderId: parseInt(formData.orderId),
        customerId: parseInt(formData.customerId),
        dueDate: formData.dueDate,
        lineItems: lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: Math.round(item.unitPrice * 100), // Convert to cents
          totalPrice: Math.round(item.totalPrice * 100), // Convert to cents
        }))
      }).unwrap()

      toast.success('Invoice created successfully')
      onOpenChange(false)
      
      // Reset form
      setFormData({ orderId: '', customerId: '', dueDate: '' })
      setLineItems([{ description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }])
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast.error('Failed to create invoice')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] flex flex-col'>
        <DialogHeader className='text-start flex-shrink-0'>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice for a customer order.
          </DialogDescription>
        </DialogHeader>
        
        <div className='space-y-6 overflow-y-auto flex-1 min-h-0 pr-2'>
          {/* Basic Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Invoice Details</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='orderId'>Order ID *</Label>
                <Input
                  id='orderId'
                  type='number'
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  placeholder='Enter order ID'
                />
              </div>
              <div>
                <Label htmlFor='customerId'>Customer ID *</Label>
                <Input
                  id='customerId'
                  type='number'
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  placeholder='Enter customer ID'
                />
              </div>
              <div className='col-span-2'>
                <Label htmlFor='dueDate'>Due Date *</Label>
                <Input
                  id='dueDate'
                  type='date'
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>Line Items</h3>
              <Button type='button' variant='outline' size='sm' onClick={addLineItem}>
                Add Item
              </Button>
            </div>
            
            <div className='space-y-3'>
              {lineItems.map((item, index) => (
                <div key={index} className='grid grid-cols-12 gap-2 items-end p-3 border rounded-lg'>
                  <div className='col-span-5'>
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Input
                      id={`description-${index}`}
                      value={item.description}
                      onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                      placeholder='Item description'
                    />
                  </div>
                  <div className='col-span-2'>
                    <Label htmlFor={`quantity-${index}`}>Qty</Label>
                    <Input
                      id={`quantity-${index}`}
                      type='number'
                      min='1'
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className='col-span-2'>
                    <Label htmlFor={`unitPrice-${index}`}>Unit Price</Label>
                    <Input
                      id={`unitPrice-${index}`}
                      type='number'
                      step='0.01'
                      min='0'
                      value={item.unitPrice}
                      onChange={(e) => handleLineItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className='col-span-2'>
                    <Label>Total</Label>
                    <div className='h-9 px-3 py-1 text-sm border rounded-md bg-muted flex items-center'>
                      {formatCurrency(Math.round(item.totalPrice * 100))}
                    </div>
                  </div>
                  <div className='col-span-1'>
                    {lineItems.length > 1 && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => removeLineItem(index)}
                        className='text-red-600 hover:text-red-700'
                      >
                        ×
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className='flex justify-end pt-2 border-t'>
              <div className='text-lg font-semibold'>
                Total: {formatCurrency(Math.round(totalAmount * 100))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className='flex-shrink-0'>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
