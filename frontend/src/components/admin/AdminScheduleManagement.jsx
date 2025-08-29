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
      const response = await api.get('/schedules');
      setSchedules(response.data.schedules || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
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
    setSelectedEmployee(employee);
    setSearchTerm(''); // Clear search when employee is selected
  };

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

  const handleCreateSchedule = async (scheduleData) => {
    try {
      setLoading(true);
      
      const response = await api.post('/schedules', scheduleData);
      
      toast({
        title: "Success",
        description: "Schedule created successfully!",
      });
      
      setShowScheduleForm(false);
      fetchSchedules();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create schedule",
        variant: "destructive",
      });
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
    return schedules.filter(schedule => schedule.employeeId === employeeId);
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
      {!searchTerm.trim() && employees.length > 0 && schedules.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">No schedules found in the system</p>
              <p className="text-sm text-gray-400">Select an employee and create schedules to get started</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Company Defaults Message */}
      {!searchTerm.trim() && employees.length > 0 && companyDefaults.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">No company default schedules found</p>
              <p className="text-sm text-gray-400">Company defaults need to be configured by administrators</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Job Codes Message */}
      {!searchTerm.trim() && employees.length > 0 && jobCodes.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">No job codes found</p>
              <p className="text-sm text-gray-400">Job codes need to be configured before creating schedules</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Welcome Message */}
      {!searchTerm.trim() && employees.length > 0 && schedules.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">Welcome to Schedule Management</p>
              <p className="text-sm text-gray-400">Search for an employee to manage their schedules</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!searchTerm.trim() && employees.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                💡 <strong>Tip:</strong> Use the search bar above to find employees by name or ID
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {!searchTerm.trim() && employees.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-4">
              <div className="flex gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCompanyDefault(true)}
                  disabled={companyDefaults.length === 0}
                >
                  View Company Defaults
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCompanyDefault(true)}
                  disabled={jobCodes.length === 0}
                >
                  View Job Codes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-400">
          Schedule Management System • {new Date().getFullYear()}
        </p>
      </div>











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
              <div className="space-y-4">
                {getEmployeeSchedules(selectedEmployee.employeeId).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2">No schedules found for this employee</p>
                    <p className="text-sm text-gray-400">Create a new schedule to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getEmployeeSchedules(selectedEmployee.employeeId).map((schedule) => (
                      <div key={schedule._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">
                              {formatDate(schedule.weekStartDate)} - {formatDate(schedule.weekEndDate)}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {schedule.totalWeeklyHours} hours • ${schedule.totalWeeklyPay}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(schedule.status)}>
                              {schedule.status}
                            </Badge>
                            <Badge variant="outline">
                              {schedule.approvalStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Schedule Form */}
      {showScheduleForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Schedule for {selectedEmployee?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {jobCodes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">No job codes found</p>
                <p className="text-sm text-gray-400">Job codes need to be configured before creating schedules</p>
              </div>
            ) : (
              <ScheduleForm
                employee={selectedEmployee}
                jobCodes={jobCodes}
                onSubmit={handleCreateSchedule}
                onCancel={() => setShowScheduleForm(false)}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Company Default Dialog */}
      <Dialog open={showCompanyDefault} onOpenChange={setShowCompanyDefault}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Company Default Schedules</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {companyDefaults.length > 0 ? (
              companyDefaults.map((defaultSchedule) => (
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
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">No company default schedules found</p>
                <p className="text-sm text-gray-400">Company defaults need to be configured by administrators</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminScheduleManagement; 