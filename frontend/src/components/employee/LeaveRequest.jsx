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
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';

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
      await api.post('/leaves/request', form);
      
      // Reset form and refresh data
      setForm({
        leaveType: '',
        startDate: '',
        endDate: '',
        description: '',
        manualDays: 0
      });
      fetchLeaveRequests();
      fetchEmployeeDetails();
      
      toast({
        title: "Success",
        description: `Leave request submitted successfully for ${format(new Date(form.startDate), 'MMM d')} - ${format(new Date(form.endDate), 'MMM d')} (${totalDays} days)`,
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

  const handleManualDaysChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setForm(prev => ({ ...prev, manualDays: value }));
    setTotalDays(value);
  };

  const toggleManualEntry = () => {
    setIsManualEntry(!isManualEntry);
    if (!isManualEntry) {
      // When switching to manual, keep current calculated days
      setForm(prev => ({ ...prev, manualDays: totalDays }));
    } else {
      // When switching back to automatic, recalculate based on dates
      if (form.startDate && form.endDate) {
        const days = differenceInBusinessDays(
          new Date(form.endDate),
          new Date(form.startDate)
        ) + 1;
        setTotalDays(days > 0 ? days : 0);
        setForm(prev => ({ ...prev, manualDays: days > 0 ? days : 0 }));
      }
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Leave Request Status */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Request Status</CardTitle>
          <CardDescription>Your leave request history and status</CardDescription>
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
                    <TableCell>{request.leaveType}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(request.startDate), 'MMM d')} - {format(new Date(request.endDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{request.totalDays} days</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(request.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.status === 'Pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancel(request._id)}
                          className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      )}
                      {request.reviewNotes && (
                        <span className="text-sm text-muted-foreground ml-2">
                          Note: {request.reviewNotes}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {leaveRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No leave requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Request Form */}
      <Card>
        <CardHeader>
          <CardTitle>Request Leave</CardTitle>
          <CardDescription>Submit a new leave request</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Select
                  value={form.leaveType}
                  onValueChange={(value) => setForm(prev => ({ ...prev, leaveType: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vacation">Vacation</SelectItem>
                    <SelectItem value="Sick">Sick Leave</SelectItem>
                    <SelectItem value="Personal">Personal Leave</SelectItem>
                    <SelectItem value="Family">Family Leave</SelectItem>
                    <SelectItem value="Bereavement">Bereavement</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!isManualEntry ? (
                <>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      required={!isManualEntry}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                      min={form.startDate || new Date().toISOString().split('T')[0]}
                      required={!isManualEntry}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2 col-span-2">
                  <Label>Number of Days</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      value={form.manualDays}
                      onChange={handleManualDaysChange}
                      min="1"
                      required={isManualEntry}
                      className="w-32"
                    />
                    <span className="text-sm text-muted-foreground">days</span>
                  </div>
                </div>
              )}

              <div className="col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={toggleManualEntry}
                  className="mb-4"
                >
                  Switch to {isManualEntry ? 'Date Selection' : 'Manual Entry'}
                </Button>
              </div>

              <div className="space-y-2 col-span-2">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Days:</span>
                    <span className="text-lg font-bold">{totalDays}</span>
                  </div>
                  {!isManualEntry && form.startDate && form.endDate && (
                    <div className="text-xs text-muted-foreground">
                      * Weekends are automatically excluded from the calculation
                    </div>
                  )}
                  {totalDays > (leaveSummary?.leavesRemaining || 0) && (
                    <div className="text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-4 w-4" />
                      Exceeds available balance
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-2">
                <Textarea
                  placeholder="Description (optional)"
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="h-20"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={loading || totalDays === 0 || totalDays > (leaveSummary?.leavesRemaining || 0)}
              >
                Submit Request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Leave Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Leave Overview</CardTitle>
          <CardDescription>Your leave balance and history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-500/10 p-4 rounded-lg">
              <div className="text-green-500 text-sm font-medium">Available</div>
              <div className="text-2xl font-bold mt-1">{leaveSummary?.leavesRemaining || 0} days</div>
            </div>
            <div className="bg-blue-500/10 p-4 rounded-lg">
              <div className="text-blue-500 text-sm font-medium">Taken</div>
              <div className="text-2xl font-bold mt-1">{leaveSummary?.leavesTaken || 0} days</div>
            </div>
            <div className="bg-yellow-500/10 p-4 rounded-lg">
              <div className="text-yellow-500 text-sm font-medium">Pending</div>
              <div className="text-2xl font-bold mt-1">
                {leaveRequests.filter(req => req.status === 'Pending').length} requests
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveRequest; 