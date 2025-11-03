import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek, isSameDay, addDays } from 'date-fns';
import { formatTime12Hour } from '@/lib/date-utils';
import { getDepartmentConfig } from '@/lib/departments';
import api from '@/lib/axios';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const ScheduleWidget = () => {
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSchedules, setTotalSchedules] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUpcomingSchedules();
  }, []);

  const fetchUpcomingSchedules = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
      
      // Fetch schedules for the current week
      const response = await api.get('/schedules/date-range', {
        params: {
          startDate: format(weekStart, 'yyyy-MM-dd'),
          endDate: format(weekEnd, 'yyyy-MM-dd')
        }
      });

      const schedules = Array.isArray(response.data) 
        ? response.data 
        : (response.data.schedules || []);

      // Get schedules starting from today
      const todayStr = format(today, 'yyyy-MM-dd');
      const upcoming = schedules
        .filter(schedule => {
          const scheduleDateStr = schedule.date?.split('T')[0] || format(new Date(schedule.date), 'yyyy-MM-dd');
          return scheduleDateStr >= todayStr;
        })
        .sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (dateA.getTime() === dateB.getTime()) {
            // If same date, sort by start time
            const timeA = a.startTime.split(':').map(Number);
            const timeB = b.startTime.split(':').map(Number);
            return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
          }
          return dateA - dateB;
        })
        .slice(0, 5); // Show only next 5 schedules

      setUpcomingSchedules(upcoming);
      setTotalSchedules(schedules.length);
    } catch (error) {
      console.error('Error fetching upcoming schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentColor = (department) => {
    const deptConfig = getDepartmentConfig(department || 'Other');
    return deptConfig.bgColor || 'bg-blue-50';
  };

  const calculateHours = (startTime, endTime) => {
    const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
    if (endMinutes > startMinutes) {
      return ((endMinutes - startMinutes) / 60).toFixed(1);
    }
    return 0;
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Schedules
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {totalSchedules} this week
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {upcomingSchedules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No upcoming schedules</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingSchedules.map((schedule) => {
              const scheduleDate = new Date(schedule.date);
              const isToday = isSameDay(scheduleDate, new Date());
              const isTomorrow = isSameDay(scheduleDate, addDays(new Date(), 1));

              let dateLabel = format(scheduleDate, 'MMM d');
              if (isToday) dateLabel = 'Today';
              else if (isTomorrow) dateLabel = 'Tomorrow';

              return (
                <div
                  key={schedule._id}
                  className={cn(
                    "p-3 rounded-lg border transition-all hover:shadow-sm cursor-pointer",
                    getDepartmentColor(schedule.employeeDepartment)
                  )}
                  onClick={() => navigate('/admin-dashboard/schedules')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs font-medium">
                          {schedule.jobCode}
                        </Badge>
                        <span className={cn(
                          "text-xs font-medium",
                          isToday && "text-primary font-semibold"
                        )}>
                          {dateLabel}
                        </span>
                      </div>
                      <div className="text-sm font-medium truncate">
                        {schedule.employeeName}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime12Hour(schedule.startTime)} - {formatTime12Hour(schedule.endTime)}</span>
                        <span className="ml-2">({calculateHours(schedule.startTime, schedule.endTime)}h)</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {totalSchedules > 5 && (
              <Button
                variant="ghost"
                className="w-full mt-2 text-sm"
                onClick={() => navigate('/admin-dashboard/schedules')}
              >
                View all schedules
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleWidget;
