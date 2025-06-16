import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Mail,
  Phone
} from 'lucide-react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { departments } from '@/lib/departments';
import { handleApiError } from '@/utils/errorHandler';

const DepartmentDetails = () => {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const [allEmployees, setAllEmployees] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const department = departments[departmentId];

  useEffect(() => {
    if (!department) {
      navigate('/admin-dashboard/departments');
      return;
    }
    fetchEmployees();
  }, [departmentId]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employees');
      // Filter employees by department
      const departmentEmployees = response.data.filter(emp => emp.department === departmentId);
      setAllEmployees(departmentEmployees);
    } catch (error) {
      const { message } = handleApiError(error);
      console.error('Error fetching employees:', message);
      setAllEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and paginate employees client-side
  const employees = useMemo(() => {
    let filtered = [...allEmployees];
    
    // Apply global filter
    if (globalFilter) {
      const lowerFilter = globalFilter.toLowerCase();
      filtered = filtered.filter(employee => 
        employee.name?.toLowerCase().includes(lowerFilter) ||
        employee.email?.toLowerCase().includes(lowerFilter) ||
        employee.position?.toLowerCase().includes(lowerFilter) ||
        employee.employeeId?.toString().includes(lowerFilter)
      );
    }
    
    // Apply sorting
    if (sorting.length) {
      const { id, desc } = sorting[0];
      filtered.sort((a, b) => {
        if (a[id] < b[id]) return desc ? 1 : -1;
        if (a[id] > b[id]) return desc ? -1 : 1;
        return 0;
      });
    }
    
    return filtered;
  }, [allEmployees, globalFilter, sorting]);

  const paginatedEmployees = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return employees.slice(start, end);
  }, [employees, pagination]);

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "employeeId",
      header: "Employee ID",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("employeeId")}</div>
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
    },
    {
      accessorKey: "phoneNumber",
      header: ({ column }) => (
        <div className="flex items-center">
          <Phone className="mr-2 h-4 w-4" />
          Phone
        </div>
      ),
    },
    {
      accessorKey: "position",
      header: "Position",
    },
    {
      accessorKey: "employmentStatus",
      header: "Status",
      cell: ({ row }) => (
        <Badge 
          variant={
            row.getValue("employmentStatus") === "Active" ? "success" :
            row.getValue("employmentStatus") === "Inactive" || row.getValue("employmentStatus") === "On Leave" ? "default" : 
            "destructive"
          }
          className="font-medium"
        >
          {row.getValue("employmentStatus")}
        </Badge>
      ),
    },
  ];

  const table = useReactTable({
    data: paginatedEmployees,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(employees.length / pagination.pageSize),
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
  });

  const handleViewEmployee = (employee) => {
    navigate(`/admin-dashboard/employees/${employee.employeeId}`);
  };

  const Icon = department?.icon;

  if (loading && employees.length === 0) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0"
                onClick={() => navigate('/admin-dashboard/departments')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded transition-colors ${department?.bgColor}`}>
                    <Icon className={`h-5 w-5 transition-colors ${department?.color}`} />
                  </div>
                  <CardTitle className={`transition-colors ${department?.color}`}>
                    {department?.label}
                  </CardTitle>
                </div>
                <CardDescription className="pt-1.5">
                  {loading ? 'Loading...' : `${employees.length} employees in ${department?.label} department`}
                </CardDescription>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 pb-4">
          <div className="flex-1">
            <Input
              placeholder="Search employees..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
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
                    onClick={() => handleViewEmployee(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {loading ? (
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      'No employees found in this department.'
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between py-4">
          <span className="text-sm text-muted-foreground/70">
            {loading ? (
              'Loading...'
            ) : (
              `Showing ${pagination.pageIndex * pagination.pageSize + 1} to ${Math.min((pagination.pageIndex + 1) * pagination.pageSize, employees.length)} of ${employees.length} employees`
            )}
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 opacity-70 hover:opacity-100"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage() || loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 opacity-70 hover:opacity-100"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage() || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DepartmentDetails; 