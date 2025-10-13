import { CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons'
import { Badge } from '@/components/dashboard/ui/badge'
import { Button } from '@/components/dashboard/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/dashboard/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/dashboard/ui/popover'
import { Separator } from '@/components/dashboard/ui/separator'
import { cn } from '@/lib/dashboardRelated/utils'

type MultiSelectDropdownProps = {
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  items: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[]
  disabled?: boolean
  className?: string
}

export function MultiSelectDropdown({
  value = [],
  onValueChange,
  items,
  placeholder = 'Select items',
  disabled,
  className = '',
}: MultiSelectDropdownProps) {
  const selectedValues = new Set(value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={false}
          aria-haspopup='listbox'
          className={cn('justify-between', className)}
          disabled={disabled}
        >
          <PlusCircledIcon className='size-4' />
          {placeholder}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation='vertical' className='mx-2 h-4' />
              <Badge
                variant='secondary'
                className='rounded-sm px-1 font-normal lg:hidden'
              >
                {selectedValues.size}
              </Badge>
              <div className='hidden space-x-1 lg:flex'>
                {selectedValues.size > 2 ? (
                  <Badge
                    variant='secondary'
                    className='rounded-sm px-1 font-normal'
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  items
                    .filter((item) => selectedValues.has(item.value))
                    .map((item) => (
                      <Badge
                        variant='secondary'
                        key={item.value}
                        className='rounded-sm px-1 font-normal'
                      >
                        {item.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0' align='start'>
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => {
                const isSelected = selectedValues.has(item.value)
                return (
                  <CommandItem
                    key={item.value}
                    onSelect={() => {
                      const newSelectedValues = new Set(selectedValues)
                      if (isSelected) {
                        newSelectedValues.delete(item.value)
                      } else {
                        newSelectedValues.add(item.value)
                      }
                      onValueChange(Array.from(newSelectedValues))
                    }}
                  >
                    <div
                      className={cn(
                        'border-primary flex size-4 items-center justify-center rounded-sm border',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <CheckIcon className={cn('text-background h-4 w-4')} />
                    </div>
                    {item.icon && (
                      <item.icon className='text-muted-foreground size-4' />
                    )}
                    <span>{item.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
