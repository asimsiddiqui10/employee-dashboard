import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  MoreHorizontal,
  Plus,
  Search,
  Clock,
  Calendar,
  DollarSign,
  ArrowLeft,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Save,
  X
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { handleApiError } from '@/utils/errorHandler';
import { getDepartmentConfig } from "@/lib/departments";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';

const AdminScheduleAssignment = () => {
  const [employees, setEmployees] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [scheduleData, setScheduleData] = useState({});
  const [jobCodes, setJobCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
    fetchJobCodes();
  }, []);

  useEffect(() => {
    // Filter employees based on search
    const filtered = employees.filter(employee => 
      employee.employmentStatus !== 'Terminated' &&
      (globalFilter === '' || 
       employee.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
       employee.employeeId.toLowerCase().includes(globalFilter.toLowerCase()) ||
       employee.email.toLowerCase().includes(globalFilter.toLowerCase()))
    );
    setFilteredEmployees(filtered);
  }, [employees, globalFilter]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employees');
      setEmployees(response.data);
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

  const fetchJobCodes = async () => {
    try {
      const response = await api.get('/job-codes/active/all');
      setJobCodes(response.data);
    } catch (error) {
      console.error('Error fetching job codes:', error);
      // Fallback to default job codes if API fails
      setJobCodes([
        { code: 'ACT001', description: 'General Labor' },
        { code: 'ACT002', description: 'Equipment Operator' },
        { code: 'ACT003', description: 'Supervisor' },
        { code: 'ACT004', description: 'Administrative' },
        { code: 'ACT005', description: 'Sales' }
      ]);
    }
  };

  const handleViewDetails = (employee) => {
    navigate(`/admin-dashboard/employees/${employee.employeeId}`);
  };

  const handleEditSchedule = (employee) => {
    setEditingEmployee(employee);
    // Initialize schedule data for the week
    const weekData = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - date.getDay() + i);
      const dateKey = date.toISOString().split('T')[0];
      weekData[dateKey] = {
        hours: '8.0',
        startTime: '09:00',
        endTime: '17:00',
        jobCode: 'ACT001',
        rate: 25.00,
        enabled: i < 5 // Monday to Friday enabled by default
      };
    }
    setScheduleData(weekData);
  };

  const handleSaveSchedule = async (employee) => {
    try {
      // Convert scheduleData to the format expected by the backend
      const schedules = Object.keys(scheduleData).map(dateKey => ({
        date: dateKey,
        hours: parseFloat(scheduleData[dateKey].hours),
        startTime: scheduleData[dateKey].startTime,
        endTime: scheduleData[dateKey].endTime,
        jobCode: scheduleData[dateKey].jobCode,
        rate: scheduleData[dateKey].rate === 'NA' ? 'NA' : parseFloat(scheduleData[dateKey].rate),
        enabled: scheduleData[dateKey].enabled
      }));

      // Save schedule data to backend
      await api.post('/schedules', {
        employeeId: employee.employeeId,
        schedules
      });
      
      toast({
        title: "Success",
        description: `Schedule saved for ${employee.name}`,
      });
      
      setEditingEmployee(null);
      setScheduleData({});
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingEmployee(null);
    setScheduleData({});
  };

  const updateScheduleData = (dateKey, field, value) => {
    setScheduleData(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [field]: value
      }
    }));
  };

  const toggleDayEnabled = (dateKey) => {
    setScheduleData(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        enabled: !prev[dateKey].enabled
      }
    }));
  };

  const copyWeekSchedule = () => {
    // Copy current week schedule to next week
    const nextWeekData = {};
    Object.keys(scheduleData).forEach(dateKey => {
      const date = new Date(dateKey);
      date.setDate(date.getDate() + 7);
      const nextWeekKey = date.toISOString().split('T')[0];
      nextWeekData[nextWeekKey] = { ...scheduleData[dateKey] };
    });
    setScheduleData(nextWeekData);
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium text-xs sm:text-sm">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "employeeId",
      header: "Employee ID",
      cell: ({ row }) => (
        <div className="font-medium text-xs sm:text-sm">{row.getValue("employeeId")}</div>
      ),
    },
    {
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => (
        <div className="text-xs sm:text-sm">{row.getValue("position")}</div>
      ),
    },
    {
      accessorKey: "employmentType",
      header: "Employment Type",
      cell: ({ row }) => (
        <Badge 
          variant={
            row.getValue("employmentType") === "full-time" ? "default" :
            row.getValue("employmentType") === "part-time" ? "secondary" :
            row.getValue("employmentType") === "hourly" ? "outline" :
            "default"
          }
          className="font-medium"
        >
          {row.getValue("employmentType")}
        </Badge>
      ),
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => {
        const department = row.getValue("department");
        const deptConfig = getDepartmentConfig(department);
        const Icon = deptConfig.icon;
        return (
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded transition-colors ${deptConfig.bgColor}`}>
              <Icon className={`h-4 w-4 transition-colors ${deptConfig.color}`} />
            </div>
            <span className={`font-medium transition-colors ${deptConfig.color} text-xs sm:text-sm`}>
              {department}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const employee = row.original;
        const isEditing = editingEmployee?._id === employee._id;
        
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewDetails(employee)}
              className="h-7 px-2"
            >
              <Eye className="h-3 w-3" />
            </Button>
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleSaveSchedule(employee)}
                  className="h-7 px-2"
                >
                  <Save className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="h-7 px-2"
                >
                  <X className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEditSchedule(employee)}
                className="h-7 px-2"
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredEmployees,
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
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Schedule Assignment Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Schedule Assignment</CardTitle>
              <CardDescription className="pt-1.5 text-sm">
                Assign work schedules, job codes, and rates to employees
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 pb-2">
            <div className="flex-1 flex items-center gap-4">
              <div className="flex-1 max-w-full sm:max-w-sm">
                <Input
                  placeholder="Search employees by name, ID, or email..."
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead 
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          header.column.getCanSort() ? "cursor-pointer select-none" : "",
                          header.column.columnDef.meta?.className || "",
                          "px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          {header.column.getCanSort() && (
                            <ArrowUpDown className="h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell 
                          key={cell.id}
                          className={cn(
                            cell.column.columnDef.meta?.className || "",
                            "px-2 sm:px-4 py-2 sm:py-3"
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No employees found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground/70">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                className="h-6 w-6 sm:h-8 sm:w-8 p-0 opacity-70 hover:opacity-100"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                className="h-6 w-6 sm:h-8 sm:w-8 p-0 opacity-70 hover:opacity-100"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Editor */}
      {editingEmployee && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Edit Schedule: {editingEmployee.name}</CardTitle>
                <CardDescription>
                  Set work hours, job codes, and rates for each day of the week
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={copyWeekSchedule}
                  className="text-xs"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Copy to Next Week
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
              {Object.keys(scheduleData).map((dateKey, index) => {
                const dayData = scheduleData[dateKey];
                const date = new Date(dateKey);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                
                return (
                  <div key={dateKey} className="space-y-3 p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">{dayName}</Label>
                      <input
                        type="checkbox"
                        checked={dayData.enabled}
                        onChange={() => toggleDayEnabled(dateKey)}
                        className="rounded"
                      />
                    </div>
                    
                    {dayData.enabled && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-xs">Hours</Label>
                          <Input
                            type="number"
                            step="0.5"
                            min="0"
                            max="24"
                            value={dayData.hours}
                            onChange={(e) => updateScheduleData(dateKey, 'hours', e.target.value)}
                            className="text-xs h-8"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-xs">Start Time</Label>
                          <Input
                            type="time"
                            value={dayData.startTime}
                            onChange={(e) => updateScheduleData(dateKey, 'startTime', e.target.value)}
                            className="text-xs h-8"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-xs">End Time</Label>
                          <Input
                            type="time"
                            value={dayData.endTime}
                            onChange={(e) => updateScheduleData(dateKey, 'endTime', e.target.value)}
                            className="text-xs h-8"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-xs">Job Code</Label>
                          <Select
                            value={dayData.jobCode}
                            onValueChange={(value) => updateScheduleData(dateKey, 'jobCode', value)}
                          >
                            <SelectTrigger className="text-xs h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {jobCodes.map((job) => (
                                <SelectItem key={job.code} value={job.code}>
                                  {job.code} - {job.description}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-xs">Rate ($/hr)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={dayData.rate}
                            onChange={(e) => updateScheduleData(dateKey, 'rate', parseFloat(e.target.value))}
                            className="text-xs h-8"
                          />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminScheduleAssignment; 