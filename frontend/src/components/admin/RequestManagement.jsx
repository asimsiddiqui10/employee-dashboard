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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import { format } from 'date-fns';
import { FileText, UserCog, MoreHorizontal, Search } from 'lucide-react';

const requestTypes = [
  { value: 'document_request', label: 'Document Request', icon: FileText },
  { value: 'details_change', label: 'Details Change', icon: UserCog },
  { value: 'other', label: 'Other Request', icon: MoreHorizontal }
];

const RequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    search: ''
  });
  const [updateForm, setUpdateForm] = useState({
    status: '',
    note: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const fetchRequests = async () => {
    try {
      const params = {
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.type !== 'all' && { type: filters.type })
      };
      const response = await api.get('/requests/all', { params });
      setRequests(response.data.data);
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

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put(`/requests/${selectedRequest._id}/status`, updateForm);
      toast({
        title: "Success",
        description: "Request status updated successfully",
      });
      setShowUpdateDialog(false);
      setSelectedRequest(null);
      setUpdateForm({ status: '', note: '' });
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

  const getTypeIcon = (type) => {
    const requestType = requestTypes.find(t => t.value === type);
    const Icon = requestType?.icon || MoreHorizontal;
    return <Icon className="h-4 w-4" />;
  };

  const filteredRequests = requests.filter(request => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        request.title.toLowerCase().includes(searchTerm) ||
        request.employee?.name.toLowerCase().includes(searchTerm) ||
        request.employee?.employeeId.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Request Management</CardTitle>
              <CardDescription>Manage and process employee requests</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 max-w-sm">
              <Input
                placeholder="Search by title, employee name or ID..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="h-9"
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({ ...filters, type: value })}
            >
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
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

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.employee?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.employee?.employeeId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(request.type)}
                        <span>{requestTypes.find(t => t.value === request.type)?.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>{request.title}</TableCell>
                    <TableCell>
                      {format(new Date(request.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setUpdateForm({ status: request.status, note: request.adminNotes || '' });
                          setShowUpdateDialog(true);
                        }}
                      >
                        Update Status
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Request Status</DialogTitle>
                <DialogDescription>
                  Update the status and add notes for this request.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={updateForm.status}
                    onValueChange={(value) => setUpdateForm({ ...updateForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Notes</label>
                  <Textarea
                    value={updateForm.note}
                    onChange={(e) => setUpdateForm({ ...updateForm, note: e.target.value })}
                    placeholder="Add notes about this status update"
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUpdateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    Update Status
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestManagement; 