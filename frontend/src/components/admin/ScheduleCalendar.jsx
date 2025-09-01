import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns';
import api from '@/lib/axios';

const ScheduleCalendar = ({ schedules = [], employee }) => {
  const [jobCodes, setJobCodes] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date()); // Default to current week
  const [showWeekends, setShowWeekends] = useState(false);
  
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

  // Auto-navigate to the week that contains the most recent schedule (only on mount)
  useEffect(() => {
    if (schedules && schedules.length > 0) {
      console.log('Auto-navigation: Found schedules, checking for most recent...');
      
      // Find the most recent schedule
      const mostRecentSchedule = schedules.reduce((latest, current) => {
        const latestDate = new Date(latest.createdAt);
        const currentDate = new Date(current.createdAt);
        return currentDate > latestDate ? current : latest;
      });
      
      console.log('Auto-navigation: Most recent schedule:', mostRecentSchedule);
      
      // Only auto-navigate if the most recent schedule was created today or this week
      const today = new Date();
      const scheduleCreatedDate = new Date(mostRecentSchedule.createdAt);
      const daysDifference = Math.floor((today - scheduleCreatedDate) / (1000 * 60 * 60 * 24));
      
      console.log('Auto-navigation: Days since schedule creation:', daysDifference);
      
      // Only auto-navigate if schedule was created within the last 7 days
      if (daysDifference <= 7 && mostRecentSchedule.schedules && mostRecentSchedule.schedules.length > 0) {
        const firstScheduleDate = mostRecentSchedule.schedules[0].date;
        console.log('Auto-navigation: First schedule date:', firstScheduleDate);
        
        const scheduleDate = new Date(firstScheduleDate);
        console.log('Auto-navigation: Parsed schedule date:', scheduleDate);
        console.log('Auto-navigation: Current week before navigation:', currentWeek);
        
        setCurrentWeek(scheduleDate);
        
        console.log('Auto-navigation: Set current week to:', scheduleDate);
      } else {
        console.log('Auto-navigation: Schedule too old or no valid dates, staying on current week');
        setCurrentWeek(new Date()); // Default to current week
      }
    } else {
      console.log('Auto-navigation: No schedules found, defaulting to current week');
      setCurrentWeek(new Date()); // Default to current week if no schedules
    }
  }, [schedules]);

  // Debug logging
  useEffect(() => {
    console.log('ScheduleCalendar render:', {
      currentWeek,
      jobCodesCount: jobCodes.length,
      schedulesCount: schedules.length,
      showWeekends,
      weekDates: weekDates.map(date => `${format(date, 'yyyy-MM-dd')} ${format(date, 'EEEE')}`)
    });
  }, [currentWeek, jobCodes, schedules, showWeekends, weekDates]);

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

  // Debug: Show schedule dates
  if (schedules.length > 0) {
    console.log('ScheduleCalendar: First schedule details:', {
      _id: schedules[0]._id,
      employeeId: schedules[0].employeeId,
      scheduleDates: schedules[0].schedules?.map(s => ({
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        hours: s.hours,
        jobCode: s.jobCode
      })) || [],
      createdAt: schedules[0].createdAt
    });
    
    // Also log all schedules for debugging
    console.log('ScheduleCalendar: All schedules:', schedules.map(s => ({
      _id: s._id,
      employeeId: s.employeeId,
      scheduleDatesCount: s.schedules?.length || 0,
      createdAt: s.createdAt
    })));
  }

  // Debug: Log the first schedule to see its structure
  console.log('ScheduleCalendar: Current week being displayed:', format(currentWeek, 'yyyy-MM-dd'));
  console.log('ScheduleCalendar: Total schedules available:', schedules.length);

  // Get schedule for a specific date
  const getScheduleForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    console.log(`Looking for schedule on date: ${dateStr}`);
    
    // Find schedules that contain this specific date in their schedules array
    const scheduleWithDate = schedules.find(schedule => {
      return schedule.schedules && schedule.schedules.some(s => {
        let scheduleDateStr;
        
        if (typeof s.date === 'string') {
          // If it's an ISO string, extract just the date part
          if (s.date.includes('T')) {
            scheduleDateStr = s.date.split('T')[0];
          } else {
            scheduleDateStr = s.date;
          }
        } else if (s.date instanceof Date) {
          scheduleDateStr = format(s.date, 'yyyy-MM-dd');
        } else {
          // If it's a MongoDB date object or other format
          scheduleDateStr = new Date(s.date).toISOString().split('T')[0];
        }
        
        return scheduleDateStr === dateStr;
      });
    });
    
    return scheduleWithDate;
  };

  // Get day schedule for a specific date
  const getDaySchedule = (date) => {
    const schedule = getScheduleForDate(date);
    if (!schedule) return null;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Find all schedules for this date (multiple time slots)
    const daySchedules = schedule.schedules.filter(s => {
      let scheduleDateStr;
      
      if (typeof s.date === 'string') {
        // If it's an ISO string, extract just the date part
        if (s.date.includes('T')) {
          scheduleDateStr = s.date.split('T')[0];
        } else {
          scheduleDateStr = s.date;
        }
      } else if (s.date instanceof Date) {
        scheduleDateStr = format(s.date, 'yyyy-MM-dd');
      } else {
        // If it's a MongoDB date object or other format
        scheduleDateStr = new Date(s.date).toISOString().split('T')[0];
      }
      
      return scheduleDateStr === dateStr;
    });
    
    if (daySchedules.length === 0) return null;
    
    // Return all schedules for this date
    return daySchedules;
  };

  // Calculate total hours for a specific date
  const calculateDayTotalHours = (date) => {
    const daySchedules = getDaySchedule(date);
    if (!daySchedules) return 0;
    
    return daySchedules.reduce((total, slot) => {
      if (slot.enabled && !slot.isBreak) {
        return total + (slot.hours || 0);
      }
      return total;
    }, 0);
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
            {schedules && schedules.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const mostRecentSchedule = schedules.reduce((latest, current) => {
                    const latestDate = new Date(latest.createdAt);
                    const currentDate = new Date(current.createdAt);
                    return currentDate > latestDate ? current : latest;
                  });
                  
                  if (mostRecentSchedule.schedules && mostRecentSchedule.schedules.length > 0) {
                    const firstScheduleDate = mostRecentSchedule.schedules[0].date;
                    const scheduleDate = new Date(firstScheduleDate);
                    setCurrentWeek(scheduleDate);
                  }
                }}
              >
                Go to Latest Schedule
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('Manual refresh: Navigating to current week');
                setCurrentWeek(new Date());
              }}
            >
              Go to This Week
            </Button>
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
          {/* Calendar cells */}
          {getDisplayWeekDates().map((date, index) => {
            if (!date) return null;
            
            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            const daySchedules = getDaySchedule(date);
            const dayTotalHours = calculateDayTotalHours(date);
            
            return (
              <div
                key={index}
                className={`p-3 border rounded-lg min-h-[120px] ${
                  isToday 
                    ? 'bg-primary/10 border-primary/20 dark:bg-primary/20 dark:border-primary/30' 
                    : 'bg-card border-border'
                }`}
              >
                {daySchedules ? (
                  <div className="space-y-2">
                    {daySchedules.map((schedule, slotIndex) => (
                      <div key={slotIndex} className="text-sm">
                        {!schedule.isBreak && (
                          <>
                            <div className="font-medium">
                              {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                            </div>
                            <div className="text-lg font-bold text-primary">
                              {schedule.hours}h
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {getJobCodeDetails(schedule.jobCode)}
                            </div>
                          </>
                        )}
                        {schedule.isBreak && (
                          <div className="text-xs text-muted-foreground italic">
                            Break: {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                          </div>
                        )}
                      </div>
                    ))}
                    {dayTotalHours > 0 && (
                      <div className="text-xs text-muted-foreground border-t pt-1">
                        Total: {dayTotalHours}h
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">No schedule</div>
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