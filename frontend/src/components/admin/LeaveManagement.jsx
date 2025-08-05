import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, Building, ArrowUpDown } from 'lucide-react';
import { getDepartmentConfig, departments } from '@/lib/departments';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
} from "@tanstack/react-table";

const LeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [sorting, setSorting] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchLeaveRequests();
  }, [filters]);

  const fetchLeaveRequests = async () => {
    try {
      const response = await api.get('/leaves/all', { params: filters });
      setLeaveRequests(response.data.data);
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

  const handleStatusUpdate = async (status) => {
    try {
      setLoading(true);
      await api.put(`/leaves/${selectedRequest._id}/status`, {
        status,
        reviewNotes
      });

      setShowReviewDialog(false);
      setReviewNotes('');
      setSelectedRequest(null);
        fetchLeaveRequests();

        toast({
          title: "Success",
          description: `Leave request ${status.toLowerCase()} successfully`,
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

  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
      Approved: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
      Rejected: "bg-red-500/10 text-red-500 hover:bg-red-500/20"
    };
    return <Badge className={styles[status]}>{status}</Badge>;
  };

  const getDepartmentBadge = (department) => {
    const deptConfig = getDepartmentConfig(department);
    return (
      <div className="flex items-center gap-2">
        <div className={`p-1 rounded ${deptConfig.bgColor}`}>
          <deptConfig.icon className={`h-4 w-4 ${deptConfig.color}`} />
        </div>
        <span className={deptConfig.color}>{department}</span>
      </div>
    );
  };

  const columns = [
    {
      accessorKey: "employee.name",
      header: "Employee",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <div>
            <div className="font-medium">{row.original.employee?.name || 'Unknown'}</div>
            <div className="text-sm text-muted-foreground">
              {row.original.employee?.employeeId || 'No ID'}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "employee.department",
      header: "Department",
      cell: ({ row }) => (
        row.original.employee?.department ? 
          getDepartmentBadge(row.original.employee.department) : 
          <span className="text-muted-foreground">No Department</span>
      ),
    },
    {
      accessorKey: "leaveType",
      header: "Type",
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Leave Period</span>
          <ArrowUpDown className="h-4 w-4 cursor-pointer" onClick={() => column.toggleSorting()} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <span>
            {format(new Date(row.original.startDate), 'MMM d')} - {format(new Date(row.original.endDate), 'MMM d, yyyy')}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "totalDays",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <span>Days</span>
          <ArrowUpDown className="h-4 w-4 cursor-pointer" onClick={() => column.toggleSorting()} />
        </div>
      ),
      cell: ({ row }) => `${row.original.totalDays} days`,
    },
    {
      accessorKey: "noticeDays",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <span>Notice</span>
          <ArrowUpDown className="h-4 w-4 cursor-pointer" onClick={() => column.toggleSorting()} />
        </div>
      ),
      cell: ({ row }) => `${row.original.noticeDays} days prior`,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <span>Status</span>
          <ArrowUpDown className="h-4 w-4 cursor-pointer" onClick={() => column.toggleSorting()} />
        </div>
      ),
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Submitted</span>
          <ArrowUpDown className="h-4 w-4 cursor-pointer" onClick={() => column.toggleSorting()} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <span>{format(new Date(row.original.createdAt), 'MMM d, yyyy')}</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <>
          {row.original.status === 'Pending' && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedRequest(row.original);
                  setShowReviewDialog(true);
                  setReviewNotes('');
                }}
                className="h-8 bg-blue-50 hover:bg-blue-100 text-blue-600"
              >
                Review
              </Button>
            </div>
          )}
          {row.original.status !== 'Pending' && row.original.reviewNotes && (
            <span className="text-sm text-muted-foreground">
              Note: {row.original.reviewNotes}
            </span>
          )}
        </>
      ),
    },
  ];

  const table = useReactTable({
    data: leaveRequests,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-500">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaveRequests.filter(r => r.status === 'Pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-500">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaveRequests.filter(r => r.status === 'Approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-500">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaveRequests.filter(r => r.status === 'Rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests Table */}
      <Card>
      <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>Manage employee leave requests</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? '' : value }))}
              >
                <SelectTrigger className="w-full sm:w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.department}
                onValueChange={(value) => setFilters(prev => ({ ...prev, department: value === 'all' ? '' : value }))}
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {Object.entries(departments).map(([key, dept]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <dept.icon className={`h-4 w-4 ${dept.color}`} />
                        <span>{key}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full sm:w-[130px]"
                />
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full sm:w-[130px]"
                />
              </div>
              {(filters.status || filters.department || filters.startDate || filters.endDate) && (
                <Button 
                  variant="ghost" 
                  className="px-2 h-9"
                  onClick={() => setFilters({ status: '', department: '', startDate: '', endDate: '' })}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
      </CardHeader>
      <CardContent>
          <div className="rounded-md border overflow-x-auto">
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
                      No leave requests found
                  </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Leave Request</DialogTitle>
            <DialogDescription>
              Review and update the status of this leave request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Employee</label>
                  <p className="text-sm">{selectedRequest.employee?.name || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Department</label>
                  <p className="text-sm">{selectedRequest.employee?.department || 'No Department'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Leave Type</label>
                  <p className="text-sm">{selectedRequest.leaveType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Total Days</label>
                  <p className="text-sm">{selectedRequest.totalDays} days</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <p className="text-sm">{selectedRequest.description || 'No description provided'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Review Notes</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about your decision (optional)"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex space-x-2">
                        <Button
              variant="outline"
              onClick={() => {
                setShowReviewDialog(false);
                setReviewNotes('');
              }}
                        >
              Cancel
                        </Button>
                        <Button
                          variant="destructive"
              onClick={() => handleStatusUpdate('Rejected')}
                        >
              Reject
            </Button>
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleStatusUpdate('Approved')}
            >
              Approve
                        </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
                      </div>
  );
};

export default LeaveManagement; 