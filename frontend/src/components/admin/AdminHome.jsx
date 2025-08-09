import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { ArrowUpIcon, ArrowDownIcon, Users, DollarSign, Building, Bell, Calendar, Clock, FileText, UserCog, MoreHorizontal, Shield, GraduationCap, Laptop, MapPin, Briefcase } from "lucide-react";
import { DonutChartComponent } from '../charts/DonutChart';
import { RevenueBarChart } from '../charts/BarChart';
import { VisitorsAreaChart } from '../charts/AreaChart';
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import { format } from 'date-fns';



const AdminHome = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [pendingTimeEntries, setPendingTimeEntries] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaveRequests();
    fetchPendingTimeEntries();
    fetchRequests();
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
    }
  };

  const fetchPendingTimeEntries = async () => {
    try {
      const response = await api.get('/time-clock/today/all');
      const entries = response.data;
      const pendingEntries = entries.filter(entry => 
        entry.status === 'completed' && 
        entry.managerApproval?.status === 'pending'
      );
      setPendingTimeEntries(pendingEntries);
    } catch (error) {
      console.error('Error fetching pending time entries:', error);
      const { message } = handleApiError(error);
      console.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await api.get('/requests/all', { 
        params: { status: 'pending' } 
      });
      setRequests(response.data.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      const { message } = handleApiError(error);
      console.error(message);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
      Approved: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
      Rejected: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
      pending: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
      processing: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
      completed: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
      rejected: "bg-red-500/10 text-red-500 hover:bg-red-500/20"
    };
    return <Badge className={styles[status]}>{status}</Badge>;
  };

  const getRequestTypeIcon = (type) => {
    const iconClass = "h-4 w-4";
    switch (type) {
      case 'document_request':
        return <FileText className={`${iconClass} text-blue-600`} />;
      case 'details_change':
        return <UserCog className={`${iconClass} text-purple-600`} />;
      case 'leave_request':
        return <Calendar className={`${iconClass} text-green-600`} />;
      case 'payroll_inquiry':
        return <DollarSign className={`${iconClass} text-yellow-600`} />;
      case 'schedule_change':
        return <Clock className={`${iconClass} text-orange-600`} />;
      case 'access_request':
        return <Shield className={`${iconClass} text-red-600`} />;
      case 'training_request':
        return <GraduationCap className={`${iconClass} text-indigo-600`} />;
      case 'equipment_request':
        return <Laptop className={`${iconClass} text-gray-600`} />;
      case 'location_change':
        return <MapPin className={`${iconClass} text-pink-600`} />;
      case 'team_request':
        return <Users className={`${iconClass} text-teal-600`} />;
      case 'project_request':
        return <Briefcase className={`${iconClass} text-cyan-600`} />;
      default:
        return <MoreHorizontal className={`${iconClass} text-slate-600`} />;
    }
  };

  const getRequestTypeLabel = (type) => {
    switch (type) {
      case 'document_request':
        return 'Document Request';
      case 'details_change':
        return 'Details Change';
      case 'leave_request':
        return 'Leave Request';
      case 'payroll_inquiry':
        return 'Payroll Inquiry';
      case 'schedule_change':
        return 'Schedule Change';
      case 'access_request':
        return 'Access Request';
      case 'training_request':
        return 'Training Request';
      case 'equipment_request':
        return 'Equipment Request';
      case 'location_change':
        return 'Location Change';
      case 'team_request':
        return 'Team Request';
      case 'project_request':
        return 'Project Request';
      default:
        return 'Other Request';
    }
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
              <CardTitle className="text-xs font-medium text-muted-foreground">Currently Working</CardTitle>
              <Badge className={cn(
                "font-medium transition-colors text-[10px] px-2 py-0.5",
                "bg-green-500/10 text-green-500 hover:bg-green-500/20"
              )}>
                <Users className="mr-1 h-2.5 w-2.5" />
                Active
              </Badge>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold tracking-tight">20</div>
            </CardContent>
          </Card>

          <Card 
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/admin-dashboard/time-tracking')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Pending Timesheets</CardTitle>
              <Badge className={cn(
                "font-medium transition-colors text-[10px] px-2 py-0.5",
                "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
              )}>
                <Bell className="mr-1 h-2.5 w-2.5" />
                Awaiting
              </Badge>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold tracking-tight">
                {loading ? '...' : pendingTimeEntries.length}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Overtime Approvals</CardTitle>
              <Badge className={cn(
                "font-medium transition-colors text-[10px] px-2 py-0.5",
                "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
              )}>
                <Clock className="mr-1 h-2.5 w-2.5" />
                Pending
              </Badge>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold tracking-tight">15</div>
            </CardContent>
          </Card>

          <Card 
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => navigate('/admin-dashboard/leave')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Leave Requests</CardTitle>
              <Badge className={cn(
                "font-medium transition-colors text-[10px] px-2 py-0.5",
                "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
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

      {/* Requests Card */}
      <Card className="w-full lg:w-1/4 min-w-0 overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle 
              className="text-xl font-semibold cursor-pointer hover:text-primary transition-colors"
              onClick={() => navigate('/admin-dashboard/requests')}
            >
              Requests
            </CardTitle>
            <Badge variant="secondary" className="font-normal">
              {requests.length} Pending
            </Badge>
          </div>
          <CardDescription>Pending employee requests</CardDescription>
        </CardHeader>
        <CardContent className="p-2">
          <div className="px-3 flex flex-col gap-3">
            {requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No pending requests</p>
              </div>
            ) : (
              <>
                {requests.slice(0, 5).map((request) => (
                  <div
                    key={request._id}
                    className="flex flex-col gap-1 rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:bg-muted/30 w-full p-3"
                    onClick={() => navigate('/admin-dashboard/requests')}
                  >
                    <div className="flex items-start gap-1 w-full min-w-0">
                      <div className="p-1.5 rounded-full bg-muted/50 flex-shrink-0">
                        {getRequestTypeIcon(request.type)}
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <h4 className="font-medium text-sm truncate pr-1">{request.title}</h4>
                        <p className="text-xs text-muted-foreground truncate pr-1">
                          {request.employee?.name || 'Unknown Employee'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground break-words overflow-hidden pr-1" 
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                      {request.description}
                    </p>
                  </div>
                ))}
                <div className="text-center py-2">
                  <button 
                    className="text-xs text-primary hover:underline"
                    onClick={() => navigate('/admin-dashboard/requests')}
                  >
                    View all {requests.length} requests
                  </button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHome;