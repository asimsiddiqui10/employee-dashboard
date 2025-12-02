import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/hooks/use-toast';
import { Upload, Search, Filter, Download, Calendar, User, FileText, Plus, FolderOpen, Folder, Grid3X3, List, ArrowLeft, CalendarPlus, Clock } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from 'date-fns';

export default function PayrollUpload() {
  // Navigation state
  const [currentView, setCurrentView] = useState('folders'); // 'folders' or 'documents'
  const [selectedPayPeriod, setSelectedPayPeriod] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [activeTab, setActiveTab] = useState('documents'); // 'documents' or 'timesheets'

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  
  // Upload form state
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [payPeriod, setPayPeriod] = useState('');
  const [newPayPeriod, setNewPayPeriod] = useState('');
  const [isCreatingPayPeriod, setIsCreatingPayPeriod] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [payPeriodStart, setPayPeriodStart] = useState('');
  const [payPeriodEnd, setPayPeriodEnd] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  // Data state
  const [payrollDocuments, setPayrollDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payPeriods, setPayPeriods] = useState([]);
  const [payrollCalendar, setPayrollCalendar] = useState([]);

  // Filter state (only for documents view)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Calendar form state
  const [calendarTitle, setCalendarTitle] = useState('');
  const [calendarPayPeriodStart, setCalendarPayPeriodStart] = useState('');
  const [calendarPayPeriodEnd, setCalendarPayPeriodEnd] = useState('');
  const [calendarPayDate, setCalendarPayDate] = useState('');
  const [calendarNotes, setCalendarNotes] = useState('');

  // Timesheet state
  const [timesheetStartDate, setTimesheetStartDate] = useState('');
  const [timesheetEndDate, setTimesheetEndDate] = useState('');
  const [timesheets, setTimesheets] = useState([]);
  const [timesheetLoading, setTimesheetLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchPayrollDocuments();
    fetchPayPeriods();
    fetchPayrollCalendar();
  }, []);

  useEffect(() => {
    if (currentView === 'documents' && selectedPayPeriod) {
      filterDocuments();
    }
  }, [payrollDocuments, searchTerm, filterEmployee, filterDateFrom, filterDateTo, filterStatus, selectedPayPeriod]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const fetchPayrollDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payroll/all');
      setPayrollDocuments(response.data);
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPayPeriods = async () => {
    try {
      const response = await api.get('/payroll/categories');
      setPayPeriods(response.data);
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const fetchPayrollCalendar = async () => {
    try {
      const response = await api.get('/payroll/calendar');
      setPayrollCalendar(response.data);
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const filterDocuments = () => {
    let filtered = payrollDocuments.filter(doc => doc.category === selectedPayPeriod);

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.employeeId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.employeeId?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Employee filter
    if (filterEmployee !== 'all') {
      filtered = filtered.filter(doc => doc.employeeId?._id === filterEmployee);
    }

    // Date range filter
    if (filterDateFrom) {
      filtered = filtered.filter(doc => new Date(doc.payPeriodStart) >= new Date(filterDateFrom));
    }
    if (filterDateTo) {
      filtered = filtered.filter(doc => new Date(doc.payPeriodEnd) <= new Date(filterDateTo));
    }

    // Status filter
    if (filterStatus === 'recent') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(doc => new Date(doc.uploadedAt) >= thirtyDaysAgo);
    }

    setFilteredDocuments(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title || !selectedEmployee || !payPeriodStart || !payPeriodEnd) {
      setError('Please fill in all required fields');
      return;
    }

    let finalPayPeriod = payPeriod;
    if (isCreatingPayPeriod && newPayPeriod.trim()) {
      finalPayPeriod = newPayPeriod.trim();
    } else if (!finalPayPeriod) {
      finalPayPeriod = 'General';
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', finalPayPeriod);
    formData.append('employeeId', selectedEmployee);
    formData.append('payPeriodStart', payPeriodStart);
    formData.append('payPeriodEnd', payPeriodEnd);

    try {
      setUploading(true);
      await api.post('/payroll/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast({
        title: "Success",
        description: "Payroll document uploaded successfully",
        variant: "default",
      });

      resetForm();
      setIsModalOpen(false);
      fetchPayrollDocuments();
      fetchPayPeriods();
    } catch (error) {
      const { message } = handleApiError(error);
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCalendarSubmit = async (e) => {
    e.preventDefault();
    if (!calendarTitle || !calendarPayPeriodStart || !calendarPayPeriodEnd || !calendarPayDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.post('/payroll/calendar', {
        title: calendarTitle,
        payPeriodStart: calendarPayPeriodStart,
        payPeriodEnd: calendarPayPeriodEnd,
        payDate: calendarPayDate,
        notes: calendarNotes
      });

      toast({
        title: "Success",
        description: "Payroll period added to calendar",
        variant: "default",
      });

      resetCalendarForm();
      setIsCalendarModalOpen(false);
      fetchPayrollCalendar();
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setPayPeriod('');
    setNewPayPeriod('');
    setIsCreatingPayPeriod(false);
    setSelectedEmployee('');
    setPayPeriodStart('');
    setPayPeriodEnd('');
    setError('');
    setSuccess('');
  };

  const resetCalendarForm = () => {
    setCalendarTitle('');
    setCalendarPayPeriodStart('');
    setCalendarPayPeriodEnd('');
    setCalendarPayDate('');
    setCalendarNotes('');
  };

  const handleDownload = async (documentId) => {
    try {
      const response = await api.get(`/payroll/download/${documentId}`);
      if (response.data.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
      }
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterEmployee('all');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterStatus('all');
  };

  const getStatusBadge = (uploadedAt) => {
    const uploadDate = new Date(uploadedAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (uploadDate >= thirtyDaysAgo) {
      return <Badge variant="default" className="text-xs">Recent</Badge>;
    }
    return <Badge variant="secondary" className="text-xs">Archived</Badge>;
  };

  const getPayPeriodDocumentCount = (payPeriod) => {
    return payrollDocuments.filter(doc => doc.category === payPeriod).length;
  };

  const renderFoldersView = () => (
    <div className="space-y-6">
      {/* Payroll Calendar Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Payroll Calendar
            </CardTitle>
            <p className="text-sm text-muted-foreground">Manage payroll release dates</p>
          </div>
          <Dialog open={isCalendarModalOpen} onOpenChange={setIsCalendarModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarPlus className="h-4 w-4 mr-2" />
                Add Period
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payroll Period</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCalendarSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Period Title *</Label>
                  <Input
                    value={calendarTitle}
                    onChange={(e) => setCalendarTitle(e.target.value)}
                    placeholder="e.g., October 2024 Payroll"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pay Period Start *</Label>
                    <Input
                      type="date"
                      value={calendarPayPeriodStart}
                      onChange={(e) => setCalendarPayPeriodStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pay Period End *</Label>
                    <Input
                      type="date"
                      value={calendarPayPeriodEnd}
                      onChange={(e) => setCalendarPayPeriodEnd(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Pay Date *</Label>
                  <Input
                    type="date"
                    value={calendarPayDate}
                    onChange={(e) => setCalendarPayDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    value={calendarNotes}
                    onChange={(e) => setCalendarNotes(e.target.value)}
                    placeholder="Optional notes"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">Add Period</Button>
                  <Button type="button" variant="outline" onClick={() => setIsCalendarModalOpen(false)}>Cancel</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {payrollCalendar.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2" />
              <p>No payroll periods scheduled</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {payrollCalendar.slice(0, 3).map((period) => (
                <div key={period._id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium text-sm">{period.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Pay Date: {format(new Date(period.payDate), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <Badge variant={period.status === 'upcoming' ? 'default' : 'secondary'} className="text-xs">
                    {period.status}
                  </Badge>
                </div>
              ))}
              {payrollCalendar.length > 3 && (
                <div className="text-center text-sm text-muted-foreground">
                  +{payrollCalendar.length - 3} more periods
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pay Periods Folders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Pay Periods
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payPeriods.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No pay periods found</h3>
              <p className="text-sm text-muted-foreground">Upload your first payroll document to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {payPeriods.map((period) => (
                <Card 
                  key={period} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedPayPeriod(period);
                    setCurrentView('documents');
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Folder className="h-8 w-8 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium">{period}</div>
                        <div className="text-sm text-muted-foreground">
                          {getPayPeriodDocumentCount(period)} documents
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderDocumentsView = () => (
    <div className="space-y-6">
      {/* Header with back button and view controls */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentView('folders')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Folders
            </Button>
            <div>
              <CardTitle className="text-xl font-bold">{selectedPayPeriod}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {filteredDocuments.length} documents
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-r-none"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-l-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Compact Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterEmployee} onValueChange={setFilterEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="All employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All employees</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee._id} value={employee._id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                <SelectItem value="recent">Recent (30 days)</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={clearFilters} size="sm">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents Display */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No documents found</h3>
              <p className="text-sm text-muted-foreground">
                {payrollDocuments.filter(doc => doc.category === selectedPayPeriod).length === 0
                  ? "No documents in this pay period yet."
                  : "Try adjusting your filters to see more results."}
              </p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Title</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Pay Period</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc._id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{doc.title}</div>
                          {doc.description && (
                            <div className="text-sm text-muted-foreground">{doc.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{doc.employeeId?.name}</div>
                            <div className="text-sm text-muted-foreground">{doc.employeeId?.employeeId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(doc.payPeriodStart), 'MMM dd')} - {format(new Date(doc.payPeriodEnd), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}</div>
                          <div className="text-muted-foreground">by {doc.uploadedBy?.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(doc.uploadedAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(doc._id)}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((doc) => (
                <Card key={doc._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <FileText className="h-8 w-8 text-primary" />
                      {getStatusBadge(doc.uploadedAt)}
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium line-clamp-2">{doc.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {doc.employeeId?.name} ({doc.employeeId?.employeeId})
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(doc.payPeriodStart), 'MMM dd')} - {format(new Date(doc.payPeriodEnd), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Uploaded {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc._id)}
                      className="w-full mt-3 flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Calculate hours from schedule startTime and endTime
  const calculateScheduleHours = (startTime, endTime) => {
    const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
    
    if (endMinutes > startMinutes) {
      const totalMinutes = endMinutes - startMinutes;
      return totalMinutes / 60;
    }
    return 0;
  };

  // Fetch timesheets for all employees
  const fetchTimesheets = async () => {
    if (!timesheetStartDate || !timesheetEndDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    try {
      setTimesheetLoading(true);
      const timesheetData = [];

      // Fetch all active employees
      const employeesResponse = await api.get('/employees');
      const allEmployees = Array.isArray(employeesResponse.data) 
        ? employeesResponse.data 
        : (employeesResponse.data?.data || []);
      
      const activeEmployees = allEmployees.filter(emp => emp.employmentStatus === 'Active');

      // Fetch all time entries once for contract/hourly employees (more efficient)
      let allTimeEntries = [];
      try {
        const timeEntriesResponse = await api.get('/time-clock/all/all');
        // Endpoint returns array directly
        allTimeEntries = Array.isArray(timeEntriesResponse.data) 
          ? timeEntriesResponse.data 
          : [];
      } catch (error) {
        console.error('Error fetching time entries:', error);
      }

      // Set up date range for filtering
      const startDate = new Date(timesheetStartDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(timesheetEndDate);
      endDate.setHours(23, 59, 59, 999);

      // Process each employee
      for (const employee of activeEmployees) {
        let totalHours = 0;

        if (employee.employmentType === 'Full-time/Part-time') {
          // Fetch schedules for full-time/part-time employees
          try {
            const schedulesResponse = await api.get(`/schedules/employee/${employee.employeeId}`, {
              params: {
                startDate: timesheetStartDate,
                endDate: timesheetEndDate
              }
            });

            const schedules = schedulesResponse.data?.schedules || schedulesResponse.data || [];
            const schedulesArray = Array.isArray(schedules) ? schedules : [];

            // Calculate total hours from schedules
            schedulesArray.forEach(schedule => {
              if (schedule.startTime && schedule.endTime) {
                totalHours += calculateScheduleHours(schedule.startTime, schedule.endTime);
              }
            });
          } catch (error) {
            console.error(`Error fetching schedules for ${employee.employeeId}:`, error);
          }
        } else if (employee.employmentType === 'Contract/Hourly') {
          // Filter time entries for this employee within date range
          const employeeIdStr = employee._id?.toString();
          
          allTimeEntries.forEach(entry => {
            const entryEmployeeId = entry.employee?._id?.toString() || entry.employee?.toString();
            const entryDate = new Date(entry.clockIn || entry.date);
            
            if (
              entryEmployeeId === employeeIdStr &&
              entryDate >= startDate &&
              entryDate <= endDate &&
              entry.status === 'completed' &&
              entry.totalWorkTime
            ) {
              // totalWorkTime is in minutes, convert to hours
              totalHours += entry.totalWorkTime / 60;
            }
          });
        }

        timesheetData.push({
          employeeId: employee.employeeId,
          name: employee.name,
          employmentType: employee.employmentType,
          hours: parseFloat(totalHours.toFixed(2))
        });
      }

      // Sort by employee ID
      timesheetData.sort((a, b) => a.employeeId.localeCompare(b.employeeId));
      setTimesheets(timesheetData);
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message || "Failed to fetch timesheets",
        variant: "destructive",
      });
    } finally {
      setTimesheetLoading(false);
    }
  };

  // Export timesheets to TXT file
  const exportTimesheetsToTxt = () => {
    if (timesheets.length === 0) {
      toast({
        title: "Error",
        description: "No timesheet data to export",
        variant: "destructive",
      });
      return;
    }

    // Format: employeeId, hours
    const content = timesheets
      .map(ts => `${ts.employeeId},${ts.hours}`)
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const dateRange = `${timesheetStartDate}_to_${timesheetEndDate}`;
    link.download = `timesheets_${dateRange}.txt`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Timesheets exported successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-2xl font-bold">Payroll Management</CardTitle>
            <p className="text-muted-foreground">
              Manage payroll documents and timesheets
            </p>
          </div>
          {activeTab === 'documents' && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Upload Document
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Payroll Document</DialogTitle>
              </DialogHeader>
              
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Employee *</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee._id} value={employee._id}>
                          {employee.name} ({employee.employeeId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Document Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Pay Stub - John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Additional details"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pay Period *</Label>
                  {!isCreatingPayPeriod ? (
                    <div className="flex gap-2">
                      <Select value={payPeriod} onValueChange={setPayPeriod}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select pay period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General">General</SelectItem>
                          {payPeriods.map((period) => (
                            <SelectItem key={period} value={period}>
                              {period}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreatingPayPeriod(true)}
                        className="whitespace-nowrap"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        New
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., Oct 2024, Nov 2024"
                        value={newPayPeriod}
                        onChange={(e) => setNewPayPeriod(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsCreatingPayPeriod(false);
                          setNewPayPeriod('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payPeriodStart">Period Start *</Label>
                    <Input
                      id="payPeriodStart"
                      type="date"
                      value={payPeriodStart}
                      onChange={(e) => setPayPeriodStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payPeriodEnd">Period End *</Label>
                    <Input
                      id="payPeriodEnd"
                      type="date"
                      value={payPeriodEnd}
                      onChange={(e) => setPayPeriodEnd(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file-upload">Upload File *</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    accept=".pdf,.doc,.docx"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={uploading} className="flex-1">
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      resetForm();
                      setIsModalOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          )}
        </CardHeader>
      </Card>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="timesheets">
            <Clock className="h-4 w-4 mr-2" />
            Timesheets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="mt-6">
          {currentView === 'folders' ? renderFoldersView() : renderDocumentsView()}
        </TabsContent>

        <TabsContent value="timesheets" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Generate Timesheets</CardTitle>
              <p className="text-sm text-muted-foreground">
                Generate timesheets for all employees based on schedules (Full-time/Part-time) and time entries (Contract/Hourly)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timesheetStartDate">Start Date *</Label>
                  <Input
                    id="timesheetStartDate"
                    type="date"
                    value={timesheetStartDate}
                    onChange={(e) => setTimesheetStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timesheetEndDate">End Date *</Label>
                  <Input
                    id="timesheetEndDate"
                    type="date"
                    value={timesheetEndDate}
                    onChange={(e) => setTimesheetEndDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button 
                    onClick={fetchTimesheets} 
                    disabled={timesheetLoading || !timesheetStartDate || !timesheetEndDate}
                    className="w-full"
                  >
                    {timesheetLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Generate Timesheets
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {timesheets.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {timesheets.length} employees • Total: {timesheets.reduce((sum, ts) => sum + ts.hours, 0).toFixed(2)} hours
                    </div>
                    <Button onClick={exportTimesheetsToTxt} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export to TXT
                    </Button>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Employment Type</TableHead>
                          <TableHead className="text-right">Hours</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {timesheets.map((timesheet) => (
                          <TableRow key={timesheet.employeeId}>
                            <TableCell className="font-medium">{timesheet.employeeId}</TableCell>
                            <TableCell>{timesheet.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {timesheet.employmentType}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {timesheet.hours.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {timesheets.length === 0 && !timesheetLoading && timesheetStartDate && timesheetEndDate && (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Click "Generate Timesheets" to fetch data for all employees</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 