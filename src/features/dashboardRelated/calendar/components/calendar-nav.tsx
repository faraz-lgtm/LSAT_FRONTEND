"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/dashboard/ui/calendarRelatedUI/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/dashboard/ui/calendarRelatedUI/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  generateDaysInMonth,
  goNext,
  goPrev,
  goToday,
} from "@/utils/calendar/calendar-utils";
import type { calendarRef } from "@/utils/calendar/data";
import { months } from "@/utils/calendar/data";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  GalleryVertical,
  PlusIcon,
  Table,
  Tally3,
} from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/dashboard/ui/calendarRelatedUI/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/dashboard/ui/calendarRelatedUI/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/dashboard/ui/dropdown-menu";

interface CalendarNavProps {
  calendarRef: calendarRef;
  viewedDate: Date;
  onCreateTask?: () => void;
  onCreateOrder?: () => void;
}

export default function CalendarNav({ calendarRef, viewedDate, onCreateTask, onCreateOrder }: CalendarNavProps) {
  const [monthOpen, setMonthOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [dayOpen, setDayOpen] = useState(false);

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between w-full gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => goPrev(calendarRef)}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button variant="outline" size="icon" onClick={() => goNext(calendarRef)}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
          <Button variant="outline" onClick={() => goToday(calendarRef)}>Today</Button>
        </div>

        <div className="flex items-center gap-2">
          <Tabs defaultValue="timeGridWeek">
            <TabsList>
              <TabsTrigger value="timeGridDay" onClick={() => {
                const calendarApi = calendarRef.current!.getApi();
                calendarApi.changeView("timeGridDay");
              }}>
                <Tally3 className="mr-2 h-4 w-4" /> Day
              </TabsTrigger>
              <TabsTrigger value="timeGridWeek" onClick={() => {
                const calendarApi = calendarRef.current!.getApi();
                calendarApi.changeView("timeGridWeek");
              }}>
                <Table className="mr-2 h-4 w-4" /> Week
              </TabsTrigger>
              <TabsTrigger value="dayGridMonth" onClick={() => {
                const calendarApi = calendarRef.current!.getApi();
                calendarApi.changeView("dayGridMonth");
              }}>
                <GalleryVertical className="mr-2 h-4 w-4" /> Month
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Month selector */}
        <Popover open={monthOpen} onOpenChange={setMonthOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={monthOpen}
              className="w-[180px] justify-between"
            >
              {months?.[viewedDate.getMonth()]?.label ?? ""}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[180px] p-0">
            <Command>
              <CommandInput placeholder="Search month..." />
              <CommandEmpty>No month found.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  {months.map((month) => (
                    <CommandItem
                      key={month.value}
                      onSelect={() => {
                        const calendarApi = calendarRef.current!.getApi();
                        const newDate = new Date(viewedDate);
                        newDate.setMonth(Number(month.value) - 1);
                        calendarApi.gotoDate(newDate);
                        setMonthOpen(false);
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", Number(month.value) - 1 === viewedDate.getMonth() ? "opacity-100" : "opacity-0")} />
                      {month.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Year selector */}
        <Popover open={yearOpen} onOpenChange={setYearOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={yearOpen} className="w-[120px] justify-between">
              {viewedDate.getFullYear()}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search year..." />
              <CommandEmpty>No year found.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  {Array.from({ length: 11 }, (_, i) => viewedDate.getFullYear() - 5 + i).map((year) => (
                    <CommandItem
                      key={year}
                      onSelect={() => {
                        const calendarApi = calendarRef.current!.getApi();
                        const newDate = new Date(viewedDate);
                        newDate.setFullYear(year);
                        calendarApi.gotoDate(newDate);
                        setYearOpen(false);
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", year === viewedDate.getFullYear() ? "opacity-100" : "opacity-0")} />
                      {year}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Day selector */}
        <Popover open={dayOpen} onOpenChange={setDayOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={dayOpen} className="w-[120px] justify-between">
              {viewedDate.toLocaleDateString("en-US", { day: "2-digit" })}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-0">
            <Command>
              <CommandInput placeholder="Search day..." />
              <CommandEmpty>No day found.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  {generateDaysInMonth(viewedDate.getDate()).map((day) => (
                    <CommandItem
                      key={day.value}
                      onSelect={() => {
                        const calendarApi = calendarRef.current!.getApi();
                        const newDate = new Date(viewedDate);
                        newDate.setDate(Number(day.value));
                        calendarApi.gotoDate(newDate);
                        setDayOpen(false);
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", Number(day.value) === viewedDate.getDate() ? "opacity-100" : "opacity-0")} />
                      {day.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="ml-auto flex items-center gap-2">
          <Input placeholder="Search events" className="w-[200px]" />
          {/* New Event Dropdown: choose Task or Order */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                New Event
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onCreateTask}>Create Task</DropdownMenuItem>
              <DropdownMenuItem onClick={onCreateOrder}>Create Order</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}


