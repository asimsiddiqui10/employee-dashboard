import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, AlertTriangle, Trash2, Check } from 'lucide-react';

const ConflictResolutionDialog = ({ 
  open, 
  onClose, 
  conflicts, 
  newSchedule, 
  onOverride, 
  onCancel 
}) => {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Schedule Conflict Detected
          </DialogTitle>
          <DialogDescription>
            The schedule you're trying to create conflicts with existing schedules.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* New Schedule Info */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">New Schedule</h4>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <div><strong>Employee:</strong> {newSchedule?.employeeName}</div>
              <div><strong>Date:</strong> {newSchedule?.date}</div>
              <div><strong>Time:</strong> {newSchedule?.startTime} - {newSchedule?.endTime}</div>
              <div><strong>Job Code:</strong> {newSchedule?.jobCode}</div>
            </div>
          </div>

          {/* Conflicting Schedules */}
          <div>
            <h4 className="font-medium mb-2 text-red-900 dark:text-red-100">Conflicting Schedules</h4>
            <div className="space-y-2">
              {conflicts.map((conflict, index) => (
                <Alert key={index} className="border-red-200 bg-red-50 dark:bg-red-950">
                  <Clock className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    <div><strong>Time:</strong> {conflict.startTime} - {conflict.endTime}</div>
                    {conflict.employeeName && (
                      <div><strong>Employee:</strong> {conflict.employeeName}</div>
                    )}
                    {conflict.jobCode && (
                      <div><strong>Job Code:</strong> {conflict.jobCode}</div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="destructive"
              onClick={onOverride}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Override & Replace
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Override will delete the conflicting schedules and create the new one.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConflictResolutionDialog;
