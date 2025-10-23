/* eslint-disable @typescript-eslint/no-explicit-any */
// used in CX Pages

import * as React from "react";
// import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Edit } from "lucide-react";
import { useGetAvailableSlotsQuery } from "@/redux/apiSlices/Slot"; 
import type { RootState } from "../../redux/store";

import { useSelector } from "react-redux";

type Slot = {
  start: Date;
  label: string;
};

export function DateTimePicker({
  value,
  packageId,
  onChange,
  excludedSlots = [],
}: {
  value?: Date | undefined;
  packageId: number;
  onChange: (date: Date) => void;
  excludedSlots?: Date[];
}) {

  const { items } = useSelector((state: RootState) => state.cart);

  const [date, setDate] = React.useState<Date | undefined>(value);
  console.log('date', date);
  const [selectedSlot, setSelectedSlot] = React.useState<Slot | undefined>(date?{
    start: date,
    label: "",
  }:undefined);


  // Fetch available slots from API
  const { data: slotsData, isLoading: slotsLoading, error: slotsError } = useGetAvailableSlotsQuery({

    packageId: packageId,
    date: date && date instanceof Date ? new Date(date).toISOString(): new Date().toISOString(), // Day as number using UTC to avoid timezone issues
  }, {
    skip: !date || !(date instanceof Date), // Only fetch when date is selected and is a valid Date
  });
  /**
   * Checks if the date passed to it is within next 12 hours
   * returns true if it is
   * @param date 
   * @returns 
   */

  const isWithin12Hours = (date: Date): boolean => {
    const now = new Date();
    const cutoff = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    return date >= now && date <= cutoff;
  };


  // Generate slots from backend API data
  const generateSlots = React.useCallback(function generateSlots(
    slotsData: any // API response data
  ): Slot[] {
    if (!slotsData?.availableSlots) {
      return [];
    }

    let slots: Slot[] = [];
    const slotDurationMinutes = slotsData.slotDurationMinutes || 15;

    // API now returns slots only for the requested date, so no need to filter
    slotsData.availableSlots.forEach((apiSlot: any) => {
      const startTime = new Date(apiSlot.slot);
      const endTime = new Date(startTime.getTime() + slotDurationMinutes * 60 * 1000);
      
      slots.push({
        start: startTime,
        label: `${formatTime(startTime)} - ${formatTime(endTime)}`,
      });
    });

    // remove slots that are already booked
    const bookedSlots = items
      .flatMap((item) => item.DateTime || [])
      .filter((slot) => slot !== undefined && slot !== null ) // Remove undefined values
      .map((slot) => new Date(slot)); // Ensure they're Date objects

    // Combine booked slots with excluded slots
    const allExcludedSlots = [...bookedSlots, ...excludedSlots];
    
    slots = slots.filter((slot) => {
      // Exact match - if slot.start time equals any excluded slot time, remove it
      return !allExcludedSlots.some((excludedSlot) => {
        console.log('slot.start', slot.start.getTime());
        console.log('excludedSlot', excludedSlot.getTime());
        console.log('slot.start.getTime() === excludedSlot.getTime()', slot.start.getTime() === excludedSlot.getTime());
        return slot.start.getTime() === excludedSlot.getTime();
      });
    });

    console.log('bookedSlots', bookedSlots);
    console.log('excludedSlots', excludedSlots);
    console.log('allExcludedSlots', allExcludedSlots);
    console.log('available slots after filtering', slots);
    

    // Check to which slot the date is closest, only if date is defined and slots is not empty
    // if (date && slots.length > 0) {
    //   const closestSlot = slots.reduce((prev, curr) => {
    //     return (Math.abs(curr.start.getTime() - date.getTime()) < Math.abs(prev.start.getTime() - date.getTime()) ? curr : prev);
    //   });
    //   setSelectedSlot(closestSlot);
    //   // Set the date to the closest slot's start time
    //   const newDate = new Date(date);
    //   newDate.setHours(closestSlot.start.getHours(), closestSlot.start.getMinutes(), 0, 0);
    //   setDate(newDate);
    //   onChange(newDate);
    // }
    return slots;
  }, [items, excludedSlots]);

  function formatTime(date: Date): string {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  const availableSlots: Slot[] = React.useMemo(() => {
    if (!slotsData) return [];
    return generateSlots(slotsData.data);
  }, [slotsData,generateSlots]);



  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && selectedDate instanceof Date) {
      setDate(selectedDate);
      // Don't call onChange here - wait for slot selection
    }
  };

  const handleSlotSelect = (slot: Slot) => {
    setSelectedSlot(slot);
    
    if (date && date instanceof Date) {
      // Combine selected date with slot time
      const combinedDate = new Date(date);
      combinedDate.setHours(
        slot.start.getHours(),
        slot.start.getMinutes(),
        0,
        0
      );
      onChange(combinedDate);
    }
  };
  const [isOpen, setIsOpen] = React.useState(false);

  // const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  // const handleDateSelect = (selectedDate: Date | undefined) => {
  //   if (selectedDate) {
  //     setDate(selectedDate);
  //   }
  // };

  // const handleTimeChange = (
  //   type: "hour" | "minute" | "ampm",
  //   value: string
  // ) => {
  //   if (date) {
  //     const newDate = new Date(date);
  //     if (type === "hour") {
  //       newDate.setHours(
  //         (parseInt(value) % 12) + (newDate.getHours() >= 12 ? 12 : 0)
  //       );
  //     } else if (type === "minute") {
  //       newDate.setMinutes(parseInt(value));
  //     } else if (type === "ampm") {
  //       const currentHours = newDate.getHours();
  //       newDate.setHours(
  //         value === "PM" ? currentHours + 12 : currentHours - 12
  //       );
  //     }
  //     setDate(newDate);
  //   }
  // };

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "flex-1 justify-start text-left font-normal text-xs sm:text-sm min-w-0",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />

            {date && date instanceof Date ? (
              selectedSlot ? (
                <span className="truncate">
                  {format(new Date(date.getFullYear(), date.getMonth(), date.getDate(), selectedSlot.start.getHours(), selectedSlot.start.getMinutes()), "MM/dd/yyyy hh:mm aa")}
                </span>
              ) : (
                <span className="truncate">
                  {format(date, "MM/dd/yyyy")}
                </span>
              )
            ) : (
              <span className="truncate">MM/DD/YYYY hh:mm aa</span>
            )}
          </Button>
        </PopoverTrigger>
      <PopoverContent className="w-auto p-0 max-w-[90vw] sm:max-w-none bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <div className="flex flex-col sm:flex-row">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            className="bg-blue-50 dark:bg-blue-950"
            disabled={(d) => {
              // disable past days
              if (d < new Date(new Date().toDateString())) return true;

              // disable today if all its times are within 12h
              if (isWithin12Hours(new Date(d.setHours(23, 59, 59, 999)))) {
                return true;
              }

              return false;
            }}
          />
          {/* Time Picker */}
          {slotsLoading && (
            <div className="p-4 text-center text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
              Loading available slots...
            </div>
          )}
          
          {slotsError && (
            <div className="p-4 text-center text-red-500 bg-red-50 dark:bg-red-950">
              Error loading slots. Please try again.
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2">
            {availableSlots.length === 0 && !slotsLoading ? (
              <div className="col-span-2 sm:col-span-3 p-4 text-center text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                No available slots for this date
              </div>
            ) : (
              availableSlots.map((slot, index) => {
              const isSelected =
                selectedSlot &&
                selectedSlot.start.getTime() === slot.start.getTime();

              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "ghost"}
                  onClick={() => handleSlotSelect(slot)}
                  className={`justify-center text-xs sm:text-sm ${
                    isSelected 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "bg-white hover:bg-blue-100 text-gray-700 border border-blue-200 hover:border-blue-300"
                  }`}
                >
                  {slot.label}
                 </Button>
               );
             })
            )}
           </div>

          {/* <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {hours.reverse().map((hour) => (
                  <Button
                    key={hour}
                    size="icon"
                    disabled={isWithin12Hours(
                      new Date(date!.setHours(hour, date!.getMinutes(), 0, 0))
                    )}
                    variant={
                      date && date.getHours() % 12 === hour % 12
                        ? "default"
                        : "ghost"
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("hour", hour.toString())}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant={
                      date && date.getMinutes() === minute ? "default" : "ghost"
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() =>
                      handleTimeChange("minute", minute.toString())
                    }
                  >
                    {minute}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="">
              <div className="flex sm:flex-col p-2">
                {["AM", "PM"].map((ampm) => (
                  <Button
                    key={ampm}
                    size="icon"
                    variant={
                      date &&
                      ((ampm === "AM" && date.getHours() < 12) ||
                        (ampm === "PM" && date.getHours() >= 12))
                        ? "default"
                        : "ghost"
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("ampm", ampm)}
                  >
                    {ampm}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div> */}
        </div>
      </PopoverContent>
    </Popover>
    {date && (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-8 w-8 p-0 flex-shrink-0 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
      >
        <Edit className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
      </Button>
    )}
    </div>
  );
}
