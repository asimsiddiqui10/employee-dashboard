import React from 'react';
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
import { format } from 'date-fns';
import { ArrowUpDown, Download, CheckCircle, XCircle } from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { getDepartmentConfig } from '@/lib/departments';

const TimesheetTable = ({ 
  data, 
  onApprove, 
  onReject, 
  onDownload,
  isActionLoading 
}) => {
  const [sorting, setSorting] = React.useState([]);

  const getStatusBadge = (status) => {
    const variants = {
      active: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
      completed: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
      pending_approval: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
      approved: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
      rejected: "bg-red-500/10 text-red-500 hover:bg-red-500/20"
    };
    return <Badge className={variants[status]}>{status.replace('_', ' ').toUpperCase()}</Badge>;
  };

  const columns = [
    {
      accessorFn: (row) => `${row.employee?.name} (${row.employee?.employeeId})`,
      header: "Employee",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.employee?.name}</span>
          <span className="text-sm text-muted-foreground">{row.original.employee?.employeeId}</span>
        </div>
      ),
    },
    {
      accessorFn: (row) => row.employee?.department,
      header: "Department",
      cell: ({ row }) => {
        const dept = row.original.employee?.department;
        const deptConfig = getDepartmentConfig(dept);
        return (
          <Badge variant="outline" className={deptConfig?.color}>
            {dept}
          </Badge>
        );
      },
    },
    {
      accessorKey: "clockIn",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          Clock In
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting()}
          />
        </div>
      ),
      cell: ({ row }) => format(new Date(row.getValue("clockIn")), 'MMM d, HH:mm'),
    },
    {
      accessorKey: "clockOut",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          Clock Out
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting()}
          />
        </div>
      ),
      cell: ({ row }) => row.getValue("clockOut") ? format(new Date(row.getValue("clockOut")), 'MMM d, HH:mm') : '-',
    },
    {
      accessorKey: "totalWorkTime",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          Hours
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting()}
          />
        </div>
      ),
      cell: ({ row }) => {
        const minutes = row.getValue("totalWorkTime");
        if (!minutes) return '-';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
      },
    },
    {
      accessorKey: "shift",
      header: "Shift",
      cell: ({ row }) => row.getValue("shift") || '-',
    },
    {
      accessorKey: "weekTotal",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          Week Total
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting()}
          />
        </div>
      ),
      cell: ({ row }) => {
        const minutes = row.getValue("weekTotal");
        if (!minutes) return '-';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
      },
    },
    {
      accessorKey: "jobCode",
      header: "Job Code",
      cell: ({ row }) => row.getValue("jobCode") || '-',
    },
    {
      accessorKey: "rate",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          Rate
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting()}
          />
        </div>
      ),
      cell: ({ row }) => row.getValue("rate") ? `$${row.getValue("rate").toFixed(2)}` : '-',
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          Status
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting()}
          />
        </div>
      ),
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <div className="flex items-center gap-2">
            {status === 'pending_approval' && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onApprove(row.original)}
                  disabled={isActionLoading}
                  className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onReject(row.original)}
                  disabled={isActionLoading}
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
            {status === 'approved' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDownload(row.original)}
                disabled={isActionLoading}
                className="h-8 w-8"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No timesheets found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TimesheetTable; 