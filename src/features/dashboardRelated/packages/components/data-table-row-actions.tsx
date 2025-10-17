import { type Row } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/dashboard/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/dashboard/ui/dropdown-menu'
import type { ProductOutput } from '@/types/api/data-contracts'
import { usePackages } from './packages-provider'

type DataTableRowActionsProps = {
  row: Row<ProductOutput>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = usePackages()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <MoreHorizontal className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('edit')
          }}
        >
          <Pencil className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('delete')
          }}
          className='text-destructive focus:text-destructive'
        >
          <Trash2 className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
