import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Calendar as CalendarIcon, List, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import api from '../../lib/axios';
import { useToast } from "@/hooks/use-toast";
import ScheduleForm from './ScheduleForm';
import ScheduleList from './ScheduleList';
import ScheduleTimeline from './ScheduleTimeline';
import ScheduleWeeklyView from './ScheduleWeeklyView';
import TemplateManagement from './TemplateManagement';
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

const localizer = momentLocalizer(moment);

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [jobCodes, setJobCodes] = useState([]);
  const [companyDefaults, setCompanyDefaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showTemplateManagement, setShowTemplateManagement] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedulesRes, employeesRes, jobCodesRes, defaultsRes] = await Promise.all([
        api.get('/schedules'),
        api.get('/employees'),
        api.get('/job-codes?limit=1000'), // Get all job codes
        api.get('/schedules/company-defaults')
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
      setCompanyDefaults(Array.isArray(defaultsRes.data) ? defaultsRes.data : []);
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
      await api.post('/schedules', scheduleData);
      toast({
        title: "Success",
        description: "Schedule created successfully"
      });
      fetchData();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create schedule",
        variant: "destructive"
      });
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

  // Helper to check if a day should be included
  const isDayEnabled = (date, daysOfWeek) => {
    const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayMap[date.day()];
    return daysOfWeek && daysOfWeek[dayName] === true;
  };

  // Convert schedules to calendar events - generate individual day events
  const events = schedules.flatMap(schedule => {
    const events = [];
    const startDate = moment(schedule.startDate);
    const endDate = moment(schedule.endDate);
    
    let currentDate = startDate.clone();
    
    while (currentDate.isSameOrBefore(endDate, 'day')) {
      // Only add event if this day is enabled in daysOfWeek
      if (isDayEnabled(currentDate, schedule.daysOfWeek)) {
        // Parse start and end times
        const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
        const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
        
        const eventStart = currentDate.clone().hour(startHour).minute(startMinute).toDate();
        const eventEnd = currentDate.clone().hour(endHour).minute(endMinute).toDate();
        
        events.push({
          id: `${schedule._id}-${currentDate.format('YYYY-MM-DD')}`,
          title: `${schedule.employeeName} - ${schedule.jobCode} (${schedule.hoursPerDay}h) - ${formatTime12Hour(schedule.startTime)} to ${formatTime12Hour(schedule.endTime)}`,
          start: eventStart,
          end: eventEnd,
          resource: schedule,
          allDay: false
        });
      }
      
      currentDate.add(1, 'day');
    }
    
    return events;
  });

  // Filter schedules based on selected employee
  const filteredSchedules = selectedEmployee
    ? schedules.filter(schedule => schedule.employeeId === selectedEmployee.employeeId)
    : schedules;

  const filteredEvents = selectedEmployee
    ? events.filter(event => event.resource.employeeId === selectedEmployee.employeeId)
    : events;

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
          <TabsList className="grid grid-cols-3 w-[550px]">
            <TabsTrigger value="daily">
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="mr-2 h-4 w-4" />
              List
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

        <TabsContent value="list" className="mt-0">
          <ScheduleList
            schedules={filteredSchedules}
            onDelete={handleDeleteSchedule}
            onEdit={(schedule) => {
              setSelectedSchedule(schedule);
              setShowForm(true);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Schedule Form Dialog */}
      {showForm && (
        <ScheduleForm
          employees={employees}
          jobCodes={jobCodes}
          companyDefaults={companyDefaults}
          existingSchedules={schedules}
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
    </div>
  );
};

export default ScheduleManagement;

