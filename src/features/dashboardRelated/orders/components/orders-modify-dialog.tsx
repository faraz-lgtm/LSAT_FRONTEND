import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/dashboard/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/dashboard/ui/dialog'
import { Label } from '@/components/dashboard/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/dashboard/ui/select'
import { Textarea } from '@/components/dashboard/ui/textarea'
import { useModifyOrderMutation } from '@/redux/apiSlices/Order/orderSlice'
import { useGetProductsQuery } from '@/redux/apiSlices/Product/productSlice'
import type { OrderOutput, ProductOutput } from '@/types/api/data-contracts'
import type { ModifyOrderDto } from '@/redux/apiSlices/Order/orderSlice'

// Type definition for OrderItemDto (not in API contracts yet)
type OrderItemDto = any;
import { formatCurrency } from '@/utils/currency'

type OrdersModifyDialogProps = {
  currentRow: OrderOutput
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrdersModifyDialog({
  currentRow,
  open,
  onOpenChange,
}: OrdersModifyDialogProps) {
  const [modifyOrder, { isLoading: isModifying }] = useModifyOrderMutation()
  const { data: productsData } = useGetProductsQuery()
  
  // Calculate total order amount
  const orderTotal = currentRow.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  const [formData, setFormData] = useState({
    refundReason: 'customer_request' as const,
    reasonDetails: '',
    notes: '',
    selectedProducts: [] as { product: ProductOutput; quantity: number }[],
  })

  const products = productsData?.data || []

  // Initialize with current order items when dialog opens
  useEffect(() => {
    if (open && products.length > 0) {
      const currentItems = currentRow.items.map(item => {
        const product = products.find(p => p.id === item.id)
        return {
          product: product!,
          quantity: item.quantity
        }
      }).filter(item => item.product)
      
      setFormData(prev => ({
        ...prev,
        selectedProducts: currentItems
      }))
    }
  }, [open, products, currentRow.items])

  const handleAddProduct = (productId: string) => {
    const product = products.find(p => p.id === parseInt(productId))
    if (!product) return

    const existingIndex = formData.selectedProducts.findIndex(item => item.product.id === product.id)
    if (existingIndex >= 0) {
      // Update quantity
      setFormData(prev => ({
        ...prev,
        selectedProducts: prev.selectedProducts.map((item, index) => 
          index === existingIndex 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }))
    } else {
      // Add new product
      setFormData(prev => ({
        ...prev,
        selectedProducts: [...prev.selectedProducts, { product, quantity: 1 }]
      }))
    }
  }

  const handleRemoveProduct = (productId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.filter(item => item.product.id !== productId)
    }))
  }

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveProduct(productId)
      return
    }

    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map(item => 
        item.product.id === productId 
          ? { ...item, quantity }
          : item
      )
    }))
  }

  const calculateNewTotal = () => {
    return formData.selectedProducts.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  }

  const handleSubmit = async () => {
    try {
      // Validate form
      if (!formData.reasonDetails.trim()) {
        toast.error('Please provide a reason for the modification')
        return
      }

      if (formData.selectedProducts.length === 0) {
        toast.error('Please select at least one product for the new order')
        return
      }

      // Convert to API format
      const newOrderItems: OrderItemDto[] = formData.selectedProducts.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      }))

      const modifyData: ModifyOrderDto = {
        originalOrderId: currentRow.id,
        newOrderItems,
        refundReason: formData.refundReason,
        reasonDetails: formData.reasonDetails,
        notes: formData.notes || undefined,
      }

      await modifyOrder(modifyData).unwrap()

      toast.success('Order modified successfully! A refund has been processed and a new order created.')
      onOpenChange(false)
      
      // Reset form
      setFormData({
        refundReason: 'customer_request',
        reasonDetails: '',
        notes: '',
        selectedProducts: [],
      })
    } catch (error) {
      console.error('Error modifying order:', error)
      toast.error('Failed to modify order')
    }
  }

  const newTotal = calculateNewTotal()
  const refundAmount = orderTotal

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-4xl max-h-[90vh] flex flex-col'>
        <DialogHeader className='text-start flex-shrink-0'>
          <DialogTitle>Modify Order #{currentRow.id}</DialogTitle>
          <DialogDescription>
            This will refund the original order and create a new order with different items.
          </DialogDescription>
        </DialogHeader>
        
        <div className='space-y-6 overflow-y-auto flex-1 min-h-0 pr-2'>
          {/* Original Order Summary */}
          <div className='p-4 bg-muted rounded-lg'>
            <h3 className='text-lg font-semibold mb-3'>Original Order Summary</h3>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='font-medium text-muted-foreground'>Customer:</span>
                <div className='text-foreground'>{currentRow.customer.name}</div>
              </div>
              <div>
                <span className='font-medium text-muted-foreground'>Original Total:</span>
                <div className='text-foreground font-semibold'>{formatCurrency(orderTotal * 100)}</div>
              </div>
              <div>
                <span className='font-medium text-muted-foreground'>Items:</span>
                <div className='text-foreground'>{currentRow.items.length}</div>
              </div>
              <div>
                <span className='font-medium text-muted-foreground'>Refund Amount:</span>
                <div className='text-red-600 font-semibold'>-{formatCurrency(refundAmount * 100)}</div>
              </div>
            </div>
          </div>

          {/* New Order Items */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>New Order Items</h3>
              <div className='text-sm text-muted-foreground'>
                New Total: <span className='font-semibold text-green-600'>{formatCurrency(newTotal * 100)}</span>
              </div>
            </div>

            {/* Add Product Dropdown */}
            <div className='space-y-2'>
              <Label>Add Product</Label>
              <Select onValueChange={handleAddProduct}>
                <SelectTrigger>
                  <SelectValue placeholder='Select a product to add' />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} - {formatCurrency(product.price * 100)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Products */}
            <div className='space-y-2'>
              {formData.selectedProducts.map((item) => (
                <div key={item.product.id} className='flex items-center justify-between p-3 border rounded-lg'>
                  <div className='flex-1'>
                    <div className='font-medium'>{item.product.name}</div>
                    <div className='text-sm text-muted-foreground'>
                      {formatCurrency(item.product.price * 100)} each
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className='w-8 text-center'>{item.quantity}</span>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleRemoveProduct(item.product.id)}
                      className='text-red-600'
                    >
                      Remove
                    </Button>
                  </div>
                  <div className='text-right'>
                    <div className='font-semibold'>
                      {formatCurrency(item.product.price * item.quantity * 100)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modification Details */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Modification Details</h3>
            
            <div className='space-y-2'>
              <Label htmlFor='refundReason'>Reason for Modification</Label>
              <Select
                value={formData.refundReason}
                onValueChange={(value: any) => setFormData({ ...formData, refundReason: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select reason' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='customer_request'>Customer Request</SelectItem>
                  <SelectItem value='duplicate'>Duplicate Order</SelectItem>
                  <SelectItem value='fraudulent'>Fraudulent Transaction</SelectItem>
                  <SelectItem value='other'>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='reasonDetails'>Reason Details *</Label>
              <Textarea
                id='reasonDetails'
                value={formData.reasonDetails}
                onChange={(e) => setFormData({ ...formData, reasonDetails: e.target.value })}
                placeholder='Provide detailed reason for the order modification'
                rows={3}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='notes'>Additional Notes (Optional)</Label>
              <Textarea
                id='notes'
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder='Any additional notes for the new order'
                rows={2}
              />
            </div>
          </div>

          {/* Summary */}
          <div className='p-4 bg-blue-50 rounded-lg'>
            <h3 className='text-lg font-semibold mb-3'>Modification Summary</h3>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='font-medium text-muted-foreground'>Refund Amount:</span>
                <div className='text-red-600 font-semibold'>-{formatCurrency(refundAmount * 100)}</div>
              </div>
              <div>
                <span className='font-medium text-muted-foreground'>New Order Total:</span>
                <div className='text-green-600 font-semibold'>+{formatCurrency(newTotal * 100)}</div>
              </div>
              <div className='col-span-2'>
                <span className='font-medium text-muted-foreground'>Net Difference:</span>
                <div className={`font-semibold ${newTotal > refundAmount ? 'text-green-600' : newTotal < refundAmount ? 'text-red-600' : 'text-gray-600'}`}>
                  {newTotal > refundAmount ? '+' : ''}{formatCurrency((newTotal - refundAmount) * 100)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className='flex-shrink-0'>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isModifying}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isModifying || formData.selectedProducts.length === 0}>
            {isModifying ? 'Processing...' : 'Modify Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
