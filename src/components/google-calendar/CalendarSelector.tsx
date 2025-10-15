import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronDown, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Calendar {
  id: string;
  summary: string;
  primary?: boolean;
}

interface CalendarSelectorProps {
  calendars: Calendar[];
  selectedCalendarId: string;
  onCalendarSelect: (calendarId: string) => void;
  disabled?: boolean;
}

export const CalendarSelector: React.FC<CalendarSelectorProps> = ({
  calendars,
  selectedCalendarId,
  onCalendarSelect,
  disabled = false,
}) => {
  const [open, setOpen] = React.useState(false);
  
  const selectedCalendar = calendars.find(cal => cal.id === selectedCalendarId);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="truncate">
              {selectedCalendar ? selectedCalendar.summary : 'Select calendar...'}
            </span>
            {selectedCalendar?.primary && (
              <span className="text-xs text-muted-foreground">(Primary)</span>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search calendars..." />
          <CommandList>
            <CommandEmpty>No calendars found.</CommandEmpty>
            <CommandGroup>
              {calendars.map((calendar) => (
                <CommandItem
                  key={calendar.id}
                  value={calendar.id}
                  onSelect={() => {
                    onCalendarSelect(calendar.id);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="truncate">{calendar.summary}</span>
                    {calendar.primary && (
                      <span className="text-xs text-muted-foreground">(Primary)</span>
                    )}
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedCalendarId === calendar.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};