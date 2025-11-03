import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
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
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Schedule Conflict Detected
          </DialogTitle>
          <DialogDescription>
            The schedule you're trying to create conflicts with existing schedules.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {/* New Schedule Info */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm">New Schedule</h4>
              <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium">Employee:</span>
                  <span className="truncate ml-2">{newSchedule?.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span className="truncate ml-2">{newSchedule?.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Time:</span>
                  <span className="truncate ml-2">{newSchedule?.startTime} - {newSchedule?.endTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Job Code:</span>
                  <span className="truncate ml-2">{newSchedule?.jobCode}</span>
                </div>
              </div>
            </div>

            {/* Conflicting Schedules */}
            <div>
              <h4 className="font-medium mb-2 text-red-900 dark:text-red-100 text-sm">
                Conflicting Schedules ({conflicts.length})
              </h4>
              <div className="space-y-2 max-h-60">
                {conflicts.map((conflict, index) => (
                  <Alert key={index} className="border-red-200 bg-red-50 dark:bg-red-950 p-3">
                    <Clock className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <AlertDescription className="text-red-800 dark:text-red-200 text-xs">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium">Time:</span>
                          <span className="truncate ml-2">{conflict.startTime} - {conflict.endTime}</span>
                        </div>
                        {conflict.employeeName && (
                          <div className="flex justify-between">
                            <span className="font-medium">Employee:</span>
                            <span className="truncate ml-2">{conflict.employeeName}</span>
                          </div>
                        )}
                        {conflict.jobCode && (
                          <div className="flex justify-between">
                            <span className="font-medium">Job Code:</span>
                            <span className="truncate ml-2">{conflict.jobCode}</span>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Action Buttons - Fixed at bottom */}
        <div className="flex-shrink-0 space-y-3 pt-4 border-t">
          <div className="flex gap-3">
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
