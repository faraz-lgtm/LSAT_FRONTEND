'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/dashboard/ui/alert'
import { Input } from '@/components/dashboard/ui/input'
import { Label } from '@/components/dashboard/ui/label'
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog'
import { type OrganizationOutput } from '@/redux/apiSlices/Organization/organizationSlice'
import { useDeleteOrganizationMutation } from '@/redux/apiSlices/Organization/organizationSlice'

type OrganizationsDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: OrganizationOutput
}

export function OrganizationsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: OrganizationsDeleteDialogProps) {
  const [value, setValue] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteOrganization] = useDeleteOrganizationMutation()

  // Use organization name for confirmation
  const confirmValue = currentRow.name

  const handleDelete = async () => {
    if (value.trim() !== confirmValue) return

    setIsDeleting(true)
    
    try {
      console.log("🗑️ Deleting organization:", currentRow.id)
      await deleteOrganization(currentRow.id).unwrap()
      console.log("✅ Delete organization success")
      
      toast.success(`Organization ${currentRow.name} deleted successfully`)
      onOpenChange(false)
      setValue('')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("❌ Delete organization error:", error)
      toast.error(error?.data?.message || 'Failed to delete organization')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== confirmValue || isDeleting}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          Delete Organization
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{currentRow.name}</span>?
            <br />
            This action will permanently remove the organization{' '}
            <span className='font-bold'>({currentRow.slug})</span>{' '}
            from the system. This cannot be undone.
          </p>

          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertTitle>Critical Warning!</AlertTitle>
            <AlertDescription>
              <strong>Deleting this organization will permanently delete ALL related data</strong> including users, orders, 
              packages, and all associated records. This action cannot be undone and will significantly affect business operations.
            </AlertDescription>
          </Alert>

          <Label className='my-2'>
            Organization Name:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter organization name to confirm deletion.'
              disabled={isDeleting}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={isDeleting ? 'Deleting...' : 'Delete'}
      destructive
    />
  )
}


