import React from 'react';
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

const HoursForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onCancel,
  timeEntry,
  loading 
}) => {
  const [formData, setFormData] = React.useState({
    jobCode: '',
    rate: '',
    timesheetNotes: '',
    employeeApproval: false
  });

  // Reset form when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        jobCode: '',
        rate: '',
        timesheetNotes: '',
        employeeApproval: false
      });
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert rate to number
    const submissionData = {
      ...formData,
      rate: parseFloat(formData.rate)
    };

    // Validate required fields
    if (!submissionData.jobCode || !submissionData.rate) {
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
            <Input
              id="jobCode"
              name="jobCode"
              value={formData.jobCode}
              onChange={handleChange}
              required
              placeholder="Enter job code"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rate">Rate (per hour) *</Label>
            <Input
              id="rate"
              name="rate"
              type="number"
              step="0.01"
              min="0"
              value={formData.rate}
              onChange={handleChange}
              required
              placeholder="Enter hourly rate"
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
              disabled={loading || !formData.jobCode || !formData.rate}
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