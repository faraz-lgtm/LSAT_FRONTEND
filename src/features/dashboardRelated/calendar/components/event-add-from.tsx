"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/dashboard/ui/calendarRelatedUI/ui/alert-dialog";
import { Button } from "@/components/dashboard/ui/calendarRelatedUI/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/dashboard/ui/calendarRelatedUI/ui/form";
import { Input } from "@/components/dashboard/ui/calendarRelatedUI/ui/input";
import { useEvents } from "@/context/event-context";
import { useToast } from "@/hooks/dashboardRelated/calendar/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DateTimePicker } from "@/components/dashboard/ui/calendarRelatedUI/date-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/dashboard/ui/calendarRelatedUI/ui/popover";
import { Textarea } from "@/components/dashboard/ui/calendarRelatedUI/ui/textarea";
import { ToastAction } from "@/components/dashboard/ui/calendarRelatedUI/ui/toast";

const eventAddFormSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Please enter a title." }),
  description: z
    .string()
    .min(1, { message: "Please enter a description." }),
  start: z.date({
    message: "Please select a start time",
  }),
  end: z.date({
    message: "Please select an end time",
  }),
  color: z
    .string()
    .min(1, { message: "Please select an event color." })
});

type EventAddFormValues = z.infer<typeof eventAddFormSchema>;

interface EventAddFormProps {
  start: Date;
  end: Date;
}

export function EventAddForm({ start, end }: EventAddFormProps) {
  const { events, addEvent } = useEvents();
  const { eventAddOpen, setEventAddOpen } = useEvents();

  const { toast } = useToast();

  const form = useForm<z.infer<typeof eventAddFormSchema>>({
    resolver: zodResolver(eventAddFormSchema)
  });

  useEffect(() => {
    console.log('🔄 Form reset effect triggered');
    console.log('📅 Reset data:', {
      start,
      end,
      color: "#76c7ef"
    });
    
    form.reset({
      title: "",
      description: "",
      start: start,
      end: end,
      color: "#76c7ef"
    });
    
    console.log('✅ Form reset completed');
  }, [form, start, end]);

  async function onSubmit(data: EventAddFormValues) {
    console.log('🚀 Event Add Form submitted!', data);
    console.log('📊 Current events count:', events.length);
    
    const newEvent = {
      id: String(events.length + 1),
      title: data.title,
      description: data.description,
      start: data.start,
      end: data.end,
      color: data.color
    };
    
    console.log('📝 New event to add:', newEvent);
    console.log('🔄 Calling addEvent...');
    
    addEvent(newEvent);
    console.log('✅ Event added successfully!');
    
    console.log('🔄 Closing dialog...');
    setEventAddOpen(false);
    
    console.log('📢 Showing toast notification...');
    toast({
      title: "Event added!",
      action: (
        <ToastAction altText={"Click here to dismiss notification"}>
          Dismiss
        </ToastAction>
      )
    });
  }

  const handleAddEventClick = () => {
    console.log('🖱️ Add Event button clicked!');
    console.log('📅 Start date:', start);
    console.log('📅 End date:', end);
    console.log('📊 Current events count:', events.length);
    console.log('🔄 Opening event add dialog...');
    setEventAddOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    console.log('🔄 Event Add Dialog state change:', open);
    if (open) {
      console.log('📋 Event Add Dialog opened');
      console.log('📝 Form reset with data:', {
        start,
        end,
        color: "#76c7ef"
      });
    } else {
      console.log('📋 Event Add Dialog closed');
    }
  };

  const handleCancelClick = () => {
    console.log('❌ Cancel button clicked');
    console.log('🔄 Closing event add dialog...');
    setEventAddOpen(false);
  };

  return (
    <AlertDialog open={eventAddOpen} onOpenChange={handleDialogOpenChange}>
      <AlertDialogTrigger className="flex" asChild>
        <Button
          className="w-24 md:w-28 text-xs md:text-sm"
          variant="default"
          onClick={handleAddEventClick}
        >
          <PlusIcon className="md:h-5 md:w-5 h-3 w-3" />
          <p>Add Event</p>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add Event</AlertDialogTitle>
        </AlertDialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Standup Meeting" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Daily session"
                      className="max-h-36"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="start"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel htmlFor="datetime">Start</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      hourCycle={12}
                      granularity="minute"
                      locale={undefined}
                      weekStartsOn={0}
                      showWeekNumber={false}
                      showOutsideDays={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel htmlFor="datetime">End</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      hourCycle={12}
                      granularity="minute"
                      locale={undefined}
                      weekStartsOn={0}
                      showWeekNumber={false}
                      showOutsideDays={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild className="cursor-pointer">
                        <div className="flex flex-row w-full items-center space-x-2 pl-2">
                          <div
                            className={`w-5 h-5 rounded-full cursor-pointer`}
                            style={{ backgroundColor: field.value }}
                          ></div>
                          <Input {...field} />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="flex mx-auto items-center justify-center">
                        <HexColorPicker
                          className="flex"
                          color={field.value}
                          onChange={field.onChange}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter className="pt-2">
              <AlertDialogCancel onClick={handleCancelClick}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction type="submit">Add Event</AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
