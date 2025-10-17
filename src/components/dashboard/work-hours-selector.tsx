'use client'

import { Button } from '@/components/dashboard/ui/button'
import { Label } from '@/components/dashboard/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/dashboard/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface WorkHoursSelectorProps {
  value: Record<string, string[]>
  onChange: (value: Record<string, string[]>) => void
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]

const TIME_SLOTS = [
  '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30',
  '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30',
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
]

export function WorkHoursSelector({ value, onChange }: WorkHoursSelectorProps) {
  const [workHours, setWorkHours] = useState<Record<string, string[]>>(value || {})

  useEffect(() => {
    setWorkHours(value || {})
  }, [value])

  const handleDayToggle = (day: string) => {
    const newWorkHours = { ...workHours }
    if (newWorkHours[day]) {
      delete newWorkHours[day]
    } else {
      newWorkHours[day] = ['09:00-17:00'] // Default time slot
    }
    setWorkHours(newWorkHours)
    onChange(newWorkHours)
  }

  const handleTimeSlotChange = (day: string, slotIndex: number, newSlot: string) => {
    const newWorkHours = { ...workHours }
    if (newWorkHours[day]) {
      newWorkHours[day] = newWorkHours[day].map((slot, index) => 
        index === slotIndex ? newSlot : slot
      )
      setWorkHours(newWorkHours)
      onChange(newWorkHours)
    }
  }

  const addTimeSlot = (day: string) => {
    const newWorkHours = { ...workHours }
    if (newWorkHours[day]) {
      newWorkHours[day] = [...newWorkHours[day], '09:00-17:00']
      setWorkHours(newWorkHours)
      onChange(newWorkHours)
    }
  }

  const removeTimeSlot = (day: string, slotIndex: number) => {
    const newWorkHours = { ...workHours }
    if (newWorkHours[day] && newWorkHours[day].length > 1) {
      newWorkHours[day] = newWorkHours[day].filter((_, index) => index !== slotIndex)
      setWorkHours(newWorkHours)
      onChange(newWorkHours)
    }
  }

  const parseTimeSlot = (timeSlot: string) => {
    const [startTime, endTime] = timeSlot.split('-')
    return { startTime, endTime }
  }

  const formatTimeSlot = (startTime: string, endTime: string) => {
    return `${startTime}-${endTime}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4" />
        <Label className="text-sm font-medium">Work Hours</Label>
      </div>
      
      <div className="grid gap-3">
        {DAYS_OF_WEEK.map((day) => {
          const isActive = !!workHours[day]
          const timeSlots = workHours[day] || []
          
          return (
            <Card key={day} className={`transition-colors ${isActive ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200'}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{day}</CardTitle>
                  <Button
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDayToggle(day)}
                    className="h-7 px-3"
                  >
                    {isActive ? 'Active' : 'Inactive'}
                  </Button>
                </div>
              </CardHeader>
              
              {isActive && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {timeSlots.map((timeSlot, slotIndex) => {
                      const { startTime, endTime } = parseTimeSlot(timeSlot)
                      
                      return (
                        <div key={slotIndex} className="flex items-center gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <Select
                              value={startTime}
                              onValueChange={(value) => {
                                const newSlot = formatTimeSlot(value, endTime)
                                handleTimeSlotChange(day, slotIndex, newSlot)
                              }}
                            >
                              <SelectTrigger className="w-24 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_SLOTS.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            <span className="text-sm text-gray-500">to</span>
                            
                            <Select
                              value={endTime}
                              onValueChange={(value) => {
                                const newSlot = formatTimeSlot(startTime, value)
                                handleTimeSlotChange(day, slotIndex, newSlot)
                              }}
                            >
                              <SelectTrigger className="w-24 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_SLOTS.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md font-medium">
                              UTC
                            </span>
                          </div>
                          
                          {timeSlots.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTimeSlot(day, slotIndex)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )
                    })}
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTimeSlot(day)}
                      className="w-full h-8 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Time Slot
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
