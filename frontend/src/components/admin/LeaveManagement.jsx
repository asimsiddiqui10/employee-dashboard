import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import { toast } from "@/hooks/use-toast";

const LeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const response = await api.get('/leaves/all');
      setLeaveRequests(response.data);
      setLoading(false);
    } catch (error) {
      const { message } = handleApiError(error);
      console.error(message);
      setError('Error fetching leave requests');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const response = await api.patch(`/leaves/${id}/status`, { status });
      if (response.data) {
        fetchLeaveRequests();
        toast({
          title: "Success",
          description: `Leave request ${status.toLowerCase()} successfully`,
        });
      }
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'destructive';
      default:
        return 'info';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="mx-auto max-w-7xl">
      <CardHeader>
        <CardTitle>Leave Management</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <ScrollArea className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Employee</TableHead>
                <TableHead className="min-w-[80px]">Type</TableHead>
                <TableHead className="min-w-[90px]">Dates</TableHead>
                <TableHead className="min-w-[50px]">Days</TableHead>
                <TableHead className="hidden md:table-cell min-w-[120px]">Reason</TableHead>
                <TableHead className="min-w-[80px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveRequests.map((request) => (
                <TableRow key={request._id}>
                  <TableCell className="font-medium min-w-[150px]">
                    {request.employee.name}
                    <br />
                    <span className="text-sm text-muted-foreground">
                      {request.employee.employeeId}
                    </span>
                  </TableCell>
                  <TableCell className="min-w-[80px]">{request.leaveType}</TableCell>
                  <TableCell className="min-w-[90px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 cursor-pointer">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(request.startDate)}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>From: {new Date(request.startDate).toLocaleDateString()}</p>
                          <p>To: {new Date(request.endDate).toLocaleDateString()}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="min-w-[50px]">{request.totalDays}</TableCell>
                  <TableCell className="hidden md:table-cell min-w-[120px] max-w-[120px] truncate">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="cursor-pointer">
                          <span className="truncate">{request.reason}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{request.reason}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="min-w-[80px]">
                    <Badge 
                      variant={getStatusBadgeVariant(request.status)}
                      className={cn(
                        "font-medium transition-colors",
                        request.status === 'Approved' && "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30",
                        request.status === 'Rejected' && "bg-red-500/10 text-red-500 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30",
                        request.status === 'Pending' && "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30"
                      )}
                    >
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    {request.status === 'Pending' && (
                      <div className="flex space-x-2">
                        <Button
                          size="icon"
                          className="bg-green-500 hover:bg-green-600 md:w-auto md:px-3"
                          onClick={() => handleStatusUpdate(request._id, 'Approved')}
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span className="hidden md:inline md:ml-1">Approve</span>
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="md:w-auto md:px-3"
                          onClick={() => handleStatusUpdate(request._id, 'Rejected')}
                        >
                          <XCircle className="h-4 w-4" />
                          <span className="hidden md:inline md:ml-1">Reject</span>
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LeaveManagement; 