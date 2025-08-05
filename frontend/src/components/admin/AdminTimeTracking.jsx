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
import { Users, Coffee, Search, Filter } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

export default function AdminTimeTracking() {
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, break
  const [period, setPeriod] = useState('today'); // today, week, month
  const [searchQuery, setSearchQuery] = useState('');
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const { toast } = useToast();
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [onBreakEmployees, setOnBreakEmployees] = useState([]);
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
  }, [period]); // Re-fetch when period changes

  const fetchTimeEntries = async () => {
    try {
      const response = await api.get(`/time-clock/${period}/all`);
      console.log('Time entries response:', response.data);
      
      const entries = response.data;
      
      // Separate entries by status
      const active = entries.filter(entry => 
        entry.status === 'active' && 
        (!entry.breaks || !entry.breaks.some(b => !b.endTime))
      );
      const onBreak = entries.filter(entry => 
        entry.status === 'active' && 
        entry.breaks && 
        entry.breaks.some(b => !b.endTime)
      );
      const pendingAndCompleted = entries.filter(entry => 
        entry.status === 'completed' || 
        entry.managerApproval?.status === 'pending'
      );

      // Deduplicate active employees
      const uniqueActiveEmployees = [];
      const activeEmployeeNames = new Set();
      
      active.forEach(entry => {
        const employeeName = entry.employee?.name;
        if (employeeName && !activeEmployeeNames.has(employeeName)) {
          activeEmployeeNames.add(employeeName);
          uniqueActiveEmployees.push(entry);
        }
      });

      // Deduplicate on break employees
      const uniqueOnBreakEmployees = [];
      const onBreakEmployeeNames = new Set();
      
      onBreak.forEach(entry => {
        const employeeName = entry.employee?.name;
        if (employeeName && !onBreakEmployeeNames.has(employeeName)) {
          onBreakEmployeeNames.add(employeeName);
          uniqueOnBreakEmployees.push(entry);
        }
      });

      // Count pending approval requests
      const pendingRequests = entries.filter(entry => 
        entry.managerApproval?.status === 'pending'
      ).length;

      setActiveEmployees(uniqueActiveEmployees);
      setOnBreakEmployees(uniqueOnBreakEmployees);
      setTimeEntries(pendingAndCompleted); // Show both pending and completed entries
      setStats({
        pendingRequests,
        overtimeApprovals: 0, // You can implement this later if needed
        currentlyWorking: uniqueActiveEmployees.length + uniqueOnBreakEmployees.length
      });
      setLoading(false);
    } catch (error) {
      const { message } = handleApiError(error);
      console.error('Error fetching time entries:', error);
      toast({
        title: "Error",
        description: `Failed to fetch time entries: ${message}`,
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (timeEntryId, status) => {
    try {
      setLoading(true);
      await api.put(`/time-clock/${timeEntryId}/approve`, {
        status,
        notes: '' // Optional notes
      });
      
      toast({
        title: "Success",
        description: `Timesheet ${status} successfully`,
      });
      
      // Refresh the data
      fetchTimeEntries();
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

  const columns = [
    {
      accessorKey: "employee.name",
      header: "Employee",
      cell: ({ row }) => {
        const employee = row.original.employee;
        return (
          <div className="flex items-center gap-2">
            {employee?.profilePic && (
              <Avatar className="h-8 w-8"> 
                <AvatarImage src={employee.profilePic} alt={employee.name} />
                <AvatarFallback>{employee?.name?.[0]}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <div className="font-medium">{employee?.name}</div>
              <div className="text-sm text-muted-foreground">{employee?.employeeId}</div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => format(new Date(row.getValue("date")), 'MMM d, yyyy')
    },
    {
      accessorKey: "clockIn",
      header: "Clock In",
      cell: ({ row }) => format(new Date(row.getValue("clockIn")), 'HH:mm:ss')
    },
    {
      accessorKey: "clockOut",
      header: "Clock Out",
      cell: ({ row }) => row.getValue("clockOut") ? format(new Date(row.getValue("clockOut")), 'HH:mm:ss') : '-'
    },
    {
      accessorKey: "totalWorkTime",
      header: "Duration",
      cell: ({ row }) => {
        const minutes = row.getValue("totalWorkTime");
        if (!minutes) return '-';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
      }
    },
    {
      accessorKey: "jobCode",
      header: "Job Code",
      cell: ({ row }) => row.getValue("jobCode") || '-'
    },
    {
      accessorKey: "rate",
      header: "Rate",
      cell: ({ row }) => {
        const rate = row.getValue("rate");
        return rate ? `$${rate.toFixed(2)}` : '-';
      }
    },
    {
      accessorKey: "managerApproval.status",
      header: "Status",
      cell: ({ row }) => {
        const entry = row.original;
        if (entry.status === 'active') {
          return (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Active
            </span>
          );
        }
        
        const status = entry.managerApproval?.status || 'pending';
        const statusStyles = {
          pending: "bg-yellow-100 text-yellow-800",
          approved: "bg-green-100 text-green-800",
          rejected: "bg-red-100 text-red-800"
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const entry = row.original;
        
        // Only show buttons for completed entries with pending approval
        if (entry.status === 'completed' && entry.managerApproval?.status === 'pending') {
          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-green-50 hover:bg-green-100 text-green-600"
                onClick={() => handleApprove(entry._id, 'approved')}
                disabled={loading}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-red-50 hover:bg-red-100 text-red-600"
                onClick={() => handleApprove(entry._id, 'rejected')}
                disabled={loading}
              >
                Reject
              </Button>
            </div>
          );
        }
        return null;
      }
    }
  ];

  // Filter entries based on pending status and search query
  const filteredData = React.useMemo(() => {
    return timeEntries.filter(entry => {
      // First apply pending filter if active
      if (showPendingOnly) {
        if (!(entry.status === 'completed' && entry.managerApproval?.status === 'pending')) {
          return false;
        }
      }

      // Then apply search filter if there's a search query
      if (searchQuery) {
        const searchValue = searchQuery.toLowerCase();
        return (
          (entry.employee?.name || '').toLowerCase().includes(searchValue) ||
          (entry.employee?.employeeId || '').toLowerCase().includes(searchValue) ||
          (entry.jobCode || '').toLowerCase().includes(searchValue)
        );
      }

      return true;
    });
  }, [timeEntries, showPendingOnly, searchQuery]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Update the summary card section
  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              Timesheets awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Currently Working
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentlyWorking}</div>
            <p className="text-xs text-muted-foreground">
              Employees clocked in
            </p>
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
            <p className="text-xs text-muted-foreground">
              Employees on break
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Time Entries</CardTitle>
          <CardDescription>
            Manage and approve employee timesheets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between pb-4">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                placeholder="Search employee, ID, or job code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8"
              />
              <Button
                variant="outline"
                size="sm"
                className={`${
                  showPendingOnly 
                    ? 'bg-yellow-100 text-yellow-900 hover:bg-yellow-200' 
                    : ''
                }`}
                onClick={() => setShowPendingOnly(!showPendingOnly)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Pending
              </Button>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} entries
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {table.getHeaderGroups().map((headerGroup) => (
                    headerGroup.headers.map((header) => (
                      <TableHead 
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </TableHead>
                    ))
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      No time entries found
                    </TableCell>
                  </TableRow>
                ) : (
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
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between py-4">
            <span className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 