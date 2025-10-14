'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/dashboard/ui/alert'
import { Input } from '@/components/dashboard/ui/input'
import { Label } from '@/components/dashboard/ui/label'
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog'
import { type User } from '../data/schema'
import { useDeleteUserMutation } from '@/redux/apiSlices/User/userSlice'

type UserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: UserDeleteDialogProps) {
  const [value, setValue] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteUser] = useDeleteUserMutation()

  // Use name for confirmation instead of username since customers don't have usernames
  const confirmValue = currentRow.name
  
  // Check if user is a customer
  const isCustomer = currentRow.roles.includes('CUST')

  const handleDelete = async () => {
    if (value.trim() !== confirmValue) return

    setIsDeleting(true)
    
    try {
      console.log("🗑️ Deleting user:", currentRow.id)
      const result = await deleteUser(currentRow.id).unwrap()
      console.log("✅ Delete user success:", result)
      
      toast.success(`User ${currentRow.name} deleted successfully`)
      onOpenChange(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("❌ Delete user error:", error)
      toast.error(error?.data?.message || 'Failed to delete user')
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
          Delete User
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{currentRow.name}</span>?
            <br />
            This action will permanently remove the user with the role of{' '}
            <span className='font-bold'>
              {currentRow.roles.map((role) => role.toUpperCase()).join(', ')}
            </span>{' '}
            from the system. This cannot be undone.
          </p>

          {isCustomer && (
            <Alert variant='destructive'>
              <AlertTriangle className='h-4 w-4' />
              <AlertTitle>Critical Warning!</AlertTitle>
              <AlertDescription>
                <strong>This user is a CUSTOMER.</strong> Deleting this customer will also permanently delete ALL related orders, 
                order history, and associated data. This action cannot be undone and will affect business records.
              </AlertDescription>
            </Alert>
          )}

          <Label className='my-2'>
            Name:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter name to confirm deletion.'
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
