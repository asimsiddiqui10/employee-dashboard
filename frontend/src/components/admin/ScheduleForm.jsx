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
import { Calendar as CalendarIcon, Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import { format, addDays, isBefore, isAfter, isSameDay, parseISO } from 'date-fns';
import api from '../../lib/axios';
import { useToast } from "@/hooks/use-toast";

const ScheduleForm = ({ 
  employees, 
  jobCodes, 
  templates = [], 
  onSubmit, 
  onClose, 
  onDelete, 
  initialData 
}) => {
  const [formData, setFormData] = useState({
    employeeIds: [],
    jobCode: '',
    date: '',
    startTime: '09:00',
    endTime: '17:00'
  });
  
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringData, setRecurringData] = useState({
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
    }
  });
  
  const [open, setOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [employeeJobCodes, setEmployeeJobCodes] = useState([]);
  const [calculatedHours, setCalculatedHours] = useState(8);
  const { toast } = useToast();

  // Initialize form with existing data
  useEffect(() => {
    if (initialData) {
      setFormData({
        employeeIds: initialData.employeeId ? [initialData.employeeId] : [],
        jobCode: initialData.jobCode || '',
        date: initialData.date ? initialData.date.split('T')[0] : '',
        startTime: initialData.startTime || '09:00',
        endTime: initialData.endTime || '17:00'
      });
      
      const employee = employees.find(emp => emp.employeeId === initialData.employeeId);
      if (employee) {
        setSelectedEmployees([employee]);
        setEmployeeJobCodes(employee.jobCodes || []);
      }
    }
  }, [initialData, employees]);

  // Update employee job codes when employees change - find common job codes
  useEffect(() => {
    if (selectedEmployees.length > 0) {
      if (selectedEmployees.length === 1) {
        setEmployeeJobCodes(selectedEmployees[0].jobCodes || []);
      } else {
        // Find common job codes across all selected employees
        const allJobCodes = selectedEmployees.map(emp => emp.jobCodes || []);
        const commonJobCodes = allJobCodes.reduce((common, current) => 
          common.filter(jobCode => current.some(jc => jc.code === jobCode.code))
        );
        setEmployeeJobCodes(commonJobCodes);
      }
    } else {
      setEmployeeJobCodes([]);
    }
  }, [selectedEmployees]);

  // Auto-calculate hours when time changes
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const startMinutes = parseInt(formData.startTime.split(':')[0]) * 60 + parseInt(formData.startTime.split(':')[1]);
      const endMinutes = parseInt(formData.endTime.split(':')[0]) * 60 + parseInt(formData.endTime.split(':')[1]);
      
      if (endMinutes > startMinutes) {
        const totalMinutes = endMinutes - startMinutes;
        const hours = totalMinutes / 60;
        setCalculatedHours(hours);
      }
    }
  }, [formData.startTime, formData.endTime]);

  const handleEmployeeSelect = (employee) => {
    const isAlreadySelected = selectedEmployees.some(emp => emp.employeeId === employee.employeeId);
    
    if (isAlreadySelected) {
      // Remove employee if already selected
      setSelectedEmployees(prev => prev.filter(emp => emp.employeeId !== employee.employeeId));
      setFormData(prev => ({
        ...prev,
        employeeIds: prev.employeeIds.filter(id => id !== employee.employeeId)
      }));
    } else {
      // Add employee if not selected
      setSelectedEmployees(prev => [...prev, employee]);
      setFormData(prev => ({
        ...prev,
        employeeIds: [...prev.employeeIds, employee.employeeId]
      }));
    }
    
    // Preserve existing job code in edit mode, only clear in create mode
    const newJobCode = initialData ? formData.jobCode : '';
    setFormData(prev => ({ ...prev, jobCode: newJobCode }));
    setOpen(false);
  };

  const handleTemplateSelect = async (templateId) => {
    try {
      // If same template is selected, unselect it
      if (selectedTemplate && selectedTemplate._id === templateId) {
        setSelectedTemplate(null);
        return;
      }

      const template = templates.find(t => t._id === templateId);
      if (!template) return;

      // Check if any selected employee has the job code from template
      if (template.jobCode && selectedEmployees.length > 0) {
        const hasJobCode = employeeJobCodes.some(jc => jc.code === template.jobCode);
        if (!hasJobCode) {
          toast({
            title: "Job Code Mismatch",
            description: `Selected employees don't have job code "${template.jobCode}" from this template`,
            variant: "destructive"
          });
          return;
        }
      }

      setSelectedTemplate(template);
      setFormData({
        ...formData,
        jobCode: template.jobCode || formData.jobCode,
        startTime: template.startTime,
        endTime: template.endTime,
      });

      if (isRecurring) {
        setRecurringData({
          ...recurringData,
          daysOfWeek: template.daysOfWeek || recurringData.daysOfWeek
        });
      }
    } catch (error) {
      console.error('Error applying template:', error);
    }
  };

  const generateDatesInRange = (startDate, endDate, daysOfWeek) => {
    const dates = [];
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    let current = start;

    while (isBefore(current, end) || isSameDay(current, end)) {
      const dayOfWeek = current.getDay();
      const dayMap = {
        0: 'sunday',
        1: 'monday',
        2: 'tuesday',
        3: 'wednesday',
        4: 'thursday',
        5: 'friday',
        6: 'saturday'
      };
      
      const dayName = dayMap[dayOfWeek];
      if (daysOfWeek[dayName]) {
        dates.push(format(current, 'yyyy-MM-dd'));
      }
      current = addDays(current, 1);
    }

    return dates;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isRecurring) {
      // Single schedule validation
      if (formData.employeeIds.length === 0 || !formData.jobCode || !formData.date) {
        const missingFields = [];
        if (formData.employeeIds.length === 0) missingFields.push('Employee(s)');
        if (!formData.jobCode) missingFields.push('Job Code');
        if (!formData.date) missingFields.push('Date');
        
        toast({
          title: "Missing Required Fields",
          description: `Please fill in: ${missingFields.join(', ')}`,
          variant: "destructive"
        });
        return;
      }
    } else {
      // Recurring schedule validation
      if (formData.employeeIds.length === 0 || !formData.jobCode || !recurringData.startDate || !recurringData.endDate) {
        const missingFields = [];
        if (formData.employeeIds.length === 0) missingFields.push('Employee(s)');
        if (!formData.jobCode) missingFields.push('Job Code');
        if (!recurringData.startDate) missingFields.push('Start Date');
        if (!recurringData.endDate) missingFields.push('End Date');
        
        toast({
          title: "Missing Required Fields",
          description: `Please fill in: ${missingFields.join(', ')}`,
          variant: "destructive"
        });
        return;
      }
    }

    if (!isRecurring) {
      // Single schedule - create for each selected employee
      const schedules = formData.employeeIds.map(employeeId => {
        const employee = selectedEmployees.find(emp => emp.employeeId === employeeId);
        return {
          employeeId: employeeId,
          employeeName: employee.name,
          date: formData.date,
          jobCode: formData.jobCode,
          startTime: formData.startTime,
          endTime: formData.endTime
        };
      });

      if (schedules.length === 1) {
        onSubmit(schedules[0]);
      } else {
        onSubmit({ schedules: schedules, isBatch: true });
      }
    } else {
      // Recurring schedule - create for each selected employee
      const dates = generateDatesInRange(
        recurringData.startDate,
        recurringData.endDate,
        recurringData.daysOfWeek
      );

      const batchSchedules = [];
      formData.employeeIds.forEach(employeeId => {
        const employee = selectedEmployees.find(emp => emp.employeeId === employeeId);
        dates.forEach(date => {
          batchSchedules.push({
            employeeId: employeeId,
            employeeName: employee.name,
            date: date,
            jobCode: formData.jobCode,
            startTime: formData.startTime,
            endTime: formData.endTime
          });
        });
      });

      try {
        // Call the parent's onSubmit function to handle the batch creation
        // This ensures fetchData() is called to refresh the schedule list
        onSubmit({ schedules: batchSchedules, isBatch: true });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create recurring schedules",
          variant: "destructive"
        });
      }
    }
  };

  const handleDelete = async () => {
    if (initialData && onDelete) {
      onDelete(initialData._id);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
        <DialogTitle>
          {initialData ? 'Edit Schedule' : 'Create New Schedule'}
        </DialogTitle>
        <DialogDescription>
          {initialData 
            ? 'Modify schedule details for a specific day.'
            : 'Create a new schedule for an employee with single or recurring dates.'
          }
        </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Selection */}
          {templates.length > 0 && (
            <div className="space-y-2">
              <Label>Import Template (Optional)</Label>
              <div className="flex gap-2">
                <Select onValueChange={handleTemplateSelect} value={selectedTemplate?._id || ""}>
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
                {selectedTemplate && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTemplate(null)}
                    className="px-3"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Employee Selection */}
          <div className="space-y-2">
            <Label>Employee(s) *</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedEmployees.length > 0 
                    ? `${selectedEmployees.length} employee(s) selected`
                    : "Select employee(s)..."
                  }
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search employee..." />
                  <CommandEmpty>No employee found.</CommandEmpty>
                  <CommandGroup>
                    {employees.map((employee) => {
                      const isSelected = selectedEmployees.some(emp => emp._id === employee._id);
                      return (
                        <CommandItem
                          key={employee._id}
                          value={employee.name}
                          onSelect={() => handleEmployeeSelect(employee)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              isSelected ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {employee.name} ({employee.employeeId})
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedEmployees.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedEmployees.map((employee) => (
                  <div
                    key={employee._id}
                    className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                  >
                    {employee.name}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-primary/20"
                      onClick={() => handleEmployeeSelect(employee)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Job Code */}
          <div className="space-y-2">
            <Label>Job Code *</Label>
            <Select
              value={formData.jobCode}
              onValueChange={(value) => setFormData({ ...formData, jobCode: value })}
              disabled={selectedEmployees.length === 0}
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

          {/* Recurring Checkbox */}
          {!initialData && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurring"
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
                <Label htmlFor="recurring" className="cursor-pointer">
                  Recurring Schedule
                </Label>
              </div>
            </div>
          )}

          {/* Date Selection */}
          {!isRecurring ? (
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                autoComplete="off"
                required
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={recurringData.startDate}
                  onChange={(e) => setRecurringData({ ...recurringData, startDate: e.target.value })}
                  autoComplete="off"
                  required
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input
                  type="date"
                  value={recurringData.endDate}
                  onChange={(e) => setRecurringData({ ...recurringData, endDate: e.target.value })}
                  min={recurringData.startDate}
                  autoComplete="off"
                />
              </div>

              {/* Days of Week */}
              <div className="space-y-2">
                <Label>Days of Week</Label>
                <div className="flex gap-4">
                  {Object.entries(recurringData.daysOfWeek).map(([day, checked]) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={day}
                        checked={checked}
                        onCheckedChange={(checked) => setRecurringData({
                          ...recurringData,
                          daysOfWeek: { ...recurringData.daysOfWeek, [day]: checked }
                        })}
                      />
                      <Label htmlFor={day} className="text-sm capitalize cursor-pointer">
                        {day.charAt(0).toUpperCase()}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  M T W T F are selected by default
                </p>
              </div>
            </div>
          )}

          {/* Time and Hours */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Start Time *</Label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                autoComplete="off"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>End Time *</Label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                autoComplete="off"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Hours per Day</Label>
              <div className="p-3 bg-muted rounded-md">
                <span className="text-lg font-medium">{calculatedHours.toFixed(1)} hours</span>
                <span className="text-sm text-muted-foreground ml-2">(Auto-calculated)</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            {initialData && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="mr-auto"
              >
                Delete Schedule
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
        <Button type="submit">
          {initialData ? 'Update' : 'Create'} Schedule
        </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleForm;