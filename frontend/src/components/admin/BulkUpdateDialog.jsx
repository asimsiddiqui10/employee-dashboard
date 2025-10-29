import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Users, Calendar, Clock, Briefcase } from 'lucide-react';
import { format } from 'date-fns';

const BulkUpdateDialog = ({ 
  open, 
  onClose, 
  schedules, 
  onConfirm, 
  jobCodes = [] 
}) => {
  const [updates, setUpdates] = useState({
    jobCode: 'keep-current',
    startTime: '',
    endTime: ''
  });
  const [errors, setErrors] = useState({});

  // Extract job code values for validation
  const jobCodeValues = Array.isArray(jobCodes) ? jobCodes.map(jc => jc.code || jc) : [];

  const handleInputChange = (field, value) => {
    setUpdates(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (updates.jobCode && updates.jobCode !== 'keep-current' && !jobCodeValues.includes(updates.jobCode)) {
      newErrors.jobCode = 'Invalid job code';
    }
    
    if (updates.startTime && updates.endTime) {
      const startMinutes = parseInt(updates.startTime.split(':')[0]) * 60 + parseInt(updates.startTime.split(':')[1]);
      const endMinutes = parseInt(updates.endTime.split(':')[0]) * 60 + parseInt(updates.endTime.split(':')[1]);
      
      if (endMinutes <= startMinutes) {
        newErrors.endTime = 'End time must be after start time';
      }
    }
    
    if (updates.startTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(updates.startTime)) {
      newErrors.startTime = 'Invalid time format (HH:MM)';
    }
    
    if (updates.endTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(updates.endTime)) {
      newErrors.endTime = 'Invalid time format (HH:MM)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validateForm()) {
      return;
    }
    
    // Filter out empty fields and 'keep-current' values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== '' && value !== 'keep-current')
    );
    
    if (Object.keys(filteredUpdates).length === 0) {
      setErrors({ general: 'Please provide at least one field to update' });
      return;
    }
    
    onConfirm(filteredUpdates);
  };

  const handleClose = () => {
    setUpdates({ jobCode: 'keep-current', startTime: '', endTime: '' });
    setErrors({});
    onClose();
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Update Schedules
          </DialogTitle>
          <DialogDescription>
            Update {schedules.length} selected schedule{schedules.length !== 1 ? 's' : ''}. 
            Leave fields empty to keep current values.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Schedules Preview */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Selected Schedules:</h4>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {Object.values(schedulesByEmployee).map((employee) => (
                <div key={employee.employeeId} className="p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Briefcase className="h-4 w-4" />
                    {employee.employeeName} ({employee.employeeId})
                  </div>
                  <div className="text-xs text-muted-foreground ml-6">
                    {employee.schedules.length} schedule{employee.schedules.length !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Update Fields */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Update Fields:</h4>
            
            {/* Job Code */}
            <div className="space-y-2">
              <Label htmlFor="jobCode">Job Code</Label>
              <Select 
                value={updates.jobCode} 
                onValueChange={(value) => handleInputChange('jobCode', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job code (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keep-current">Keep current</SelectItem>
                  {Array.isArray(jobCodes) && jobCodes.map((jobCode, index) => {
                    const code = jobCode.code || jobCode;
                    const title = jobCode.title || jobCode.code || jobCode;
                    return (
                      <SelectItem key={code || index} value={code}>
                        {title}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.jobCode && (
                <p className="text-sm text-red-500">{errors.jobCode}</p>
              )}
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={updates.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                placeholder="Keep current"
              />
              {errors.startTime && (
                <p className="text-sm text-red-500">{errors.startTime}</p>
              )}
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={updates.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                placeholder="Keep current"
              />
              {errors.endTime && (
                <p className="text-sm text-red-500">{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* General Error */}
          {errors.general && (
            <Alert variant="destructive">
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Update {schedules.length} Schedule{schedules.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUpdateDialog;
