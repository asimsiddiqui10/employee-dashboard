import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import moment from 'moment';

const ScheduleTimeline = ({ schedules, employees, onSelectSchedule }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate time slots (every hour from 12 AM to 11 PM)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push({
        hour,
        label: moment().hour(hour).minute(0).format('h A')
      });
    }
    return slots;
  }, []);

  // Filter schedules for current date
  const todaySchedules = useMemo(() => {
    const dateStr = moment(currentDate).format('YYYY-MM-DD');
    
    return schedules.filter(schedule => {
      const startDate = moment(schedule.startDate);
      const endDate = moment(schedule.endDate);
      const current = moment(currentDate);
      
      // Check if current date is within schedule range
      const isInRange = current.isSameOrAfter(startDate, 'day') && current.isSameOrBefore(endDate, 'day');
      
      if (!isInRange) return false;
      
      // Check if it's a weekend and whether weekends are included
      const dayOfWeek = current.day();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      if (isWeekend && !schedule.includeWeekends) return false;
      
      return true;
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

  const goToPreviousDay = () => {
    setCurrentDate(prev => moment(prev).subtract(1, 'day').toDate());
  };

  const goToNextDay = () => {
    setCurrentDate(prev => moment(prev).add(1, 'day').toDate());
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Daily Schedule Timeline</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <div className="text-sm font-semibold min-w-[180px] text-center">
              {moment(currentDate).format('dddd, MMMM D, YYYY')}
            </div>
            <Button variant="outline" size="sm" onClick={goToNextDay}>
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
                <div className="w-[200px] flex-shrink-0 p-3 font-semibold bg-muted/50 border-r border-border">
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
                        const colors = [
                          'bg-blue-500 hover:bg-blue-600',
                          'bg-green-500 hover:bg-green-600',
                          'bg-purple-500 hover:bg-purple-600',
                          'bg-orange-500 hover:bg-orange-600',
                          'bg-pink-500 hover:bg-pink-600',
                        ];
                        const colorClass = colors[idx % colors.length];

                        return (
                          <div
                            key={schedule._id}
                            className={`absolute top-2 bottom-2 ${colorClass} rounded cursor-pointer transition-all shadow-sm`}
                            style={style}
                            onClick={() => onSelectSchedule?.(schedule)}
                            title={`${schedule.jobCode}\n${schedule.startTime} - ${schedule.endTime}\n${schedule.hoursPerDay} hours`}
                          >
                            <div className="px-2 py-1 text-white text-xs font-medium truncate">
                              <div className="truncate">{schedule.jobCode}</div>
                              <div className="text-[10px] opacity-90">
                                {schedule.startTime} - {schedule.endTime}
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

