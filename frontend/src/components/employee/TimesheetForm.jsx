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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const TimesheetForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  timeEntry,
  loading 
}) => {
  const [formData, setFormData] = React.useState({
    jobCode: '',
    rate: '',
    shift: 'Morning',
    timesheetNotes: '',
    employeeApproval: false
  });

  // Reset form when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        jobCode: '',
        rate: '',
        shift: 'Morning',
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
    if (!submissionData.jobCode || !submissionData.rate || !submissionData.shift) {
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

  const handleShiftChange = (value) => {
    setFormData(prev => ({
      ...prev,
      shift: value
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
          <DialogTitle>Complete Timesheet</DialogTitle>
          <DialogDescription>
            Please fill in the required timesheet details before clocking out.
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
            <Label htmlFor="shift">Shift *</Label>
            <Select
              value={formData.shift}
              onValueChange={handleShiftChange}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Morning">Morning</SelectItem>
                <SelectItem value="Afternoon">Afternoon</SelectItem>
                <SelectItem value="Night">Night</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
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
              I confirm that this timesheet is accurate
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.jobCode || !formData.rate || !formData.shift}
            >
              {loading ? "Submitting..." : "Submit Timesheet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TimesheetForm; 