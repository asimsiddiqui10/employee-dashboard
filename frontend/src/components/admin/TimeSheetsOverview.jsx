import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { handleApiError } from '@/utils/errorHandler';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Bell } from "lucide-react";
import TimesheetTable from './TimesheetTable';
import TimesheetSearch from './TimesheetSearch';

const TimeSheetsOverview = () => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all',
    department: 'all',
    startDate: '',
    endDate: ''
  });
  const { toast } = useToast();
  const [stats, setStats] = useState({
    pendingRequests: 0,
    overtimeApprovals: 0,
    currentlyWorking: 0
  });

  useEffect(() => {
    fetchTimeEntries();
    // Refresh data every minute
    const interval = setInterval(fetchTimeEntries, 60000);
    return () => clearInterval(interval);
  }, [filters]); // Re-fetch when filters change

  const fetchTimeEntries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/time-clock/timesheets', { params: filters });
      
      console.log('Time entries response:', response.data);
      setTimeEntries(response.data.timeEntries || []);
      
      // Update stats
      const activeEmployees = response.data.activeEmployees || [];
      const onBreakEmployees = response.data.onBreakEmployees || [];
      
      console.log('Active employees:', activeEmployees);
      console.log('On break employees:', onBreakEmployees);
      
      setStats({
        pendingRequests: response.data.pendingRequests || 0,
        overtimeApprovals: response.data.overtimeApprovals || 0,
        currentlyWorking: activeEmployees.length
      });
    } catch (error) {
      handleApiError(error);
      toast({
        title: "Error",
        description: "Failed to fetch time entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (timeEntry) => {
    try {
      setIsActionLoading(true);
      await api.put(`/time-clock/${timeEntry._id}/manager-approve`, {
        approved: true
      });
      toast({
        title: "Success",
        description: "Timesheet approved successfully",
      });
      fetchTimeEntries();
    } catch (error) {
      handleApiError(error);
      toast({
        title: "Error",
        description: "Failed to approve timesheet",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async (timeEntry) => {
    try {
      setIsActionLoading(true);
      await api.put(`/time-clock/${timeEntry._id}/manager-approve`, {
        approved: false
      });
      toast({
        title: "Success",
        description: "Timesheet rejected successfully",
      });
      fetchTimeEntries();
    } catch (error) {
      handleApiError(error);
      toast({
        title: "Error",
        description: "Failed to reject timesheet",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      status: 'all',
      department: 'all',
      startDate: '',
      endDate: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime Approvals</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overtimeApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Need review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Working</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentlyWorking}</div>
            <p className="text-xs text-muted-foreground">
              Active employees
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Time Sheets</CardTitle>
        </CardHeader>
        <CardContent>
          <TimesheetSearch
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
          <div className="mt-6">
            <TimesheetTable
              data={timeEntries}
              onApprove={handleApprove}
              onReject={handleReject}
              isActionLoading={isActionLoading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeSheetsOverview; 