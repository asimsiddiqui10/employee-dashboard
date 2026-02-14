import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import { format, isToday, isPast, isFuture } from 'date-fns';

const ScheduledWorkList = ({ onEdit, onRefresh }) => {
  const [scheduledWork, setScheduledWork] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchScheduledWork();
  }, []);

  const fetchScheduledWork = async () => {
    try {
      setLoading(true);
      const response = await api.get('/scheduled-work');
      setScheduledWork(response.data.data);
      setError(null);
    } catch (error) {
      const { message } = handleApiError(error);
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      await api.delete(`/scheduled-work/${id}`);
      toast({
        title: "Success",
        description: "Schedule deleted successfully",
      });
      fetchScheduledWork();
      if (onRefresh) onRefresh();
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleGenerateTimesheet = async (id) => {
    try {
      await api.post('/scheduled-work/generate-timesheet', { 
        date: new Date().toISOString().split('T')[0] 
      });
      toast({
        title: "Success",
        description: "Timesheet generated successfully",
      });
      fetchScheduledWork();
      if (onRefresh) onRefresh();
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (schedule) => {
    if (schedule.timesheetGenerated) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
    }
    
    if (isPast(new Date(schedule.date))) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    
    if (isToday(new Date(schedule.date))) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Today</Badge>;
    }
    
    if (isFuture(new Date(schedule.date))) {
      return <Badge variant="outline">Upcoming</Badge>;
    }
    
    return <Badge variant="secondary">Scheduled</Badge>;
  };

  const getRecurringText = (schedule) => {
    if (!schedule.recurring?.enabled) return 'One-time';
    
    const { pattern, daysOfWeek, endDate } = schedule.recurring;
    
    let text = pattern.charAt(0).toUpperCase() + pattern.slice(1);
    
    if (pattern === 'weekly' && daysOfWeek.length > 0) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const selectedDays = daysOfWeek.map(day => dayNames[day]).join(', ');
      text += ` (${selectedDays})`;
    }
    
    if (endDate) {
      text += ` until ${format(new Date(endDate), 'MMM d, yyyy')}`;
    }
    
    return text;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Error Loading Schedules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchScheduledWork} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (scheduledWork.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">No Scheduled Work</CardTitle>
          <CardDescription>
            You haven't scheduled any work hours yet. Create your first schedule to get started.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Your Work Schedules</h3>
        <Button onClick={fetchScheduledWork} variant="outline" size="sm">
          Refresh
        </Button>
      </div>
      
      <div className="space-y-3">
        {scheduledWork.map((schedule) => (
          <div
            key={schedule._id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-1 h-10 bg-orange-500 rounded-full"></div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">
                    {format(new Date(schedule.date), 'EEEE, d MMM')}
                  </span>
                  {getStatusBadge(schedule)}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(schedule.startTime), 'HH:mm')} - {format(new Date(schedule.endTime), 'HH:mm')}
                  </div>
                  <div className="flex items-center gap-1">
                    <span>•</span>
                    {getRecurringText(schedule)}
                  </div>
                  {schedule.jobCode && (
                    <div className="flex items-center gap-1">
                      <span>•</span>
                      {schedule.jobCode} • ${schedule.rate}/hr
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!schedule.timesheetGenerated && isPast(new Date(schedule.date)) && (
                <Button
                  size="sm"
                  onClick={() => handleGenerateTimesheet(schedule._id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Generate Timesheet
                </Button>
              )}
              
              {!schedule.timesheetGenerated && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(schedule)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(schedule._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduledWorkList; 