import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Calendar as CalendarIcon, List, Check, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import api from '../../lib/axios';
import { useToast } from "@/hooks/use-toast";
import ScheduleForm from './ScheduleForm';
import ScheduleTimeline from './ScheduleTimeline';
import ScheduleWeeklyView from './ScheduleWeeklyView';
import TemplateManagement from './TemplateManagement';
import ConflictResolutionDialog from './ConflictResolutionDialog';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  const [conflictDialog, setConflictDialog] = useState({
    open: false,
    conflicts: [],
    newSchedule: null,
    pendingSchedule: null
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedulesRes, employeesRes, jobCodesRes, templatesRes] = await Promise.all([
        api.get(`/schedules?page=${currentPage}&limit=${pagination.limit}`),
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
      // Get schedules data with pagination
      let schedulesData = [];
      if (schedulesRes.data.schedules) {
        schedulesData = schedulesRes.data.schedules;
        setPagination(schedulesRes.data.pagination);
      } else {
        schedulesData = Array.isArray(schedulesRes.data) ? schedulesRes.data : [];
      }
      
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
      fetchData();
      setShowForm(false);
      setSelectedSchedule(null);
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

  // Removed unused event generation code - we now use ScheduleWeeklyView component

  // Filter schedules based on selected employee
  const filteredSchedules = selectedEmployee
    ? schedules.filter(schedule => schedule.employeeId === selectedEmployee.employeeId)
    : schedules;

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Schedule Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTemplateManagement(true)}>
            <List className="mr-2 h-4 w-4" />
            Manage Templates
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Schedule
          </Button>
        </div>
      </div>

      {/* Tabs for Daily, Weekly and List View */}
      <Tabs defaultValue="daily" className="w-full">
        <div className="flex items-center justify-between gap-4 mb-6">
          {/* Employee Search Combobox - Moved to LEFT */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[300px] justify-between"
              >
                {selectedEmployee
                  ? `${selectedEmployee.name} (${selectedEmployee.employeeId})`
                  : "Select Employees"}
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

          {/* Tab Switcher - Moved to RIGHT */}
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="daily">
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Weekly
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
          />
        </TabsContent>

        <TabsContent value="weekly" className="mt-0">
          <ScheduleWeeklyView
            schedules={filteredSchedules}
            onSelectSchedule={(schedule) => {
              setSelectedSchedule(schedule);
              setShowForm(true);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} schedules
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
              disabled={currentPage === pagination.pages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default ScheduleManagement;

