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
import { Search, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import api from '../../lib/axios';
import { useToast } from "@/hooks/use-toast";

const ScheduleForm = ({ employees, jobCodes, companyDefaults, existingSchedules = [], onSubmit, onClose, onDelete, initialData }) => {
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
    hoursPerDay: '8',
    startTime: '09:00',
    endTime: '17:00',
    notes: ''
  });
  
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState(employees);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeJobCodes, setEmployeeJobCodes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const { toast } = useToast();

  // Fetch templates on mount
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

  useEffect(() => {
    if (initialData) {
      setFormData({
        employeeId: initialData.employeeId,
        jobCode: initialData.jobCode,
        startDate: new Date(initialData.startDate).toISOString().split('T')[0],
        endDate: new Date(initialData.endDate).toISOString().split('T')[0],
        daysOfWeek: initialData.daysOfWeek || {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false
        },
        hoursPerDay: initialData.hoursPerDay.toString(),
        startTime: initialData.startTime,
        endTime: initialData.endTime,
        notes: initialData.notes || ''
      });
      
      const emp = employees.find(e => e.employeeId === initialData.employeeId);
      setSelectedEmployee(emp);
    }
  }, [initialData, employees]);

  useEffect(() => {
    if (!employees || employees.length === 0) {
      setFilteredEmployees([]);
      return;
    }
    
    if (!searchTerm || searchTerm.trim() === '') {
      setFilteredEmployees(employees);
      return;
    }
    
    const filtered = employees.filter(emp => {
      const name = emp.name || '';
      const empId = emp.employeeId || '';
      const searchLower = searchTerm.toLowerCase();
      
      return name.toLowerCase().includes(searchLower) || 
             empId.toLowerCase().includes(searchLower);
    });
    
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  useEffect(() => {
    if (selectedEmployee && Array.isArray(jobCodes)) {
      // Filter job codes based on employee's assigned job codes
      const empJobCodes = jobCodes.filter(jc =>
        selectedEmployee.jobCodes?.some(empJc => empJc.code === jc.code)
      );
      setEmployeeJobCodes(empJobCodes);
    } else {
      setEmployeeJobCodes([]);
    }
  }, [selectedEmployee, jobCodes]);

  const handleEmployeeSelect = (employeeId) => {
    const emp = employees.find(e => e.employeeId === employeeId);
    setSelectedEmployee(emp);
    
    // Get employee's assigned job codes
    const empJobCodes = emp?.jobCodes || [];
    setEmployeeJobCodes(empJobCodes);
    
    setFormData({ 
      ...formData, 
      employeeId, 
      employeeName: emp?.name || '',
      jobCode: '' // Reset job code when employee changes
    });
  };

  const handleCompanyDefaultSelect = (defaultId) => {
    const selected = companyDefaults.find(d => d._id === defaultId);
    if (selected) {
      setFormData({
        ...formData,
        hoursPerDay: selected.hoursPerDay.toString(),
        startTime: selected.startTime,
        endTime: selected.endTime,
        includeWeekends: selected.includeWeekends
      });
    }
  };

  const handleTemplateSelect = (templateId) => {
    if (!templateId) return;

    const template = templates.find(t => t._id === templateId);
    if (!template) return;

    // If template has a job code, validate it
    if (template.jobCode) {
      // Check if employee is selected
      if (!selectedEmployee) {
        toast({
          title: "Error",
          description: "Please select an employee first to apply this template",
          variant: "destructive"
        });
        return;
      }

      // Check if employee has this job code assigned
      const hasJobCode = selectedEmployee.jobCodes?.some(jc => jc.code === template.jobCode);
      if (!hasJobCode) {
        toast({
          title: "Error",
          description: `This template requires job code "${template.jobCode}" which is not assigned to the selected employee. Please assign the job code to the employee first or use a different template.`,
          variant: "destructive"
        });
        return;
      }

      // Apply template with job code
      setFormData({
        ...formData,
        jobCode: template.jobCode,
        hoursPerDay: template.hoursPerDay.toString(),
        startTime: template.startTime,
        endTime: template.endTime,
        daysOfWeek: template.daysOfWeek || {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false
        },
        notes: template.notes || formData.notes
      });

      toast({
        title: "Success",
        description: `Template "${template.name}" applied successfully`,
      });
    } else {
      // Template without job code - only apply time settings
      setFormData({
        ...formData,
        hoursPerDay: template.hoursPerDay.toString(),
        startTime: template.startTime,
        endTime: template.endTime,
        daysOfWeek: template.daysOfWeek || {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false
        },
        notes: template.notes || formData.notes
      });

      toast({
        title: "Success",
        description: `Template "${template.name}" applied. Please select a job code for this schedule.`,
      });
    }
  };

  // Strict conflict detection - no overlaps allowed
  const checkConflicts = () => {
    const newStart = new Date(formData.startDate);
    const newEnd = new Date(formData.endDate);
    
    // Filter schedules for the same employee (excluding current schedule if editing)
    const employeeSchedules = existingSchedules.filter(schedule => 
      schedule.employeeId === formData.employeeId && 
      schedule._id !== initialData?._id
    );
    
    // Convert time to minutes for comparison
    const toMinutes = (time) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };
    
    const newStartMin = toMinutes(formData.startTime);
    const newEndMin = toMinutes(formData.endTime);
    
    // Helper to check if a day is enabled in daysOfWeek
    const isDayEnabled = (date, daysOfWeek) => {
      const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayMap[date.getDay()];
      return daysOfWeek && daysOfWeek[dayName] === true;
    };

    // Check each day in the new schedule range
    const conflicts = [];
    let currentDate = new Date(newStart);
    
    while (currentDate <= newEnd) {
      // Only check days that are enabled in the new schedule
      if (isDayEnabled(currentDate, formData.daysOfWeek)) {
        // Check against existing schedules
        for (const schedule of employeeSchedules) {
          const existingStart = new Date(schedule.startDate);
          const existingEnd = new Date(schedule.endDate);
          
          // Check if current date falls within existing schedule
          if (currentDate >= existingStart && currentDate <= existingEnd) {
            // Check if existing schedule includes this day
            if (isDayEnabled(currentDate, schedule.daysOfWeek)) {
              // Times overlap check
              const existingStartMin = toMinutes(schedule.startTime);
              const existingEndMin = toMinutes(schedule.endTime);
              
              const timesOverlap = newStartMin < existingEndMin && newEndMin > existingStartMin;
              
              if (timesOverlap) {
                conflicts.push({
                  date: new Date(currentDate),
                  schedule: schedule
                });
                break; // Found conflict for this date, move to next date
              }
            }
          }
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return conflicts;
  };

  // Time validation function
  const validateTimeRange = () => {
    const startTime = formData.startTime;
    const endTime = formData.endTime;
    
    if (!startTime || !endTime) return true; // Let required validation handle empty fields
    
    // Convert to minutes for comparison
    const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
    
    // Check if end time is before or equal to start time
    if (endMinutes <= startMinutes) {
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.jobCode) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Validate time range
    if (!validateTimeRange()) {
      alert('❌ Invalid Time Range!\n\nEnd time must be after start time.\nPlease select a valid time range.');
      return;
    }
    
    // Check for conflicts - strict mode, no overlaps allowed (only if dates provided)
    const conflicts = (formData.startDate && formData.endDate) ? checkConflicts() : [];
    
    if (conflicts.length > 0) {
      const firstConflict = conflicts[0];
      const conflictMsg = `❌ Schedule Conflict Detected!\n\n` +
        `This schedule conflicts with an existing schedule:\n\n` +
        `Employee: ${firstConflict.schedule.employeeName}\n` +
        `Existing Schedule:\n` +
        `  • Job Code: ${firstConflict.schedule.jobCode}\n` +
        `  • Date Range: ${new Date(firstConflict.schedule.startDate).toLocaleDateString()} - ${new Date(firstConflict.schedule.endDate).toLocaleDateString()}\n` +
        `  • Time: ${firstConflict.schedule.startTime} - ${firstConflict.schedule.endTime}\n` +
        `  • Days: ${firstConflict.schedule.includeWeekends ? 'Mon-Sun' : 'Mon-Fri'}\n\n` +
        `Conflict on: ${firstConflict.date.toLocaleDateString()}\n\n` +
        `${conflicts.length > 1 ? `(+ ${conflicts.length - 1} more conflict${conflicts.length > 1 ? 's' : ''})\n\n` : ''}` +
        `Please either:\n` +
        `  1. Change the date range to avoid overlap\n` +
        `  2. Change the time to avoid overlap\n` +
        `  3. Delete the existing schedule first\n` +
        `  4. Edit the existing schedule instead`;
      
      alert(conflictMsg);
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Schedule' : 'Create New Schedule'}</DialogTitle>
          <DialogDescription>
            Create a schedule for an employee with specific job code and time range
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Template Selector */}
          <div className="space-y-2">
            <Label>Apply Template (Optional)</Label>
            <Select onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template to import settings" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {templates.length === 0 ? (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    No templates available. Create one in Manage Templates.
                  </div>
                ) : (
                  templates.map(template => (
                    <SelectItem key={template._id} value={template._id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{template.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {template.jobCode ? `Job Code: ${template.jobCode} • ` : ''}
                          {template.hoursPerDay}h ({template.startTime}-{template.endTime})
                          {template.includeWeekends ? ' • Includes Weekends' : ''}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Templates will auto-fill schedule settings. If a template has a job code, employee must have it assigned.
            </p>
          </div>

          {/* Employee Search and Select */}
          <div className="space-y-2">
            <Label>Employee *</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {formData.employeeId
                    ? employees.find((emp) => emp.employeeId === formData.employeeId)?.name + 
                      ' (' + formData.employeeId + ')'
                    : "Select employee..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search employee..." />
                  <CommandEmpty>No employee found.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-y-auto">
                    {employees.map((emp) => (
                      <CommandItem
                        key={emp._id}
                        value={`${emp.name} ${emp.employeeId}`}
                        onSelect={() => {
                          handleEmployeeSelect(emp.employeeId);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.employeeId === emp.employeeId ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {emp.name} ({emp.employeeId})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedEmployee && (
              <p className="text-sm text-muted-foreground">
                {selectedEmployee.department} - {selectedEmployee.position}
                {selectedEmployee.jobCodes && selectedEmployee.jobCodes.length > 0 && (
                  <span className="ml-2 text-xs">
                    ({selectedEmployee.jobCodes.length} job code{selectedEmployee.jobCodes.length > 1 ? 's' : ''} assigned)
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Job Code */}
          <div className="space-y-2">
            <Label htmlFor="jobCode">Job Code *</Label>
            <Select
              value={formData.jobCode}
              onValueChange={(value) => setFormData({ ...formData, jobCode: value })}
              required
              disabled={!selectedEmployee}
            >
              <SelectTrigger>
                <SelectValue placeholder={!selectedEmployee ? "Select employee first" : "Select job code"} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {!selectedEmployee ? (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    Please select an employee first
                  </div>
                ) : employeeJobCodes.length === 0 ? (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    No job codes assigned to this employee
                  </div>
                ) : (
                  employeeJobCodes.map(jc => (
                    <SelectItem key={jc._id || jc.code} value={jc.code}>
                      <div className="flex flex-col">
                        <span className="font-medium">{jc.code}</span>
                        {jc.description && (
                          <span className="text-xs text-muted-foreground">{jc.description}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedEmployee && employeeJobCodes.length === 0 && (
              <p className="text-xs text-yellow-600">
                This employee has no job codes assigned. Please assign job codes in Employee Management.
              </p>
            )}
          </div>

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
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  placeholder="Start date"
                />
              </div>
              <div className="space-y-2">
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  placeholder="End date"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty or use button for foreseeable future (defaults to today + 1 year)
            </p>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hoursPerDay">Hours Per Day *</Label>
              <Input
                id="hoursPerDay"
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={formData.hoursPerDay}
                onChange={(e) => setFormData({ ...formData, hoursPerDay: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
                className={!validateTimeRange() && formData.startTime && formData.endTime ? "border-red-500" : ""}
              />
              {!validateTimeRange() && formData.startTime && formData.endTime && (
                <p className="text-sm text-red-600">End time must be after start time</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
                className={!validateTimeRange() && formData.startTime && formData.endTime ? "border-red-500" : ""}
              />
              {!validateTimeRange() && formData.startTime && formData.endTime && (
                <p className="text-sm text-red-600">End time must be after start time</p>
              )}
            </div>
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

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center gap-2 pt-4">
            {/* Delete button - only show when editing */}
            {initialData && onDelete ? (
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
              <Button type="submit">
                {initialData ? 'Update' : 'Create'} Schedule
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleForm;

