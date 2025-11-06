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
      
      // Fetch employee data to get employeeId (string, not ObjectId)
      // The backend endpoint expects employeeId as a string like "E001", not ObjectId
      let employeeId = null;
      
      try {
        const employeeResponse = await api.get('/employees/me');
        // The response is the Employee object directly
        const employee = employeeResponse.data?.data || employeeResponse.data;
        employeeId = employee?.employeeId; // This is the string ID like "E001"
        
        console.log('Employee data:', employee);
        console.log('Employee ID:', employeeId);
      } catch (empError) {
        console.error('Error fetching employee data:', empError);
      }

      if (!employeeId) {
        toast({
          title: "Error",
          description: "Employee ID not found. Please ensure your employee profile is set up correctly.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      console.log('Fetching schedules for employeeId:', employeeId);
      const response = await api.get(`/schedules/employee/${employeeId}`);
      console.log('Schedules response:', response.data);
      
      // Backend returns { schedules: [...], pagination: {...} }
      const schedulesData = response.data?.schedules || response.data || [];
      const schedulesArray = Array.isArray(schedulesData) ? schedulesData : [];
      
      console.log('Parsed schedules:', schedulesArray);
      setSchedules(schedulesArray);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      console.error('Error response:', error.response);
      console.error('Error details:', error.response?.data);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load schedules",
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
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Schedule</h1>
          <p className="text-sm text-muted-foreground mt-1">View your work schedule</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <Tabs defaultValue="daily" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="grid w-full max-w-xs grid-cols-2">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="daily" className="mt-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleGoToPreviousDay}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleGoToToday}>
                    Today
                  </Button>
                  <div className="text-sm font-medium min-w-[160px] text-center">
                    {formatDate(currentDate, 'MMM d, yyyy')}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleGoToNextDay}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {todaySchedules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No schedules for this date</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todaySchedules.map((schedule) => (
                    <div
                      key={schedule._id}
                      className={cn(
                        "p-3 rounded-lg border transition-shadow",
                        getDepartmentColor(schedule.employeeDepartment || user?.department)
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="font-medium">
                            {schedule.jobCode}
                          </Badge>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {formatTime12Hour(schedule.startTime)} - {formatTime12Hour(schedule.endTime)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {calculateHours(schedule.startTime, schedule.endTime)} hours
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="weekly" className="mt-0">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium">
                  {format(currentWeek, 'MMM d')} - {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'MMM d, yyyy')}
                </div>
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
              <div className="grid grid-cols-7 gap-1.5">
                {schedulesByDay.map((day, index) => {
                  const isToday = isSameDay(day.date, new Date());
                  
                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex flex-col border rounded-md overflow-hidden",
                        isToday && "border-primary border-2"
                      )}
                    >
                      {/* Day Header */}
                      <div className={cn(
                        "p-1.5 text-center border-b text-xs",
                        isToday ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <div className="font-medium">{format(day.date, 'EEE')}</div>
                        <div className={cn(
                          "text-base font-bold mt-0.5",
                          !isToday && day.schedules.length === 0 && "text-muted-foreground"
                        )}>
                          {format(day.date, 'd')}
                        </div>
                      </div>

                      {/* Schedules for this day */}
                      <ScrollArea className="flex-1 min-h-[120px] max-h-[200px]">
                        <div className="p-1.5 space-y-1">
                          {day.schedules.length === 0 ? (
                            <div className="text-[10px] text-muted-foreground text-center mt-2">
                              No schedules
                            </div>
                          ) : (
                            day.schedules.map((schedule) => (
                              <div
                                key={schedule._id}
                                className={cn(
                                  "p-1.5 rounded border text-[10px]",
                                  getDepartmentColor(schedule.employeeDepartment || user?.department)
                                )}
                              >
                                <div className="font-medium truncate">
                                  {formatTime12Hour(schedule.startTime)} - {formatTime12Hour(schedule.endTime)}
                                </div>
                                <div className="text-muted-foreground truncate mt-0.5">
                                  {schedule.jobCode}
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeSchedule;
