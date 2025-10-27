import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { formatDate, startOfDay, isSameDay, addDays } from '../../lib/date-utils';
import api from '../../lib/axios';
import { useToast } from "@/hooks/use-toast";

const ScheduleFormNew = ({ 
  employees, 
  jobCodes, 
  existingSchedules = [], 
  onSubmit, 
  onClose, 
  onDelete, 
  initialData 
}) => {
  const [scheduleType, setScheduleType] = useState('pattern');
  const [formData, setFormData] = useState({
    employeeId: '',
    jobCode: '',
    startDate: '',
    endDate: '',
    daysOfWeek: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    specificDates: [],
    hoursPerDay: '8',
    startTime: '09:00',
    endTime: '17:00',
    notes: ''
  });
  
  const [editMode, setEditMode] = useState({
    isEditing: false,
    modifySpecificDates: false,
    datesToModify: []
  });
  
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeJobCodes, setEmployeeJobCodes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showModifyDatePicker, setShowModifyDatePicker] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const { toast } = useToast();

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await api.get('/schedule-templates');
        setTemplates(response.data);
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };
    fetchTemplates();
  }, []);

  // Initialize form with existing data
  useEffect(() => {
    if (initialData) {
      console.log('Initializing form with data:', initialData);
      setEditMode({ isEditing: true, modifySpecificDates: false, datesToModify: [] });
      setScheduleType(initialData.scheduleType || 'pattern');
      
      const employee = employees.find(emp => emp.employeeId === initialData.employeeId);
      console.log('Found employee for edit:', employee);
      if (employee) {
        setSelectedEmployee(employee);
        setEmployeeJobCodes(employee.jobCodes || []);
        console.log('Employee job codes:', employee.jobCodes);
      } else {
        console.log('Employee not found for ID:', initialData.employeeId);
      }

      setFormData({
        employeeId: initialData.employeeId || '',
        jobCode: initialData.jobCode || '',
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
        daysOfWeek: initialData.daysOfWeek || {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false
        },
        specificDates: initialData.specificDates?.map(sd => new Date(sd.date)) || [],
        hoursPerDay: initialData.hoursPerDay?.toString() || '8',
        startTime: initialData.startTime || '09:00',
        endTime: initialData.endTime || '17:00',
        notes: initialData.notes || ''
      });

      if (initialData.specificDates) {
        setSelectedDates(initialData.specificDates.map(sd => new Date(sd.date)));
      }
    }
  }, [initialData, employees]);

  // Update job codes when employee changes
  useEffect(() => {
    if (selectedEmployee) {
      setEmployeeJobCodes(selectedEmployee.jobCodes || []);
    }
  }, [selectedEmployee]);

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setFormData({ ...formData, employeeId: employee.employeeId, jobCode: '' });
    setOpen(false);
  };

  const handleTemplateSelect = async (templateId) => {
    try {
      const template = templates.find(t => t._id === templateId);
      if (!template) return;

      // Validate job code if template has one
      if (template.jobCode && selectedEmployee) {
        const hasJobCode = employeeJobCodes.some(jc => jc.code === template.jobCode);
        if (!hasJobCode) {
          toast({
            title: "Job Code Mismatch",
            description: `Employee doesn't have job code "${template.jobCode}" from this template`,
            variant: "destructive"
          });
          return;
        }
      }

      setFormData({
        ...formData,
        jobCode: template.jobCode || formData.jobCode,
        daysOfWeek: template.daysOfWeek || formData.daysOfWeek,
        hoursPerDay: template.hoursPerDay.toString(),
        startTime: template.startTime,
        endTime: template.endTime,
        notes: template.notes || formData.notes
      });

      toast({
        title: "Success",
        description: `Template "${template.name}" applied`
      });
    } catch (error) {
      console.error('Error applying template:', error);
    }
  };

  const handleDateSelect = (dates) => {
    if (!dates) return;
    
    if (Array.isArray(dates)) {
      setSelectedDates(dates);
      setFormData({ ...formData, specificDates: dates });
    } else {
      // Single date selected
      const dateExists = selectedDates.some(d => isSameDay(d, dates));
      if (dateExists) {
        // Remove date
        const newDates = selectedDates.filter(d => !isSameDay(d, dates));
        setSelectedDates(newDates);
        setFormData({ ...formData, specificDates: newDates });
      } else {
        // Add date
        const newDates = [...selectedDates, dates];
        setSelectedDates(newDates);
        setFormData({ ...formData, specificDates: newDates });
      }
    }
  };

  const removeDateFromSelection = (dateToRemove) => {
    const newDates = selectedDates.filter(d => !isSameDay(d, dateToRemove));
    setSelectedDates(newDates);
    setFormData({ ...formData, specificDates: newDates });
  };

  // Auto-calculate hours when time changes
  useEffect(() => {
    console.log('Time change detected:', { startTime: formData.startTime, endTime: formData.endTime });
    
    if (formData.startTime && formData.endTime) {
      const startMinutes = parseInt(formData.startTime.split(':')[0]) * 60 + parseInt(formData.startTime.split(':')[1]);
      const endMinutes = parseInt(formData.endTime.split(':')[0]) * 60 + parseInt(formData.endTime.split(':')[1]);
      
      console.log('Calculating hours:', { startMinutes, endMinutes });
      
      if (endMinutes > startMinutes) {
        const totalMinutes = endMinutes - startMinutes;
        const hours = totalMinutes / 60;
        console.log('Setting hours to:', hours);
        setFormData(prev => ({
          ...prev,
          hoursPerDay: hours.toString()
        }));
      }
    }
  }, [formData.startTime, formData.endTime]);

  // Time validation
  const validateTimeRange = () => {
    const startTime = formData.startTime;
    const endTime = formData.endTime;
    
    if (!startTime || !endTime) return true;
    
    const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
    
    return endMinutes > startMinutes;
  };

  // Conflict detection
  const checkConflicts = () => {
    if (!formData.employeeId) return [];

    const conflicts = [];
    let datesToCheck = [];

    // Generate dates to check based on schedule type
    if (scheduleType === 'specific_dates') {
      datesToCheck = selectedDates;
    } else {
      // Pattern schedule
      if (!formData.startDate || !formData.endDate) return [];
      
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      let current = start;
      
      while (current <= end) {
        const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayMap[current.getDay()];
        if (formData.daysOfWeek[dayName]) {
          datesToCheck.push(new Date(current));
        }
        current = addDays(current, 1);
      }
    }

    // Check each date against existing schedules
    const employeeSchedules = existingSchedules.filter(schedule => 
      schedule.employeeId === formData.employeeId && 
      schedule._id !== initialData?._id
    );

    const toMinutes = (time) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    const newStartMin = toMinutes(formData.startTime);
    const newEndMin = toMinutes(formData.endTime);

    datesToCheck.forEach(checkDate => {
      employeeSchedules.forEach(schedule => {
        let scheduleDates = [];
        
        // Get effective dates for existing schedule
        if (schedule.scheduleType === 'specific_dates') {
          scheduleDates = schedule.specificDates?.map(sd => new Date(sd.date)) || [];
        } else {
          const scheduleStart = new Date(schedule.startDate);
          const scheduleEnd = new Date(schedule.endDate);
          let current = scheduleStart;
          
          while (current <= scheduleEnd) {
            const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayName = dayMap[current.getDay()];
            if (schedule.daysOfWeek && schedule.daysOfWeek[dayName]) {
              // Check if not excluded
              const isExcluded = schedule.excludedDates?.some(
                d => isSameDay(new Date(d), current)
              );
              if (!isExcluded) {
                scheduleDates.push(new Date(current));
              }
            }
            current = addDays(current, 1);
          }
        }

        // Check if any schedule date matches our check date
        if (scheduleDates.some(d => isSameDay(d, checkDate))) {
          // Check time overlap
          const existingStartMin = toMinutes(schedule.startTime);
          const existingEndMin = toMinutes(schedule.endTime);
          
          const timesOverlap = newStartMin < existingEndMin && newEndMin > existingStartMin;
          
          if (timesOverlap) {
            conflicts.push({
              date: checkDate,
              schedule: schedule
            });
          }
        }
      });
    });

    return conflicts;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Form submission started', { formData, scheduleType, editMode });
    
    if (!formData.employeeId || !formData.jobCode) {
      console.log('Missing fields validation failed:', { 
        employeeId: formData.employeeId, 
        jobCode: formData.jobCode 
      });
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Missing fields validation passed');
    
    if (!validateTimeRange()) {
      console.log('Time validation failed');
      toast({
        title: "Invalid Time Range",
        description: "End time must be after start time",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Time validation passed');

    if (scheduleType === 'specific_dates' && selectedDates.length === 0) {
      toast({
        title: "No Dates Selected",
        description: "Please select at least one date for the schedule",
        variant: "destructive"
      });
      return;
    }

    // Check conflicts
    const conflicts = checkConflicts();
    if (conflicts.length > 0) {
      const firstConflict = conflicts[0];
      toast({
        title: "Schedule Conflict",
        description: `Conflict with existing schedule on ${formatDate(firstConflict.date, 'MMM dd, yyyy')}. ${conflicts.length > 1 ? `(+${conflicts.length - 1} more)` : ''}`,
        variant: "destructive"
      });
      return;
    }

    // Prepare submission data
    const submissionData = {
      ...formData,
      scheduleType,
      specificDates: scheduleType === 'specific_dates' 
        ? selectedDates.map(d => d.toISOString())
        : undefined
    };

    // Handle edit mode with specific date modifications
    if (editMode.isEditing && editMode.modifySpecificDates && editMode.datesToModify.length > 0) {
      submissionData.modifySpecificDates = true;
      submissionData.datesToModify = editMode.datesToModify.map(d => d.toISOString());
      submissionData.modificationData = {
        jobCode: formData.jobCode,
        hoursPerDay: parseFloat(formData.hoursPerDay),
        startTime: formData.startTime,
        endTime: formData.endTime,
        notes: formData.notes
      };
    }

    console.log('Submitting data:', submissionData);
    onSubmit(submissionData);
  };

  console.log('ScheduleFormNew rendering', { 
    editMode, 
    formData, 
    scheduleType, 
    selectedEmployee: selectedEmployee?.name, 
    employeeJobCodes: employeeJobCodes.length,
    jobCodeValue: formData.jobCode
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editMode.isEditing ? 'Edit Schedule' : 'Create New Schedule'}
          </DialogTitle>
          <DialogDescription>
            {editMode.isEditing 
              ? 'Modify schedule details or update specific dates from a recurring pattern.'
              : 'Create a new schedule for an employee with specific dates or recurring pattern.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Schedule Type Selection */}
          <div className="space-y-3">
            <Label>Schedule Type</Label>
            <RadioGroup
              value={scheduleType}
              onValueChange={setScheduleType}
              className="flex gap-4"
              disabled={editMode.isEditing}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pattern" id="pattern" />
                <Label htmlFor="pattern" className="cursor-pointer">
                  Pattern-based (Recurring)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="specific_dates" id="specific_dates" />
                <Label htmlFor="specific_dates" className="cursor-pointer">
                  Specific Dates
                </Label>
              </div>
            </RadioGroup>
            {editMode.isEditing && (
              <p className="text-xs text-muted-foreground">
                Schedule type cannot be changed when editing
              </p>
            )}
          </div>

          {/* Template Selector */}
          {!editMode.isEditing && templates.length > 0 && (
            <div className="space-y-2">
              <Label>Quick Apply Template (Optional)</Label>
              <Select onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template._id} value={template._id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Employee Search */}
          <div className="space-y-2">
            <Label>Employee *</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                  disabled={editMode.isEditing}
                >
                  {selectedEmployee
                    ? `${selectedEmployee.name} (${selectedEmployee.employeeId})`
                    : "Select employee..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search employee..." />
                  <CommandEmpty>No employee found.</CommandEmpty>
                  <CommandGroup className="max-h-[200px] overflow-y-auto">
                    {employees.map((emp) => (
                      <CommandItem
                        key={emp._id}
                        value={`${emp.name} ${emp.employeeId}`}
                        onSelect={() => handleEmployeeSelect(emp)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedEmployee?.employeeId === emp.employeeId ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {emp.name} ({emp.employeeId})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Job Code */}
          <div className="space-y-2">
            <Label>Job Code *</Label>
            <Select
              value={formData.jobCode}
              onValueChange={(value) => setFormData({ ...formData, jobCode: value })}
              disabled={!selectedEmployee}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select job code..." />
              </SelectTrigger>
              <SelectContent>
                {employeeJobCodes.map((jc) => (
                  <SelectItem key={jc.code} value={jc.code}>
                    {jc.code} - {jc.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pattern Schedule Fields */}
          {scheduleType === 'pattern' && (
            <>
              {/* Date Range */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Date Range (Optional)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      const oneYearFromNow = new Date();
                      oneYearFromNow.setFullYear(today.getFullYear() + 1);
                      setFormData({
                        ...formData,
                        startDate: today.toISOString().split('T')[0],
                        endDate: oneYearFromNow.toISOString().split('T')[0]
                      });
                    }}
                  >
                    From Today Till 1 Year
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      placeholder="Start date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      placeholder="End date"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave empty for foreseeable future (defaults to today + 1 year)
                </p>
              </div>

              {/* Days of Week */}
              <div className="space-y-3">
                <Label>Days of Week</Label>
                <div className="flex gap-2">
                  {[
                    { key: 'monday', label: 'M' },
                    { key: 'tuesday', label: 'T' },
                    { key: 'wednesday', label: 'W' },
                    { key: 'thursday', label: 'T' },
                    { key: 'friday', label: 'F' },
                    { key: 'saturday', label: 'S' },
                    { key: 'sunday', label: 'S' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex flex-col items-center gap-1">
                      <Label htmlFor={key} className="text-xs text-muted-foreground cursor-pointer">
                        {label}
                      </Label>
                      <Checkbox
                        id={key}
                        checked={formData.daysOfWeek[key]}
                        onCheckedChange={(checked) => setFormData({
                          ...formData,
                          daysOfWeek: {
                            ...formData.daysOfWeek,
                            [key]: checked
                          }
                        })}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  M T W T F are selected by default
                </p>
              </div>

              {/* Edit Specific Dates from Pattern */}
              {editMode.isEditing && initialData?.scheduleType === 'pattern' && (
                <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="modify-specific"
                      checked={editMode.modifySpecificDates}
                      onCheckedChange={(checked) => setEditMode({
                        ...editMode,
                        modifySpecificDates: checked,
                        datesToModify: checked ? editMode.datesToModify : []
                      })}
                    />
                    <Label htmlFor="modify-specific" className="cursor-pointer">
                      Modify specific dates from this pattern
                    </Label>
                  </div>
                  {editMode.modifySpecificDates && (
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowModifyDatePicker(!showModifyDatePicker)}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Select Dates to Modify
                      </Button>
                      {showModifyDatePicker && (
                        <div className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <Label className="text-sm font-medium">Select dates to modify:</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowModifyDatePicker(false)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <DayPicker
                            mode="multiple"
                            selected={editMode.datesToModify}
                            onSelect={(dates) => setEditMode({
                              ...editMode,
                              datesToModify: dates || []
                            })}
                            fromDate={new Date(initialData.startDate)}
                            toDate={new Date(initialData.endDate)}
                          />
                        </div>
                      )}
                      {editMode.datesToModify.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {editMode.datesToModify.map((date, idx) => (
                            <Badge key={idx} variant="secondary">
                              {formatDate(date, 'MMM dd, yyyy')}
                              <X
                                className="ml-1 h-3 w-3 cursor-pointer"
                                onClick={() => setEditMode({
                                  ...editMode,
                                  datesToModify: editMode.datesToModify.filter((_, i) => i !== idx)
                                })}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Selected dates will be updated with the new settings below
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Specific Dates Fields */}
          {scheduleType === 'specific_dates' && (
            <div className="space-y-3">
              <Label>Select Dates *</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDates.length === 0 
                  ? 'Pick dates...' 
                  : `${selectedDates.length} date${selectedDates.length > 1 ? 's' : ''} selected`}
              </Button>
              
              {showDatePicker && (
                <div className="border rounded-lg p-4">
                  <DayPicker
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={handleDateSelect}
                    fromDate={new Date()}
                  />
                </div>
              )}

              {selectedDates.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Selected Dates:</Label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded">
                    {selectedDates.sort((a, b) => a - b).map((date, idx) => (
                      <Badge key={idx} variant="secondary">
                        {formatDate(date, 'MMM dd, yyyy')}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => removeDateFromSelection(date)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Time and Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time *</Label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>End Time *</Label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hours per Day *</Label>
            <Input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={formData.hoursPerDay}
              onChange={(e) => setFormData({ ...formData, hoursPerDay: e.target.value })}
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center gap-2 pt-4">
            {editMode.isEditing && onDelete ? (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this schedule? This action cannot be undone.')) {
                    onDelete(initialData._id);
                  }
                }}
              >
                Delete Schedule
              </Button>
            ) : (
              <div />
            )}
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit"
                onClick={() => console.log('Submit button clicked')}
              >
                {editMode.isEditing ? 'Update' : 'Create'} Schedule
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleFormNew;

