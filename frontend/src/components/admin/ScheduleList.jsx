import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const ScheduleList = ({ schedules, onEdit, onDelete }) => {
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      onDelete(id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Job Code</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Hours/Day</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Weekends</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No schedules found
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((schedule) => {
                  const startDate = schedule.startDate ? new Date(schedule.startDate) : null;
                  const endDate = schedule.endDate ? new Date(schedule.endDate) : null;
                  const isValidStartDate = startDate && !isNaN(startDate.getTime());
                  const isValidEndDate = endDate && !isNaN(endDate.getTime());

                  return (
                    <TableRow key={schedule._id}>
                      <TableCell className="font-medium">{schedule.employeeName}</TableCell>
                      <TableCell>{schedule.employeeId}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{schedule.jobCode}</Badge>
                      </TableCell>
                      <TableCell>
                        {isValidStartDate ? format(startDate, 'MMM dd, yyyy') : 'Invalid Date'}
                      </TableCell>
                      <TableCell>
                        {isValidEndDate ? format(endDate, 'MMM dd, yyyy') : 'Invalid Date'}
                      </TableCell>
                      <TableCell>{schedule.hoursPerDay}h</TableCell>
                      <TableCell className="text-sm">
                        {schedule.startTime} - {schedule.endTime}
                      </TableCell>
                      <TableCell>
                        {schedule.includeWeekends ? (
                          <Badge variant="outline">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(schedule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(schedule._id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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

