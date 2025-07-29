import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/context/authContext';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import { toast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  PlayCircle,
  CalendarDays,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

const TimePunch = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayPunch, setTodayPunch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [punchEntries, setPunchEntries] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Fetch current punch entry and punch entries on mount
  useEffect(() => {
    fetchTodayPunch();
    fetchPunchEntries();
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchPunchEntries = async () => {
    try {
      // Calculate date range for the last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const response = await api.get('/time-punch', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });

      setPunchEntries(response.data.data);
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const fetchTodayPunch = async () => {
    try {
      const response = await api.get('/time-punch/today');
      setTodayPunch(response.data.data);
    } catch (error) {
      const { message } = handleApiError(error);
      console.error('Error fetching today\'s punch:', error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePunchIn = async () => {
    try {
      const response = await api.post('/time-punch/punch-in');
      setTodayPunch(response.data.data);
      fetchPunchEntries(); // Refresh the list
      toast({
        title: "Success",
        description: "Attendance marked successfully!",
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

  const columns = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => format(new Date(row.getValue("date")), 'MMM d, yyyy')
    },
    {
      accessorKey: "punchIn",
      header: "Punch In Time",
      cell: ({ row }) => format(new Date(row.getValue("punchIn")), 'HH:mm:ss')
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("status") === 'active' ? 'default' : 'secondary'}>
          {row.getValue("status") === 'active' ? 'Present' : 'Completed'}
        </Badge>
      )
    }
  ];

  const table = useReactTable({
    data: punchEntries,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 7,
      },
    },
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Punch Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Clock className="h-6 w-6" />
              Daily Attendance
            </CardTitle>
            <CardDescription>
              Mark your attendance for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {/* Current Time Display */}
              <div className="text-center">
                <div className="text-sm font-medium text-muted-foreground mb-1">Current Time</div>
                <div className="text-3xl font-bold font-mono">
                  {format(currentTime, 'HH:mm:ss')}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {format(currentTime, 'EEEE, MMM d')}
                </div>
              </div>

              {/* Punch In Button */}
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  {!todayPunch ? (
                    <Button
                      size="lg"
                      onClick={handlePunchIn}
                      className="w-40"
                      variant="default"
                    >
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Mark Attendance
                    </Button>
                  ) : (
                    <div className="text-center space-y-2">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                      <div className="text-lg font-semibold text-green-600">
                        Attendance Marked
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(todayPunch.punchIn), 'HH:mm:ss')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Today's Status */}
                {todayPunch && (
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Today's Status</span>
                      <Badge variant="default" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                        Present
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Punch In Time</span>
                      <span className="font-mono">
                        {format(new Date(todayPunch.punchIn), 'HH:mm:ss')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <CalendarDays className="h-6 w-6" />
              Attendance Summary
            </CardTitle>
            <CardDescription>
              Your attendance this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">This Month</div>
                  <div className="text-2xl font-bold mt-1">
                    {punchEntries.filter(entry => {
                      const entryDate = new Date(entry.date);
                      const now = new Date();
                      return entryDate.getMonth() === now.getMonth() && 
                             entryDate.getFullYear() === now.getFullYear();
                    }).length} days
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">This Week</div>
                  <div className="text-2xl font-bold mt-1">
                    {punchEntries.filter(entry => {
                      const entryDate = new Date(entry.date);
                      const now = new Date();
                      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                      const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
                      return entryDate >= startOfWeek && entryDate <= endOfWeek;
                    }).length} days
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Total Entries</div>
                  <div className="text-2xl font-bold mt-1">
                    {punchEntries.length} days
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attendance Card - Full Width */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-6 w-6" />
            Recent Attendance
          </CardTitle>
          <CardDescription>
            Your attendance records from the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md border">
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
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimePunch; 