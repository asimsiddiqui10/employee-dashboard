import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import { Send, Tag, Link as LinkIcon, X, Check, ChevronDown, DollarSign, Building2, Megaphone, FileText, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getDepartmentConfig, departments } from "@/lib/departments";

const notificationTypes = [
  { value: 'announcement', label: 'Announcement', icon: Megaphone },
  { value: 'company', label: 'Company', icon: Building2 },
  { value: 'policy', label: 'Policy', icon: FileText },
  { value: 'payroll', label: 'Payroll', icon: DollarSign },
  { value: 'other', label: 'Other', icon: AlertCircle }
];

const timeFilters = [
  { value: '24h', label: 'Past 24 Hours' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' }
];

const AdminNotifications = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [timeFilter, setTimeFilter] = useState('24h');
  const [form, setForm] = useState({
    type: 'announcement',
    title: '',
    message: '',
    priority: 'medium',
    link: '',
    sendToAll: false
  });
  const [currentTag, setCurrentTag] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [employeeUsers, setEmployeeUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => { 
    fetchEmployees();
    fetchNotifications();
  }, [timeFilter]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      const { message } = handleApiError(error);
      setStatus({ type: 'error', message });
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get(`/notifications/all?timeFilter=${timeFilter}`);
      setNotifications(response.data);
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      });
    }
  };

  const formatNotificationDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type) => {
    const notificationType = notificationTypes.find(t => t.value === type);
    return notificationType ? notificationType.icon : AlertCircle;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleTypeChange = (value) => {
    setForm({ ...form, type: value });
  };

  const handleDepartmentChange = (value) => {
    setSelectedDepartments(prev => {
      // If value is an array, use it directly
      if (Array.isArray(value)) return value;
      // If it's a single value, create an array with just that value
      return [value];
    });
  };

  const handleEmployeeSelect = (value) => {
    setSelectedEmployees(prev => {
      // If value is an array, use it directly
      if (Array.isArray(value)) return value;
      // If it's a single value, create an array with just that value
      return [value];
    });
  };

  const addTag = () => {
    if (currentTag.trim() && !form.tags.includes(currentTag.trim())) {
      setForm({ ...form, tags: [...form.tags, currentTag.trim()] });
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setForm({ ...form, tags: form.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message || (!form.sendToAll && selectedEmployees.length === 0 && selectedDepartments.length === 0)) {
      setStatus({ type: 'error', message: 'Please fill all required fields' });
      return;
    }

    try {
      setIsLoading(true);
      let userIds = [];

      if (form.sendToAll) {
        // Get all employee user IDs
        userIds = employees.map(emp => emp.user?._id).filter(Boolean);
      } else if (selectedDepartments.length > 0) {
        // Get user IDs from selected departments
        userIds = employees
          .filter(emp => selectedDepartments.includes(emp.department))
          .map(emp => emp.user?._id)
          .filter(Boolean);
        
        // Add individually selected employees
        const individualUserIds = selectedEmployees
          .map(empId => employees.find(emp => emp._id === empId)?.user?._id)
          .filter(Boolean);
        
        userIds = [...new Set([...userIds, ...individualUserIds])];
      } else {
        // Only individually selected employees
        userIds = selectedEmployees
          .map(empId => employees.find(emp => emp._id === empId)?.user?._id)
          .filter(Boolean);
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
    } catch (error) {
      const { message } = handleApiError(error);
      setStatus({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Recent Notifications Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Recent Notifications</CardTitle>
          <Select
            value={timeFilter}
            onValueChange={setTimeFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {timeFilters.map(filter => (
                <SelectItem key={filter.value} value={filter.value}>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {filter.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No notifications found
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification._id}
                    className="flex items-start space-x-4 rounded-lg border p-4"
                  >
                    <div className={cn(
                      "p-2 rounded-full",
                      notification.type === 'announcement' && "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
                      notification.type === 'company' && "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400",
                      notification.type === 'policy' && "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400",
                      notification.type === 'payroll' && "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400",
                      notification.type === 'other' && "bg-gray-100 text-gray-600 dark:bg-gray-900/50 dark:text-gray-400"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium leading-none">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <div className="flex items-center pt-2">
                        <Badge variant={notification.priority} className="text-xs">
                          {notification.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatNotificationDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Send Notification Section - Existing Form */}
      <Card>
        <CardHeader>
          <CardTitle>Send Notification</CardTitle>
        </CardHeader>
        <CardContent>
          {status.message && (
            <Alert variant={status.type === 'success' ? 'default' : 'destructive'} className="mb-6">
              <AlertDescription className="flex items-center gap-2">
                {status.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {status.message}
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="type">Notification Type</Label>
              <Select
                value={form.type}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {notificationTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Title*</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message*</Label>
              <Textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleInputChange}
                className="min-h-[100px]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(value) => setForm({ ...form, priority: value })}
              >
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
            
            <div className="space-y-2">
              <Label>Recipients*</Label>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sendToAll"
                    checked={form.sendToAll}
                    onChange={(e) => {
                      setForm({ ...form, sendToAll: e.target.checked });
                      if (e.target.checked) {
                        setSelectedEmployees([]);
                        setSelectedDepartments([]);
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="sendToAll" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Send to all employees
                  </Label>
                </div>

                {!form.sendToAll && (
                  <>
                    <div className="space-y-2">
                      <Label>Departments</Label>
                      <Select
                        value={selectedDepartments[0] || ""}
                        onValueChange={handleDepartmentChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(departments).map(([key, dept]) => {
                            const Icon = dept.icon;
                            return (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <div className={`p-1 rounded ${dept.bgColor}`}>
                                    <Icon className={`h-4 w-4 ${dept.color}`} />
                                  </div>
                                  <span>{dept.label}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {selectedDepartments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedDepartments.map(deptKey => {
                            const dept = departments[deptKey];
                            const Icon = dept.icon;
                            return (
                              <Badge
                                key={deptKey}
                                variant="secondary"
                                className="flex items-center gap-2"
                              >
                                <Icon className={`h-4 w-4 ${dept.color}`} />
                                {dept.label}
                                <X
                                  className="h-3 w-3 cursor-pointer"
                                  onClick={() => setSelectedDepartments(prev => prev.filter(d => d !== deptKey))}
                                />
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Additional Employees</Label>
                      <Select
                        value={selectedEmployees[0] || ""}
                        onValueChange={handleEmployeeSelect}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee._id} value={employee._id}>
                              {employee.name} ({employee.employeeId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedEmployees.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedEmployees.map(empId => {
                            const employee = employees.find(emp => emp._id === empId);
                            return (
                              <Badge
                                key={empId}
                                variant="secondary"
                                className="flex items-center gap-2"
                              >
                                {employee?.name} ({employee?.employeeId})
                                <X
                                  className="h-3 w-3 cursor-pointer"
                                  onClick={() => setSelectedEmployees(prev => prev.filter(id => id !== empId))}
                                />
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="link">Link</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="link"
                  name="link"
                  type="url"
                  value={form.link}
                  onChange={handleInputChange}
                  className="pl-9"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              <Send className="mr-2 h-4 w-4" />
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotifications;