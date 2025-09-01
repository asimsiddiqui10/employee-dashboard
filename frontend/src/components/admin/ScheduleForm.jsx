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
      rate: 'NA',
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
      setFormData(prev => ({
        ...prev,
        date: today,
        timeSlots: prev.timeSlots.map(slot => ({
          ...slot,
          jobCode: jobCodes.length > 0 ? jobCodes[0].code : '',
          rate: jobCodes.length > 0 ? jobCodes[0].rate || 'NA' : 'NA'
        })),
        recurringOptions: {
          type: 'thisWeek',
          endDate: '',
          includeWeekends: false
        }
      }));
    }
  }, [initialData, jobCodes]);

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      timeSlots: [
        ...prev.timeSlots,
        {
          startTime: '12:00',
          endTime: '13:00',
          isBreak: false,
          jobCode: jobCodes.length > 0 ? jobCodes[0].code : '',
          rate: jobCodes.length > 0 ? jobCodes[0].rate || 'NA' : 'NA',
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

  // Add this function to calculate recurring dates
  const calculateRecurringDates = () => {
    if (!formData.isRecurring) return [];
    
    console.log('Calculating recurring dates with options:', formData.recurringOptions);
    
    const startDate = new Date(formData.date);
    let endDate = null;
    
    if (formData.recurringOptions.type === 'thisWeek') {
      // For this week, calculate the end of the current week
      const dayOfWeek = startDate.getDay();
      const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
      endDate = new Date(startDate); // Create a new Date object
      endDate.setDate(startDate.getDate() + daysToSunday);
      console.log('This week - start:', startDate, 'end:', endDate);
    } else if (formData.recurringOptions.type === 'tillWhen' || formData.recurringOptions.type === 'custom') {
      endDate = formData.recurringOptions.endDate ? new Date(formData.recurringOptions.endDate) : null;
      console.log('Custom/Till when - start:', startDate, 'end:', endDate);
    }
    
    if (!endDate) {
      console.log('No end date found, returning empty array');
      return [];
    }
    
    const dates = [];
    const currentDate = new Date(startDate); // Create a new Date object for iteration
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      
      // Skip weekends if includeWeekends is false
      if (!formData.recurringOptions.includeWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }
      
      // Add the date to the array
      dates.push(new Date(currentDate)); // Create a new Date object for each date
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log('Calculated recurring dates:', dates.map(d => d.toISOString().split('T')[0]));
    return dates;
  };

  // Update the handleSubmit function
  const handleSubmit = async () => {
    console.log('handleSubmit called');
    console.log('Form data:', formData);
    console.log('Form validation:', { 
      hasDate: !!formData.date, 
      timeSlotsLength: formData.timeSlots.length,
      loading: loading 
    });
    
    if (!formData.date || formData.timeSlots.length === 0) {
      console.log('Form validation failed:', { date: formData.date, timeSlots: formData.timeSlots });
      return;
    }
    
    try {
      setLoading(true);
      console.log('Setting loading to true');
      
      // Calculate recurring dates if needed
      const recurringDates = calculateRecurringDates();
      console.log('Recurring dates calculated:', recurringDates);
      
      // Prepare the data for submission
      const submitData = {
        ...formData,
        recurringDates: recurringDates.map(date => date.toISOString().split('T')[0]),
        totalRecurringDays: recurringDates.length
      };
      
      console.log('Submitting schedule data:', submitData);
      console.log('Time slots details:', submitData.timeSlots);
      console.log('Calling onSubmit function...');
      await onSubmit(submitData);
      console.log('onSubmit completed successfully');
    } catch (error) {
      console.error('Error submitting schedule:', error);
    } finally {
      setLoading(false);
      console.log('Setting loading to false');
    }
  };

  const renderTimeSlot = (index) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Time Slot {index + 1}</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => removeTimeSlot(index)}
          className="text-red-600 hover:text-red-700"
        >
          Remove
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Start Time - Increased width */}
        <div className="space-y-2">
          <Label htmlFor={`startTime-${index}`}>Start Time</Label>
          <Input
            id={`startTime-${index}`}
            type="time"
            value={formData.timeSlots[index].startTime}
            onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
            onBlur={(e) => e.target.blur()}
            className="w-full min-w-[140px]"
            required
          />
        </div>
        
        {/* End Time - Increased width */}
        <div className="space-y-2">
          <Label htmlFor={`endTime-${index}`}>End Time</Label>
          <Input
            id={`endTime-${index}`}
            type="time"
            value={formData.timeSlots[index].endTime}
            onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
            onBlur={(e) => e.target.blur()}
            className="w-full min-w-[140px]"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Job Code */}
        <div className="space-y-2">
          <Label htmlFor={`jobCode-${index}`}>Job Code</Label>
          <Select
            value={formData.timeSlots[index].jobCode}
            onValueChange={(value) => {
              // Find the selected job code and update both job code and rate
              const selectedJobCode = jobCodes.find(jc => jc.code === value);
              updateTimeSlot(index, 'jobCode', value);
              updateTimeSlot(index, 'rate', selectedJobCode?.rate || 'NA');
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select job code" />
            </SelectTrigger>
            <SelectContent>
              {jobCodes.map((jobCode) => (
                <SelectItem key={jobCode.code} value={jobCode.code}>
                  {jobCode.code}: {jobCode.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Rate */}
        <div className="space-y-2">
          <Label htmlFor={`rate-${index}`}>Rate ($/hr)</Label>
          <Input
            id={`rate-${index}`}
            type="number"
            step="0.01"
            min="0"
            value={formData.timeSlots[index].rate || ''}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              updateTimeSlot(index, 'rate', isNaN(value) ? 'NA' : value);
            }}
            className="w-full"
            placeholder="0.00"
            required
          />
        </div>
      </div>
      
      {/* Break Checkbox - Replaced toggle with checkbox */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={`isBreak-${index}`}
          checked={formData.timeSlots[index].isBreak}
          onChange={(e) => updateTimeSlot(index, 'isBreak', e.target.checked)}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <Label htmlFor={`isBreak-${index}`} className="text-sm font-medium">
          Is Break
        </Label>
      </div>
      
      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor={`notes-${index}`}>Notes (Optional)</Label>
        <Input
          id={`notes-${index}`}
          type="text"
          value={formData.timeSlots[index].notes || ''}
          onChange={(e) => updateTimeSlot(index, 'notes', e.target.value)}
          className="w-full"
          placeholder="Add any notes for this time slot"
        />
      </div>
    </div>
  );

  // Update the recurring options section to include the date field
  const renderRecurringOptions = () => {
    if (!formData.isRecurring) return null;

    return (
      <div className="space-y-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
        <h4 className="font-medium text-blue-900 dark:text-blue-100">Recurring Options</h4>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="thisWeek"
              name="recurringType"
              value="thisWeek"
              checked={formData.recurringOptions.type === 'thisWeek'}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                recurringOptions: { ...prev.recurringOptions, type: e.target.value }
              }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <Label htmlFor="thisWeek" className="text-sm font-medium">
              For this week
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="tillWhen"
              name="recurringType"
              value="tillWhen"
              checked={formData.recurringOptions.type === 'tillWhen'}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                recurringOptions: { ...prev.recurringOptions, type: e.target.value }
              }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <Label htmlFor="tillWhen" className="text-sm font-medium">
              Till when
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="custom"
              name="recurringType"
              value="custom"
              checked={formData.recurringOptions.type === 'custom'}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                recurringOptions: { ...prev.recurringOptions, type: e.target.value }
              }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <Label htmlFor="custom" className="text-sm font-medium">
              Custom
            </Label>
          </div>
        </div>

        {/* Show date field for "till when" and "custom" options */}
        {(formData.recurringOptions.type === 'tillWhen' || formData.recurringOptions.type === 'custom') && (
          <div className="space-y-2">
            <Label htmlFor="recurringEndDate">End Date</Label>
            <Input
              id="recurringEndDate"
              type="date"
              value={formData.recurringOptions.endDate || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                recurringOptions: { ...prev.recurringOptions, endDate: e.target.value }
              }))}
              className="w-full"
              min={formData.date} // Ensure end date is not before start date
              required
            />
          </div>
        )}

        {/* Include weekends toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="includeWeekends"
            checked={formData.recurringOptions.includeWeekends || false}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              recurringOptions: { ...prev.recurringOptions, includeWeekends: e.target.checked }
            }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <Label htmlFor="includeWeekends" className="text-sm font-medium">
            Include weekends
          </Label>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Schedule for {employee?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Selection */}
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="mt-1"
            />
          </div>

          {/* Time Slots */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-medium">Time Slots</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTimeSlot}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Time Slot
              </Button>
            </div>

            <div className="space-y-3">
              {formData.timeSlots.map((slot, index) => renderTimeSlot(index))}
            </div>

            {/* Total Hours Display */}
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Working Hours:</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {calculateTotalHours()} hours
                </span>
              </div>
            </div>
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <Label htmlFor="isRecurring" className="text-sm font-medium">
              Make recurring
            </Label>
          </div>

          {/* Recurring Options */}
          {renderRecurringOptions()}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="mt-1"
              placeholder="Add any additional notes"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || !formData.date || formData.timeSlots.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Creating...' : 'Create Schedule'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleForm; 