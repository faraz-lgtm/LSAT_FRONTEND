import { Download, PlusIcon } from 'lucide-react'
import { Button } from '@/components/dashboard/ui/button'

type TasksPrimaryButtonsProps = {
  onCreateTask: () => void
  onImport: () => void
}

export function TasksPrimaryButtons({ onCreateTask, onImport }: TasksPrimaryButtonsProps) {
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={onImport}
      >
        <span>Import</span> <Download size={18} />
      </Button>
      <Button
        className='space-x-1'
        onClick={onCreateTask}
      >
        <span>Create Task</span> <PlusIcon size={18} />
      </Button>
    </div>
  )
}
