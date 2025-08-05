import React, { useState, useEffect } from 'react';
import { format, formatDistance } from 'date-fns';
import { useAuth } from '@/context/authContext';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import { toast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import TimesheetForm from './TimesheetForm';
import {
  Clock,
  PlayCircle,
  StopCircle,
  PauseCircle,
  PlayCircleIcon,
  Timer,
  CalendarDays,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

const TimeClock = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeEntry, setTimeEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeBreak, setActiveBreak] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timeEntries, setTimeEntries] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showTimesheetForm, setShowTimesheetForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeSummary, setTimeSummary] = useState({
    today: 0,
    week: 0,
    month: 0
  });

  // Add debugging useEffect
  useEffect(() => {
    console.log('Current user:', user);
    console.log('Auth token:', localStorage.getItem('token'));
    console.log('API headers:', api.defaults.headers.common);
  }, [user]);

  // Fetch current time entry and time entries on mount
  useEffect(() => {
    fetchTimeEntry();
    fetchTimeEntries();
    fetchTimeSummary();
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (timeEntry?.clockIn && !timeEntry?.clockOut) {
        if (!activeBreak) {
          const elapsed = Math.floor((new Date() - new Date(timeEntry.clockIn)) / 1000);
          setElapsedTime(elapsed - (timeEntry.totalBreakTime || 0) * 60); // Convert break minutes to seconds
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeEntry, activeBreak]);

  const fetchTimeEntries = async () => {
    try {
      // Calculate date range for the last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const response = await api.get('/time-clock', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });

      setTimeEntries(response.data.data);
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const fetchTimeEntry = async () => {
    try {
      // Add debugging log
      console.log('Fetching today\'s time entry...');
      
      const response = await api.get('/time-clock/today');
      console.log('Current time entry:', response.data);
      
      setTimeEntry(response.data.data);
      if (response.data.data?.breaks) {
        const lastBreak = response.data.data.breaks[response.data.data.breaks.length - 1];
        if (lastBreak && !lastBreak.endTime) {
          setActiveBreak(lastBreak);
        }
      }
    } catch (error) {
      const { message } = handleApiError(error);
      console.error('Error fetching time entry:', {
        error,
        message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSummary = async () => {
    try {
      // This would be a new endpoint to get time summaries
      const response = await api.get('/time-clock/summary');
      setTimeSummary(response.data.data);
    } catch (error) {
      console.error('Error fetching time summary:', error);
    }
  };

  const handleClockIn = async () => {
    try {
      // Add debugging logs
      console.log('Attempting clock in...');
      console.log('User state:', user);
      console.log('Auth headers:', api.defaults.headers.common);
      
      const response = await api.post('/time-clock/clock-in');
      console.log('Clock in response:', response);
      
      setTimeEntry(response.data.data);
      toast({
        title: "Success",
        description: "Successfully clocked in!",
      });
    } catch (error) {
      const { message } = handleApiError(error);
      // Add more detailed error logging
      console.error('Clock in error details:', {
        error,
        message,
        status: error.response?.status,
        data: error.response?.data
      });
      
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

  const handleTimesheetSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const response = await api.post('/time-clock/clock-out', formData);
      setTimeEntry(response.data.data);
      setElapsedTime(0);
      setShowTimesheetForm(false);
      fetchTimeEntries();
      fetchTimeSummary();
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
      setTimeEntry(response.data.data);
      setActiveBreak(response.data.data.breaks[response.data.data.breaks.length - 1]);
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
      const response = await api.post('/time-clock/break/end');
      setTimeEntry(response.data.data);
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
    if (!timeEntry) return "0h 0m";
    
    let totalMinutes = 0;
    if (timeEntry.clockIn) {
      const endTime = timeEntry.clockOut ? new Date(timeEntry.clockOut) : new Date();
      const startTime = new Date(timeEntry.clockIn);
      totalMinutes = Math.floor((endTime - startTime) / (1000 * 60));
      
      // Subtract break time if any
      if (timeEntry.totalBreakTime) {
        totalMinutes -= timeEntry.totalBreakTime;
      }
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const columns = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => format(new Date(row.getValue("date")), 'MMM d, yyyy')
    },
    {
      accessorKey: "clockIn",
      header: "Clock In",
      cell: ({ row }) => format(new Date(row.getValue("clockIn")), 'HH:mm:ss')
    },
    {
      accessorKey: "clockOut",
      header: "Clock Out",
      cell: ({ row }) => row.getValue("clockOut") ? format(new Date(row.getValue("clockOut")), 'HH:mm:ss') : '-'
    },
    {
      accessorKey: "totalWorkTime",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          Duration
          <ArrowUpDown 
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting()}
          />
        </div>
      ),
      cell: ({ row }) => {
        const minutes = row.getValue("totalWorkTime");
        if (!minutes) return '-';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
      }
    },
    {
      accessorKey: "jobCode",
      header: "Job Code",
      cell: ({ row }) => row.getValue("jobCode") || '-'
    },
    {
      accessorKey: "rate",
      header: "Rate",
      cell: ({ row }) => {
        const rate = row.getValue("rate");
        return rate ? `$${rate.toFixed(2)}` : '-';
      }
    },
    {
      accessorKey: "managerApproval.status",
      header: "Status",
      cell: ({ row }) => {
        const entry = row.original;
        if (entry.status === 'active') {
          return (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Active
            </span>
          );
        }
        
        const status = entry.managerApproval?.status || 'pending';
        const statusStyles = {
          pending: "bg-yellow-100 text-yellow-800",
          approved: "bg-green-100 text-green-800",
          rejected: "bg-red-100 text-red-800"
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      }
    },
    {
      accessorKey: "breaks",
      header: "Breaks",
      cell: ({ row }) => {
        const breaks = row.original.breaks || [];
        const totalBreakTime = breaks.reduce((total, b) => total + (b.duration || 0), 0);
        return totalBreakTime > 0 ? `${Math.floor(totalBreakTime / 60)}h ${totalBreakTime % 60}m` : '-';
      }
    }
  ];

  const table = useReactTable({
    data: timeEntries,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 7,
      },
    },
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Time Clock Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Clock className="h-6 w-6" />
              Time Clock
            </CardTitle>
            <CardDescription>
              Track your work hours and breaks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {/* Current Time and Total Hours Display */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Current Time</div>
                  <div className="text-3xl font-bold font-mono">
                    {format(currentTime, 'HH:mm:ss')}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {format(currentTime, 'EEEE, MMM d')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Today's Total</div>
                  <div className="text-3xl font-bold font-mono">
                    {calculateTotalHoursToday()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Hours Worked
                  </div>
                </div>
              </div>

              {/* Status and Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  {!timeEntry || timeEntry.status === 'completed' ? (
                    <Button
                      size="lg"
                      onClick={handleClockIn}
                      className="w-40"
                      variant="default"
                    >
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Clock In
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="lg"
                        onClick={handleClockOut}
                        className="w-40"
                        variant="destructive"
                      >
                        <StopCircle className="mr-2 h-5 w-5" />
                        Clock Out
                      </Button>
                      {!activeBreak ? (
                        <Button
                          size="lg"
                          onClick={handleStartBreak}
                          className="w-40"
                          variant="outline"
                        >
                          <PauseCircle className="mr-2 h-5 w-5" />
                          Start Break
                        </Button>
                      ) : (
                        <Button
                          size="lg"
                          onClick={handleEndBreak}
                          className="w-40"
                          variant="outline"
                        >
                          <PlayCircleIcon className="mr-2 h-5 w-5" />
                          End Break
                        </Button>
                      )}
                    </>
                  )}
                </div>

                {/* Time Entry Status */}
                {timeEntry && (
                  <div className="bg-muted p-4 rounded-lg space-y-2 min-h-[100px]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <Badge variant={activeBreak ? 'outline' : (timeEntry.status === 'active' ? 'default' : 'secondary')} 
                        className={activeBreak ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400' : ''}>
                        {activeBreak ? 'On Break' : (timeEntry.status === 'active' ? 'Clocked In' : 'Clocked Out')}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Clock In Time</span>
                      <span className="font-mono">
                        {format(new Date(timeEntry.clockIn), 'HH:mm:ss')}
                      </span>
                    </div>

                    {timeEntry.clockOut && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Clock Out Time</span>
                        <span className="font-mono">
                          {format(new Date(timeEntry.clockOut), 'HH:mm:ss')}
                        </span>
                      </div>
                    )}

                    {timeEntry.status === 'active' && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Elapsed Time</span>
                        <span className="font-mono">{formatElapsedTime(elapsedTime)}</span>
                      </div>
                    )}

                    {timeEntry.totalWorkTime > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Work Time</span>
                        <span className="font-mono">
                          {formatElapsedTime(timeEntry.totalWorkTime * 60)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <CalendarDays className="h-6 w-6" />
              Time Summary
            </CardTitle>
            <CardDescription>
              Your work hours summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Today</div>
                  <div className="text-2xl font-bold mt-1">
                    {Math.floor(timeSummary.today / 60)}h {timeSummary.today % 60}m
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">This Week</div>
                  <div className="text-2xl font-bold mt-1">
                    {Math.floor(timeSummary.week / 60)}h {timeSummary.week % 60}m
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">This Month</div>
                  <div className="text-2xl font-bold mt-1">
                    {Math.floor(timeSummary.month / 60)}h {timeSummary.month % 60}m
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Time Entries Card - Full Width */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-6 w-6" />
            Recent Time Entries
          </CardTitle>
          <CardDescription>
            Your time entries from the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No time entries found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timesheet Form */}
      <TimesheetForm
        isOpen={showTimesheetForm}
        onClose={() => setShowTimesheetForm(false)}
        onSubmit={handleTimesheetSubmit}
        timeEntry={timeEntry}
        loading={submitting}
      />
    </div>
  );
};

export default TimeClock; 