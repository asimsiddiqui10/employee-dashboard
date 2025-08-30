import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns';
import api from '@/lib/axios';

const ScheduleCalendar = ({ schedules, employee }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showWeekends, setShowWeekends] = useState(false);
  const [jobCodes, setJobCodes] = useState([]);
  
  // Get week dates starting from Monday (always 7 days)
  const getWeekDates = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday = 1
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 }); // Sunday = 0
    return eachDayOfInterval({ start, end });
  };

  // Get filtered week dates for display (excluding weekends if showWeekends is false)
  const getDisplayWeekDates = () => {
    const allDays = getWeekDates();
    if (!showWeekends) {
      return allDays.filter(day => day.getDay() !== 0 && day.getDay() !== 6);
    }
    return allDays;
  };

  const weekDates = getWeekDates();

  // Fetch job codes on component mount
  useEffect(() => {
    const fetchJobCodes = async () => {
      try {
        const response = await api.get('/job-codes/active/all');
        setJobCodes(response.data);
      } catch (error) {
        console.error('Failed to fetch job codes:', error);
      }
    };
    
    fetchJobCodes();
  }, []);

  // Debug logging
  console.log('ScheduleCalendar render:', {
    currentWeek,
    showWeekends,
    weekDates: weekDates.map(d => format(d, 'yyyy-MM-dd EEEE')),
    schedulesCount: schedules?.length || 0,
    jobCodesCount: jobCodes.length
  });

  // Week navigation functions
  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  // Calculate week total hours
  const calculateWeekTotal = () => {
    let total = 0;
    getDisplayWeekDates().forEach(date => {
      const schedule = getScheduleForDate(date);
      if (schedule) {
        const daySchedule = getDaySchedule(date);
        if (daySchedule && daySchedule.enabled) {
          total += daySchedule.hours || 0;
        }
      }
    });
    return total;
  };

  // Handle case where there are no schedules
  if (!schedules || schedules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Schedule Calendar - {employee?.name || 'Employee'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No schedules found for this employee
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScheduleForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    console.log('Looking for schedule on date:', dateStr);
    console.log('Available schedules:', schedules);
    
    // Find schedules that contain this specific date
    return schedules.find(schedule => {
      // Check if any of the schedule's daily schedules match this date
      return schedule.schedules.some(dailySchedule => {
        const scheduleDate = format(new Date(dailySchedule.date), 'yyyy-MM-dd');
        console.log('Checking daily schedule date:', scheduleDate, 'against:', dateStr);
        return scheduleDate === dateStr && dailySchedule.enabled;
      });
    });
  };

  const getDaySchedule = (date) => {
    const schedule = getScheduleForDate(date);
    if (!schedule) return null;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    // Find the daily schedule that matches this exact date
    return schedule.schedules.find(day => {
      const dayDate = format(new Date(day.date), 'yyyy-MM-dd');
      return dayDate === dateStr && day.enabled;
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Helper function to get job code details
  const getJobCodeDetails = (jobCodeId) => {
    const jobCode = jobCodes.find(jc => jc.code === jobCodeId);
    return jobCode ? `${jobCode.code}: ${jobCode.title}` : jobCodeId;
  };

  return (
    <Card>
      <CardHeader>

        

        
        {/* Week Navigation */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <div className="flex">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousWeek}
                className="rounded-r-none border-r-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextWeek}
                className="rounded-l-none"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-2xl font-bold text-foreground">
              {format(currentWeek, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'This week' : ''} {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'd MMM')} - {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'd MMM yyyy')}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {format(currentWeek, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') && (
              <Button
                variant="outline"
                size="sm"
                onClick={goToCurrentWeek}
              >
                Current Week
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Switch
                id="showWeekends"
                checked={showWeekends}
                onCheckedChange={setShowWeekends}
              />
              <Label htmlFor="showWeekends">Show Weekends</Label>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${showWeekends ? 7 : 5}, minmax(0, 1fr)) 120px` }}>
          {getWeekDates().map((date, index) => {
            const dayName = format(date, 'EEE');
            const dayDate = format(date, 'd');
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            
            // Skip weekend columns if showWeekends is false
            if (!showWeekends && isWeekend) {
              return null;
            }
            
            return (
              <div key={index} className="text-center p-2">
                <div className="font-bold text-base text-foreground">{dayName}</div>
                <div className="font-medium text-sm text-muted-foreground">{dayDate}</div>
              </div>
            );
          })}
          {/* Week Total Column Header */}
          <div className="text-center p-2">
            <div className="font-bold text-base text-foreground">Total</div>
            <div className="font-medium text-sm text-muted-foreground">Week</div>
          </div>
        </div>
        <div className="grid gap-2 mt-2" style={{ gridTemplateColumns: `repeat(${showWeekends ? 7 : 5}, minmax(0, 1fr)) 120px` }}>
          {getWeekDates().map((date, index) => {
            const daySchedule = getDaySchedule(date);
            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            
            // Skip weekend columns if showWeekends is false
            if (!showWeekends && isWeekend) {
              return null;
            }
            
            return (
              <div 
                key={index} 
                className={`min-h-[120px] border rounded p-3 ${
                  isToday 
                    ? 'bg-primary/10 border-primary/20 dark:bg-primary/20 dark:border-primary/30' 
                    : 'bg-card border-border'
                }`}
              >
                {daySchedule ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {formatTime(daySchedule.startTime)} - {formatTime(daySchedule.endTime)}
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {daySchedule.hours}h
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getJobCodeDetails(daySchedule.jobCode)}
                    </Badge>
                    {daySchedule.breaks && daySchedule.breaks.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {daySchedule.breaks.length} break(s)
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground text-center mt-4">
                    No schedule
                  </div>
                )}
              </div>
            );
          })}
          {/* Week Total Box */}
          <div className="min-h-[120px] border rounded p-3 bg-card border-border">
            <div className="text-center flex items-center justify-center h-full">
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {calculateWeekTotal()}
                </div>
                <div className="text-xs text-muted-foreground">hours</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleCalendar; 