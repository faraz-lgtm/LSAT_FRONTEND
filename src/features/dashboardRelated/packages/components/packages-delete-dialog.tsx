import { useState } from 'react'
import { toast } from 'sonner'
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
import type { ProductOutput } from '@/types/api/data-contracts'
import { useDeleteProductMutation } from '@/redux/apiSlices/Product/productSlice'

type PackageDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: ProductOutput
}

export function PackagesDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: PackageDeleteDialogProps) {
  const [deleteProduct, { isLoading }] = useDeleteProductMutation()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteProduct(currentRow.id).unwrap()
      toast.success('Package deleted successfully!')
      onOpenChange(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error:', error)
      // Error toast is handled centrally in api.ts
    } finally {
      setIsDeleting(false)
    }
  }

  const isLoadingState = isLoading || isDeleting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete Package</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this package? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium">{currentRow.name}</h4>
              <p className="text-sm text-muted-foreground">{currentRow.Description}</p>
            </div>
            
            <div className="flex items-center space-x-4 text-sm">
              <div>
                <span className="font-medium">Price:</span> ${currentRow.price}
              </div>
              {currentRow.save && (
                <div>
                  <span className="font-medium">Save:</span> ${currentRow.save}
                </div>
              )}
              <div>
                <span className="font-medium">Duration:</span> {currentRow.Duration} minutes
              </div>
            </div>

            {currentRow.badge && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Badge:</span>
                <Badge 
                  style={{ 
                    backgroundColor: currentRow.badge.color,
                    color: '#ffffff',
                    border: 'none'
                  }}
                  className="px-3 py-1 rounded-full text-sm font-medium"
                >
                  {currentRow.badge.text}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoadingState}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoadingState}
          >
            {isLoadingState ? 'Deleting...' : 'Delete Package'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
