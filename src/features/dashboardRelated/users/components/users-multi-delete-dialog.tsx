'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/dashboard/ui/alert'
import { Input } from '@/components/dashboard/ui/input'
import { Label } from '@/components/dashboard/ui/label'
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog'
import { useDeleteUserMutation } from '@/redux/apiSlices/User/userSlice'
import { type User } from '../data/schema'

type UserMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

const CONFIRM_WORD = 'DELETE'

export function UsersMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: UserMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteUser] = useDeleteUserMutation()

  const selectedRows = table.getFilteredSelectedRowModel().rows
  
  // Check if any selected users are customers
  const selectedUsers = selectedRows.map((row) => row.original as User)
  const hasCustomers = selectedUsers.some(user => user.roles.includes('CUST'))
  const customerCount = selectedUsers.filter(user => user.roles.includes('CUST')).length

  const handleDelete = async () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`)
      return
    }

    setIsDeleting(true)
    
    try {
      console.log("🗑️ Bulk deleting users:", selectedUsers.map(u => u.id))
      
      // Delete users in parallel
      const deletePromises = selectedUsers.map(user => 
        deleteUser(user.id).unwrap()
      )
      
      await Promise.all(deletePromises)
      
      console.log("✅ Bulk delete success")
      toast.success(`Successfully deleted ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`)
      table.resetRowSelection()
      onOpenChange(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("❌ Bulk delete error:", error)
      // Error toast is handled centrally in api.ts
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD || isDeleting}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          Delete {selectedRows.length}{' '}
          {selectedRows.length > 1 ? 'users' : 'user'}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete the selected users? <br />
            This action cannot be undone.
          </p>

          {hasCustomers && (
            <Alert variant='destructive'>
              <AlertTriangle className='h-4 w-4' />
              <AlertTitle>Critical Warning!</AlertTitle>
              <AlertDescription>
                <strong>{customerCount} of the selected users are CUSTOMERS.</strong> Deleting customers will also permanently delete ALL their related orders, 
                order history, and associated data. This action cannot be undone and will affect business records.
              </AlertDescription>
            </Alert>
          )}

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span className=''>Confirm by typing "{CONFIRM_WORD}":</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
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
