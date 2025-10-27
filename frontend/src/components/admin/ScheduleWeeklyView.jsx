import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  formatDate, 
  formatTime12Hour, 
  getStartOfWeek, 
  getEndOfWeek,
  generateWeekDays,
  goToPreviousWeek,
  goToNextWeek,
  isSameDay,
  isDayEnabled,
  isWithinInterval,
  startOfDay,
  getEffectiveDates
} from '../../lib/date-utils';
import { getDepartmentConfig } from '../../lib/departments';
import { cn } from "@/lib/utils";

const ScheduleWeeklyView = ({ schedules, onSelectSchedule }) => {
  // Start week on Monday
  const [currentWeek, setCurrentWeek] = useState(getStartOfWeek(new Date()));
  const [displayWeekends, setDisplayWeekends] = useState(true);

  // Generate week days (Monday to Sunday, or Mon-Fri if weekends hidden)
  const weekDays = useMemo(() => {
    return generateWeekDays(currentWeek, displayWeekends);
  }, [currentWeek, displayWeekends]);

  // Filter schedules for current week
  const weekSchedules = useMemo(() => {
    const weekEnd = getEndOfWeek(currentWeek);
    return schedules.filter(schedule => {
      if (schedule.scheduleType === 'specific_dates') {
        const effectiveDates = getEffectiveDates(schedule);
        return effectiveDates.some(d => 
          d >= currentWeek && d <= weekEnd
        );
      }
      
      const scheduleStart = new Date(schedule.startDate);
      const scheduleEnd = new Date(schedule.endDate);
      return scheduleStart <= weekEnd && scheduleEnd >= currentWeek;
    });
  }, [schedules, currentWeek]);

  // Group schedules by day
  const schedulesByDay = useMemo(() => {
    const grouped = {};
    weekDays.forEach((day, index) => {
      grouped[index] = [];
    });

    weekSchedules.forEach(schedule => {
      weekDays.forEach((day, index) => {
        const dayStart = startOfDay(day);
        
        // Handle specific dates schedules
        if (schedule.scheduleType === 'specific_dates') {
          const effectiveDates = getEffectiveDates(schedule);
          if (effectiveDates.some(d => startOfDay(d).getTime() === dayStart.getTime())) {
            grouped[index].push(schedule);
          }
          return;
        }
        
        // Handle pattern schedules
        const scheduleStart = startOfDay(new Date(schedule.startDate));
        const scheduleEnd = startOfDay(new Date(schedule.endDate));
        
        // Check if day is within schedule range
        if (dayStart >= scheduleStart && dayStart <= scheduleEnd) {
          // Check if this day is excluded
          if (schedule.excludedDates && schedule.excludedDates.length > 0) {
            const isExcluded = schedule.excludedDates.some(
              d => startOfDay(new Date(d)).getTime() === dayStart.getTime()
            );
            if (isExcluded) return;
          }
          
          // Check if this day is enabled in the schedule
          if (isDayEnabled(day, schedule.daysOfWeek)) {
            grouped[index].push(schedule);
          }
        }
      });
    });

    return grouped;
  }, [weekSchedules, weekDays]);

  const getDepartmentColor = (department) => {
    const deptConfig = getDepartmentConfig(department);
    return deptConfig.bgColor;
  };

  const handleGoToPreviousWeek = () => {
    setCurrentWeek(prev => goToPreviousWeek(prev));
  };

  const handleGoToNextWeek = () => {
    setCurrentWeek(prev => goToNextWeek(prev));
  };

  const handleGoToToday = () => {
    setCurrentWeek(getStartOfWeek(new Date()));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>
            {formatDate(currentWeek, 'MMM d')} - {formatDate(getEndOfWeek(currentWeek), 'MMM d, yyyy')}
          </CardTitle>
          <div className="flex items-center gap-4">
            {/* Display Weekends Toggle */}
            <div className="flex items-center gap-2">
              <Checkbox 
                id="display-weekends" 
                checked={displayWeekends}
                onCheckedChange={setDisplayWeekends}
              />
              <label htmlFor="display-weekends" className="text-sm cursor-pointer">
                Display weekends
              </label>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleGoToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleGoToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={handleGoToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("grid gap-2", displayWeekends ? "grid-cols-7" : "grid-cols-5")}>
          {weekDays.map((day, index) => {
            const isToday = isSameDay(day, new Date());
            const daySchedules = schedulesByDay[index] || [];
            
            return (
              <div key={index} className="flex flex-col border rounded-lg overflow-hidden">
                {/* Day Header */}
                <div className={cn(
                  "p-3 text-center border-b",
                  isToday ? "bg-blue-500 text-white" : "bg-muted"
                )}>
                  <div className="text-xs font-medium">{formatDate(day, 'EEE')}</div>
                  <div className={cn(
                    "text-lg font-bold mt-1",
                    !isToday && daySchedules.length === 0 && "text-muted-foreground"
                  )}>
                    {formatDate(day, 'd')}
                  </div>
                </div>

                {/* Schedules for this day */}
                <div className="flex-1 p-2 space-y-2 min-h-[200px]">
                  {daySchedules.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center mt-4">
                      {formatDate(day, 'h:mm a')}
                    </div>
                  ) : (
                    daySchedules.map((schedule, scheduleIndex) => (
                      <div
                        key={`${schedule._id}-${scheduleIndex}`}
                        className={cn(
                          "p-2 rounded border cursor-pointer hover:shadow-md transition-shadow",
                          getDepartmentColor(schedule.employeeDepartment)
                        )}
                        onClick={() => onSelectSchedule(schedule)}
                      >
                        <div className="text-xs font-medium truncate">
                          {formatTime12Hour(schedule.startTime)} - {formatTime12Hour(schedule.endTime)}
                        </div>
                        <div className="text-xs text-muted-foreground truncate mt-1">
                          {schedule.employeeName}
                        </div>
                        <div className="text-xs font-medium mt-1">
                          {schedule.jobCode}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleWeeklyView;

