import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
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
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ChevronLeft, ChevronRight, Users, Grid3X3, List, Eye } from 'lucide-react';
import { departments } from '@/lib/departments';

const Departments = () => {
  const navigate = useNavigate();
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [sorting, setSorting] = React.useState([]);
  const [departmentsData, setDepartmentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'list' or 'grid'
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employees');
      const employees = response.data;
      
      // Calculate department counts from employees
      const counts = employees.reduce((acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
        return acc;
      }, {});
      
      // Convert departments object to array with counts
      const deptData = Object.entries(departments).map(([key, dept]) => ({
        id: key,
        name: dept.label,
        icon: dept.icon,
        color: dept.color,
        bgColor: dept.bgColor,
        employeeCount: counts[key] || 0,
      }));
      
      setDepartmentsData(deptData);
    } catch (error) {
      const { message } = handleApiError(error);
      console.error('Error fetching employees:', message);
      // Set empty counts but still show departments
      const deptData = Object.entries(departments).map(([key, dept]) => ({
        id: key,
        name: dept.label,
        icon: dept.icon,
        color: dept.color,
        bgColor: dept.bgColor,
        employeeCount: 0,
      }));
      setDepartmentsData(deptData);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Department",
      cell: ({ row }) => {
        const dept = departments[row.original.id];
        const Icon = dept.icon;
        return (
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded transition-colors ${dept.bgColor}`}>
              <Icon className={`h-4 w-4 transition-colors ${dept.color}`} />
            </div>
            <span className={`font-medium transition-colors ${dept.color}`}>
              {row.getValue("name")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "employeeCount",
      header: ({ column }) => (
        <div className="flex items-center">
          <Users className="mr-2 h-4 w-4" />
          Employees
        </div>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("employeeCount")}</div>
      ),
    },
  ];

  const table = useReactTable({
    data: departmentsData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
  });

  const handleViewDepartment = (department) => {
    navigate(`/admin-dashboard/departments/${department.id}`);
  };

  const renderGridView = () => {
    const filteredDepartments = departmentsData.filter(dept => 
      !globalFilter || 
      dept.department.toLowerCase().includes(globalFilter.toLowerCase()) ||
      dept.employeeCount.toString().includes(globalFilter)
    );

    if (filteredDepartments.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">No departments found</h3>
          <p className="text-sm text-muted-foreground">
            {globalFilter ? 'Try adjusting your search criteria' : 'No departments have been created yet'}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDepartments.map((dept) => {
          const deptConfig = departments[dept.id] || {
            icon: Users,
            color: 'text-gray-600',
            bgColor: 'bg-gray-100',
            label: dept.department
          };
          const Icon = deptConfig.icon;

          return (
            <Card 
              key={dept.id} 
              className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 group"
              onClick={() => handleViewDepartment(dept)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Department Icon */}
                  <div className={`p-4 rounded-full transition-colors ${deptConfig.bgColor} group-hover:scale-110 duration-200`}>
                    <Icon className={`h-8 w-8 transition-colors ${deptConfig.color}`} />
                  </div>
                  
                  {/* Department Name */}
                  <div>
                    <h3 className={`font-semibold text-lg transition-colors ${deptConfig.color} group-hover:text-opacity-80`}>
                      {deptConfig.label}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Department
                    </p>
                  </div>
                  
                  {/* Employee Count */}
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {dept.employeeCount} {dept.employeeCount === 1 ? 'Employee' : 'Employees'}
                    </span>
                  </div>
                  
                  {/* View Button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDepartment(dept);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  if (loading) {
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
            <CardTitle>Departments</CardTitle>
            <CardDescription className="pt-1.5">
              Manage departments and view department-wise employees
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4 pb-4">
          <div className="flex-1">
            <Input
              placeholder="Search departments..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          {/* View Mode Switcher */}
          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 px-3"
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Grid
            </Button>
          </div>
        </div>
        {/* Conditional Rendering based on View Mode */}
        {viewMode === 'list' ? (
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
                      onClick={() => handleViewDepartment(row.original)}
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
                      No departments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          renderGridView()
        )}
        <div className="flex items-center justify-between py-4">
          <span className="text-sm text-muted-foreground/70">
            {viewMode === 'list' 
              ? `${table.getFilteredRowModel().rows.length} of ${departmentsData.length} departments`
              : `${departmentsData.filter(dept => 
                  !globalFilter || 
                  dept.department.toLowerCase().includes(globalFilter.toLowerCase()) ||
                  dept.employeeCount.toString().includes(globalFilter)
                ).length} of ${departmentsData.length} departments`
            }
          </span>
          {viewMode === 'list' && (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 opacity-70 hover:opacity-100"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 opacity-70 hover:opacity-100"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Departments; 