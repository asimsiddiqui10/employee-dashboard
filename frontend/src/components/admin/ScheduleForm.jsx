import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

const ScheduleForm = ({ employee, jobCodes, onSubmit, onCancel, initialData = null }) => {
  const [scheduleData, setScheduleData] = useState({
    weekStartDate: '',
    isRecurring: false,
    recurringDays: [],
    schedules: {}
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setScheduleData(initialData);
    } else {
      // Initialize with current week
      const today = new Date();
      const monday = new Date(today);
      monday.setDate(today.getDate() - today.getDay() + 1);
      
      const weekData = {};
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i];
        
        weekData[dateKey] = {
          date: dateKey,
          dayOfWeek: dayName,
          enabled: i > 0 && i < 6, // Monday to Friday enabled by default
          startTime: '09:00',
          endTime: '17:00',
          hours: '8.0',
          jobCode: jobCodes.length > 0 ? jobCodes[0].code : 'ACT001',
          rate: jobCodes.length > 0 ? jobCodes[0].defaultRate : 25.00,
          breaks: [
            {
              startTime: '12:00',
              endTime: '13:00',
              duration: 60,
              description: 'Lunch Break'
            }
          ],
          notes: ''
        };
      }
      
      setScheduleData({
        weekStartDate: monday.toISOString().split('T')[0],
        isRecurring: false,
        recurringDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        schedules: weekData
      });
    }
  }, [initialData, jobCodes]);

  const handleDayToggle = (dateKey, enabled) => {
    setScheduleData(prev => ({
      ...prev,
      schedules: {
        ...prev.schedules,
        [dateKey]: {
          ...prev.schedules[dateKey],
          enabled
        }
      }
    }));
  };

  const handleScheduleChange = (dateKey, field, value) => {
    setScheduleData(prev => ({
      ...prev,
      schedules: {
        ...prev.schedules,
        [dateKey]: {
          ...prev.schedules[dateKey],
          [field]: value
        }
      }
    }));
  };

  const handleBreakChange = (dateKey, breakIndex, field, value) => {
    setScheduleData(prev => ({
      ...prev,
      schedules: {
        ...prev.schedules,
        [dateKey]: {
          ...prev.schedules[dateKey],
          breaks: prev.schedules[dateKey].breaks.map((breakItem, index) =>
            index === breakIndex ? { ...breakItem, [field]: value } : breakItem
          )
        }
      }
    }));
  };

  const addBreak = (dateKey) => {
    setScheduleData(prev => ({
      ...prev,
      schedules: {
        ...prev.schedules,
        [dateKey]: {
          ...prev.schedules[dateKey],
          breaks: [
            ...prev.schedules[dateKey].breaks,
            {
              startTime: '10:00',
              endTime: '10:15',
              duration: 15,
              description: 'Break'
            }
          ]
        }
      }
    }));
  };

  const removeBreak = (dateKey, breakIndex) => {
    setScheduleData(prev => ({
      ...prev,
      schedules: {
        ...prev.schedules,
        [dateKey]: {
          ...prev.schedules[dateKey],
          breaks: prev.schedules[dateKey].breaks.filter((_, index) => index !== breakIndex)
        }
      }
    }));
  };

  const handleRecurringDayToggle = (day) => {
    setScheduleData(prev => ({
      ...prev,
      recurringDays: prev.recurringDays.includes(day)
        ? prev.recurringDays.filter(d => d !== day)
        : [...prev.recurringDays, day]
    }));
  };

  const calculateDayHours = (startTime, endTime, breaks) => {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    let totalMinutes = (end - start) / (1000 * 60);
    
    // Subtract break time
    breaks.forEach(breakItem => {
      if (breakItem.duration) {
        totalMinutes -= breakItem.duration;
      }
    });
    
    return Math.max(0, totalMinutes / 60);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Convert schedules object to array and calculate hours
      const schedulesArray = Object.values(scheduleData.schedules)
        .filter(day => day.enabled)
        .map(day => ({
          ...day,
          hours: calculateDayHours(day.startTime, day.endTime, day.breaks)
        }));

      const schedulePayload = {
        employeeId: employee.employeeId,
        weekStartDate: scheduleData.weekStartDate,
        schedules: schedulesArray,
        isRecurring: scheduleData.isRecurring,
        recurringDays: scheduleData.recurringDays,
        status: 'draft'
      };

      await onSubmit(schedulePayload);
    } catch (error) {
      console.error('Error submitting schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const getJobCodeRate = (jobCode) => {
    const jobCodeObj = jobCodes.find(jc => jc.code === jobCode);
    return jobCodeObj ? jobCodeObj.defaultRate : 0;
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Create Schedule for {employee?.name}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Schedule'}
          </Button>
        </div>
      </div>

      {/* Week Start Date */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="weekStartDate">Week Start Date</Label>
            <Input
              id="weekStartDate"
              type="date"
              value={scheduleData.weekStartDate}
              onChange={(e) => setScheduleData(prev => ({
                ...prev,
                weekStartDate: e.target.value
              }))}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isRecurring"
              checked={scheduleData.isRecurring}
              onCheckedChange={(checked) => setScheduleData(prev => ({
                ...prev,
                isRecurring: checked
              }))}
            />
            <Label htmlFor="isRecurring">Make recurring for weekdays</Label>
          </div>

          {scheduleData.isRecurring && (
            <div>
              <Label>Recurring Days</Label>
              <div className="flex gap-2 mt-2">
                {weekDays.map((day) => (
                  <Button
                    key={day}
                    variant={scheduleData.recurringDays.includes(day) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleRecurringDayToggle(day)}
                  >
                    {day.slice(0, 3)}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Schedule Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(scheduleData.schedules).map(([dateKey, daySchedule]) => (
              <div key={dateKey} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={daySchedule.enabled}
                      onCheckedChange={(enabled) => handleDayToggle(dateKey, enabled)}
                    />
                    <div>
                      <h3 className="font-medium">{daySchedule.dayOfWeek}</h3>
                      <p className="text-sm text-gray-600">{dateKey}</p>
                    </div>
                  </div>
                  {daySchedule.enabled && (
                    <Badge variant="outline">
                      {calculateDayHours(daySchedule.startTime, daySchedule.endTime, daySchedule.breaks).toFixed(1)} hours
                    </Badge>
                  )}
                </div>

                {daySchedule.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={daySchedule.startTime}
                        onChange={(e) => handleScheduleChange(dateKey, 'startTime', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={daySchedule.endTime}
                        onChange={(e) => handleScheduleChange(dateKey, 'endTime', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label>Job Code</Label>
                      <Input
                        type="text"
                        value={daySchedule.jobCode}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleScheduleChange(dateKey, 'jobCode', value);
                          handleScheduleChange(dateKey, 'rate', getJobCodeRate(value));
                        }}
                        placeholder="Enter job code"
                      />
                    </div>
                    
                    <div>
                      <Label>Rate ($/hr)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={daySchedule.rate}
                        onChange={(e) => handleScheduleChange(dateKey, 'rate', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                )}

                {daySchedule.enabled && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label>Breaks</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addBreak(dateKey)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Break
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {daySchedule.breaks.map((breakItem, breakIndex) => (
                        <div key={breakIndex} className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={breakItem.startTime}
                            onChange={(e) => handleBreakChange(dateKey, breakIndex, 'startTime', e.target.value)}
                            className="w-24"
                          />
                          <Input
                            type="time"
                            value={breakItem.endTime}
                            onChange={(e) => handleBreakChange(dateKey, breakIndex, 'endTime', e.target.value)}
                            className="w-24"
                          />
                          <Input
                            type="number"
                            placeholder="Duration (min)"
                            value={breakItem.duration}
                            onChange={(e) => handleBreakChange(dateKey, breakIndex, 'duration', parseInt(e.target.value))}
                            className="w-24"
                          />
                          <Input
                            placeholder="Description"
                            value={breakItem.description}
                            onChange={(e) => handleBreakChange(dateKey, breakIndex, 'description', e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeBreak(dateKey, breakIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {daySchedule.enabled && (
                  <div className="mt-4">
                    <Label>Notes</Label>
                    <Input
                      placeholder="Optional notes for this day..."
                      value={daySchedule.notes}
                      onChange={(e) => handleScheduleChange(dateKey, 'notes', e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleForm; 