import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/dashboard/ui/button'

type TasksPrimaryButtonsProps = {
  onCreateTask: () => void
}

export function TasksPrimaryButtons({ onCreateTask }: TasksPrimaryButtonsProps) {
  return (
    <div className='flex gap-2'>
      <Button
        className='space-x-1'
        onClick={onCreateTask}
      >
        <span>Create Appointment</span> <PlusIcon size={18} />
      </Button>
    </div>
  )
}
