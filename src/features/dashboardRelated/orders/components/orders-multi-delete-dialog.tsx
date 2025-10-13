'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/dashboard/ui/alert'
import { Input } from '@/components/dashboard/ui/input'
import { Label } from '@/components/dashboard/ui/label'
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog'

type OrdersMultiDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  selectedCount: number
}

const CONFIRM_WORD = 'DELETE'

export function OrdersMultiDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  selectedCount,
}: OrdersMultiDeleteDialogProps) {
  const [value, setValue] = useState('')

  const handleDelete = () => {
    if (value !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`)
      return
    }

    onConfirm()
    onOpenChange(false)
    setValue('')
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${selectedCount} order${selectedCount > 1 ? 's' : ''}`}
      desc='This action cannot be undone. This will permanently delete the selected orders.'
      confirmText='Delete'
      handleConfirm={handleDelete}
      destructive={true}
    >
      <Alert variant='destructive'>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          You are about to delete {selectedCount} order{selectedCount > 1 ? 's' : ''}. This action cannot be undone.
        </AlertDescription>
      </Alert>
      
      <div className='space-y-2'>
        <Label htmlFor='confirm'>
          Type <span className='font-semibold'>{CONFIRM_WORD}</span> to confirm:
        </Label>
        <Input
          id='confirm'
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={CONFIRM_WORD}
          className='font-mono'
        />
      </div>
    </ConfirmDialog>
  )
}
