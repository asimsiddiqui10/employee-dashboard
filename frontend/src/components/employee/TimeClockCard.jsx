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
import { Clock, PlayCircle, StopCircle, PauseCircle, PlayCircleIcon, History, AlertCircle } from 'lucide-react';
import { useToast } from "../../hooks/use-toast";
import api from '../../lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import HoursForm from './HoursForm';

const TimeClockCard = ({ isLoading = false }) => {
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

  const handleCleanupOrphanedEntries = async () => {
    try {
      const response = await api.post('/time-clock/cleanup');
      
      if (response.data.success) {
        const { cleanedEntries, activeEntry } = response.data.data;
        
        if (cleanedEntries > 0) {
          toast({
            title: "Cleanup Successful",
            description: `Cleaned up ${cleanedEntries} orphaned time entries.`,
          });
          
          // Refresh the current time entry
          setTimeEntry(activeEntry);
        } else {
          toast({
            title: "No Issues Found",
            description: "No orphaned time entries were found.",
          });
        }
      }
      
      // Refresh data
      fetchTimeEntry();
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Cleanup Error",
        description: message,
        variant: "destructive",
      });
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
      <Card className="h-96">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle 
              className="text-lg font-bold flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
              onClick={() => navigate('/employee-dashboard/time-tracking')}
            >
              <Clock className="h-5 w-5" />
              Time Clock
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCleanupOrphanedEntries}
              className="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
              title="Fix any orphaned time entries"
            >
              <AlertCircle className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col h-[calc(100%-5rem)]">
          {/* Current Time and Today's Total - Centered */}
          <div className="text-center space-y-3 mb-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Current Time</div>
              <div className="text-xl font-bold font-mono">
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(currentTime, 'EEE, MMM d')}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Today's Total</div>
              <div className="text-2xl font-bold font-mono">
                {calculateTotalHoursToday()}
              </div>
            </div>
          </div>

          {/* Spacer to push content to bottom */}
          <div className="flex-1 flex flex-col justify-end">
            {/* Status - Only show for active states */}
            <div className="text-center mb-4" style={{ minHeight: '40px' }}>
              {timeEntry && timeEntry.status === 'active' && (
                <Badge 
                  variant={activeBreak ? 'outline' : 'default'} 
                  className={`text-sm px-4 py-2 ${activeBreak ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400' : ''}`}
                >
                  {activeBreak ? 'On Break' : 'Clocked In'}
                </Badge>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-2 pb-3">
            {!timeEntry || timeEntry.status === 'completed' ? (
              <>
                <Button
                  size="sm"
                  onClick={handleClockIn}
                  className="w-full"
                  variant="outline"
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
          </div>
        </CardContent>
      </Card>

      {/* Hours Form */}
      <HoursForm
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