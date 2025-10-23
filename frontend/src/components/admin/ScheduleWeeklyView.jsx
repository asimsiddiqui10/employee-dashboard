import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import moment from 'moment';
import { getDepartmentConfig } from '../../lib/departments';
import { cn } from "@/lib/utils";

const ScheduleWeeklyView = ({ schedules, onSelectSchedule }) => {
  // Start week on Monday
  const [currentWeek, setCurrentWeek] = useState(moment().startOf('isoWeek'));
  const [displayWeekends, setDisplayWeekends] = useState(true);

  // Generate week days (Monday to Sunday, or Mon-Fri if weekends hidden)
  const weekDays = useMemo(() => {
    const days = [];
    const totalDays = displayWeekends ? 7 : 5;
    for (let i = 0; i < totalDays; i++) {
      days.push(currentWeek.clone().add(i, 'days'));
    }
    return days;
  }, [currentWeek, displayWeekends]);

  // Filter schedules for current week
  const weekSchedules = useMemo(() => {
    const weekEnd = currentWeek.clone().endOf('isoWeek');
    return schedules.filter(schedule => {
      const scheduleStart = moment(schedule.startDate);
      const scheduleEnd = moment(schedule.endDate);
      return scheduleStart.isSameOrBefore(weekEnd) && scheduleEnd.isSameOrAfter(currentWeek);
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
        const dayOfWeek = day.day(); // 0 = Sunday
        const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayMap[dayOfWeek];

        // Check if this day is enabled in the schedule
        if (schedule.daysOfWeek && schedule.daysOfWeek[dayName]) {
          // Check if day is within schedule range
          if (day.isBetween(moment(schedule.startDate), moment(schedule.endDate), 'day', '[]')) {
            grouped[index].push(schedule);
          }
        }
      });
    });

    return grouped;
  }, [weekSchedules, weekDays]);

  const formatTime = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getDepartmentColor = (department) => {
    const deptConfig = getDepartmentConfig(department);
    return deptConfig.bgColor;
  };

  const goToPreviousWeek = () => {
    setCurrentWeek(currentWeek.clone().subtract(1, 'week'));
  };

  const goToNextWeek = () => {
    setCurrentWeek(currentWeek.clone().add(1, 'week'));
  };

  const goToToday = () => {
    setCurrentWeek(moment().startOf('isoWeek'));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>
            {currentWeek.format('MMM D')} - {currentWeek.clone().endOf('isoWeek').format('MMM D, YYYY')}
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
              <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("grid gap-2", displayWeekends ? "grid-cols-7" : "grid-cols-5")}>
          {weekDays.map((day, index) => {
            const isToday = day.isSame(moment(), 'day');
            const daySchedules = schedulesByDay[index] || [];
            
            return (
              <div key={index} className="flex flex-col border rounded-lg overflow-hidden">
                {/* Day Header */}
                <div className={cn(
                  "p-3 text-center border-b",
                  isToday ? "bg-blue-500 text-white" : "bg-muted"
                )}>
                  <div className="text-xs font-medium">{day.format('ddd')}</div>
                  <div className={cn(
                    "text-lg font-bold mt-1",
                    !isToday && daySchedules.length === 0 && "text-muted-foreground"
                  )}>
                    {day.format('D')}
                  </div>
                </div>

                {/* Schedules for this day */}
                <div className="flex-1 p-2 space-y-2 min-h-[200px]">
                  {daySchedules.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center mt-4">
                      {day.format('h:mm A')}
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
                          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
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

