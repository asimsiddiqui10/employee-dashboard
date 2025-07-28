import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { ArrowUpIcon, ArrowDownIcon, Users, DollarSign, Building, Bell, Calendar, Clock } from "lucide-react";
import { DonutChartComponent } from '../charts/DonutChart';
import { RevenueBarChart } from '../charts/BarChart';
import { VisitorsAreaChart } from '../charts/AreaChart';
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import { format } from 'date-fns';

// Add this notification data
const notifications = [
  {
    id: 1,
    title: "New Employee Onboarding",
    description: "Sarah Johnson has completed onboarding process",
    time: "2 hours ago",
    type: "info"
  },
  {
    id: 2,
    title: "System Update",
    description: "Critical security update scheduled for tonight",
    time: "5 hours ago",
    type: "warning"
  },
  {
    id: 3,
    title: "Meeting Reminder",
    description: "Monthly review meeting in 30 minutes",
    time: "30 minutes ago",
    type: "alert"
  },
  {
    id: 4,
    title: "New Employee Onboarding",
    description: "Sarah Johnson has completed onboarding process",
    time: "2 hours ago",
    type: "info"
  },
];

const AdminHome = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const response = await api.get('/leaves/all', { 
        params: { status: 'Pending' } 
      });
      setLeaveRequests(response.data.data || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      const { message } = handleApiError(error);
      console.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
      Approved: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
      Rejected: "bg-red-500/10 text-red-500 hover:bg-red-500/20"
    };
    return <Badge className={styles[status]}>{status}</Badge>;
  };

  // Sample data for charts
  const chartdata = [
    { date: "Apr 1", Visitors: 2890, Revenue: 2400 },
    { date: "Apr 6", Visitors: 2756, Revenue: 1398 },
    { date: "Apr 11", Visitors: 3322, Revenue: 2400 },
    { date: "Apr 17", Visitors: 3470, Revenue: 3908 },
    { date: "Apr 23", Visitors: 3475, Revenue: 3800 },
    { date: "Apr 29", Visitors: 3129, Revenue: 3800 },
    { date: "May 5", Visitors: 2989, Revenue: 2800 },
    { date: "May 11", Visitors: 2756, Revenue: 2498 },
    { date: "May 17", Visitors: 3322, Revenue: 3100 },
    { date: "May 23", Visitors: 2890, Revenue: 2400 },
  ];

  const donutData = [
    { name: "Active", value: 456 },
    { name: "Inactive", value: 120 },
    { name: "On Leave", value: 89 },
    { name: "Terminated", value: 10 },
  ];

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row min-w-0">
      {/* Main Content */}
      <div className="flex w-full flex-col gap-4 lg:w-3/4 min-w-0">
        {/* Stats Section */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total Revenue</CardTitle>
              <Badge className={cn(
                "font-medium transition-colors text-[10px] px-2 py-0.5",
                "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400"
              )}>
                <ArrowUpIcon className="mr-1 h-2.5 w-2.5" />
                +12.5%
              </Badge>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold tracking-tight">$1,250.00</div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">New Customers</CardTitle>
              <Badge className={cn(
                "font-medium transition-colors text-[10px] px-2 py-0.5",
                "bg-red-500/10 text-red-500 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400"
              )}>
                <ArrowDownIcon className="mr-1 h-2.5 w-2.5" />
                -20%
              </Badge>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold tracking-tight">1,234</div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Accounts</CardTitle>
              <Badge className={cn(
                "font-medium transition-colors text-[10px] px-2 py-0.5",
                "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400"
              )}>
                <ArrowUpIcon className="mr-1 h-2.5 w-2.5" />
                +12.5%
              </Badge>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold tracking-tight">45,678</div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin-dashboard/leave')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Leave Requests</CardTitle>
              <Badge className={cn(
                "font-medium transition-colors text-[10px] px-2 py-0.5",
                "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-400"
              )}>
                <Clock className="mr-1 h-2.5 w-2.5" />
                Pending
              </Badge>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold tracking-tight">
                {loading ? '...' : leaveRequests.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          <div className="col-span-full lg:col-span-4 min-w-0">
            <RevenueBarChart />
          </div>
          <div className="col-span-full lg:col-span-3 min-w-0">
            <DonutChartComponent />
          </div>
        </div>

        {/* Visitors Area Chart */}
        <div className="grid gap-4">
          <div className="w-full min-w-0">
            <VisitorsAreaChart />
          </div>
        </div>

        {/* Leave Requests Section */}
        {leaveRequests.length > 0 && (
          <div className="grid gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/20" onClick={() => navigate('/admin-dashboard/leave')}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold">Pending Leave Requests</CardTitle>
                    <CardDescription>Recent leave requests awaiting approval</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-normal">
                      {leaveRequests.length} Pending
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Click to view all
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64 pr-4">
                  <div className="flex flex-col gap-3">
                    {leaveRequests.map((request) => (
                      <div
                        key={request._id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium text-sm">
                                {request.employee?.name || 'Unknown Employee'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {request.employee?.employeeId || 'No ID'} • {request.leaveType}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {format(new Date(request.startDate), 'MMM d')} - {format(new Date(request.endDate), 'MMM d, yyyy')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {request.totalDays} days
                            </div>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Notifications Card */}
      <Card className="w-full lg:w-1/4 min-w-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Notifications</CardTitle>
            <Badge variant="secondary" className="font-normal">
              {notifications.length} New
            </Badge>
          </div>
          <CardDescription>Recent updates and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-13rem)] pr-4">
            <div className="flex flex-col gap-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex flex-col gap-2 rounded-lg border p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium truncate">{notification.title}</h4>
                    <Badge 
                      variant={
                        notification.type === "warning" 
                          ? "destructive" 
                          : notification.type === "alert" 
                          ? "secondary" 
                          : "outline"
                      }
                      className="text-xs shrink-0 ml-2"
                    >
                      {notification.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground break-words">
                    {notification.description}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {notification.time}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHome;