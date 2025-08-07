import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import { toast } from '@/hooks/use-toast';
import { format, differenceInBusinessDays } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertCircle, Plus, ToggleLeft, ToggleRight } from 'lucide-react';
import { Label } from '@/components/ui/label';

// Custom Semi-Circle Progress Component (same as TimeOffCard)
const SemiCircularProgress = ({ value, total, size = 120, strokeWidth = 12 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // Half circle
  const offset = circumference - (value / total) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size / 2 + strokeWidth / 2}
        viewBox={`0 0 ${size} ${size / 2 + strokeWidth / 2}`}
      >
        {/* Background semi-circle */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted-foreground/20"
          strokeLinecap="round"
        />
        {/* Progress semi-circle */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-500 ease-in-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ marginTop: '15px' }}>
        <div className="text-2xl font-bold text-primary">
          {value}
        </div>
        <div className="text-xs text-muted-foreground">
          OUT OF {total}
        </div>
      </div>
    </div>
  );
};

const LeaveRequest = () => {
  const [form, setForm] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    description: '',
    manualDays: 0
  });
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalDays, setTotalDays] = useState(0);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchLeaveRequests();
    fetchEmployeeDetails();
  }, []);

  useEffect(() => {
    // Only calculate days if not using manual entry
    if (!isManualEntry && form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      
      // Calculate business days excluding weekends
      const days = differenceInBusinessDays(end, start) + 1;
      
      // Show actual calculation
      let weekendCount = 0;
      let currentDate = new Date(start);
      while (currentDate <= end) {
        if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
          weekendCount++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setTotalDays(days > 0 ? days : 0);
      setForm(prev => ({ ...prev, manualDays: days > 0 ? days : 0 }));
    }
  }, [form.startDate, form.endDate, isManualEntry]);

  const fetchEmployeeDetails = async () => {
    try {
      const response = await api.get('/employees/me');
      setLeaveSummary(response.data.leaveSummary);
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const response = await api.get('/leaves/my-requests');
      setLeaveRequests(response.data.data);
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare request data based on manual entry mode
      const requestData = {
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        description: form.description
      };

      // Add manualDays only if manual entry is enabled and has a value
      if (isManualEntry && form.manualDays > 0) {
        requestData.manualDays = form.manualDays;
      }

      await api.post('/leaves/request', requestData);
      
      // Reset form and refresh data
      setForm({
        leaveType: '',
        startDate: '',
        endDate: '',
        description: '',
        manualDays: 0
      });
      setIsManualEntry(false);
      setTotalDays(0);
      setIsDialogOpen(false);
      fetchLeaveRequests();
      fetchEmployeeDetails();
      
      toast({
        title: "Success",
        description: `Leave request submitted successfully for ${format(new Date(requestData.startDate), 'MMM d')} - ${format(new Date(requestData.endDate), 'MMM d')} (${isManualEntry ? form.manualDays : totalDays} days)`,
      });
    } catch (error) {
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

  const handleCancel = async (requestId) => {
    try {
      await api.delete(`/leaves/cancel/${requestId}`);
      fetchLeaveRequests();
      fetchEmployeeDetails();
      toast({
        title: "Success",
        description: "Leave request cancelled successfully",
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

  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20",
      Approved: "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20",
      Rejected: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
    };
    return <Badge className={styles[status]} variant="outline">{status}</Badge>;
  };

  const totalLeaves = leaveSummary?.totalLeaves || 20;
  const leavesTaken = leaveSummary?.leavesTaken || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Request Leave Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leaves</h1>
          <p className="text-muted-foreground">Manage your leave requests and balance</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Request Leave
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Request Leave</DialogTitle>
              <DialogDescription>
                Submit a new leave request. Please provide all required details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type</Label>
                <Select value={form.leaveType} onValueChange={(value) => setForm(prev => ({ ...prev, leaveType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Annual">Annual Leave</SelectItem>
                    <SelectItem value="Sick">Sick Leave</SelectItem>
                    <SelectItem value="Personal">Personal Leave</SelectItem>
                    <SelectItem value="Emergency">Emergency Leave</SelectItem>
                    <SelectItem value="Maternity">Maternity Leave</SelectItem>
                    <SelectItem value="Paternity">Paternity Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md border">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="manual-toggle" className="text-sm font-medium">
                    Manual Entry
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsManualEntry(!isManualEntry)}
                    className="p-0 h-auto"
                  >
                    {isManualEntry ? (
                      <ToggleRight className="h-5 w-5 text-primary" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  {isManualEntry ? `${form.manualDays} days` : `${totalDays} days (auto)`}
                </div>
              </div>

              {isManualEntry && (
                <div className="space-y-2">
                  <Label htmlFor="manualDays">Number of Days</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.manualDays}
                    onChange={(e) => setForm(prev => ({ ...prev, manualDays: parseInt(e.target.value) || 0 }))}
                    placeholder="Enter number of days"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add any additional details..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Request"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Leave Overview with Donut Chart */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Leave Overview</CardTitle>
          <CardDescription>Your leave balance and usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            {/* Stats Grid - Smaller */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                <div className="text-green-600 dark:text-green-400 text-xs font-medium">Available</div>
                <div className="text-xl font-bold mt-1 text-green-700 dark:text-green-300">
                  {leaveSummary?.leavesRemaining || 0} days
                </div>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                <div className="text-blue-600 dark:text-blue-400 text-xs font-medium">Taken</div>
                <div className="text-xl font-bold mt-1 text-blue-700 dark:text-blue-300">
                  {leaveSummary?.leavesTaken || 0} days
                </div>
              </div>
              <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                <div className="text-yellow-600 dark:text-yellow-400 text-xs font-medium">Pending</div>
                <div className="text-xl font-bold mt-1 text-yellow-700 dark:text-yellow-300">
                  {leaveRequests.filter(req => req.status === 'Pending').length} requests
                </div>
              </div>
            </div>
            
            {/* Donut Chart - Larger */}
            <div className="flex-shrink-0">
              <SemiCircularProgress 
                value={leavesTaken} 
                total={totalLeaves}
                size={180}
                strokeWidth={18}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Request History */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Request History</CardTitle>
          <CardDescription>Your submitted leave requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveRequests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell className="font-medium">{request.leaveType}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(request.startDate), 'MMM d')} - {format(new Date(request.endDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{request.totalDays} days</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(request.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.status === 'Pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancel(request._id)}
                          className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          Cancel
                        </Button>
                      )}
                      {request.reviewNotes && (
                        <div className="text-sm text-muted-foreground mt-1">
                          <span className="font-medium">Note:</span> {request.reviewNotes}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {leaveRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Calendar className="h-8 w-8 text-muted-foreground/50" />
                        <span>No leave requests found</span>
                        <span className="text-sm">Submit your first leave request to get started</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveRequest; 