import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Trash2, Users, Calendar, Clock, Briefcase, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const BulkDeleteDialog = ({ 
  open, 
  onClose, 
  schedules, 
  onConfirm 
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  // Group schedules by employee for display
  const schedulesByEmployee = schedules.reduce((acc, schedule) => {
    const key = schedule.employeeId;
    if (!acc[key]) {
      acc[key] = {
        employeeName: schedule.employeeName,
        employeeId: schedule.employeeId,
        schedules: []
      };
    }
    acc[key].schedules.push(schedule);
    return acc;
  }, {});

  // Get date range
  const dates = schedules.map(s => new Date(s.date)).sort((a, b) => a - b);
  const dateRange = dates.length > 0 
    ? `${format(dates[0], 'MMM d')} - ${format(dates[dates.length - 1], 'MMM d, yyyy')}`
    : '';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Schedules
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. You are about to delete {schedules.length} schedule{schedules.length !== 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning Alert */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              This will permanently delete {schedules.length} schedule{schedules.length !== 1 ? 's' : ''}. 
              This action cannot be undone.
            </AlertDescription>
          </Alert>

          {/* Schedule Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Schedules to be deleted:</h4>
            
            {/* Date Range */}
            {dateRange && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Date Range: {dateRange}</span>
              </div>
            )}

            {/* Employee Groups */}
            <div className="max-h-48 overflow-y-auto space-y-2">
              {Object.values(schedulesByEmployee).map((employee) => (
                <div key={employee.employeeId} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 text-sm font-medium text-red-800 dark:text-red-200">
                    <Users className="h-4 w-4" />
                    {employee.employeeName} ({employee.employeeId})
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-300 ml-6 mt-1">
                    {employee.schedules.length} schedule{employee.schedules.length !== 1 ? 's' : ''}
                  </div>
                  
                  {/* Show first few schedules for this employee */}
                  <div className="ml-6 mt-2 space-y-1">
                    {employee.schedules.slice(0, 3).map((schedule, idx) => (
                      <div key={idx} className="text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(schedule.date), 'MMM d')} - {schedule.jobCode}</span>
                        <span className="text-muted-foreground">
                          ({schedule.startTime} - {schedule.endTime})
                        </span>
                      </div>
                    ))}
                    {employee.schedules.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        ... and {employee.schedules.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirm}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete {schedules.length} Schedule{schedules.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkDeleteDialog;
