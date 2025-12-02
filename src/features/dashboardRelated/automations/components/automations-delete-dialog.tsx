'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/dashboard/ui/alert'
import { Input } from '@/components/dashboard/ui/input'
import { Label } from '@/components/dashboard/ui/label'
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog'
import type { AutomationConfigOutputDto } from '@/types/api/data-contracts'
import { useDeleteAutomationMutation } from '@/redux/apiSlices/Automation/automationSlice'

type AutomationsDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: AutomationConfigOutputDto
}

export function AutomationsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: AutomationsDeleteDialogProps) {
  const [value, setValue] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteAutomation] = useDeleteAutomationMutation()

  // Use automation key for confirmation
  const confirmValue = currentRow.key

  const handleDelete = async () => {
    if (value.trim() !== confirmValue) return

    setIsDeleting(true)
    
    try {
      console.log("🗑️ Deleting automation:", currentRow.key)
      await deleteAutomation({ key: currentRow.key }).unwrap()
      console.log("✅ Delete automation success")
      
      toast.success(`Automation ${currentRow.name} deleted successfully`)
      onOpenChange(false)
      setValue('')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("❌ Delete automation error:", error)
      toast.error(error?.data?.message || 'Failed to delete automation')
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
      isLoading={isDeleting}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          Delete Automation
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{currentRow.name}</span>?
            <br />
            This action will permanently remove the automation{' '}
            <span className='font-bold'>({currentRow.key})</span>{' '}
            from the system. This cannot be undone.
          </p>

          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Deleting this automation will permanently remove it and all its configuration. 
              This action cannot be undone.
            </AlertDescription>
          </Alert>

          <Label className='my-2'>
            Automation Key:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter automation key to confirm deletion.'
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

