import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  formatDate, 
  formatTime12Hour, 
  goToPreviousDay,
  goToNextDay,
  startOfDay
} from '../../lib/date-utils';
import { format } from 'date-fns';
import { getDepartmentConfig } from '../../lib/departments';

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

const ScheduleTimeline = ({ 
  schedules, 
  employees, 
  onSelectSchedule, 
  selectedSchedules = [], 
  onScheduleSelect,
  onSelectAll 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate time slots (every hour from 12 AM to 11 PM)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      slots.push({
        hour,
        label: `${hour12} ${ampm}`
      });
    }
    return slots;
  }, []);

  // Filter schedules for current date
  const todaySchedules = useMemo(() => {
    const currentDateStr = format(currentDate, 'yyyy-MM-dd');
    
    return schedules.filter(schedule => {
      // Compare date strings directly to avoid timezone issues
      const scheduleDateStr = schedule.date.split('T')[0];
      return scheduleDateStr === currentDateStr;
    });
  }, [schedules, currentDate]);

  // Get employees who have schedules today
  const activeEmployees = useMemo(() => {
    const employeeIds = new Set(todaySchedules.map(s => s.employeeId));
    return employees.filter(emp => employeeIds.has(emp.employeeId));
  }, [employees, todaySchedules]);

  // Calculate position and width for schedule bars
  const getScheduleStyle = (schedule) => {
    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
    
    const startPos = (startHour + startMinute / 60) * (100 / 24);
    const endPos = (endHour + endMinute / 60) * (100 / 24);
    const width = endPos - startPos;
    
    return {
      left: `${startPos}%`,
      width: `${width}%`
    };
  };

  // Get department color classes - using lighter bgColor for less colorful look
  const getDepartmentColorClass = (department) => {
    const deptConfig = getDepartmentConfig(department);
    return deptConfig.bgColor;
  };
  
  // Get text color for the bar
  const getDepartmentTextColor = (department) => {
    const deptConfig = getDepartmentConfig(department);
    return deptConfig.color;
  };

  const handleGoToPreviousDay = () => {
    setCurrentDate(prev => goToPreviousDay(prev));
  };

  const handleGoToNextDay = () => {
    setCurrentDate(prev => goToNextDay(prev));
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Daily Schedule Timeline</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleGoToPreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleGoToToday}>
              Today
            </Button>
            <div className="text-sm font-semibold min-w-[180px] text-center">
              {formatDate(currentDate, 'EEEE, MMMM d, yyyy')}
            </div>
            <Button variant="outline" size="sm" onClick={handleGoToNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activeEmployees.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No schedules for this date
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              {/* Time header */}
              <div className="flex border-b border-border">
                <div className="w-[200px] flex-shrink-0 p-3 font-semibold bg-muted/50 border-r border-border flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={todaySchedules.length > 0 && todaySchedules.every(s => selectedSchedules.includes(s._id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onSelectAll?.(todaySchedules);
                      } else {
                        onSelectAll?.([]);
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Employee
                </div>
                <div className="flex-1 relative" style={{ height: '50px' }}>
                  {timeSlots.map((slot, idx) => (
                    <div
                      key={slot.hour}
                      className="absolute top-0 bottom-0 border-l border-border/50"
                      style={{ left: `${(slot.hour / 24) * 100}%` }}
                    >
                      <span className="text-xs text-muted-foreground ml-1 mt-1 inline-block">
                        {slot.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Employee rows */}
              {activeEmployees.map(employee => {
                const employeeSchedules = todaySchedules.filter(
                  s => s.employeeId === employee.employeeId
                );

                return (
                  <div key={employee._id} className="flex border-b border-border hover:bg-muted/30 transition-colors">
                    <div className="w-[200px] flex-shrink-0 p-3 border-r border-border">
                      <div className="font-medium text-sm">{employee.name}</div>
                      <div className="text-xs text-muted-foreground">{employee.employeeId}</div>
                    </div>
                    <div className="flex-1 relative" style={{ height: '60px' }}>
                      {/* Time grid lines */}
                      {timeSlots.map((slot) => (
                        <div
                          key={slot.hour}
                          className="absolute top-0 bottom-0 border-l border-border/20"
                          style={{ left: `${(slot.hour / 24) * 100}%` }}
                        />
                      ))}

                      {/* Schedule bars */}
                      {employeeSchedules.map((schedule, idx) => {
                        const style = getScheduleStyle(schedule);
                        const bgColorClass = getDepartmentColorClass(schedule.employeeDepartment);
                        const textColorClass = getDepartmentTextColor(schedule.employeeDepartment);
                        const isSelected = selectedSchedules.includes(schedule._id);

                        return (
                          <div
                            key={schedule._id}
                            className={`absolute top-2 bottom-2 ${bgColorClass} rounded transition-all shadow-sm hover:shadow-md border ${
                              isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : 'cursor-pointer'
                            }`}
                            style={style}
                            onClick={() => onSelectSchedule?.(schedule)}
                            title={`${schedule.employeeName} - ${schedule.jobCode}\n${formatTime12Hour(schedule.startTime)} - ${formatTime12Hour(schedule.endTime)}\n${calculateHours(schedule.startTime, schedule.endTime)} hours`}
                          >
                            <div className={`px-2 py-1 text-xs font-medium truncate ${textColorClass} flex items-center gap-1`}>
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                  className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="truncate font-semibold">{schedule.employeeName} - {schedule.jobCode}</div>
                                <div className="text-[10px] opacity-80">
                                  {formatTime12Hour(schedule.startTime)} - {formatTime12Hour(schedule.endTime)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleTimeline;

