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
import { products } from "@/constants/products";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useGetAvailableSlotsQuery } from "@/redux/apiSlices/Order/orderSlice";
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
}: {
  value?: Date | undefined;
  packageId: (typeof products)[number]["id"];
  onChange: (date: Date) => void;
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
    month: date && date instanceof Date ? date.getMonth() + 1 : 0, // JavaScript months are 0-based, API expects 1-based
    year: date && date instanceof Date ? date.getFullYear() : 0,
    packageId: packageId,
    date: date && date instanceof Date ? date.getDate() : 0, // Day as number
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
      // .filter((slot) => slot !== undefined) // Remove undefined values
      
      .map((slot) => new Date(slot)); // Ensure they're Date objects

 

    
    slots = slots.filter((slot) => {
      // Exact match - if slot.start time equals any booked slot time, remove it

      return !bookedSlots.some((bookedSlot) => {
        console.log('slot.start', slot.start.getTime());
        console.log('bookedSlot', bookedSlot.getTime());
        console.log('slot.start.getTime() === bookedSlot.getTime()', slot.start.getTime() === bookedSlot.getTime());
        return slot.start.getTime() === bookedSlot.getTime();
      });
    });

    console.log('bookedSlots', bookedSlots);
    console.log('slots', slots);
    

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
  }, [items]);

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
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full sm:w-60 justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-3 h-4 w-4" />

          {date && date instanceof Date ? (
            selectedSlot ? (
              format(new Date(date.getFullYear(), date.getMonth(), date.getDate(), selectedSlot.start.getHours(), selectedSlot.start.getMinutes()), "MM/dd/yyyy hh:mm aa")
            ) : (
              format(date, "MM/dd/yyyy")
            )
          ) : (
            <span>MM/DD/YYYY hh:mm aa</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
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
            <div className="p-4 text-center text-gray-500">
              Loading available slots...
            </div>
          )}
          
          {slotsError && (
            <div className="p-4 text-center text-red-500">
              Error loading slots. Please try again.
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            {availableSlots.length === 0 && !slotsLoading ? (
              <div className="col-span-3 p-4 text-center text-gray-500">
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
                  style={{ backgroundColor: isSelected ? "blue" : "white" }}
                  onClick={() => handleSlotSelect(slot)}
                  className="justify-center"
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
  );
}
