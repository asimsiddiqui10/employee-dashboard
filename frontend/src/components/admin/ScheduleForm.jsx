import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Clock } from 'lucide-react';

const ScheduleForm = ({ employee, jobCodes, onSubmit, onCancel, initialData = null, isOpen = true }) => {
  const [formData, setFormData] = useState({
    date: '',
    timeSlots: [{
      startTime: '09:00',
      endTime: '17:00',
      isBreak: false,
      jobCode: '',
      rate: '',
      notes: ''
    }],
    isRecurring: false,
    recurringOptions: {
      type: 'thisWeek',
      endDate: '',
      includeWeekends: false
    },
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      const defaultJobCode = jobCodes.length > 0 ? jobCodes[0].code : '';
      const defaultRate = jobCodes.length > 0 ? (jobCodes[0].rate || '') : '';
      
      setFormData(prev => ({
        ...prev,
        date: today,
        timeSlots: [{
          startTime: '09:00',
          endTime: '17:00',
          isBreak: false,
          jobCode: defaultJobCode,
          rate: defaultRate,
          notes: ''
        }]
      }));
    }
  }, [initialData, jobCodes]);

  const addTimeSlot = () => {
    const defaultJobCode = jobCodes.length > 0 ? jobCodes[0].code : '';
    const defaultRate = jobCodes.length > 0 ? (jobCodes[0].rate || '') : '';
    
    setFormData(prev => ({
      ...prev,
      timeSlots: [
        ...prev.timeSlots,
        {
          startTime: '12:00',
          endTime: '13:00',
          isBreak: false,
          jobCode: defaultJobCode,
          rate: defaultRate,
          notes: ''
        }
      ]
    }));
  };

  const removeTimeSlot = (index) => {
    if (formData.timeSlots.length > 1) {
      setFormData(prev => ({
        ...prev,
        timeSlots: prev.timeSlots.filter((_, i) => i !== index)
      }));
    }
  };

  const updateTimeSlot = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const calculateTotalHours = () => {
    let totalHours = 0;
    formData.timeSlots.forEach(slot => {
      if (!slot.isBreak && slot.startTime && slot.endTime) {
        const start = new Date(`2000-01-01T${slot.startTime}`);
        const end = new Date(`2000-01-01T${slot.endTime}`);
        const hours = (end - start) / (1000 * 60 * 60);
        if (hours > 0) {
          totalHours += hours;
        }
      }
    });
    return totalHours.toFixed(1);
  };

  const calculateRecurringDates = () => {
    if (!formData.isRecurring) return [formData.date];
    
    const startDate = new Date(formData.date);
    const dates = [];
    
    if (formData.recurringOptions.type === 'thisWeek') {
      // Get all days for this week (Monday to Sunday)
      const dayOfWeek = startDate.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Handle Sunday (0) and other days
      const monday = new Date(startDate);
      monday.setDate(startDate.getDate() + mondayOffset);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        
        // Skip weekends if not included
        const dayNum = date.getDay();
        if (!formData.recurringOptions.includeWeekends && (dayNum === 0 || dayNum === 6)) {
          continue;
        }
        
        dates.push(date.toISOString().split('T')[0]);
      }
    } else if (formData.recurringOptions.endDate) {
      // Custom date range
      const endDate = new Date(formData.recurringOptions.endDate);
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dayNum = currentDate.getDay();
        
        // Skip weekends if not included
        if (!formData.recurringOptions.includeWeekends && (dayNum === 0 || dayNum === 6)) {
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }
        
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else {
      // Single date
      dates.push(formData.date);
    }
    
    return dates;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.date || formData.timeSlots.length === 0) {
      return;
    }

    setLoading(true);

    try {
      const dates = calculateRecurringDates();
      
      const scheduleData = {
        employeeId: employee.employeeId,
        dates: dates,
        timeSlots: formData.timeSlots.map(slot => ({
          ...slot,
          rate: slot.rate || '0' // Ensure rate is never empty or 'NA'
        })),
        notes: formData.notes,
        isRecurring: formData.isRecurring,
        recurringOptions: formData.recurringOptions
      };

      await onSubmit(scheduleData);
      
      // Reset form
      setFormData({
        date: '',
        timeSlots: [{
          startTime: '09:00',
          endTime: '17:00',
          isBreak: false,
          jobCode: jobCodes.length > 0 ? jobCodes[0].code : '',
          rate: jobCodes.length > 0 ? (jobCodes[0].rate || '') : '',
          notes: ''
        }],
        isRecurring: false,
        recurringOptions: {
          type: 'thisWeek',
          endDate: '',
          includeWeekends: false
        },
        notes: ''
      });
    } catch (error) {
      console.error('Error submitting schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobCodeChange = (index, jobCode) => {
    const selectedJobCode = jobCodes.find(jc => jc.code === jobCode);
    updateTimeSlot(index, 'jobCode', jobCode);
    updateTimeSlot(index, 'rate', selectedJobCode?.rate || '');
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Create Schedule for {employee?.name} ({employee?.employeeId})
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          {/* Recurring Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  isRecurring: checked 
                }))}
              />
              <Label htmlFor="recurring">Make this a recurring schedule</Label>
            </div>

            {formData.isRecurring && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Recurring Type</Label>
                  <Select
                    value={formData.recurringOptions.type}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      recurringOptions: { ...prev.recurringOptions, type: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thisWeek">This Week</SelectItem>
                      <SelectItem value="custom">Custom Date Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.recurringOptions.type === 'custom' && (
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={formData.recurringOptions.endDate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        recurringOptions: { ...prev.recurringOptions, endDate: e.target.value }
                      }))}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2 md:col-span-2">
                  <Switch
                    id="includeWeekends"
                    checked={formData.recurringOptions.includeWeekends}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      recurringOptions: { ...prev.recurringOptions, includeWeekends: checked }
                    }))}
                  />
                  <Label htmlFor="includeWeekends">Include weekends</Label>
                </div>
              </div>
            )}
          </div>

          {/* Time Slots */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Time Slots</Label>
              <Button type="button" onClick={addTimeSlot} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Time Slot
              </Button>
            </div>

            {formData.timeSlots.map((slot, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Job Code</Label>
                  <Select
                    value={slot.jobCode}
                    onValueChange={(value) => handleJobCodeChange(index, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job code" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobCodes.map((jobCode) => (
                        <SelectItem key={jobCode.code} value={jobCode.code}>
                          {jobCode.code} - {jobCode.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Rate</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={slot.rate}
                    onChange={(e) => updateTimeSlot(index, 'rate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Break</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      checked={slot.isBreak}
                      onCheckedChange={(checked) => updateTimeSlot(index, 'isBreak', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Actions</Label>
                  <div className="flex items-center pt-2">
                    {formData.timeSlots.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeTimeSlot(index)}
                        size="sm"
                        variant="destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                <Clock className="h-4 w-4 mr-2" />
                Total Hours: {calculateTotalHours()}
              </Badge>
              {formData.isRecurring && (
                <Badge variant="outline">
                  Dates: {calculateRecurringDates().length} days
                </Badge>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Additional notes about this schedule"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Schedule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleForm; 