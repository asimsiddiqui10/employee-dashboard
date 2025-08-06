import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import { format } from 'date-fns';
import { Plus, FileText, UserCog, MoreHorizontal } from 'lucide-react';

const requestTypes = [
  { value: 'document_request', label: 'Document Request', icon: FileText },
  { value: 'details_change', label: 'Details Change', icon: UserCog },
  { value: 'other', label: 'Other Request', icon: MoreHorizontal }
];

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    type: 'document_request', // Set a default value
    title: '',
    description: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/requests/my-requests');
      console.log('Fetched requests:', response.data); // Add logging
      setRequests(response.data.data || []); // Ensure we handle empty data
    } catch (error) {
      console.error('Error fetching requests:', error); // Add detailed error logging
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.type || !form.title || !form.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await api.post('/requests', form);
      toast({
        title: "Success",
        description: "Request submitted successfully",
      });
      setShowNewRequestDialog(false);
      setForm({ type: 'document_request', title: '', description: '' });
      fetchRequests();
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

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
      processing: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
      completed: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
      rejected: "bg-red-500/10 text-red-500 hover:bg-red-500/20"
    };
    return (
      <Badge className={styles[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Requests</CardTitle>
              <CardDescription>View and manage your requests</CardDescription>
            </div>
            <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Request</DialogTitle>
                  <DialogDescription>
                    Fill in the details for your request below.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Request Type</label>
                    <Select
                      value={form.type}
                      onValueChange={(value) => setForm({ ...form, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select request type" />
                      </SelectTrigger>
                      <SelectContent>
                        {requestTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center">
                              <type.icon className="mr-2 h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Enter request title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Provide details about your request"
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewRequestDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      Submit Request
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request._id} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{request.title}</CardTitle>
                        <CardDescription>
                          {format(new Date(request.createdAt), 'MMM d, yyyy h:mm a')}
                        </CardDescription>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        {request.description}
                      </div>
                      {request.adminNotes && (
                        <div className="mt-2 p-2 bg-muted rounded-md">
                          <div className="text-xs font-medium">Admin Notes:</div>
                          <div className="text-sm">{request.adminNotes}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {requests.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  No requests found. Create a new request to get started.
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Requests; 