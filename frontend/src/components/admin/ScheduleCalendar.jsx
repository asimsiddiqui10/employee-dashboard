import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

const ScheduleCalendar = ({ schedules, employee }) => {
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Get current week dates
  const getCurrentWeekDates = () => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getCurrentWeekDates();

  const getScheduleForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.find(schedule => 
      schedule.weekStartDate <= dateStr && schedule.weekEndDate >= dateStr
    );
  };

  const getDaySchedule = (date) => {
    const schedule = getScheduleForDate(date);
    if (!schedule) return null;
    
    const dayName = weekDays[date.getDay()];
    return schedule.schedules.find(day => day.dayOfWeek === dayName);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Calendar View</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {/* Header */}
          {weekDays.map((day) => (
            <div key={day} className="text-center font-medium text-sm p-2 bg-gray-50 rounded">
              {day.slice(0, 3)}
            </div>
          ))}
          
          {/* Calendar cells */}
          {weekDates.map((date) => {
            const daySchedule = getDaySchedule(date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={date.toISOString()}
                className={`min-h-[120px] p-2 border rounded-lg ${
                  isToday ? 'bg-blue-50 border-blue-200' : 'bg-white'
                }`}
              >
                <div className="text-xs text-gray-500 mb-2">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {isToday && <span className="ml-1 text-blue-600 font-medium">Today</span>}
                </div>
                
                {daySchedule && daySchedule.enabled ? (
                  <div className="space-y-1">
                    <div className="text-xs font-medium">
                      {formatTime(daySchedule.startTime)} - {formatTime(daySchedule.endTime)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {daySchedule.hours} hours
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {daySchedule.jobCode}
                    </Badge>
                    {daySchedule.breaks && daySchedule.breaks.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {daySchedule.breaks.length} break(s)
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 text-center mt-4">
                    No schedule
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleCalendar; 