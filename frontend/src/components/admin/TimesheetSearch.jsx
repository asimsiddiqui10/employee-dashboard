import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { departments } from '@/lib/departments';
import { Search, X } from "lucide-react";

const TimesheetSearch = ({ filters, onFilterChange, onClearFilters }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <div className="flex-1 flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by name or ID..."
          name="searchTerm"
          value={filters.searchTerm || ''}
          onChange={handleInputChange}
          className="w-full sm:w-[200px]"
        />
        
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => handleSelectChange('status', value)}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending_approval">Pending Approval</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.department || 'all'}
          onValueChange={(value) => handleSelectChange('department', value)}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {Object.keys(departments).map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          name="startDate"
          value={filters.startDate || ''}
          onChange={handleInputChange}
          className="w-full sm:w-[160px]"
        />

        <Input
          type="date"
          name="endDate"
          value={filters.endDate || ''}
          onChange={handleInputChange}
          className="w-full sm:w-[160px]"
        />
      </div>

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="icon"
          onClick={onClearFilters}
          className="shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
        <Button 
          variant="default" 
          size="icon"
          className="shrink-0"
          onClick={() => onFilterChange(filters)}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TimesheetSearch; 