import { Button } from '@/components/dashboard/ui/calendarRelatedUI/ui/button';
import { Input } from '@/components/dashboard/ui/calendarRelatedUI/ui/input';
import { Textarea } from '@/components/dashboard/ui/calendarRelatedUI/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/dashboard/ui/dialog';
import { Label } from '@/components/dashboard/ui/label';
import { Calendar } from 'lucide-react';
import React, { useState } from 'react';

interface EventCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (event: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    location?: string;
  }) => Promise<void>;
  selectedDate?: Date;
  selectedStartTime?: Date;
  selectedEndTime?: Date;
  loading?: boolean;
}

export const EventCreateForm: React.FC<EventCreateFormProps> = ({
  isOpen,
  onClose,
  onCreateEvent,
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  });

  // Initialize form with selected dates/times
  React.useEffect(() => {
    console.log('📅 Form opened with selected data:', {
      selectedDate,
      selectedStartTime,
      selectedEndTime,
    });
    
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      console.log('📅 Setting start/end date to:', dateStr);
      setFormData(prev => ({
        ...prev,
        startDate: dateStr,
        endDate: dateStr,
      }));
    }
    
    if (selectedStartTime) {
      const timeStr = selectedStartTime.toTimeString().slice(0, 5);
      console.log('⏰ Setting start time to:', timeStr);
      setFormData(prev => ({
        ...prev,
        startTime: timeStr,
      }));
    }
    
    if (selectedEndTime) {
      const timeStr = selectedEndTime.toTimeString().slice(0, 5);
      console.log('⏰ Setting end time to:', timeStr);
      setFormData(prev => ({
        ...prev,
        endTime: timeStr,
      }));
    }
  }, [selectedDate, selectedStartTime, selectedEndTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Form submitted!', formData);
    
    if (!formData.title || !formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
      console.log('❌ Missing required fields');
      alert('Please fill in all required fields');
      return;
    }

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}:00`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}:00`);

    console.log('📅 Start DateTime:', startDateTime);
    console.log('📅 End DateTime:', endDateTime);

    if (startDateTime >= endDateTime) {
      console.log('❌ End time must be after start time');
      alert('End time must be after start time');
      return;
    }

    const eventData = {
      summary: formData.title,
      description: formData.description || undefined,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      location: formData.location || undefined,
    };

    console.log('📝 Event data to create:', eventData);

    try {
      console.log('🔄 Calling onCreateEvent...');
      await onCreateEvent(eventData);
      console.log('✅ Event created successfully!');

      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
      });
      
      onClose();
    } catch (error) {
      console.error('❌ Error creating event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`📝 Input changed - ${field}:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateButtonClick = () => {
    console.log('🖱️ Create Event button clicked!');
    console.log('📝 Current form data:', formData);
    console.log('🔐 Form validation state:', {
      hasTitle: !!formData.title,
      hasStartDate: !!formData.startDate,
      hasStartTime: !!formData.startTime,
      hasEndDate: !!formData.endDate,
      hasEndTime: !!formData.endTime,
    });
    console.log('⏳ Loading state:', loading);
  };

  // Log when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      console.log('📋 Event creation form opened');
    } else {
      console.log('📋 Event creation form closed');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log('🔄 Dialog state change:', open);
      onClose();
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Create New Event
          </DialogTitle>
          <DialogDescription>
            Add a new event to your Google Calendar
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              placeholder="Enter event title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter event description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Enter event location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} onClick={handleCreateButtonClick}>
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
