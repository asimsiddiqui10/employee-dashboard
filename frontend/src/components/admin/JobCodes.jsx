import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';


import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import api from '@/lib/axios';

const JobCodes = () => {
  const [jobCodes, setJobCodes] = useState([]);

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingJobCode, setEditingJobCode] = useState(null);

  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    rate: ''
  });

  useEffect(() => {
    fetchJobCodes();
    fetchEmployees();
  }, [searchTerm]);

  useEffect(() => {
    // Filter employees based on search term
    const filtered = employees.filter(emp => 
      emp.name?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(employeeSearchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [employees, employeeSearchTerm]);

  // Reset filtered employees when dialogs close
  useEffect(() => {
    if (!showEditDialog) {
      setFilteredEmployees(employees);
      setEmployeeSearchTerm('');
    }
  }, [showEditDialog, employees]);

  useEffect(() => {
    if (!showCreateDialog) {
      setFilteredEmployees(employees);
      setEmployeeSearchTerm('');
    }
  }, [showCreateDialog, employees]);

  const fetchJobCodes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm
      });
      


      const response = await api.get(`/job-codes?${params}`);
      setJobCodes(response.data.jobCodes || response.data);
    } catch (error) {
      console.error('Error fetching job codes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch job codes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };



  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      console.log('Employees response:', response.data);
      setEmployees(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive"
      });
    }
  };



  const validateForm = () => {
    if (!formData.code || !formData.title) {
      toast({
        title: "Validation Error",
        description: "Please fill in job code and title",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleCreateJobCode = async () => {
    if (!validateForm()) return;
    
    console.log('Creating job code with data:', formData);
    console.log('Form data code:', formData.code);
    console.log('Form data title:', formData.title);
    console.log('Form data description:', formData.description);
    console.log('Selected employees:', selectedEmployees);
    
    // Check if code is empty or undefined
    if (!formData.code || formData.code.trim() === '') {
      toast({
        title: "Validation Error",
        description: "Job code cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log('Sending request to /job-codes with data:', JSON.stringify(formData));
      
      // Create the job code first
      const response = await api.post('/job-codes', formData);
      const newJobCode = response.data;
      
      // If employees are selected, assign them to the job code
      if (selectedEmployees.length > 0) {
        try {
          await api.post(`/job-codes/${newJobCode._id}/assign`, {
            employeeIds: selectedEmployees
          });
        } catch (assignError) {
          console.error('Error assigning employees:', assignError);
          toast({
            title: "Warning",
            description: "Job code created but failed to assign employees",
            variant: "destructive"
          });
        }
      }
      
      toast({
        title: "Success",
        description: "Job code created successfully"
      });
      setShowCreateDialog(false);
      resetForm();
      fetchJobCodes();
    } catch (error) {
      console.error('Error creating job code:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          "Failed to create job code";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleUpdateJobCode = async () => {
    if (!validateForm()) return;
    
    try {
      // Update the job code first
      await api.put(`/job-codes/${editingJobCode._id}`, formData);
      
      // Update employee assignments
      try {
        // Remove all current assignments
        await api.post(`/job-codes/${editingJobCode._id}/remove`, {
          employeeIds: editingJobCode.assignedTo?.map(a => a.employee._id || a.employee) || []
        });
        
        // Add new assignments
        if (selectedEmployees.length > 0) {
          await api.post(`/job-codes/${editingJobCode._id}/assign`, {
            employeeIds: selectedEmployees
          });
        }
      } catch (assignError) {
        console.error('Error updating employee assignments:', assignError);
        toast({
          title: "Warning",
          description: "Job code updated but failed to update employee assignments",
          variant: "destructive"
        });
      }
      
      toast({
        title: "Success",
        description: "Job code updated successfully"
      });
      setShowEditDialog(false);
      setEditingJobCode(null);
      resetForm();
      fetchJobCodes();
    } catch (error) {
      console.error('Error updating job code:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update job code",
        variant: "destructive"
      });
    }
  };

  const handleDeleteJobCode = async (jobCodeId) => {
    if (!confirm('Are you sure you want to delete this job code?')) return;

    try {
      await api.delete(`/job-codes/${jobCodeId}`);
      toast({
        title: "Success",
        description: "Job code deleted successfully"
      });
      fetchJobCodes();
    } catch (error) {
      console.error('Error deleting job code:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete job code",
        variant: "destructive"
      });
    }
  };



  const handleEdit = (jobCode) => {
    setEditingJobCode(jobCode);
    setFormData({
      code: jobCode.code,
      title: jobCode.title,
      description: jobCode.description,
      rate: jobCode.rate || ''
    });
    // Set currently assigned employees
    if (jobCode.assignedTo && jobCode.assignedTo.length > 0) {
      setSelectedEmployees(jobCode.assignedTo.map(assignment => assignment.employee._id || assignment.employee));
    } else {
      setSelectedEmployees([]);
    }
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      title: '',
      description: '',
      rate: ''
    });
    setSelectedEmployees([]);
    setEmployeeSearchTerm('');
    setFilteredEmployees(employees);
  };

















  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Codes</h1>
          <p className="text-muted-foreground">
            Manage job codes and assign them to employees
          </p>
        </div>
        <div className="flex gap-2">

          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Job Code
          </Button>
        </div>
      </div>





      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search job codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>


          </div>
        </CardContent>
      </Card>

      {/* Job Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Job Codes</CardTitle>
        </CardHeader>
        <CardContent>
                            {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Assigned Employees</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobCodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {loading ? 'Loading job codes...' : searchTerm ? 'No job codes match your search' : 'No job codes found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobCodes.map((jobCode) => (
                      <TableRow key={jobCode._id}>
                        <TableCell className="font-mono">{jobCode.code}</TableCell>
                        <TableCell>{jobCode.title}</TableCell>
                        <TableCell>{jobCode.description || 'No description'}</TableCell>
                        <TableCell>{jobCode.rate || 'NA'}</TableCell>
                        <TableCell>
                          {jobCode.assignedTo && jobCode.assignedTo.length > 0 ? (
                            <div className="text-center">
                              <Badge variant="secondary" className="text-sm">
                                {jobCode.assignedTo.length} employee{jobCode.assignedTo.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">0 employees</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(jobCode)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteJobCode(jobCode._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>


            </>
          )}
        </CardContent>
      </Card>

      {/* Create Job Code Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Job Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Job Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="e.g., ACT001"
                />
              </div>
              <div>
                <Label htmlFor="title">Job Name *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., General Labor"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Job description"
              />
            </div>
            
            <div>
              <Label htmlFor="rate">Rate (Optional)</Label>
              <Input
                id="rate"
                type="text"
                value={formData.rate}
                onChange={(e) => setFormData(prev => ({ ...prev, rate: e.target.value }))}
                placeholder="NA"
              />
            </div>

            <div className="border-t pt-4">
              <Label className="text-lg font-medium">Assign to Employees</Label>
              
              {/* Quick Actions */}
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (employeeSearchTerm && filteredEmployees.length > 0) {
                      // If searching, select only filtered employees
                      setSelectedEmployees(filteredEmployees.map(emp => emp._id));
                    } else {
                      // If no search, select all employees
                      setSelectedEmployees(employees.map(emp => emp._id));
                    }
                  }}
                >
                  {employeeSearchTerm && filteredEmployees.length > 0 
                    ? `Select All (${filteredEmployees.length})` 
                    : 'Select All Employees'
                  }
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEmployees([])}
                >
                  Clear Selection
                </Button>
              </div>
              
              {/* Employee Search */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <Label>Search Employees</Label>
                  <span className="text-xs text-muted-foreground">
                    {filteredEmployees.length} of {employees.length} employees
                  </span>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees by name, ID, or email..."
                    value={employeeSearchTerm}
                    onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                    className="pl-8 pr-8"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setEmployeeSearchTerm('');
                      }
                    }}
                  />
                  {employeeSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setEmployeeSearchTerm('')}
                      className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                      title="Clear search (Esc)"
                    >
                      ×
                    </button>
                  )}
                </div>
                
                {/* Employee List */}
                <div className="mt-2 max-h-40 overflow-y-auto border rounded-md p-2">
                  {employees.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      No employees found
                    </div>
                  ) : filteredEmployees.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      {employeeSearchTerm ? 'No employees match your search' : 'No employees available'}
                    </div>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <div key={employee._id} className="flex items-center space-x-2 py-1 hover:bg-muted/50 rounded px-2">
                        <input
                          type="checkbox"
                          id={`emp-${employee._id}`}
                          checked={selectedEmployees.includes(employee._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEmployees(prev => [...prev, employee._id]);
                            } else {
                              setSelectedEmployees(prev => prev.filter(id => id !== employee._id));
                            }
                          }}
                          className="rounded"
                        />
                        <Label htmlFor={`emp-${employee._id}`} className="text-sm cursor-pointer flex-1">
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {employee.employeeId} • {employee.email}
                          </div>
                        </Label>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Selection Summary */}
                {selectedEmployees.length > 0 && (
                  <div className="mt-3 p-2 bg-muted/50 rounded-md">
                    <div className="text-sm font-medium mb-1">
                      Selected: {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {employees
                        .filter(emp => selectedEmployees.includes(emp._id))
                        .map(emp => emp.name)
                        .join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateJobCode}>
                Create Job Code
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Job Code Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Job Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editCode">Job Code</Label>
                <Input
                  id="editCode"
                  value={formData.code}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="editTitle">Job Name *</Label>
                <Input
                  id="editTitle"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editDescription">Description</Label>
                <Input
                  id="editDescription"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editRate">Rate (Optional)</Label>
                <Input
                  id="editRate"
                  type="text"
                  value={formData.rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, rate: e.target.value }))}
                  placeholder="NA"
                />
              </div>
            </div>
            


            <div className="border-t pt-4">
              <Label className="text-lg font-medium">Assign to Employees</Label>
              
              {/* Quick Actions */}
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (employeeSearchTerm && filteredEmployees.length > 0) {
                      setSelectedEmployees(filteredEmployees.map(emp => emp._id));
                    } else {
                      setSelectedEmployees(employees.map(emp => emp._id));
                    }
                  }}
                >
                  {employeeSearchTerm && filteredEmployees.length > 0 
                    ? `Select All (${filteredEmployees.length})` 
                    : 'Select All Employees'
                  }
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEmployees([])}
                >
                  Clear Selection
                </Button>
              </div>
              
              {/* Employee Search */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <Label>Search Employees</Label>
                  <span className="text-xs text-muted-foreground">
                    {filteredEmployees.length} of {employees.length} employees
                  </span>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees by name, ID, or email..."
                    value={employeeSearchTerm}
                    onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                    className="pl-8 pr-8"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setEmployeeSearchTerm('');
                      }
                    }}
                  />
                  {employeeSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setEmployeeSearchTerm('')}
                      className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                      title="Clear search (Esc)"
                    >
                      ×
                    </button>
                  )}
                </div>
                
                {/* Employee List */}
                <div className="mt-2 max-h-40 overflow-y-auto border rounded-md p-2">
                  {employees.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      No employees found
                    </div>
                  ) : filteredEmployees.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      {employeeSearchTerm ? 'No employees match your search' : 'No employees available'}
                    </div>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <div key={employee._id} className="flex items-center space-x-2 py-1 hover:bg-muted/50 rounded px-2">
                        <input
                          type="checkbox"
                          id={`edit-emp-${employee._id}`}
                          checked={selectedEmployees.includes(employee._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEmployees(prev => [...prev, employee._id]);
                            } else {
                              setSelectedEmployees(prev => prev.filter(id => id !== employee._id));
                            }
                          }}
                          className="rounded"
                        />
                        <Label htmlFor={`edit-emp-${employee._id}`} className="text-sm cursor-pointer flex-1">
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {employee.employeeId} • {employee.email}
                          </div>
                        </Label>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Selection Summary */}
                {selectedEmployees.length > 0 && (
                  <div className="mt-3 p-2 bg-muted/50 rounded-md">
                    <div className="text-sm font-medium mb-1">
                      Selected: {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {employees
                        .filter(emp => selectedEmployees.includes(emp._id))
                        .map(emp => emp.name)
                        .join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateJobCode}>
                Update Job Code
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobCodes; 