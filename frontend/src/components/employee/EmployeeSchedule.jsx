import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { formatTime12Hour, formatDate } from '@/lib/date-utils';
import { getDepartmentConfig } from '@/lib/departments';
import api from '@/lib/axios';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/authContext';
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const EmployeeSchedule = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const { toast } = useToast();

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      
      // First, fetch employee data to get employeeId
      let employeeId = user?.employeeId;
      if (!employeeId) {
        const employeeResponse = await api.get('/employees/me');
        employeeId = employeeResponse.data?.employeeId;
      }

      if (!employeeId) {
        toast({
          title: "Error",
          description: "Employee ID not found",
          variant: "destructive"
        });
        return;
      }

      const response = await api.get(`/schedules/employee/${employeeId}`);
      const schedulesData = Array.isArray(response.data) ? response.data : (response.data.schedules || []);
      setSchedules(schedulesData);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast({
        title: "Error",
        description: "Failed to load schedules",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter schedules for current date
  const todaySchedules = useMemo(() => {
    const currentDateStr = format(currentDate, 'yyyy-MM-dd');
    return schedules.filter(schedule => {
      const scheduleDateStr = schedule.date?.split('T')[0] || format(new Date(schedule.date), 'yyyy-MM-dd');
      return scheduleDateStr === currentDateStr;
    });
  }, [schedules, currentDate]);

  // Filter schedules for current week
  const weekSchedules = useMemo(() => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
    
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.date);
      return scheduleDate >= weekStart && scheduleDate <= weekEnd;
    });
  }, [schedules, currentWeek]);

  // Group schedules by day for weekly view
  const schedulesByDay = useMemo(() => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayStr = format(day, 'yyyy-MM-dd');
      const daySchedules = weekSchedules.filter(schedule => {
        const scheduleDateStr = schedule.date?.split('T')[0] || format(new Date(schedule.date), 'yyyy-MM-dd');
        return scheduleDateStr === dayStr;
      });
      days.push({
        date: day,
        schedules: daySchedules.sort((a, b) => {
          const timeA = a.startTime.split(':').map(Number);
          const timeB = b.startTime.split(':').map(Number);
          return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
        })
      });
    }
    return days;
  }, [weekSchedules, currentWeek]);

  const handleGoToPreviousDay = () => {
    setCurrentDate(prev => addDays(prev, -1));
  };

  const handleGoToNextDay = () => {
    setCurrentDate(prev => addDays(prev, 1));
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  const handleGoToPreviousWeek = () => {
    setCurrentWeek(prev => subWeeks(prev, 1));
  };

  const handleGoToNextWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, 1));
  };

  const handleGoToTodayWeek = () => {
    setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

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

  // Get department color
  const getDepartmentColor = (department) => {
    const deptConfig = getDepartmentConfig(department || 'Other');
    return deptConfig.bgColor || 'bg-blue-50';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Schedule</h1>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Daily Schedule</CardTitle>
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
              {todaySchedules.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No schedules for this date</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaySchedules.map((schedule) => (
                    <div
                      key={schedule._id}
                      className={cn(
                        "p-4 rounded-lg border transition-shadow",
                        getDepartmentColor(schedule.employeeDepartment || user?.department)
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="font-medium">
                              {schedule.jobCode}
                            </Badge>
                            <span className="text-sm font-medium">
                              {formatTime12Hour(schedule.startTime)} - {formatTime12Hour(schedule.endTime)}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {calculateHours(schedule.startTime, schedule.endTime)} hours
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {format(currentWeek, 'MMM d')} - {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'MMM d, yyyy')}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleGoToPreviousWeek}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleGoToTodayWeek}>
                    This Week
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleGoToNextWeek}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {schedulesByDay.map((day, index) => {
                  const isToday = isSameDay(day.date, new Date());
                  
                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex flex-col border rounded-lg overflow-hidden",
                        isToday && "border-blue-500 border-2"
                      )}
                    >
                      {/* Day Header */}
                      <div className={cn(
                        "p-2 text-center border-b",
                        isToday ? "bg-blue-500 text-white" : "bg-muted"
                      )}>
                        <div className="text-xs font-medium">{format(day.date, 'EEE')}</div>
                        <div className={cn(
                          "text-lg font-bold mt-1",
                          !isToday && day.schedules.length === 0 && "text-muted-foreground"
                        )}>
                          {format(day.date, 'd')}
                        </div>
                      </div>

                      {/* Schedules for this day */}
                      <ScrollArea className="flex-1 min-h-[200px] max-h-[300px]">
                        <div className="p-2 space-y-2">
                          {day.schedules.length === 0 ? (
                            <div className="text-xs text-muted-foreground text-center mt-4">
                              No schedules
                            </div>
                          ) : (
                            day.schedules.map((schedule) => (
                              <div
                                key={schedule._id}
                                className={cn(
                                  "p-2 rounded border text-xs",
                                  getDepartmentColor(schedule.employeeDepartment || user?.department)
                                )}
                              >
                                <div className="font-medium truncate mb-1">
                                  {formatTime12Hour(schedule.startTime)} - {formatTime12Hour(schedule.endTime)}
                                </div>
                                <div className="text-muted-foreground truncate mb-1">
                                  {schedule.jobCode}
                                </div>
                                <div className="text-muted-foreground">
                                  {calculateHours(schedule.startTime, schedule.endTime)}h
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeSchedule;
