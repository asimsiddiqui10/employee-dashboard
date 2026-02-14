import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/context/authContext';
import api from '@/lib/axios';

const HoursForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onCancel,
  timeEntry,
  loading 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    jobCode: '',
    rate: '',
    timesheetNotes: '',
    employeeApproval: false
  });
  const [assignedJobCodes, setAssignedJobCodes] = useState([]);

  // Fetch assigned job codes when form opens
  useEffect(() => {
    if (isOpen) {
      fetchAssignedJobCodes();
      setFormData({
        jobCode: '',
        rate: '',
        timesheetNotes: '',
        employeeApproval: false
      });
    }
  }, [isOpen]);

  const fetchAssignedJobCodes = async () => {
    try {
      // Fetch employee data to get MongoDB _id
      const employeeResponse = await api.get('/employees/me');
      const employee = employeeResponse.data;
      const employeeMongoId = employee._id;

      // Fetch all active job codes
      const allJobCodesResponse = await api.get('/job-codes/active/all');
      
      if (allJobCodesResponse.data && Array.isArray(allJobCodesResponse.data)) {
        // Filter job codes assigned to this employee
        const filteredJobCodes = allJobCodesResponse.data.filter(jobCode => 
          jobCode.assignedTo && 
          jobCode.assignedTo.some(assignment => 
            assignment.employee && assignment.employee._id === employeeMongoId
          )
        );

        // Map to include code, title, description, and rate
        const mappedJobCodes = filteredJobCodes.map(jobCode => ({
          code: jobCode.code,
          title: jobCode.title,
          description: jobCode.description,
          rate: jobCode.rate
        }));

        setAssignedJobCodes(mappedJobCodes);
      }
    } catch (error) {
      console.error('Error fetching assigned job codes:', error);
      setAssignedJobCodes([]);
    }
  };

  // Auto-populate rate when job code is selected
  const handleJobCodeChange = (value) => {
    const selectedJobCode = assignedJobCodes.find(jc => jc.code === value);
    setFormData(prev => ({
      ...prev,
      jobCode: value,
      rate: selectedJobCode?.rate ? selectedJobCode.rate.toString() : ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert rate to number
    const submissionData = {
      ...formData,
      rate: parseFloat(formData.rate)
    };

    // Validate required fields (rate is now optional)
    if (!submissionData.jobCode) {
      return;
    }

    onSubmit(submissionData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApprovalChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      employeeApproval: checked
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Hours Record</DialogTitle>
          <DialogDescription>
            Please fill in the required hours details before clocking out.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="jobCode">Job Code *</Label>
            <Select
              value={formData.jobCode}
              onValueChange={handleJobCodeChange}
              required
              disabled={assignedJobCodes.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={assignedJobCodes.length === 0 ? "No job codes assigned" : "Select job code..."} />
              </SelectTrigger>
              <SelectContent>
                {assignedJobCodes.map((jc) => (
                  <SelectItem key={jc.code} value={jc.code}>
                    {jc.code} - {jc.description || jc.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rate">Rate (per hour)</Label>
            <Input
              id="rate"
              name="rate"
              type="number"
              step="0.01"
              min="0"
              value={formData.rate}
              onChange={handleChange}
              placeholder="Enter hourly rate (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timesheetNotes">Notes (optional)</Label>
            <Textarea
              id="timesheetNotes"
              name="timesheetNotes"
              value={formData.timesheetNotes}
              onChange={handleChange}
              placeholder="Add any additional notes"
              className="h-20"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="employeeApproval"
              checked={formData.employeeApproval}
              onCheckedChange={handleApprovalChange}
            />
            <Label htmlFor="employeeApproval" className="text-sm">
              I confirm that this hours record is accurate
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.jobCode}
            >
              {loading ? "Submitting..." : "Submit Hours"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HoursForm; 