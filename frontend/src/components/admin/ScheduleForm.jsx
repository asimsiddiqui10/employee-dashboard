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
    timeSlots: [
      {
        startTime: '09:00',
        endTime: '17:00',
        isBreak: false,
        jobCode: '',
        rate: ''
      }
    ],
    notes: '',
    isRecurring: false,
    recurringOptions: {
      type: 'thisWeek', // 'thisWeek', 'tillWhen', 'custom'
      endDate: '',
      includeWeekends: false
    }
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
        }))
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
          isBreak: true,
          jobCode: jobCodes.length > 0 ? jobCodes[0].code : '',
          rate: jobCodes.length > 0 ? jobCodes[0].rate || 'NA' : 'NA'
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
      if (!slot.isBreak) {
        const start = new Date(`2000-01-01T${slot.startTime}`);
        const end = new Date(`2000-01-01T${slot.endTime}`);
        const hours = (end - start) / (1000 * 60 * 60);
        totalHours += hours;
      }
    });
    return totalHours.toFixed(1);
  };

  const handleSubmit = async () => {
    if (!formData.date || formData.timeSlots.length === 0) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error creating schedule:', error);
    } finally {
      setLoading(false);
    }
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
              <Label>Time Slots</Label>
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
              {formData.timeSlots.map((slot, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={slot.isBreak}
                        onCheckedChange={(checked) => updateTimeSlot(index, 'isBreak', checked)}
                      />
                      <Label className="text-sm">
                        {slot.isBreak ? 'Break' : 'Work'}
                      </Label>
                    </div>

                    {formData.timeSlots.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTimeSlot(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <Input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                      className="w-24"
                    />
                    <span className="text-gray-500">-</span>
                    <Input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                      className="w-24"
                    />
                  </div>

                  {!slot.isBreak && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm">Job Code</Label>
                        <Select
                          value={slot.jobCode || ''}
                          onValueChange={(value) => updateTimeSlot(index, 'jobCode', value)}
                        >
                          <SelectTrigger className="mt-1">
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

                      <div>
                        <Label className="text-sm">Rate</Label>
                        <Input
                          type="text"
                          value={slot.rate || ''}
                          onChange={(e) => updateTimeSlot(index, 'rate', e.target.value)}
                          placeholder="NA"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Total Hours Display */}
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Work Hours:</span>
                <Badge variant="secondary" className="text-lg">
                  {calculateTotalHours()} hours
                </Badge>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any additional notes..."
              className="mt-1"
            />
          </div>

          {/* Recurring Options */}
          <div className="border-t pt-4">
            <div className="flex items-center space-x-2 mb-3">
              <Switch
                id="isRecurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  isRecurring: checked
                }))}
              />
              <Label htmlFor="isRecurring">Make recurring</Label>
            </div>

            {formData.isRecurring && (
              <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                <div>
                  <Label>Recurring Type</Label>
                  <Select
                    value={formData.recurringOptions.type}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      recurringOptions: { ...prev.recurringOptions, type: value }
                    }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thisWeek">For this week</SelectItem>
                      <SelectItem value="tillWhen">Till when</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.recurringOptions.type === 'tillWhen' && (
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={formData.recurringOptions.endDate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        recurringOptions: { ...prev.recurringOptions, endDate: e.target.value }
                      }))}
                      className="mt-1"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating...' : 'Create Schedule'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleForm; 