import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, PlayCircle, StopCircle, PauseCircle, PlayCircleIcon, History } from 'lucide-react';
import { useToast } from "../../hooks/use-toast";
import api from '../../lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import TimesheetForm from './TimesheetForm';

const TimeClockCard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeEntry, setTimeEntry] = useState(null);
  const [activeBreak, setActiveBreak] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showTimesheetForm, setShowTimesheetForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (timeEntry?.clockIn && !timeEntry?.clockOut) {
        if (!activeBreak) {
          const elapsed = Math.floor((new Date() - new Date(timeEntry.clockIn)) / 1000);
          setElapsedTime(elapsed);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeEntry, activeBreak]);

  // Fetch current time entry on mount
  useEffect(() => {
    fetchTimeEntry();
  }, []);

  const fetchTimeEntry = async () => {
    try {
      const response = await api.get('/time-clock/today');
      setTimeEntry(response.data.data);
      if (response.data.data?.breaks) {
        const lastBreak = response.data.data.breaks[response.data.data.breaks.length - 1];
        if (lastBreak && !lastBreak.endTime) {
          setActiveBreak(lastBreak);
        }
      }
    } catch (error) {
      console.error('Error fetching time entry:', error);
    }
  };

  const handleClockIn = async () => {
    try {
      const response = await api.post('/time-clock/clock-in');
      setTimeEntry(response.data.data);
      toast({
        title: "Success",
        description: "Successfully clocked in!",
      });
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleClockOut = async () => {
    setShowTimesheetForm(true);
  };

  const handleTimesheetCancel = () => {
    setShowTimesheetForm(false);
    toast({
      title: "Clock out cancelled",
      description: "You remain clocked in. You can try to clock out again when ready.",
    });
  };

  const handleTimesheetSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const response = await api.post('/time-clock/clock-out', formData);
      setTimeEntry(response.data.data);
      setElapsedTime(0);
      setShowTimesheetForm(false);
      toast({
        title: "Success",
        description: "Successfully clocked out!",
      });
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartBreak = async () => {
    try {
      const response = await api.post('/time-clock/break/start');
      const newBreak = response.data.data.breaks[response.data.data.breaks.length - 1];
      setActiveBreak(newBreak);
      toast({
        title: "Success",
        description: "Break started!",
      });
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleEndBreak = async () => {
    try {
      await api.post('/time-clock/break/end');
      setActiveBreak(null);
      toast({
        title: "Success",
        description: "Break ended!",
      });
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const formatElapsedTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateTotalHoursToday = () => {
    if (!timeEntry) return '00:00:00';
    
    if (timeEntry.status === 'completed' && timeEntry.totalWorkTime) {
      const totalMinutes = timeEntry.totalWorkTime;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    }
    
    if (timeEntry.status === 'active') {
      return formatElapsedTime(elapsedTime);
    }
    
    return '00:00:00';
  };

  const handleRecentTimeEntries = () => {
    navigate('/employee-dashboard/time-tracking');
  };

  return (
    <>
      <Card className="h-80">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Clock
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Today's Total and Current Time - Side by Side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground mb-1">Today's Total</div>
              <div className="text-xl font-bold font-mono">
                {calculateTotalHoursToday()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground mb-1">Current Time</div>
              <div className="text-xl font-bold font-mono">
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(currentTime, 'EEE, MMM d')}
              </div>
            </div>
          </div>

          {/* Status */}
          {timeEntry && (
            <div className="text-center">
              <Badge 
                variant={activeBreak ? 'outline' : (timeEntry.status === 'active' ? 'default' : 'secondary')} 
                className={`text-sm px-4 py-2 ${activeBreak ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400' : ''}`}
              >
                {activeBreak ? 'On Break' : (timeEntry.status === 'active' ? 'Clocked In' : 'Clocked Out')}
              </Badge>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col gap-2">
            {!timeEntry || timeEntry.status === 'completed' ? (
              <>
                <Button
                  size="sm"
                  onClick={handleClockIn}
                  className="w-full bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/30"
                  variant="secondary"
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Clock In
                </Button>
                <Button
                  size="sm"
                  onClick={handleRecentTimeEntries}
                  className="w-full"
                  variant="outline"
                >
                  <History className="mr-2 h-4 w-4" />
                  Recent Time Entries
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={handleClockOut}
                  className="w-full bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30"
                  variant="secondary"
                >
                  <StopCircle className="mr-2 h-4 w-4" />
                  Clock Out
                </Button>
                {!activeBreak ? (
                  <Button
                    size="sm"
                    onClick={handleStartBreak}
                    className="w-full"
                    variant="outline"
                  >
                    <PauseCircle className="mr-2 h-4 w-4" />
                    Start Break
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleEndBreak}
                    className="w-full"
                    variant="outline"
                  >
                    <PlayCircleIcon className="mr-2 h-4 w-4" />
                    End Break
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timesheet Form */}
      <TimesheetForm
        isOpen={showTimesheetForm}
        onClose={() => setShowTimesheetForm(false)}
        onSubmit={handleTimesheetSubmit}
        onCancel={handleTimesheetCancel}
        timeEntry={timeEntry}
        loading={submitting}
      />
    </>
  );
};

export default TimeClockCard; 