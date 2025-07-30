import React, { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "../../hooks/use-toast";
import api from '../../lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import { Users, Coffee } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AdminTimeTracking() {
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, break
  const [period, setPeriod] = useState('today'); // today, week, month
  const { toast } = useToast();
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [onBreakEmployees, setOnBreakEmployees] = useState([]);

  useEffect(() => {
    fetchTimeEntries();
    // Refresh data every minute
    const interval = setInterval(fetchTimeEntries, 60000);
    return () => clearInterval(interval);
  }, [period]); // Re-fetch when period changes

  const fetchTimeEntries = async () => {
    try {
      const response = await api.get(`/time-clock/${period}/all`);
      console.log('Time entries response:', response.data); // Debug log
      
      const entries = response.data;
      
      // Debug log each entry's structure
      entries.forEach((entry, index) => {
        console.log(`Entry ${index + 1}:`, {
          id: entry._id,
          status: entry.status,
          employee: entry.employee,
          breaks: entry.breaks
        });
      });
      
      // Separate active and completed entries
      const active = entries.filter(entry => 
        entry.status === 'active' && 
        (!entry.breaks || !entry.breaks.some(b => !b.endTime))
      );
      const onBreak = entries.filter(entry => 
        entry.status === 'active' && 
        entry.breaks && 
        entry.breaks.some(b => !b.endTime)
      );
      const completed = entries.filter(entry => entry.status === 'completed');

      // Deduplicate active employees by name (handle multiple employee records for same person)
      const uniqueActiveEmployees = [];
      const activeEmployeeNames = new Set();
      
      active.forEach(entry => {
        const employeeName = entry.employee?.name;
        if (employeeName && !activeEmployeeNames.has(employeeName)) {
          activeEmployeeNames.add(employeeName);
          uniqueActiveEmployees.push(entry);
        }
      });

      // Deduplicate on break employees by name
      const uniqueOnBreakEmployees = [];
      const onBreakEmployeeNames = new Set();
      
      onBreak.forEach(entry => {
        const employeeName = entry.employee?.name;
        if (employeeName && !onBreakEmployeeNames.has(employeeName)) {
          onBreakEmployeeNames.add(employeeName);
          uniqueOnBreakEmployees.push(entry);
        }
      });

      console.log('Active employees (before dedup):', active.length);
      console.log('Active employees (after dedup):', uniqueActiveEmployees.length);
      console.log('On break employees (before dedup):', onBreak.length);
      console.log('On break employees (after dedup):', uniqueOnBreakEmployees.length);

      setActiveEmployees(uniqueActiveEmployees);
      setOnBreakEmployees(uniqueOnBreakEmployees);
      setTimeEntries(completed);
      setLoading(false);
    } catch (error) {
      const { message } = handleApiError(error);
      console.error('Error fetching time entries:', error); // Debug log
      toast({
        title: "Error",
        description: `Failed to fetch time entries: ${message}`,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: "bg-green-500 hover:bg-green-600",
      break: "bg-yellow-500 hover:bg-yellow-600",
      completed: "bg-gray-500 hover:bg-gray-600",
    };

    return (
      <Badge className={statusStyles[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const calculateElapsedTime = (clockIn, clockOut, breaks) => {
    const start = new Date(clockIn);
    const end = clockOut ? new Date(clockOut) : new Date();
    let totalBreakTime = 0;

    if (breaks && breaks.length > 0) {
      breaks.forEach(breakPeriod => {
        if (breakPeriod.endTime) {
          totalBreakTime += new Date(breakPeriod.endTime) - new Date(breakPeriod.startTime);
        } else if (breakPeriod.startTime) {
          totalBreakTime += new Date() - new Date(breakPeriod.startTime);
        }
      });
    }

    const totalTime = end - start - totalBreakTime;
    const hours = Math.floor(totalTime / (1000 * 60 * 60));
    const minutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const filteredEntries = timeEntries.filter(entry => {
    if (filter === 'all') return true;
    if (filter === 'active') return entry.status === 'active';
    if (filter === 'break') return entry.status === 'break';
    return true;
  });

  const getTotalEmployees = (status) => {
    if (status === 'all') return timeEntries.length;
    return timeEntries.filter(entry => entry.status === status).length;
  };

  // Update the summary card section
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Time Tracking Overview</h1>
        <div className="flex gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              <SelectItem value="active">Currently Working</SelectItem>
              <SelectItem value="break">On Break</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Currently Working
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployees.length}</div>
            <div className="text-xs text-muted-foreground">
              Active Employees
            </div>
            <ScrollArea className="h-[100px] mt-2">
              {activeEmployees.map(entry => (
                <div key={entry._id || entry.employee?._id} className="flex items-center space-x-2 text-sm py-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={entry.employee?.profilePic} />
                    <AvatarFallback>
                      {entry.employee?.name ? entry.employee.name.split(' ').map(n => n[0]).join('') : 'N/A'}
                    </AvatarFallback>
                  </Avatar>
                  <span>{entry.employee?.name || 'N/A'}</span>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              On Break
            </CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onBreakEmployees.length}</div>
            <div className="text-xs text-muted-foreground">
              Employees on Break
            </div>
            <ScrollArea className="h-[100px] mt-2">
              {onBreakEmployees.map(entry => (
                <div key={entry._id || entry.employee?._id} className="flex items-center space-x-2 text-sm py-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={entry.employee?.profilePic} />
                    <AvatarFallback>
                      {entry.employee?.name ? entry.employee.name.split(' ').map(n => n[0]).join('') : 'N/A'}
                    </AvatarFallback>
                  </Avatar>
                  <span>{entry.employee?.name || 'N/A'}</span>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Time Entries</CardTitle>
          <CardDescription>
            {period === 'today' 
              ? "Real-time tracking data for today" 
              : period === 'week' 
                ? "This week's time entries" 
                : "This month's time entries"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Break</TableHead>
                <TableHead>Total Time</TableHead>
                <TableHead>Total Breaks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No time entries found</TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={entry._id}>
                    <TableCell className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={entry.employee?.profilePic} />
                        <AvatarFallback>
                          {entry.employee?.name ? entry.employee.name.split(' ').map(n => n[0]).join('') : 'N/A'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{entry.employee?.name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">
                          {entry.employee?.employeeId || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{format(new Date(entry.clockIn), 'hh:mm a')}</p>
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(entry.clockIn), { addSuffix: true })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(entry.status)}</TableCell>
                    <TableCell>
                      {entry.breaks && entry.breaks.length > 0 && !entry.breaks[entry.breaks.length - 1].endTime ? (
                        <p className="text-yellow-600">
                          {formatDistanceToNow(new Date(entry.breaks[entry.breaks.length - 1].startTime), { addSuffix: false })}
                        </p>
                      ) : (
                        <p className="text-gray-500">-</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{calculateElapsedTime(entry.clockIn, entry.clockOut, entry.breaks)}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{entry.breaks?.length || 0} breaks</p>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 