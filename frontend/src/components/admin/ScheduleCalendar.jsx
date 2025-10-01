import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay } from 'date-fns';

const ScheduleCalendar = ({ schedules = [], employee }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showWeekends, setShowWeekends] = useState(false);

  // Get week dates starting from Monday
  const weekDates = useMemo(() => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentWeek]);

  // Get filtered week dates for display (excluding weekends if showWeekends is false)
  const displayDates = useMemo(() => {
    if (!showWeekends) {
      return weekDates.filter(day => day.getDay() !== 0 && day.getDay() !== 6);
    }
    return weekDates;
  }, [weekDates, showWeekends]);

  // Navigation functions
  const goToPreviousWeek = () => setCurrentWeek(prev => subWeeks(prev, 1));
  const goToNextWeek = () => setCurrentWeek(prev => addWeeks(prev, 1));
  const goToCurrentWeek = () => setCurrentWeek(new Date());

  // Find schedule for a specific date
  const getScheduleForDate = (date) => {
    if (!schedules?.length) return null;
    
    return schedules.find(schedule => 
      schedule.schedules?.some(slot => 
        isSameDay(new Date(slot.date), date)
      )
    );
  };

  // Calculate total hours for a schedule
  const calculateScheduleHours = (schedule) => {
    if (!schedule?.schedules?.length) return 0;
    
    return schedule.schedules.reduce((total, slot) => {
      if (slot.isBreak) return total;
      
      const startTime = new Date(`2000-01-01T${slot.startTime}`);
      const endTime = new Date(`2000-01-01T${slot.endTime}`);
      const hours = (endTime - startTime) / (1000 * 60 * 60);
      
      return total + (hours > 0 ? hours : 0);
    }, 0);
  };

  // Calculate week total hours
  const weekTotalHours = useMemo(() => {
    return displayDates.reduce((total, date) => {
      const schedule = getScheduleForDate(date);
      return total + calculateScheduleHours(schedule);
    }, 0);
  }, [displayDates, schedules]);

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={goToPreviousWeek} variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button onClick={goToCurrentWeek} variant="outline" size="sm">
            Today
          </Button>
          <Button onClick={goToNextWeek} variant="outline" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="showWeekends"
              checked={showWeekends}
              onCheckedChange={setShowWeekends}
            />
            <Label htmlFor="showWeekends">Show Weekends</Label>
          </div>
          <Badge variant="outline">
            Week Total: {weekTotalHours.toFixed(1)} hrs
          </Badge>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 gap-4">
        {displayDates.map((date) => {
          const schedule = getScheduleForDate(date);
          const totalHours = calculateScheduleHours(schedule);
          const isToday = isSameDay(date, new Date());

          return (
            <Card key={date.toISOString()} className={isToday ? 'border-primary' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{format(date, 'EEEE')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(date, 'MMM d, yyyy')}
                    </p>
                  </div>
                  <Badge variant={totalHours > 0 ? 'default' : 'outline'}>
                    {totalHours.toFixed(1)} hrs
                  </Badge>
                </div>

                {schedule ? (
                  <div className="space-y-2">
                    {schedule.schedules
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((slot, idx) => (
                        <div 
                          key={idx} 
                          className={`p-2 rounded-md ${
                            slot.isBreak 
                              ? 'bg-muted' 
                              : 'bg-primary/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <Badge variant={slot.isBreak ? 'outline' : 'secondary'}>
                              {slot.isBreak ? 'Break' : slot.jobCode}
                            </Badge>
                          </div>
                          {slot.notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {slot.notes}
                            </p>
                          )}
                        </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No schedule
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduleCalendar; 