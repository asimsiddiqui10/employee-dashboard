import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Calendar,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0
  });
  const [departmentStats, setDepartmentStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('today'); // today, week, month

  useEffect(() => {
    fetchAttendanceData();
  }, [timeRange]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/attendance/${timeRange}`);
      setAttendanceData(response.data.data);
      setAttendanceStats(response.data.stats);
      setDepartmentStats(response.data.departmentStats || []);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'today':
        return `Today - ${format(new Date(), 'MMM d, yyyy')}`;
      case 'week':
        const weekStart = startOfWeek(new Date());
        const weekEnd = endOfWeek(new Date());
        return `This Week - ${format(weekStart, 'MMM d')} to ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        const monthStart = startOfMonth(new Date());
        const monthEnd = endOfMonth(new Date());
        return `This Month - ${format(monthStart, 'MMM d')} to ${format(monthEnd, 'MMM d, yyyy')}`;
      default:
        return 'Today';
    }
  };

  const getDepartmentColor = (department) => {
    const colors = {
      'Engineering': '#3B82F6',
      'Production': '#10B981',
      'Administration': '#F59E0B',
      'Management': '#8B5CF6',
      'Sales': '#EF4444',
      'Warehouse': '#06B6D4',
      'Other': '#6B7280'
    };
    return colors[department] || '#6B7280';
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#6B7280'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employee Attendance</h1>
          <p className="text-muted-foreground">
            {getTimeRangeLabel()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {format(new Date(), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Half - Stats Cards */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attendanceStats.totalEmployees}</div>
                <p className="text-xs text-muted-foreground">
                  Full-time & Part-time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{attendanceStats.presentToday}</div>
                <p className="text-xs text-muted-foreground">
                  Marked attendance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Absent</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{attendanceStats.absentToday}</div>
                <p className="text-xs text-muted-foreground">
                  No attendance marked
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {attendanceStats.attendanceRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Attendance rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Attendance List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Attendance Records
              </CardTitle>
              <CardDescription>
                Employees who marked attendance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-y-auto space-y-3">
                {attendanceData.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No attendance records found</p>
                  </div>
                ) : (
                  attendanceData.map((attendance) => (
                    <div key={attendance._id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={attendance.employee?.profilePic} />
                          <AvatarFallback>
                            {attendance.employee?.name?.charAt(0) || 'E'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{attendance.employee?.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {attendance.employee?.employeeId} • {attendance.employee?.department}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {format(new Date(attendance.punchIn), 'MMM d, HH:mm')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(attendance.date), 'MMM d, yyyy')}
                          </div>
                        </div>
                        <Badge variant="default" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 text-xs">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Present
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Half - Charts */}
        <div className="space-y-4">
          {/* Department Attendance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Attendance by Department
              </CardTitle>
              <CardDescription>
                Present vs absent employees by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="present" fill="#10B981" name="Present" />
                    <Bar dataKey="absent" fill="#EF4444" name="Absent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Overall Attendance Distribution
              </CardTitle>
              <CardDescription>
                Present vs absent ratio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Present', value: attendanceStats.presentToday, color: '#10B981' },
                        { name: 'Absent', value: attendanceStats.absentToday, color: '#EF4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      dataKey="value"
                    >
                      {[
                        { name: 'Present', value: attendanceStats.presentToday, color: '#10B981' },
                        { name: 'Absent', value: attendanceStats.absentToday, color: '#EF4444' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance; 