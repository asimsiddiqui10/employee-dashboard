import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Users, Filter, RefreshCw, Play, AlertCircle } from 'lucide-react';
import { useToast } from "../../hooks/use-toast";
import api from '../../lib/axios';
import { handleApiError } from '@/utils/errorHandler';

export default function AutomaticTimesheetAdmin() {
  const [scheduledWork, setScheduledWork] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, scheduled, completed, cancelled
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch scheduled work (admin endpoint would need to be created)
      const scheduledResponse = await api.get('/scheduled-work/admin/all');
      setScheduledWork(scheduledResponse.data.data || []);
      
      // Fetch automatic timesheets from time entries
      const timeEntriesResponse = await api.get('/time-clock/all/all');
      const automaticEntries = timeEntriesResponse.data.filter(entry => 
        entry.jobCode === 'AUTO001' || 
        (entry.timesheetNotes && entry.timesheetNotes.includes('Auto-generated'))
      );
      setTimeEntries(automaticEntries);
      
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: `Failed to fetch data: ${message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkGenerate = async () => {
    try {
      setLoading(true);
      
      // Get date range for last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const response = await api.post('/scheduled-work/bulk-generate', {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
      
      toast({
        title: "Success",
        description: `Generated ${response.data.data.generated.length} timesheets`,
      });
      
      fetchData(); // Refresh data
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: `Failed to generate timesheets: ${message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAutoGenerateAll = async () => {
    try {
      setLoading(true);
      
      const response = await api.post('/scheduled-work/admin/auto-generate-all');
      
      toast({
        title: "Success",
        description: response.data.message,
      });
      
      fetchData(); // Refresh data
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: `Failed to auto-generate: ${message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      scheduled: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    
    return (
      <Badge className={statusStyles[status] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getApprovalBadge = (status) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    };
    
    return (
      <Badge className={statusStyles[status] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredScheduledWork = scheduledWork.filter(work => {
    if (filter !== 'all' && work.status !== filter) return false;
    if (searchQuery) {
      const searchValue = searchQuery.toLowerCase();
      return (
        (work.employee?.name || '').toLowerCase().includes(searchValue) ||
        (work.employee?.employeeId || '').toLowerCase().includes(searchValue)
      );
    }
    return true;
  });

  const filteredTimeEntries = timeEntries.filter(entry => {
    if (statusFilter !== 'all' && entry.managerApproval?.status !== statusFilter) return false;
    if (searchQuery) {
      const searchValue = searchQuery.toLowerCase();
      return (
        (entry.employee?.name || '').toLowerCase().includes(searchValue) ||
        (entry.employee?.employeeId || '').toLowerCase().includes(searchValue)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automatic Timesheet Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage scheduled work and automatic timesheet generation
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleBulkGenerate} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Bulk Generate
          </Button>
          <Button onClick={handleAutoGenerateAll}>
            <Play className="h-4 w-4 mr-2" />
            Auto Generate All
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledWork.length}</div>
            <p className="text-xs text-muted-foreground">
              Work schedules
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scheduledWork.filter(w => w.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Timesheets generated
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeEntries.filter(e => e.managerApproval?.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scheduledWork.filter(w => w.status === 'scheduled').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Future schedules
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Work Table */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Work</CardTitle>
          <CardDescription>
            View and manage employee work schedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Search employee name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Job Code</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timesheet</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredScheduledWork.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No scheduled work found
                  </TableCell>
                </TableRow>
              ) : (
                filteredScheduledWork.map((work) => (
                  <TableRow key={work._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {work.employee?.profilePic && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={work.employee.profilePic} alt={work.employee.name} />
                            <AvatarFallback>{work.employee?.name?.[0]}</AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <div className="font-medium">{work.employee?.name}</div>
                          <div className="text-sm text-muted-foreground">{work.employee?.employeeId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(work.date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      {format(new Date(work.startTime), 'HH:mm')} - {format(new Date(work.endTime), 'HH:mm')}
                    </TableCell>
                    <TableCell>{work.jobCode || '-'}</TableCell>
                    <TableCell>{work.rate ? `$${work.rate.toFixed(2)}` : '-'}</TableCell>
                    <TableCell>{getStatusBadge(work.status)}</TableCell>
                    <TableCell>
                      {work.timesheetGenerated ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Generated
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {work.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Automatic Timesheets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Automatic Timesheets</CardTitle>
          <CardDescription>
            View timesheets generated from scheduled work
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Approval Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Job Code</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Approval Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTimeEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No automatic timesheets found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTimeEntries.map((entry) => (
                  <TableRow key={entry._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {entry.employee?.profilePic && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={entry.employee.profilePic} alt={entry.employee.name} />
                            <AvatarFallback>{entry.employee?.name?.[0]}</AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <div className="font-medium">{entry.employee?.name}</div>
                          <div className="text-sm text-muted-foreground">{entry.employee?.employeeId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(entry.date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      {format(new Date(entry.clockIn), 'HH:mm')} - {format(new Date(entry.clockOut), 'HH:mm')}
                    </TableCell>
                    <TableCell>
                      {entry.totalWorkTime ? `${Math.floor(entry.totalWorkTime / 60)}h ${entry.totalWorkTime % 60}m` : '-'}
                    </TableCell>
                    <TableCell>{entry.jobCode || '-'}</TableCell>
                    <TableCell>{entry.rate ? `$${entry.rate.toFixed(2)}` : '-'}</TableCell>
                    <TableCell>{getApprovalBadge(entry.managerApproval?.status || 'pending')}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {entry.timesheetNotes || '-'}
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