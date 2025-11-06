import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Calendar as CalendarIcon, List, Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import api from '../../lib/axios';
import { useToast } from "@/hooks/use-toast";
import ScheduleForm from './ScheduleForm';
import ScheduleTimeline from './ScheduleTimeline';
import ScheduleWeeklyView from './ScheduleWeeklyView';
import ScheduleUpcomingView from './ScheduleUpcomingView';
import TemplateManagement from './TemplateManagement';
import ConflictResolutionDialog from './ConflictResolutionDialog';
import BulkUpdateDialog from './BulkUpdateDialog';
import BulkDeleteDialog from './BulkDeleteDialog';
import { getDepartmentConfig } from '../../lib/departments';

// Utility function to convert 24-hour time to 12-hour format
const formatTime12Hour = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minutes} ${ampm}`;
};

// Map Tailwind colors to hex values for calendar
const tailwindToHex = {
  'text-purple-500': '#a855f7',
  'text-blue-500': '#3b82f6',
  'text-emerald-500': '#10b981',
  'text-green-500': '#22c55e',
  'text-teal-500': '#14b8a6',
  'text-orange-500': '#f97316',
  'text-indigo-500': '#6366f1',
  'text-amber-500': '#f59e0b',
  'text-red-500': '#ef4444',
  'text-gray-500': '#6b7280'
};

// Get department color for schedule
const getDepartmentColor = (department) => {
  const deptConfig = getDepartmentConfig(department);
  return tailwindToHex[deptConfig.color] || '#3b82f6';
};

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [jobCodes, setJobCodes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showTemplateManagement, setShowTemplateManagement] = useState(false);
  const [conflictDialog, setConflictDialog] = useState({
    open: false,
    conflicts: [],
    newSchedule: null,
    pendingSchedule: null
  });
  
  // Bulk operations state
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkUpdateDialog, setBulkUpdateDialog] = useState({ 
    open: false, 
    schedules: [], 
    updates: {} 
  });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState({ 
    open: false, 
    schedules: [] 
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedulesRes, employeesRes, jobCodesRes, templatesRes] = await Promise.all([
        api.get('/schedules'),
        api.get('/employees'),
        api.get('/job-codes?limit=1000'), // Get all job codes
        api.get('/schedule-templates')
      ]);

      // Get employees data
      const employeesData = Array.isArray(employeesRes.data) ? employeesRes.data : (employeesRes.data.data || []);
      
      // Enhance employees with their job codes from the JobCode model
      // Handle paginated response from job-codes endpoint
      const jobCodesData = Array.isArray(jobCodesRes.data) 
        ? jobCodesRes.data 
        : (jobCodesRes.data.jobCodes || []);
      
      // Map employees with their assigned job codes
      const employeesWithJobCodes = employeesData.map(emp => {
        const empJobCodes = jobCodesData.filter(jc => {
          // Check if this job code is assigned to this employee
          const isAssigned = jc.assignedTo?.some(assignment => {
            const assignmentEmpId = assignment.employee?._id?.toString() || assignment.employee?.toString();
            return assignmentEmpId === emp._id?.toString();
          });
          return isAssigned;
        });
        
        return {
          ...emp,
          jobCodes: empJobCodes
        };
      });

      // Enhance schedules with employee department info
      // Get all schedules data (now returns array directly)
      const schedulesData = Array.isArray(schedulesRes.data) ? schedulesRes.data : [];
      
      const enhancedSchedules = schedulesData.map(schedule => {
        const employee = employeesData.find(emp => emp.employeeId === schedule.employeeId);
        return {
          ...schedule,
          employeeDepartment: employee?.department || schedule.employee?.department || 'Other'
        };
      });

      setSchedules(enhancedSchedules);
      setEmployees(employeesWithJobCodes);
      setJobCodes(jobCodesData);
      setTemplates(Array.isArray(templatesRes.data) ? templatesRes.data : []);
      
      console.log('Schedules loaded:', enhancedSchedules.length);
      console.log('Sample schedule:', enhancedSchedules[0]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load schedule data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (scheduleData) => {
    try {
      if (selectedSchedule) {
        // Update existing schedule
        await api.put(`/schedules/${selectedSchedule._id}`, scheduleData);
        toast({
          title: "Success",
          description: scheduleData.modifySpecificDates 
            ? "Schedule updated with specific date modifications"
            : "Schedule updated successfully"
        });
      } else if (scheduleData.isBatch) {
        // Create batch schedules
        const response = await api.post('/schedules/batch', {
          schedules: scheduleData.schedules
        });
        toast({
          title: "Success",
          description: `Created ${response.data.schedules.length} schedules`,
          variant: "default"
        });
      } else {
        // Create single schedule
        await api.post('/schedules', scheduleData);
        toast({
          title: "Success",
          description: "Schedule created successfully"
        });
      }
      fetchData();
      setShowForm(false);
      setSelectedSchedule(null);
    } catch (error) {
      console.error('Error saving schedule:', error);
      
      // Handle conflict errors specifically
      if (error.response?.status === 409) {
        const conflicts = error.response.data.conflicts;
        
        console.log('Conflict data received:', conflicts);
        console.log('Schedule data:', scheduleData);
        
        // Show conflict resolution dialog instead of toast
        setConflictDialog({
          open: true,
          conflicts: conflicts,
          newSchedule: scheduleData,
          pendingSchedule: scheduleData
        });
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to save schedule",
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await api.delete(`/schedules/${id}`);
      toast({
        title: "Success",
        description: "Schedule deleted successfully"
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive"
      });
    }
  };

  const handleOverrideConflict = async () => {
    try {
      const { pendingSchedule } = conflictDialog;
      
      console.log('Override conflict - pendingSchedule:', pendingSchedule);
      console.log('Override conflict - conflicts:', conflictDialog.conflicts);
      
      // First, delete conflicting schedules - handle errors gracefully
      const conflicts = conflictDialog.conflicts;
      console.log('Conflicts to delete:', conflicts);
      
      const deletePromises = conflicts
        .filter(conflict => conflict._id)
        .map(async (conflict) => {
          try {
            await api.delete(`/schedules/${conflict._id}`);
            return { success: true, id: conflict._id };
          } catch (error) {
            console.warn(`Failed to delete schedule ${conflict._id}:`, error.message);
            return { success: false, id: conflict._id, error: error.message };
          }
        });
      
      const deleteResults = await Promise.all(deletePromises);
      const successfulDeletes = deleteResults.filter(result => result.success).length;
      const failedDeletes = deleteResults.filter(result => !result.success);
      
      if (failedDeletes.length > 0) {
        console.warn('Some conflicts could not be deleted:', failedDeletes);
      }
      
      // Then create the new schedule
      if (pendingSchedule.isBatch) {
        await api.post('/schedules/batch', {
          schedules: pendingSchedule.schedules,
          skipConflictCheck: true
        });
        toast({
          title: "Success",
          description: `Overrode ${successfulDeletes} conflicts and created ${pendingSchedule.schedules.length} schedules`,
          variant: "default"
        });
      } else {
        await api.post('/schedules', {
          ...pendingSchedule,
          skipConflictCheck: true
        });
        toast({
          title: "Success",
          description: `Overrode ${successfulDeletes} conflicts and created schedule successfully`
        });
      }
      
      // Close dialog and refresh data
      setConflictDialog({ open: false, conflicts: [], newSchedule: null, pendingSchedule: null });
      setShowForm(false);
      setSelectedSchedule(null);
      
      // Add a small delay to ensure backend operations complete
      setTimeout(async () => {
        console.log('Refreshing data after override...');
        try {
          await fetchData();
          console.log('Data refresh completed successfully');
        } catch (error) {
          console.error('Error during data refresh:', error);
        }
      }, 500);
    } catch (error) {
      console.error('Error overriding conflict:', error);
      toast({
        title: "Error",
        description: "Failed to override conflicting schedules",
        variant: "destructive"
      });
    }
  };

  const handleCancelConflict = () => {
    setConflictDialog({ open: false, conflicts: [], newSchedule: null, pendingSchedule: null });
  };

  // Bulk operations functions
  const handleScheduleSelect = (scheduleId, isSelected) => {
    if (isSelected) {
      setSelectedSchedules(prev => [...prev, scheduleId]);
    } else {
      setSelectedSchedules(prev => prev.filter(id => id !== scheduleId));
    }
  };

  const handleSelectAll = (schedulesToSelect) => {
    const scheduleIds = schedulesToSelect.map(s => s._id);
    setSelectedSchedules(scheduleIds);
  };

  const handleClearSelection = () => {
    setSelectedSchedules([]);
  };

  const handleDateRangeSelect = async () => {
    if (!dateRange.start || !dateRange.end) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await api.get(`/schedules/bulk/date-range?startDate=${dateRange.start}&endDate=${dateRange.end}`);
      const scheduleIds = response.data.schedules.map(s => s._id);
      setSelectedSchedules(scheduleIds);
    } catch (error) {
      console.error('Error selecting date range:', error);
      toast({
        title: "Error",
        description: "Failed to select schedules in date range",
        variant: "destructive"
      });
    }
  };

  const handleBulkUpdate = () => {
    const selectedScheduleData = schedules.filter(s => selectedSchedules.includes(s._id));
    setBulkUpdateDialog({
      open: true,
      schedules: selectedScheduleData,
      updates: {}
    });
  };

  const handleBulkDelete = () => {
    const selectedScheduleData = schedules.filter(s => selectedSchedules.includes(s._id));
    setBulkDeleteDialog({
      open: true,
      schedules: selectedScheduleData
    });
  };

  const executeBulkUpdate = async (updates) => {
    try {
      await api.put('/schedules/bulk-update', {
        scheduleIds: selectedSchedules,
        updates: updates
      });

      toast({
        title: "Success",
        description: `Updated ${selectedSchedules.length} schedules`,
        variant: "default"
      });

      setBulkUpdateDialog({ open: false, schedules: [], updates: {} });
      setSelectedSchedules([]);
      fetchData();
    } catch (error) {
      console.error('Error updating schedules:', error);
      toast({
        title: "Error",
        description: "Failed to update schedules",
        variant: "destructive"
      });
    }
  };

  const executeBulkDelete = async () => {
    try {
      await api.delete('/schedules/bulk-delete-by-ids', {
        data: { scheduleIds: selectedSchedules }
      });

      toast({
        title: "Success",
        description: `Deleted ${selectedSchedules.length} schedules`,
        variant: "default"
      });

      setBulkDeleteDialog({ open: false, schedules: [] });
      setSelectedSchedules([]);
      fetchData();
    } catch (error) {
      console.error('Error deleting schedules:', error);
      toast({
        title: "Error",
        description: "Failed to delete schedules",
        variant: "destructive"
      });
    }
  };

  // Update showBulkActions based on selectedSchedules
  useEffect(() => {
    setShowBulkActions(selectedSchedules.length > 0);
  }, [selectedSchedules]);

  // Removed unused event generation code - we now use ScheduleWeeklyView component

  // Filter schedules based on selected employee
  const filteredSchedules = selectedEmployee
    ? schedules.filter(schedule => schedule.employeeId === selectedEmployee.employeeId)
    : schedules;

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schedule Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and view employee schedules</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Compact Select Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Select:</span>
            <div className="flex items-center gap-1">
              <div className="relative">
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-[120px] h-9 pr-8 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full cursor-pointer"
                />
                <CalendarIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              <span className="text-xs text-muted-foreground">to</span>
              <div className="relative">
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-[120px] h-9 pr-8 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full cursor-pointer"
                />
                <CalendarIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              <Button 
                onClick={handleDateRangeSelect}
                variant="outline"
                size="sm"
                disabled={!dateRange.start || !dateRange.end}
                className="h-9"
              >
                Select Range
              </Button>
              {selectedSchedules.length > 0 && (
                <Button 
                  onClick={handleClearSelection}
                  variant="ghost"
                  size="sm"
                  className="h-9"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear ({selectedSchedules.length})
                </Button>
              )}
            </div>
          </div>
          <div className="flex gap-2 ml-auto lg:ml-0">
            <Button variant="outline" size="sm" onClick={() => setShowTemplateManagement(true)}>
              <List className="mr-2 h-4 w-4" />
              Templates
            </Button>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar - Fixed space to prevent layout shift */}
      <div className="h-[30px] transition-opacity duration-200">
        {showBulkActions ? (
          <Card className="h-full">
            <CardContent className="p-1.5 h-full flex items-center">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 w-full">
                <div className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium">
                    {selectedSchedules.length} schedule{selectedSchedules.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <Button 
                    onClick={handleBulkUpdate}
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                  >
                    Update
                  </Button>
                  <Button 
                    onClick={handleBulkDelete}
                    variant="destructive"
                    size="sm"
                    className="h-7 px-2 text-xs"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="h-full" />
        )}
      </div>

      {/* Tabs for Daily, Weekly and List View */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="daily" className="w-full">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
              {/* Employee Search Combobox */}
              <div className="w-full lg:w-auto">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full lg:w-[300px] justify-between"
                    >
                      {selectedEmployee
                        ? `${selectedEmployee.name} (${selectedEmployee.employeeId})`
                        : "Filter by Employee"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Search employee..." />
                      <CommandEmpty>No employee found.</CommandEmpty>
                      <CommandGroup className="max-h-[300px] overflow-y-auto">
                        <CommandItem
                          value="all"
                          onSelect={() => {
                            setSelectedEmployee(null);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              !selectedEmployee ? "opacity-100" : "opacity-0"
                            )}
                          />
                          All Employees
                        </CommandItem>
                        {employees.map((emp) => (
                          <CommandItem
                            key={emp._id}
                            value={`${emp.name} ${emp.employeeId}`}
                            onSelect={() => {
                              setSelectedEmployee(emp);
                              setOpen(false);
                            }}
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

              {/* Tab Switcher */}
              <TabsList className="grid grid-cols-3 w-full lg:w-auto lg:min-w-[400px]">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Weekly
                </TabsTrigger>
                <TabsTrigger value="upcoming">
                  <List className="mr-2 h-4 w-4" />
                  Upcoming
                </TabsTrigger>
              </TabsList>
            </div>

        <TabsContent value="daily" className="mt-0">
          <ScheduleTimeline
            schedules={filteredSchedules}
            employees={employees}
            onSelectSchedule={(schedule) => {
              setSelectedSchedule(schedule);
              setShowForm(true);
            }}
            selectedSchedules={selectedSchedules}
            onScheduleSelect={handleScheduleSelect}
            onSelectAll={handleSelectAll}
          />
        </TabsContent>

        <TabsContent value="weekly" className="mt-0">
          <ScheduleWeeklyView
            schedules={filteredSchedules}
            onSelectSchedule={(schedule) => {
              setSelectedSchedule(schedule);
              setShowForm(true);
            }}
            selectedSchedules={selectedSchedules}
            onScheduleSelect={handleScheduleSelect}
            onSelectAll={handleSelectAll}
          />
        </TabsContent>

        <TabsContent value="upcoming" className="mt-0">
          <ScheduleUpcomingView
            schedules={filteredSchedules}
            onSelectSchedule={(schedule) => {
              setSelectedSchedule(schedule);
              setShowForm(true);
            }}
          />
        </TabsContent>
          </Tabs>
        </CardContent>
      </Card>


      {/* Schedule Form Dialog */}
      {showForm && (
        <ScheduleForm
          employees={employees}
          jobCodes={jobCodes}
          templates={templates}
          onSubmit={handleCreateSchedule}
          onDelete={handleDeleteSchedule}
          onClose={() => {
            setShowForm(false);
            setSelectedSchedule(null);
          }}
          initialData={selectedSchedule}
        />
      )}

      {/* Template Management Dialog */}
      {showTemplateManagement && (
        <TemplateManagement
          open={showTemplateManagement}
          onClose={() => setShowTemplateManagement(false)}
          jobCodes={jobCodes}
        />
      )}

      {/* Conflict Resolution Dialog */}
      <ConflictResolutionDialog
        open={conflictDialog.open}
        onClose={handleCancelConflict}
        conflicts={conflictDialog.conflicts}
        newSchedule={conflictDialog.newSchedule}
        onOverride={handleOverrideConflict}
        onCancel={handleCancelConflict}
      />

      {/* Bulk Update Dialog */}
      <BulkUpdateDialog
        open={bulkUpdateDialog.open}
        onClose={() => setBulkUpdateDialog({ open: false, schedules: [], updates: {} })}
        schedules={bulkUpdateDialog.schedules}
        onConfirm={executeBulkUpdate}
        jobCodes={jobCodes}
      />

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        open={bulkDeleteDialog.open}
        onClose={() => setBulkDeleteDialog({ open: false, schedules: [] })}
        schedules={bulkDeleteDialog.schedules}
        onConfirm={executeBulkDelete}
      />
    </div>
  );
};

export default ScheduleManagement;

