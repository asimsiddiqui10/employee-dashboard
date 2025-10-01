import React, { useState, useEffect, useMemo } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showCompanyDefault, setShowCompanyDefault] = useState(false);
  const [viewMode, setViewMode] = useState('calendar');
  const { toast } = useToast();

  // Fetch all required data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      setFetchingData(true);
      try {
        await Promise.all([
          fetchEmployees(),
          fetchSchedules(),
          fetchCompanyDefaults()
        ]);
      } catch (err) {
        setError(err.message);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
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
      throw new Error("Failed to fetch employees");
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await api.get('/schedules');
      setSchedules(response.data);
    } catch (error) {
      throw new Error("Failed to fetch schedules");
    }
  };

  const fetchCompanyDefaults = async () => {
    try {
      const response = await api.get('/schedules/company-defaults');
      setCompanyDefaults(response.data);
    } catch (error) {
      throw new Error("Failed to fetch company defaults");
    }
  };

  const handleCreateSchedule = async (scheduleData) => {
    try {
      setLoading(true);
      
      // Ensure all dates are properly formatted
      const formattedScheduleData = {
        ...scheduleData,
        dates: scheduleData.dates.map(date => 
          typeof date === 'string' ? date : date.toISOString().split('T')[0]
        ),
        timeSlots: scheduleData.timeSlots.map(slot => ({
          ...slot,
          rate: slot.rate || '0' // Ensure rate is never empty
        }))
      };

      const response = await api.post('/schedules', formattedScheduleData);

      toast({
        title: "Success",
        description: "Schedule created successfully!",
      });

      setShowScheduleForm(false);
      await fetchSchedules();

    } catch (error) {
      if (error.response?.status === 409) {
        const errorData = error.response.data;
        if (errorData.conflicts?.length > 0) {
          const conflictMessages = errorData.conflicts
            .map(conflict => `${conflict.date}: ${conflict.message}`)
            .join('\n');

          toast({
            title: "Schedule Conflict",
            description: conflictMessages,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Schedule Conflict",
            description: "Time conflicts detected. Please adjust your schedule times.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to create schedule",
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
      weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay() + 1);
      
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
      await fetchSchedules();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create schedule from template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Memoized filtered employees
  const filteredEmployees = useMemo(() => 
    employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [employees, searchTerm]
  );

  // Memoized employee schedules
  const getEmployeeSchedules = useMemo(() => 
    (employeeId) => schedules.filter(schedule => schedule.employeeId === employeeId),
    [schedules]
  );

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          {error}
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (fetchingData) {
    return (
      <div className="p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Schedule Management</h1>
          <p className="text-muted-foreground">Create and manage employee schedules</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Employee List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.employeeId}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedEmployee?.employeeId === employee.employeeId
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <div className="font-medium">{employee.name}</div>
                  <div className="text-sm opacity-90">{employee.employeeId}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Schedule View */}
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {selectedEmployee ? `${selectedEmployee.name}'s Schedule` : 'Select an Employee'}
            </CardTitle>
            {selectedEmployee && (
              <div className="flex gap-2">
                <Button onClick={() => setShowCompanyDefault(true)} variant="outline">
                  Use Template
                </Button>
                <Button onClick={() => setShowScheduleForm(true)}>
                  Create Schedule
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {selectedEmployee ? (
              <ScheduleCalendar
                schedules={getEmployeeSchedules(selectedEmployee.employeeId)}
                employee={selectedEmployee}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select an employee to view or create schedules
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Schedule Form Dialog */}
      {showScheduleForm && selectedEmployee && (
        <ScheduleForm
          employee={selectedEmployee}
          onSubmit={handleCreateSchedule}
          onCancel={() => setShowScheduleForm(false)}
          isOpen={showScheduleForm}
        />
      )}

      {/* Company Default Dialog */}
      {showCompanyDefault && (
        <Dialog open={showCompanyDefault} onOpenChange={setShowCompanyDefault}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Schedule Template</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              {companyDefaults.map((template) => (
                <div
                  key={template._id}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-muted"
                  onClick={() => handleCreateFromCompanyDefault(template)}
                >
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminScheduleManagement; 