import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Send, Users, Building2, Search, X } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from '@/hooks/use-toast';
import { handleApiError } from '@/utils/errorHandler';

const SendNotificationModal = ({ onNotificationSent }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: 'announcement',
    title: '',
    message: '',
    priority: 'medium',
    link: '',
    sendToAll: false
  });
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    if (open) {
      fetchEmployees();
      fetchDepartments();
    }
  }, [open]);

  useEffect(() => {
    // Filter employees based on search
    if (employeeSearch.trim()) {
      const filtered = employees.filter(emp => 
        emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.department.toLowerCase().includes(employeeSearch.toLowerCase())
      );
      setFilteredEmployees(filtered.slice(0, 10)); // Show max 10 results
    } else {
      setFilteredEmployees([]);
    }
  }, [employeeSearch, employees]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/employees/departments');
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (status.message) setStatus({ type: '', message: '' });
  };

  const addEmployee = (employee) => {
    if (!selectedEmployees.find(emp => emp._id === employee._id)) {
      setSelectedEmployees(prev => [...prev, employee]);
      setEmployeeSearch('');
    }
  };

  const removeEmployee = (employeeId) => {
    setSelectedEmployees(prev => prev.filter(emp => emp._id !== employeeId));
  };

  const handleDepartmentSelect = (department, checked) => {
    if (checked) {
      setSelectedDepartments(prev => [...prev, department]);
    } else {
      setSelectedDepartments(prev => prev.filter(dept => dept !== department));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message || (!form.sendToAll && selectedEmployees.length === 0 && selectedDepartments.length === 0)) {
      setStatus({ type: 'error', message: 'Please fill all required fields and select recipients' });
      return;
    }

    try {
      setIsLoading(true);
      let userIds = [];

      if (form.sendToAll) {
        userIds = employees.map(emp => emp.user?._id).filter(Boolean);
      } else {
        // Add employees from selected departments
        if (selectedDepartments.length > 0) {
          const departmentEmployees = employees.filter(emp => 
            selectedDepartments.includes(emp.department)
          );
          userIds = departmentEmployees.map(emp => emp.user?._id).filter(Boolean);
        }
        
        // Add individually selected employees
        const individualUserIds = selectedEmployees
          .map(emp => emp.user?._id)
          .filter(Boolean);
        
        userIds = [...new Set([...userIds, ...individualUserIds])];
      }

      if (userIds.length === 0) {
        setStatus({ type: 'error', message: 'No valid recipients selected' });
        return;
      }

      await api.post('/notifications', {
        ...form,
        recipients: userIds
      });

      setStatus({ type: 'success', message: 'Notification sent successfully' });
      setForm({
        type: 'announcement',
        title: '',
        message: '',
        priority: 'medium',
        link: '',
        sendToAll: false
      });
      setSelectedEmployees([]);
      setSelectedDepartments([]);
      setEmployeeSearch('');
      
      if (onNotificationSent) {
        onNotificationSent();
      }

      setTimeout(() => {
        setOpen(false);
        setStatus({ type: '', message: '' });
      }, 1500);
      
    } catch (error) {
      const { message } = handleApiError(error);
      setStatus({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  };

  const getRecipientCount = () => {
    if (form.sendToAll) return employees.length;
    
    let count = selectedEmployees.length;
    
    // Add employees from selected departments
    selectedDepartments.forEach(dept => {
      const deptEmployees = employees.filter(emp => emp.department === dept);
      deptEmployees.forEach(emp => {
        // Only count if not already selected individually
        if (!selectedEmployees.find(selected => selected._id === emp._id)) {
          count++;
        }
      });
    });
    
    return count;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Send Notification
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send New Notification
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={form.type} onValueChange={(value) => handleChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="payroll">Payroll</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={form.priority} onValueChange={(value) => handleChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter notification title"
              />
            </div>

            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={form.message}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="Enter notification message"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="link">Link (optional)</Label>
              <Input
                id="link"
                value={form.link}
                onChange={(e) => handleChange('link', e.target.value)}
                placeholder="Enter optional link"
              />
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Recipients</Label>
                  <Badge variant="secondary">
                    {getRecipientCount()} selected
                  </Badge>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendToAll"
                    checked={form.sendToAll}
                    onCheckedChange={(checked) => {
                      handleChange('sendToAll', checked);
                      if (checked) {
                        setSelectedEmployees([]);
                        setSelectedDepartments([]);
                        setEmployeeSearch('');
                      }
                    }}
                  />
                  <Label htmlFor="sendToAll" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Send to All Employees
                  </Label>
                </div>

                {!form.sendToAll && (
                  <>
                    {/* Department Selection */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        By Department
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {departments.map((dept) => (
                          <div key={dept} className="flex items-center space-x-2">
                            <Checkbox
                              id={`dept-${dept}`}
                              checked={selectedDepartments.includes(dept)}
                              onCheckedChange={(checked) => handleDepartmentSelect(dept, checked)}
                            />
                            <Label htmlFor={`dept-${dept}`} className="text-sm">
                              {dept}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Employee Search */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Search & Add Employees</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by name, ID, or department..."
                          value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      {/* Search Results */}
                      {filteredEmployees.length > 0 && (
                        <div className="mt-2 border rounded-md max-h-32 overflow-y-auto">
                          {filteredEmployees.map((employee) => (
                            <div
                              key={employee._id}
                              className="p-2 hover:bg-muted cursor-pointer border-b last:border-b-0"
                              onClick={() => addEmployee(employee)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-sm">{employee.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {employee.employeeId} • {employee.department}
                                  </div>
                                </div>
                                <Button size="sm" variant="ghost" className="h-6 px-2">
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Selected Employees */}
                      {selectedEmployees.length > 0 && (
                        <div className="mt-3">
                          <Label className="text-xs font-medium mb-2 block">Selected Employees:</Label>
                          <div className="flex flex-wrap gap-2">
                            {selectedEmployees.map((employee) => (
                              <Badge
                                key={employee._id}
                                variant="secondary"
                                className="flex items-center gap-2"
                              >
                                {employee.name} ({employee.employeeId})
                                <X
                                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                                  onClick={() => removeEmployee(employee._id)}
                                />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {status.message && (
            <div className={`p-3 rounded-md text-sm ${
              status.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {status.message}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isLoading ? 'Sending...' : 'Send Notification'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SendNotificationModal;