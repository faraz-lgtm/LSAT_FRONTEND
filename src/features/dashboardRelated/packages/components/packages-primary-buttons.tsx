import { Plus } from 'lucide-react'
import { Button } from '@/components/dashboard/ui/button'
import { usePackages } from './packages-provider'

export function PackagesPrimaryButtons() {
  const { setOpen } = usePackages()

  return (
    <div className="flex items-center space-x-2">
      <Button onClick={() => setOpen('add')}>
        <Plus className="mr-2 h-4 w-4" />
        Add Package
      </Button>
    </div>
  )
}
