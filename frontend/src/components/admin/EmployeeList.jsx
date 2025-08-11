import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  MoreHorizontal,
  Plus,
  Search,
  UserPlus,
  Mail,
  Phone,
  ArrowLeft,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import AddEmployeeForm from './AddEmployeeForm';
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
import { Switch } from "@/components/ui/switch";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showExEmployees, setShowExEmployees] = useState(false);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    // Filter employees based on showExEmployees state
    const filtered = employees.filter(employee => 
      showExEmployees ? employee.employmentStatus === 'Terminated' : employee.employmentStatus !== 'Terminated'
    );
    setFilteredEmployees(filtered);
  }, [employees, showExEmployees]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      const { message } = handleApiError(error);
      console.error(message);
    }
  };

  const handleViewDetails = (employee) => {
    navigate(`/admin-dashboard/employees/${employee.employeeId}`);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setIsEditing(true);
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
      accessorKey: "email",
      header: ({ column }) => (
        <div className="flex items-center">
          <Mail className="mr-2 h-4 w-4" />
          Email
        </div>
      ),
      meta: {
        className: "hidden sm:table-cell"
      }
    },
    {
      accessorKey: "phoneNumber",
      header: ({ column }) => (
        <div className="flex items-center">
          <Phone className="mr-2 h-4 w-4" />
          Phone
        </div>
      ),
      meta: {
        className: "hidden sm:table-cell"
      }
    },
    {
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => (
        <div className="text-xs sm:text-sm">{row.getValue("position")}</div>
      ),
    },
    {
      accessorKey: "employmentStatus",
      header: "Status",
      cell: ({ row }) => (
        <Badge 
          variant={
            row.getValue("employmentStatus") === "Active" ? "success" :
            row.getValue("employmentStatus") === "On Leave" ? "warning" : 
            row.getValue("employmentStatus") === "Terminated" ? "destructive" :
            "default"
          }
          className="font-medium"
        >
          {row.getValue("employmentStatus")}
        </Badge>
      ),
      meta: {
        className: "hidden sm:table-cell"
      }
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

  const handleAddEmployee = async (formData) => {
    try {
      const response = await api.post('/employees', formData);
      console.log('Employee created successfully:', response.data);
      setShowAddForm(false);
      fetchEmployees();
      alert(`Employee created successfully!\nLogin credentials:\nEmail: ${formData.email}\nPassword: ${formData.password}`);
    } catch (error) {
      const { message } = handleApiError(error);
      alert(message);
    }
  };

  if (showAddForm) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Add New Employee</CardTitle>
              <CardDescription>Enter employee details below.</CardDescription>
            </div>
            <Button 
              variant="outline"
              onClick={() => setShowAddForm(false)} 
              className="ml-auto text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
            >
              <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Back to List</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AddEmployeeForm
            onClose={() => setShowAddForm(false)}
            onSubmit={handleAddEmployee}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl">Employee List</CardTitle>
            <CardDescription className="pt-1.5 text-sm">Manage your employees and their roles here.</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center gap-2">
              <Switch
                id="show-ex-employees"
                checked={showExEmployees}
                onCheckedChange={setShowExEmployees}
              />
              <Label htmlFor="show-ex-employees" className="text-xs sm:text-sm font-medium">
                Show Ex-Employees
              </Label>
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className={cn(
                "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30",
                "transition-colors font-medium text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
              )}
            >
              <UserPlus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Add Employee</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 pb-2">
          <div className="flex-1 flex items-center gap-4">
            <div className="flex-1 max-w-full sm:max-w-sm">
              <Input
                placeholder="Search employees..."
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
                    className={cn(
                      "cursor-pointer hover:bg-muted/50",
                      row.original.employmentStatus === 'Terminated' 
                        ? "bg-gray-100 dark:bg-gray-900/50" 
                        : ""
                    )}
                    onClick={() => handleViewDetails(row.original)}
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
                    No results.
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
  );
};

export default EmployeeList;
