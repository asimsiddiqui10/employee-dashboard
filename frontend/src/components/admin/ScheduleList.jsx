import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { getDepartmentConfig } from '../../lib/departments';
import { cn } from "@/lib/utils";

// Utility function to convert 24-hour time to 12-hour format
const formatTime12Hour = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minutes} ${ampm}`;
};

const ScheduleList = ({ schedules, onEdit, onDelete }) => {
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      onDelete(id);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Schedule List</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="h-9 text-xs">Dept</TableHead>
                <TableHead className="h-9 text-xs">Employee</TableHead>
                <TableHead className="h-9 text-xs">ID</TableHead>
                <TableHead className="h-9 text-xs">Job Code</TableHead>
                <TableHead className="h-9 text-xs">Date Range</TableHead>
                <TableHead className="h-9 text-xs">Hrs</TableHead>
                <TableHead className="h-9 text-xs">Time</TableHead>
                <TableHead className="h-9 text-xs">Days</TableHead>
                <TableHead className="h-9 text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-20 text-center text-sm text-muted-foreground">
                    No schedules found
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((schedule) => {
                  const startDate = schedule.startDate ? new Date(schedule.startDate) : null;
                  const endDate = schedule.endDate ? new Date(schedule.endDate) : null;
                  const isValidStartDate = startDate && !isNaN(startDate.getTime());
                  const isValidEndDate = endDate && !isNaN(endDate.getTime());
                  const deptConfig = getDepartmentConfig(schedule.employeeDepartment);

                  return (
                    <TableRow key={schedule._id} className="h-12">
                      <TableCell className="py-2">
                        <div className={cn("w-8 h-8 rounded flex items-center justify-center", deptConfig.bgColor)}>
                          {deptConfig.icon && <deptConfig.icon className={cn("h-4 w-4", deptConfig.color)} />}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-sm font-medium">{schedule.employeeName}</TableCell>
                      <TableCell className="py-2 text-xs text-muted-foreground">{schedule.employeeId}</TableCell>
                      <TableCell className="py-2">
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">{schedule.jobCode}</Badge>
                      </TableCell>
                      <TableCell className="py-2 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span>{isValidStartDate ? format(startDate, 'MMM dd, yy') : 'Invalid'}</span>
                          <span className="text-muted-foreground">{isValidEndDate ? format(endDate, 'MMM dd, yy') : 'Invalid'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-sm">{schedule.hoursPerDay}h</TableCell>
                      <TableCell className="py-2 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span>{formatTime12Hour(schedule.startTime)}</span>
                          <span className="text-muted-foreground">{formatTime12Hour(schedule.endTime)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex gap-0.5 text-xs font-medium">
                          {schedule.daysOfWeek?.monday && <span className="w-5 text-center">M</span>}
                          {schedule.daysOfWeek?.tuesday && <span className="w-5 text-center">T</span>}
                          {schedule.daysOfWeek?.wednesday && <span className="w-5 text-center">W</span>}
                          {schedule.daysOfWeek?.thursday && <span className="w-5 text-center">T</span>}
                          {schedule.daysOfWeek?.friday && <span className="w-5 text-center">F</span>}
                          {schedule.daysOfWeek?.saturday && <span className="w-5 text-center">S</span>}
                          {schedule.daysOfWeek?.sunday && <span className="w-5 text-center">S</span>}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => onEdit(schedule)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleDelete(schedule._id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleList;

