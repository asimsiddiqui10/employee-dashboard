import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import api from '../../lib/axios';
import ScheduleForm from './ScheduleForm';
import ScheduleCalendar from './ScheduleCalendar';

const AdminScheduleManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [companyDefaults, setCompanyDefaults] = useState([]);
  const [jobCodes, setJobCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [showCompanyDefault, setShowCompanyDefault] = useState(false);
  const [viewMode, setViewMode] = useState('calendar'); // 'list' or 'calendar'
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const { toast } = useToast();



  useEffect(() => {
    const fetchAllData = async () => {
      setFetchingData(true);
      try {
        await Promise.all([
          fetchEmployees(),
          fetchSchedules(),
          fetchCompanyDefaults(),
          fetchJobCodes()
        ]);
      } finally {
        setFetchingData(false);
      }
    };
    
    fetchAllData();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to fetch employees');
    }
  };

  const fetchSchedules = async () => {
    try {
      if (!selectedEmployee) {
        console.log('No employee selected, skipping schedule fetch');
        return;
      }
      
      console.log('Fetching schedules for employee:', selectedEmployee.employeeId);
      console.log('Making API call to:', `/schedules/employee/${selectedEmployee.employeeId}`);
      
      const response = await api.get(`/schedules/employee/${selectedEmployee.employeeId}`);
      console.log('Schedules API response:', response);
      console.log('Schedules data:', response.data);
      console.log('Schedules array length:', response.data?.length || 0);
      
      setSchedules(response.data || []);
      console.log('Set schedules state to:', response.data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
    }
  };

  const fetchCompanyDefaults = async () => {
    try {
      const response = await api.get('/company-defaults');
      setCompanyDefaults(response.data);
    } catch (error) {
      console.error('Error fetching company defaults:', error);
    }
  };

  const fetchJobCodes = async () => {
    try {
      const response = await api.get('/job-codes/active/all');
      setJobCodes(response.data);
    } catch (error) {
      console.error('Error fetching job codes:', error);
    }
  };

  const handleEmployeeSelect = (employee) => {
    console.log('Employee selected:', employee);
    setSelectedEmployee(employee);
    setSearchTerm(''); // Clear search when employee is selected
  };

  // Fetch schedules when employee is selected
  useEffect(() => {
    if (selectedEmployee) {
      console.log('Employee selected, fetching schedules for:', selectedEmployee.employeeId);
      fetchSchedules();
    }
  }, [selectedEmployee]);

  const handleAddSchedule = () => {
    if (!selectedEmployee) {
      toast({
        title: "Error",
        description: "Please select an employee first",
        variant: "destructive",
      });
      return;
    }
    setShowScheduleForm(true);
  };

  const handleCompanyDefault = () => {
    setShowCompanyDefault(true);
  };

  // Add this function to calculate recurring dates
  const calculateRecurringDates = () => {
    if (!formData.isRecurring) return [];
    
    const startDate = new Date(formData.date);
    const endDate = formData.recurringOptions.endDate ? new Date(formData.recurringOptions.endDate) : null;
    
    if (!endDate) return [];
    
    const dates = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      
      // Skip weekends if includeWeekends is false
      if (!formData.recurringOptions.includeWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }
      
      // Add the date to the array
      dates.push(new Date(currentDate));
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  // Helper function to calculate total hours for a schedule
  const calculateScheduleTotalHours = (schedules) => {
    return schedules.reduce((total, slot) => {
      if (slot.enabled && !slot.isBreak) {
        return total + (slot.hours || 0);
      }
      return total;
    }, 0);
  };

  // Update the handleCreateSchedule function
  const handleCreateSchedule = async (formData) => {
    try {
      setLoading(true);

      console.log('Creating schedule with form data:', formData);

      // Handle recurring schedules
      let allSchedules = [];

      if (formData.isRecurring && formData.recurringDates && formData.recurringDates.length > 0) {
        console.log('Creating recurring schedules for dates:', formData.recurringDates);
        console.log('Time slots:', formData.timeSlots);

        // Create schedules for each recurring date
        formData.recurringDates.forEach(dateStr => {
          const daySchedules = formData.timeSlots.map(slot => {
            const calculatedHours = slot.isBreak ? 0 : calculateHours(slot.startTime, slot.endTime);

            const scheduleEntry = {
              date: dateStr,
              enabled: true,
              startTime: slot.startTime,
              endTime: slot.endTime,
              hours: calculatedHours,
              jobCode: slot.jobCode || 'ACT001',
              rate: slot.rate || 'NA',
              isBreak: slot.isBreak,
              notes: formData.notes
            };

            console.log('Created schedule entry:', scheduleEntry);
            return scheduleEntry;
          });

          allSchedules.push(...daySchedules);
        });
      } else {
        console.log('Creating single day schedule for date:', formData.date);
        console.log('Time slots:', formData.timeSlots);

        // Single day schedule - create all time slots for the same date
        const selectedDateSchedules = formData.timeSlots.map(slot => {
          const calculatedHours = slot.isBreak ? 0 : calculateHours(slot.startTime, slot.endTime);

          const scheduleEntry = {
            date: formData.date,
            enabled: true,
            startTime: slot.startTime,
            endTime: slot.endTime,
            hours: calculatedHours,
            jobCode: slot.jobCode || 'ACT001',
            rate: slot.rate || 'NA',
            isBreak: slot.isBreak,
            notes: formData.notes
          };

          console.log('Created schedule entry:', scheduleEntry);
          return scheduleEntry;
        });

        // Add all time slots to the schedules array
        allSchedules.push(...selectedDateSchedules);
      }

      console.log('All schedules created:', allSchedules);

      const schedulePayload = {
        employeeId: selectedEmployee.employeeId,
        schedules: allSchedules,
        isRecurring: formData.isRecurring,
        notes: formData.notes
      };

      console.log('Schedule payload being sent:', schedulePayload);

      const response = await api.post('/schedules', schedulePayload);

      console.log('Schedule creation response:', response.data);

      toast({
        title: "Success",
        description: "Schedule created successfully!",
      });

      setShowScheduleForm(false);

      // Immediately refresh schedules
      console.log('Immediately fetching updated schedules...');
      await fetchSchedules();

    } catch (error) {
      console.error('Schedule creation error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      // Handle conflict errors with better messaging
      if (error.response?.status === 409) {
        const errorData = error.response.data;
        if (errorData.conflicts && errorData.conflicts.length > 0) {
          const conflictMessages = errorData.conflicts.map(conflict =>
            `${conflict.date}: ${conflict.newSchedule} conflicts with ${conflict.existingSchedule}`
          ).join('\n');

          toast({
            title: "Schedule Conflict",
            description: `Time conflicts detected:\n${conflictMessages}`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Schedule Conflict",
            description: errorData.message || "Time conflicts detected. Please adjust your schedule times.",
            variant: "destructive",
          });
        }
      } else {
        // Show more detailed error message
        const errorMessage = error.response?.data?.error || "Failed to create schedule";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };



  const handleCreateFromCompanyDefault = async (companyDefault) => {
    try {
      setLoading(true);
      
      const weekStartDate = new Date();
      weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay() + 1); // Monday
      
      const response = await api.post('/schedules/from-company-default', {
        employeeId: selectedEmployee.employeeId,
        weekStartDate: weekStartDate.toISOString().split('T')[0],
        companyDefaultId: companyDefault._id
      });
      
      toast({
        title: "Success",
        description: `Schedule created from ${companyDefault.name} successfully!`,
      });
      
      setShowCompanyDefault(false);
      fetchSchedules();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create schedule from company default",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEmployeeSchedules = (employeeId) => {
    console.log('Getting schedules for employee:', employeeId);
    console.log('All schedules in state:', schedules);
    console.log('Schedules array length:', schedules?.length || 0);
    
    const employeeSchedules = schedules.filter(schedule => {
      console.log('Checking schedule:', schedule);
      console.log('Schedule employeeId:', schedule.employeeId);
      console.log('Looking for employeeId:', employeeId);
      console.log('Match:', schedule.employeeId === employeeId);
      return schedule.employeeId === employeeId;
    });
    
    console.log('Filtered schedules for employee:', employeeSchedules);
    console.log('Filtered schedules length:', employeeSchedules.length);
    return employeeSchedules;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to calculate hours between two time strings
  const calculateHours = (startTime, endTime) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const hours = (end - start) / (1000 * 60 * 60);
    return Math.max(0, hours);
  };

  // Helper function to calculate minutes between two time strings
  const calculateMinutes = (startTime, endTime) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const minutes = (end - start) / (1000 * 60);
    return Math.max(0, minutes);
  };

  // Helper function to get recurring days based on options
  const getRecurringDays = (recurringOptions) => {
    if (recurringOptions.type === 'thisWeek') {
      return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    } else if (recurringOptions.type === 'tillWhen') {
      // For now, return weekdays. This could be expanded based on the end date
      return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    } else if (recurringOptions.type === 'custom') {
      // Return weekdays by default, but could be expanded
      return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    }
    return [];
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schedule management...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Schedule Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowCompanyDefault(true)} variant="outline" disabled={loading}>
            Company Default
          </Button>
          <Button onClick={() => setShowScheduleForm(true)} disabled={!selectedEmployee || loading}>
            Add New Schedule
          </Button>
          <Button 
            onClick={fetchSchedules} 
            disabled={!selectedEmployee || loading}
            variant="outline"
          >
            Refresh Schedules
          </Button>
        </div>
      </div>

      {/* Search and Employee Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Label htmlFor="search">Search Employees</Label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value.trim().length > 0) {
                      setSelectedEmployee(null); // Clear selection when searching
                    }
                  }}
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setSearchTerm('')}
                  >
                    ×
                  </Button>
                )}
              </div>
            </div>
            <div className="flex-1">
              <Label>Selected Employee</Label>
              <div className="text-sm text-gray-600">
                {selectedEmployee ? (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedEmployee.name}</span>
                    <Badge variant="secondary">{selectedEmployee.employeeId}</Badge>
                    <Badge variant="outline">{selectedEmployee.employmentType || 'Unknown'}</Badge>
                  </div>
                ) : (
                  <span className="text-gray-400">No employee selected</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchTerm.trim().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results ({filteredEmployees.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredEmployees.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee._id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedEmployee?._id === employee._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleEmployeeSelect(employee)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{employee.name}</h3>
                        <p className="text-sm text-gray-600">{employee.employeeId}</p>
                        <p className="text-sm text-gray-500">{employee.department || 'No Department'}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{employee.employmentType || 'Unknown'}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">No employees found matching "{searchTerm}"</p>
                <p className="text-sm text-gray-400">Try searching with a different name or employee ID</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Employees Message */}
      {!searchTerm.trim() && employees.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">No employees found in the system</p>
              <p className="text-sm text-gray-400">Employees need to be added before schedules can be managed</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Schedules Message */}



      {/* Schedule Views */}
      {selectedEmployee && (
        <Card>
          <CardHeader>
            <CardTitle>Schedules for {selectedEmployee.name}</CardTitle>
            <div className="flex gap-2">
              <Tabs value={viewMode} onValueChange={setViewMode}>
                <TabsList>
                  <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                  <TabsTrigger value="list">List View</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === 'calendar' ? (
              <ScheduleCalendar 
                schedules={getEmployeeSchedules(selectedEmployee.employeeId)}
                employee={selectedEmployee}
              />
            ) : (
              <div className="space-y-2">
                {getEmployeeSchedules(selectedEmployee.employeeId).length > 0 ? (
                  <div className="space-y-2">
                    {getEmployeeSchedules(selectedEmployee.employeeId).map((schedule) => (
                      <div key={schedule._id} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4 flex-1">
                            {/* Schedule Details */}
                            <div className="flex-1">
                              {schedule.schedules.map((slot, index) => (
                                <div key={index} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-1">
                                  <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {new Date(slot.date).toLocaleDateString()}
                                  </span>
                                  <span>{slot.startTime} - {slot.endTime}</span>
                                  <span className="font-medium">{slot.hours}h</span>
                                  <span className="text-blue-600 dark:text-blue-400">{slot.jobCode}</span>
                                  {slot.isBreak && <span className="text-orange-600">(Break)</span>}
                                </div>
                              ))}
                            </div>
                            
                            {/* Total Hours */}
                            <div className="text-right min-w-[80px]">
                              <span className="font-bold text-gray-900 dark:text-gray-100">
                                {schedule.schedules.reduce((total, slot) => {
                                  if (slot.enabled && !slot.isBreak) {
                                    return total + (slot.hours || 0);
                                  }
                                  return total;
                                }, 0)}h
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No schedules found for this employee
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Schedule Form Modal */}
      <ScheduleForm
        employee={selectedEmployee}
        jobCodes={jobCodes}
        onSubmit={handleCreateSchedule}
        onCancel={() => setShowScheduleForm(false)}
        isOpen={showScheduleForm}
      />

      {/* Company Default Dialog */}
      <Dialog open={showCompanyDefault} onOpenChange={setShowCompanyDefault}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Company Default Schedules</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {companyDefaults.length > 0 && companyDefaults.map((defaultSchedule) => (
              <div key={defaultSchedule._id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{defaultSchedule.name}</h4>
                    <p className="text-sm text-gray-600">{defaultSchedule.description}</p>
                    <p className="text-sm text-gray-500">
                      {defaultSchedule.defaultJobCode} • ${defaultSchedule.defaultRate}/hr
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {defaultSchedule.isDefault && (
                      <Badge className="bg-green-100 text-green-800">Default</Badge>
                    )}
                    <Button
                      onClick={() => handleCreateFromCompanyDefault(defaultSchedule)}
                      disabled={loading || !selectedEmployee}
                      size="sm"
                    >
                      Use This
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminScheduleManagement; 