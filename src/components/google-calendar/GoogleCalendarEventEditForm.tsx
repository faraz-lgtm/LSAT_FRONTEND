"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/dashboardRelated/calendar/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/dashboard/ui/calendarRelatedUI/ui/form";
import { Input } from "@/components/dashboard/ui/calendarRelatedUI/ui/input";
import { Textarea } from "@/components/dashboard/ui/calendarRelatedUI/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/dashboard/ui/calendarRelatedUI/ui/popover";
import { HexColorPicker } from "react-colorful";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/dashboard/ui/calendarRelatedUI/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/dashboard/ui/calendarRelatedUI/ui/calendar";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { CalendarEvent } from "@/utils/calendar/data";

const eventEditFormSchema = z.object({
  title: z.string().min(1, { message: "Please enter an event title." }),
  description: z.string().optional(),
  startDate: z.date({
    required_error: "Please select a start date.",
  }),
  startTime: z.string().min(1, { message: "Please select a start time." }),
  endDate: z.date({
    required_error: "Please select an end date.",
  }),
  endTime: z.string().min(1, { message: "Please select an end time." }),
  color: z
    .string()
    .min(1, { message: "Please select an event color." }),
});

type EventEditFormValues = z.infer<typeof eventEditFormSchema>;

interface GoogleCalendarEventEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent;
  onUpdate: (updatedEvent: CalendarEvent) => void;
  loading?: boolean;
}

export function GoogleCalendarEventEditForm({
  isOpen,
  onClose,
  event,
  onUpdate,
  loading = false,
}: GoogleCalendarEventEditFormProps) {
  const { toast } = useToast();

  const form = useForm<EventEditFormValues>({
    resolver: zodResolver(eventEditFormSchema),
    defaultValues: {
      title: event.title,
      description: event.description || "",
      startDate: event.start,
      startTime: format(event.start, "HH:mm"),
      endDate: event.end,
      endTime: format(event.end, "HH:mm"),
      color: event.backgroundColor || "#3788d8",
    },
  });

  // Update form when event changes
  useEffect(() => {
    form.reset({
      title: event.title,
      description: event.description || "",
      startDate: event.start,
      startTime: format(event.start, "HH:mm"),
      endDate: event.end,
      endTime: format(event.end, "HH:mm"),
      color: event.backgroundColor || "#3788d8",
    });
  }, [event, form]);

  const onSubmit = (values: EventEditFormValues) => {
    console.log("📝 EventEditForm onSubmit called:", values);
    
    // Combine date and time for start and end
    const startDateTime = new Date(values.startDate);
    const [startHours, startMinutes] = values.startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes, 0, 0);
    
    const endDateTime = new Date(values.endDate);
    const [endHours, endMinutes] = values.endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes, 0, 0);
    
    // Create updated event object
    const updatedEvent: CalendarEvent = {
      ...event,
      title: values.title,
      description: values.description || "",
      start: startDateTime,
      end: endDateTime,
      backgroundColor: values.color,
    };

    console.log("📝 Updated event data:", updatedEvent);
    
    // Call the onUpdate callback
    onUpdate(updatedEvent);
    
    toast({
      title: "Event updated",
      description: "Your event has been updated successfully.",
    });
  };

  const handleCancel = () => {
    console.log("❌ EventEditForm cancelled");
    form.reset();
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Event</AlertDialogTitle>
        </AlertDialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event title" {...field} />
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
                      placeholder="Enter event description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Event Color</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <div
                            className="mr-2 h-4 w-4 rounded-full"
                            style={{ backgroundColor: field.value }}
                          />
                          {field.value || "Pick a color"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <HexColorPicker
                        color={field.value}
                        onChange={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancel} disabled={loading}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                disabled={loading}
                onClick={form.handleSubmit(onSubmit)}
              >
                {loading ? "Updating..." : "Update Event"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
