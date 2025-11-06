import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { formatTime12Hour } from '../../lib/date-utils';
import { getDepartmentConfig } from '../../lib/departments';
import { cn } from "@/lib/utils";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

// Calculate hours from start and end time
const calculateHours = (startTime, endTime) => {
  const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
  const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
  
  if (endMinutes > startMinutes) {
    const totalMinutes = endMinutes - startMinutes;
    return (totalMinutes / 60).toFixed(1);
  }
  return 0;
};

const ScheduleUpcomingView = ({ schedules, onSelectSchedule }) => {
  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter and sort upcoming schedules
  const upcomingSchedules = useMemo(() => {
    return schedules
      .filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        scheduleDate.setHours(0, 0, 0, 0);
        return scheduleDate >= today;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() === dateB.getTime()) {
          // If same date, sort by start time
          const timeA = a.startTime.split(':').map(Number);
          const timeB = b.startTime.split(':').map(Number);
          return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
        }
        return dateA - dateB;
      });
  }, [schedules, today]);

  const getDepartmentColor = (department) => {
    const deptConfig = getDepartmentConfig(department || 'Other');
    return deptConfig.bgColor || 'bg-blue-50';
  };

  const columns = [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          Date
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting()}
          />
        </div>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"));
        const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
        return (
          <div className="flex flex-col">
            <span className={cn("font-medium", isToday && "text-primary font-semibold")}>
              {format(date, 'MMM d, yyyy')}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(date, 'EEEE')}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "employeeName",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          Employee
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting()}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("employeeName")}</span>
          <span className="text-xs text-muted-foreground">{row.original.employeeId}</span>
        </div>
      ),
    },
    {
      accessorKey: "jobCode",
      header: "Job Code",
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-medium">
          {row.getValue("jobCode")}
        </Badge>
      ),
    },
    {
      accessorKey: "startTime",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          Time
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting()}
          />
        </div>
      ),
      cell: ({ row }) => {
        const startTime = row.getValue("startTime");
        const endTime = row.original.endTime;
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {formatTime12Hour(startTime)} - {formatTime12Hour(endTime)}
            </span>
            <span className="text-xs text-muted-foreground">
              {calculateHours(startTime, endTime)} hours
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "employeeDepartment",
      header: "Department",
      cell: ({ row }) => {
        const dept = row.getValue("employeeDepartment");
        const deptConfig = getDepartmentConfig(dept);
        return (
          <Badge variant="outline" className={deptConfig?.color}>
            {dept || 'Other'}
          </Badge>
        );
      },
    },
  ];

  const table = useReactTable({
    data: upcomingSchedules,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Schedules</CardTitle>
        <CardDescription>
          All schedules starting from today
        </CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingSchedules.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No upcoming schedules found</p>
          </div>
        ) : (
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
                    <TableRow
                      key={row.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onSelectSchedule?.(row.original)}
                    >
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
                      No upcoming schedules found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleUpcomingView;

