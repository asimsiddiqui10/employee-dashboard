import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { format, isSameDay, addDays, startOfDay } from 'date-fns';
import { formatTime12Hour } from '@/lib/date-utils';
import { getDepartmentConfig } from '@/lib/departments';
import api from '@/lib/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/authContext';
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const EmployeeScheduleWidget = () => {
  const { user } = useAuth();
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [jobCodeMap, setJobCodeMap] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchUpcomingSchedules();
    fetchJobCodes();
  }, []);

  const fetchUpcomingSchedules = async () => {
    try {
      setLoading(true);
      
      // Get employeeId (string, not ObjectId)
      let employeeId = null;
      
      try {
        const employeeResponse = await api.get('/employees/me');
        const employee = employeeResponse.data?.data || employeeResponse.data;
        employeeId = employee?.employeeId; // This is the string ID like "E001"
      } catch (empError) {
        console.error('Error fetching employee data:', empError);
      }

      if (!employeeId) {
        setLoading(false);
        return;
      }

      // Fetch upcoming schedules (next 30 days)
      const today = startOfDay(new Date());
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      
      const response = await api.get(`/schedules/employee/${employeeId}`, {
        params: {
          startDate: format(today, 'yyyy-MM-dd'),
          endDate: format(futureDate, 'yyyy-MM-dd')
        }
      });

      const schedules = response.data?.schedules || response.data || [];
      
      // Get schedules starting from today (exclude anything before today)
      const upcoming = schedules
        .filter(schedule => {
          const scheduleDate = new Date(schedule.date);
          return scheduleDate >= today;
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

      setUpcomingSchedules(Array.isArray(upcoming) ? upcoming : []);
    } catch (error) {
      console.error('Error fetching upcoming schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobCodes = async () => {
    try {
      const response = await api.get('/job-codes/active/all');
      const jobCodes = response.data || [];
      const map = {};
      jobCodes.forEach((jc, index) => {
        map[jc.code] = {
          title: jc.title,
          colorIndex: index,
        };
      });
      setJobCodeMap(map);
    } catch (error) {
      console.error('Error fetching job codes for schedule widget:', error);
    }
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
      <Card className="h-96">
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
    <Card className="h-96">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Schedules
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {upcomingSchedules.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex flex-col h-[calc(100%-5rem)]">
        {upcomingSchedules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground flex-1 flex flex-col items-center justify-center">
            <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No upcoming schedules</p>
          </div>
        ) : (
          <div className="space-y-2 flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              {upcomingSchedules.map((schedule) => {
                const scheduleDate = new Date(schedule.date);
                const isToday = isSameDay(scheduleDate, new Date());
                const isTomorrow = isSameDay(scheduleDate, addDays(new Date(), 1));

                let dateLabel = format(scheduleDate, 'MMM d');
                if (isToday) dateLabel = 'Today';
                else if (isTomorrow) dateLabel = 'Tomorrow';

                const jobCodeInfo = jobCodeMap[schedule.jobCode];
                const jobCodeLabel = jobCodeInfo?.title || schedule.jobCode;
                const colorIndex = jobCodeInfo?.colorIndex ?? 0;
                const jobCodeColors = [
                  "bg-blue-50 text-blue-700 border-blue-100",
                  "bg-emerald-50 text-emerald-700 border-emerald-100",
                  "bg-amber-50 text-amber-700 border-amber-100",
                  "bg-purple-50 text-purple-700 border-purple-100",
                  "bg-rose-50 text-rose-700 border-rose-100",
                  "bg-slate-50 text-slate-700 border-slate-200",
                ];

                return (
                  <div
                    key={schedule._id}
                    className="p-3 rounded-lg border bg-background transition-all hover:shadow-sm cursor-pointer"
                    onClick={() => navigate('/employee-dashboard/schedule')}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            className={cn(
                              "text-xs font-medium border px-2 py-0.5",
                              jobCodeColors[colorIndex % jobCodeColors.length]
                            )}
                          >
                            {jobCodeLabel}
                          </Badge>
                          <span className={cn(
                            "text-xs font-medium",
                            isToday && "text-primary font-semibold"
                          )}>
                            {dateLabel}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime12Hour(schedule.startTime)} - {formatTime12Hour(schedule.endTime)}</span>
                          <span className="ml-2">({calculateHours(schedule.startTime, schedule.endTime)} hr)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {upcomingSchedules.length > 0 && (
              <Button
                variant="ghost"
                className="w-full mt-2 text-sm"
                onClick={() => navigate('/employee-dashboard/schedule')}
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

export default EmployeeScheduleWidget;

