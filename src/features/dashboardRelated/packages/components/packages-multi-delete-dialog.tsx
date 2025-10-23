import { useState } from 'react'
import { toast } from 'sonner'
import { type Table } from '@tanstack/react-table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/dashboard/ui/dialog'
import { Button } from '@/components/dashboard/ui/button'
import { Badge } from '@/components/dashboard/ui/badge'
import { ScrollArea } from '@/components/dashboard/ui/scroll-area'
import { useDeleteProductMutation } from '@/redux/apiSlices/Product/productSlice'
import type { ProductOutput } from '@/types/api/data-contracts'

type PackageMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

export function PackagesMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: PackageMultiDeleteDialogProps<TData>) {
  const [deleteProduct] = useDeleteProductMutation()
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletedCount, setDeletedCount] = useState(0)

  // Add null checks to prevent errors
  if (!table) {
    return null
  }

  const selectedRows = table.getFilteredSelectedRowModel()?.rows || []
  const selectedProducts = selectedRows.map(row => row.original as ProductOutput)

  // If no products are selected, don't render the dialog
  if (selectedProducts.length === 0) {
    return null
  }

  const handleDeleteAll = async () => {
    try {
      setIsDeleting(true)
      setDeletedCount(0)

      // Delete products one by one
      for (const product of selectedProducts) {
        try {
          await deleteProduct(product.id).unwrap()
          setDeletedCount(prev => prev + 1)
        } catch (error) {
          console.error(`Failed to delete product ${product.id}:`, error)
          // Continue with other deletions even if one fails
        }
      }

      toast.success(`Successfully deleted ${deletedCount} package(s)`)
      onOpenChange(false)
      
      // Clear selection safely
      if (table && typeof table.toggleAllPageRowsSelected === 'function') {
        table.toggleAllPageRowsSelected(false)
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Failed to delete some packages')
    } finally {
      setIsDeleting(false)
      setDeletedCount(0)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete Multiple Packages</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {selectedProducts.length} selected package(s)? 
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <ScrollArea className="h-[300px] w-full rounded border p-4">
            <div className="space-y-3">
              {selectedProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between space-x-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{product.name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>${product.price}</span>
                      {product.save && <span>Save: ${product.save}</span>}
                      <span>{product.Duration} minutes</span>
                    </div>
                  </div>
                  {product.badge && (
                    <Badge className={product.badge.color} variant="secondary">
                      {product.badge.text}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          
          {isDeleting && (
            <div className="mt-4 text-sm text-muted-foreground">
              Deleting... {deletedCount}/{selectedProducts.length} completed
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDeleteAll}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : `Delete ${selectedProducts.length} Package(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
