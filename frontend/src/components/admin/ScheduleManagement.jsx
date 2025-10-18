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

      setSchedules(Array.isArray(schedulesRes.data) ? schedulesRes.data : []);
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

  // Convert schedules to calendar events - generate individual day events
  const events = schedules.flatMap(schedule => {
    const events = [];
    const startDate = moment(schedule.startDate);
    const endDate = moment(schedule.endDate);
    
    let currentDate = startDate.clone();
    
    while (currentDate.isSameOrBefore(endDate, 'day')) {
      const dayOfWeek = currentDate.day();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
      
      // Only add event if includeWeekends is true OR it's not a weekend
      if (schedule.includeWeekends || !isWeekend) {
        // Parse start and end times
        const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
        const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
        
        const eventStart = currentDate.clone().hour(startHour).minute(startMinute).toDate();
        const eventEnd = currentDate.clone().hour(endHour).minute(endMinute).toDate();
        
        events.push({
          id: `${schedule._id}-${currentDate.format('YYYY-MM-DD')}`,
          title: `${schedule.employeeName} - ${schedule.jobCode} (${schedule.hoursPerDay}h)`,
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
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Schedule
        </Button>
      </div>

      {/* Tabs for Timeline, Calendar and List View */}
      <Tabs defaultValue="timeline" className="w-full">
        <div className="flex items-center justify-between gap-4 mb-6">
          <TabsList className="grid grid-cols-3 w-[550px]">
            <TabsTrigger value="timeline">
              Timeline View
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="mr-2 h-4 w-4" />
              List
            </TabsTrigger>
          </TabsList>

          {/* Employee Search Combobox */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[400px] justify-between"
              >
                {selectedEmployee
                  ? `${selectedEmployee.name} (${selectedEmployee.employeeId})`
                  : "Filter by employee..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
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

        <TabsContent value="timeline" className="mt-0">
          <ScheduleTimeline
            schedules={filteredSchedules}
            employees={employees}
            onSelectSchedule={(schedule) => {
              setSelectedSchedule(schedule);
              setShowForm(true);
            }}
          />
        </TabsContent>

        <TabsContent value="calendar" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: '600px' }}>
                <Calendar
                  localizer={localizer}
                  events={filteredEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  views={['month', 'week', 'day', 'agenda']}
                  defaultView="month"
                  step={30}
                  timeslots={2}
                  onSelectEvent={(event) => {
                    setSelectedSchedule(event.resource);
                    setShowForm(true);
                  }}
                  eventPropGetter={() => ({
                    style: {
                      backgroundColor: '#3b82f6',
                      borderRadius: '5px',
                      opacity: 0.8,
                      color: 'white',
                      border: '0px',
                      display: 'block'
                    }
                  })}
                  formats={{
                    agendaHeaderFormat: ({ start, end }) => 
                      `${moment(start).format('MMM DD')} - ${moment(end).format('MMM DD, YYYY')}`,
                    agendaDateFormat: 'ddd MMM DD',
                    agendaTimeFormat: 'h:mm A',
                    agendaTimeRangeFormat: ({ start, end }) => 
                      `${moment(start).format('h:mm A')} - ${moment(end).format('h:mm A')}`,
                  }}
                  messages={{
                    agenda: 'Schedule List',
                    date: 'Date',
                    time: 'Time',
                    event: 'Schedule',
                  }}
                />
              </div>
            </CardContent>
          </Card>
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
          onClose={() => {
            setShowForm(false);
            setSelectedSchedule(null);
          }}
          initialData={selectedSchedule}
        />
      )}
    </div>
  );
};

export default ScheduleManagement;

