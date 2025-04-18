import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Tag, Link as LinkIcon, X, Check, ChevronDown } from 'lucide-react';
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

const AdminNotifications = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [form, setForm] = useState({ title: '', message: '', tags: [], link: '' });
  const [currentTag, setCurrentTag] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [employeeUsers, setEmployeeUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/employees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEmployeeUsers(response.data.map(emp => ({ ...emp, userId: emp.user })));
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setStatus({ type: 'error', message: 'Failed to fetch employees' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleEmployeeSelect = (values) => {
    setSelectedEmployees(Array.isArray(values) ? values : [values]);
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
    if (!form.title || !form.message || selectedEmployees.length === 0) {
      setStatus({ type: 'error', message: 'Please fill all required fields' });
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const userIds = selectedEmployees.map(empId => {
        const employee = employees.find(emp => emp._id === empId);
        return employee?.user?._id;
      }).filter(Boolean);

      if (userIds.length === 0) {
        setStatus({ type: 'error', message: 'No valid recipients selected' });
        return;
      }

      await axios.post('http://localhost:3000/api/notifications', {
        ...form, recipients: userIds
      }, { headers: { 'Authorization': `Bearer ${token}` } });

      setStatus({ type: 'success', message: 'Notification sent successfully' });
      setForm({ title: '', message: '', tags: [], link: '' });
      setSelectedEmployees([]);
    } catch (error) {
      console.error('Error sending notification:', error);
      setStatus({ type: 'error', message: error.response?.data?.error || 'Failed to send notification' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Send Notifications</CardTitle>
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
            <Label htmlFor="recipients">Recipients*</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {selectedEmployees.length > 0
                    ? `${selectedEmployees.length} recipient${selectedEmployees.length === 1 ? '' : 's'} selected`
                    : "Select recipients"}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search employees..." />
                  <CommandEmpty>No employee found.</CommandEmpty>
                  <CommandGroup>
                    {isLoading ? (
                      <CommandItem disabled>Loading...</CommandItem>
                    ) : (
                      employees.map((employee) => (
                        <CommandItem
                          key={employee._id}
                          onSelect={() => {
                            const isSelected = selectedEmployees.includes(employee._id);
                            const newSelected = isSelected
                              ? selectedEmployees.filter((id) => id !== employee._id)
                              : [...selectedEmployees, employee._id];
                            setSelectedEmployees(newSelected);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedEmployees.includes(employee._id) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {employee.name} ({employee.email})
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedEmployees.map((empId) => {
                const employee = employees.find((emp) => emp._id === empId);
                return (
                  <Badge
                    key={empId}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {employee?.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 px-1 hover:bg-transparent"
                      onClick={() => {
                        setSelectedEmployees(selectedEmployees.filter((id) => id !== empId));
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground">Select one or more recipients</p>
          </div>
          
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="Add a tag"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addTag}
              >
                <Tag className="h-4 w-4" />
              </Button>
            </div>
            
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
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
  );
};

export default AdminNotifications;