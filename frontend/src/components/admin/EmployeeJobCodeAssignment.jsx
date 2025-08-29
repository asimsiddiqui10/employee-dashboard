import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, Star, UserCheck } from 'lucide-react';
import axios from '@/lib/axios';

const EmployeeJobCodeAssignment = () => {
  const [employees, setEmployees] = useState([]);
  const [jobCodes, setJobCodes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState({
    jobCodeId: '',
    assignedRate: '',
    isPrimary: false,
    notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
    fetchJobCodes();
    fetchAssignments();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/employees');
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchJobCodes = async () => {
    try {
      const response = await axios.get('/job-codes/active/all');
      setJobCodes(response.data);
    } catch (error) {
      console.error('Error fetching job codes:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await axios.get('/employee-job-codes/stats');
      // This would need to be implemented in the backend
      // For now, we'll use a placeholder
      setAssignments([]);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignJobCode = async () => {
    try {
      await axios.post(`/employee-job-codes/employee/${selectedEmployee._id}`, assignmentForm);
      toast({
        title: "Success",
        description: "Job code assigned successfully"
      });
      setShowAssignmentDialog(false);
      setSelectedEmployee(null);
      setAssignmentForm({
        jobCodeId: '',
        assignedRate: '',
        isPrimary: false,
        notes: ''
      });
      fetchAssignments();
    } catch (error) {
      console.error('Error assigning job code:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to assign job code",
        variant: "destructive"
      });
    }
  };

  const handleSetAsPrimary = async (assignmentId) => {
    try {
      await axios.patch(`/employee-job-codes/assignment/${assignmentId}/set-primary`);
      toast({
        title: "Success",
        description: "Job code set as primary successfully"
      });
      fetchAssignments();
    } catch (error) {
      console.error('Error setting job code as primary:', error);
      toast({
        title: "Error",
        description: "Failed to set job code as primary",
        variant: "destructive"
      });
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    if (!confirm('Are you sure you want to remove this job code assignment?')) return;

    try {
      await axios.delete(`/employee-job-codes/assignment/${assignmentId}`);
      toast({
        title: "Success",
        description: "Job code assignment removed successfully"
      });
      fetchAssignments();
    } catch (error) {
      console.error('Error removing job code assignment:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to remove job code assignment",
        variant: "destructive"
      });
    }
  };

  const openAssignmentDialog = (employee) => {
    setSelectedEmployee(employee);
    setShowAssignmentDialog(true);
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Job Code Assignment</h1>
          <p className="text-muted-foreground">
            Assign job codes and rates to employees
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Employees List */}
      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEmployees.map((employee) => (
                <Card key={employee._id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{employee.name}</h3>
                        <p className="text-sm text-muted-foreground">{employee.employeeId}</p>
                        <p className="text-sm text-muted-foreground">{employee.department}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => openAssignmentDialog(employee)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Assign Job Code
                      </Button>
                    </div>
                    
                    {/* Current Job Codes */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Current Job Codes:</h4>
                      {/* This would show current assignments */}
                      <div className="text-sm text-muted-foreground">
                        No job codes assigned
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Assign Job Code to {selectedEmployee?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="jobCode">Job Code *</Label>
              <Select 
                value={assignmentForm.jobCodeId} 
                onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, jobCodeId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job code" />
                </SelectTrigger>
                <SelectContent>
                  {jobCodes.map((jobCode) => (
                    <SelectItem key={jobCode._id} value={jobCode._id}>
                      {jobCode.code} - {jobCode.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assignedRate">Assigned Rate *</Label>
              <Input
                id="assignedRate"
                type="number"
                step="0.01"
                value={assignmentForm.assignedRate}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, assignedRate: e.target.value }))}
                placeholder="Enter hourly rate"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={assignmentForm.notes}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPrimary"
                checked={assignmentForm.isPrimary}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, isPrimary: e.target.checked }))}
              />
              <Label htmlFor="isPrimary">Set as primary job code</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAssignmentDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignJobCode}>
                Assign Job Code
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeJobCodeAssignment; 