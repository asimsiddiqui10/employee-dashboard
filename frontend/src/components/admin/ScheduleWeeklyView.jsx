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
  startOfDay
} from '../../lib/date-utils';
import { format } from 'date-fns';
import { getDepartmentConfig } from '../../lib/departments';
import { cn } from "@/lib/utils";

// Calculate hours from start and end time
const calculateHours = (startTime, endTime) => {
  const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
  const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
  
  if (endMinutes > startMinutes) {
    const totalMinutes = endMinutes - startMinutes;
    return (totalMinutes / 60).toFixed(1);
  }
  return 0;
};

const ScheduleWeeklyView = ({ 
  schedules, 
  onSelectSchedule, 
  selectedSchedules = [], 
  onScheduleSelect,
  onSelectAll 
}) => {
  // Start week on Monday
  const [currentWeek, setCurrentWeek] = useState(getStartOfWeek(new Date()));
  const [displayWeekends, setDisplayWeekends] = useState(true);

  // Generate week days (Monday to Sunday, or Mon-Fri if weekends hidden)
  const weekDays = useMemo(() => {
    return generateWeekDays(currentWeek, displayWeekends);
  }, [currentWeek, displayWeekends]);

  // Filter schedules for current week
  const weekSchedules = useMemo(() => {
    const weekStartStr = format(currentWeek, 'yyyy-MM-dd');
    const weekEndStr = format(getEndOfWeek(currentWeek), 'yyyy-MM-dd');
    
    return schedules.filter(schedule => {
      // Compare date strings directly to avoid timezone issues
      const scheduleDateStr = schedule.date.split('T')[0];
      return scheduleDateStr >= weekStartStr && scheduleDateStr <= weekEndStr;
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
        const dayStr = format(day, 'yyyy-MM-dd');
        const scheduleDateStr = schedule.date.split('T')[0];
        
        // Compare date strings directly to avoid timezone issues
        if (scheduleDateStr === dayStr) {
          grouped[index].push(schedule);
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
                    daySchedules.map((schedule, scheduleIndex) => {
                      const isSelected = selectedSchedules.includes(schedule._id);
                      
                      return (
                        <div
                          key={`${schedule._id}-${scheduleIndex}`}
                          className={cn(
                            "p-2 rounded border hover:shadow-md transition-shadow",
                            getDepartmentColor(schedule.employeeDepartment),
                            isSelected ? "ring-2 ring-blue-500 ring-offset-1" : "cursor-pointer"
                          )}
                          onClick={() => onSelectSchedule(schedule)}
                        >
                          <div className="flex items-start gap-2">
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  onScheduleSelect?.(schedule._id, e.target.checked);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5 cursor-pointer"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium truncate">
                                {formatTime12Hour(schedule.startTime)} - {formatTime12Hour(schedule.endTime)}
                              </div>
                              <div className="text-xs text-muted-foreground truncate mt-1">
                                {schedule.employeeName}
                              </div>
                              <div className="text-xs font-medium mt-1">
                                {schedule.jobCode}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {calculateHours(schedule.startTime, schedule.endTime)}h
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
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

