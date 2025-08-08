import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
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
  DialogFooter,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Receipt, 
  DollarSign, 
  Calendar, 
  FileText, 
  Upload, 
  X, 
  Eye, 
  Trash2,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  TrendingUp,
  Download
} from 'lucide-react';

// Category configurations
const categoryConfig = {
  Travel: { icon: '✈️', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  Meals: { icon: '🍽️', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  'Office Supplies': { icon: '📎', color: 'text-gray-600', bgColor: 'bg-gray-50' },
  Training: { icon: '🎓', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  Equipment: { icon: '💻', color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  Medical: { icon: '🏥', color: 'text-red-600', bgColor: 'bg-red-50' },
  Fuel: { icon: '⛽', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  Accommodation: { icon: '🏨', color: 'text-teal-600', bgColor: 'bg-teal-50' },
  Other: { icon: '📋', color: 'text-slate-600', bgColor: 'bg-slate-50' }
};

const statusConfig = {
  Pending: { 
    icon: Clock, 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50', 
    borderColor: 'border-yellow-200',
    variant: 'secondary' 
  },
  'Under Review': { 
    icon: AlertCircle, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50', 
    borderColor: 'border-blue-200',
    variant: 'default' 
  },
  Approved: { 
    icon: CheckCircle, 
    color: 'text-green-600', 
    bgColor: 'bg-green-50', 
    borderColor: 'border-green-200',
    variant: 'default' 
  },
  Rejected: { 
    icon: XCircle, 
    color: 'text-red-600', 
    bgColor: 'bg-red-50', 
    borderColor: 'border-red-200',
    variant: 'destructive' 
  },
  Paid: { 
    icon: CreditCard, 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-50', 
    borderColor: 'border-emerald-200',
    variant: 'default' 
  }
};

const Reimbursements = () => {
  const [reimbursements, setReimbursements] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReimbursement, setSelectedReimbursement] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [form, setForm] = useState({
    title: '',
    category: '',
    amount: '',
    currency: 'USD',
    description: '',
    expenseDate: '',
    priority: 'Medium',
    tags: '',
    receipts: []
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReimbursements();
  }, [statusFilter]);

  const fetchReimbursements = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reimbursements/my-reimbursements?status=${statusFilter}`);
      setReimbursements(response.data.data);
      setSummary(response.data.summary);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('category', form.category);
      formData.append('amount', form.amount);
      formData.append('currency', form.currency);
      formData.append('description', form.description);
      formData.append('expenseDate', form.expenseDate);
      formData.append('priority', form.priority);
      formData.append('tags', form.tags);

      // Append receipts
      form.receipts.forEach(file => {
        formData.append('receipts', file);
      });

      const response = await api.post('/reimbursements', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast({
        title: "Success",
        description: "Reimbursement request submitted successfully",
      });

      setIsDialogOpen(false);
      resetForm();
      fetchReimbursements();
    } catch (error) {
      handleApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setForm(prev => ({
      ...prev,
      receipts: [...prev.receipts, ...files]
    }));
  };

  const removeFile = (index) => {
    setForm(prev => ({
      ...prev,
      receipts: prev.receipts.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setForm({
      title: '',
      category: '',
      amount: '',
      currency: 'USD',
      description: '',
      expenseDate: '',
      priority: 'Medium',
      tags: '',
      receipts: []
    });
  };

  const viewReimbursement = async (reimbursementId) => {
    try {
      const response = await api.get(`/reimbursements/${reimbursementId}`);
      setSelectedReimbursement(response.data.data);
      setIsViewDialogOpen(true);
    } catch (error) {
      handleApiError(error);
    }
  };

  const deleteReimbursement = async (reimbursementId) => {
    try {
      await api.delete(`/reimbursements/${reimbursementId}`);
      toast({
        title: "Success",
        description: "Reimbursement cancelled successfully",
      });
      fetchReimbursements();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDownloadReceipt = async (reimbursementId, receiptId, fileName) => {
    try {
      const response = await api.get(`/reimbursements/${reimbursementId}/receipts/${receiptId}/download`);
      
      if (response.data.downloadUrl) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.download = fileName || response.data.fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={`${config.color} ${config.bgColor} ${config.borderColor}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getCategoryDisplay = (category) => {
    const config = categoryConfig[category];
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg">{config.icon}</span>
        <span className={config.color}>{category}</span>
      </div>
    );
  };

  const getSummaryStats = () => {
    const stats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      paid: 0,
      totalAmount: 0,
      approvedAmount: 0,
      paidAmount: 0
    };

    summary.forEach(item => {
      stats.total += item.count;
      stats.totalAmount += item.totalAmount;
      
      switch (item._id) {
        case 'Pending':
          stats.pending = item.count;
          break;
        case 'Under Review':
          stats.pending += item.count;
          break;
        case 'Approved':
          stats.approved = item.count;
          stats.approvedAmount = item.totalAmount;
          break;
        case 'Rejected':
          stats.rejected = item.count;
          break;
        case 'Paid':
          stats.paid = item.count;
          stats.paidAmount = item.totalAmount;
          break;
      }
    });

    return stats;
  };

  const stats = getSummaryStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reimbursements</h1>
          <p className="text-muted-foreground">Submit and track your expense reimbursements</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Reimbursement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit Reimbursement Request</DialogTitle>
              <DialogDescription>
                Fill out the details of your expense to request reimbursement
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Lunch meeting with client"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={form.category} onValueChange={(value) => setForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(categoryConfig).map((category) => (
                        <SelectItem key={category} value={category}>
                          <div className="flex items-center gap-2">
                            <span>{categoryConfig[category].icon}</span>
                            <span>{category}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={form.currency} onValueChange={(value) => setForm(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                      <SelectItem value="AUD">AUD (A$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expenseDate">Expense Date *</Label>
                  <Input
                    id="expenseDate"
                    type="date"
                    value={form.expenseDate}
                    onChange={(e) => setForm(prev => ({ ...prev, expenseDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide details about the expense..."
                  className="min-h-[80px]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={form.priority} onValueChange={(value) => setForm(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (optional)</Label>
                  <Input
                    id="tags"
                    value={form.tags}
                    onChange={(e) => setForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="e.g., client, travel, training"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipts">Upload Receipts</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <div className="mt-4">
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <span className="text-sm font-medium text-primary hover:text-primary/80">
                          Click to upload files
                        </span>
                        <span className="text-sm text-muted-foreground"> or drag and drop</span>
                      </Label>
                      <Input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      PNG, JPG, PDF, DOC, XLS up to 5MB each (max 5 files)
                    </p>
                  </div>
                </div>
                
                {form.receipts.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Files:</Label>
                    <div className="space-y-2">
                      {form.receipts.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.totalAmount.toLocaleString()} total amount
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.approvedAmount.toLocaleString()} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
            <CreditCard className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.paid}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.paidAmount.toLocaleString()} received
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Reimbursements</CardTitle>
              <CardDescription>Track the status of your expense reimbursements</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading reimbursements...</p>
            </div>
          ) : reimbursements.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No reimbursements found</h3>
              <p className="text-muted-foreground">
                {statusFilter === 'all' 
                  ? "You haven't submitted any reimbursement requests yet." 
                  : `No reimbursements with status "${statusFilter}" found.`
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Expense Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reimbursements.map((reimbursement) => (
                  <TableRow key={reimbursement._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{reimbursement.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {reimbursement.receiptCount} receipt{reimbursement.receiptCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getCategoryDisplay(reimbursement.category)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: reimbursement.currency || 'USD'
                        }).format(reimbursement.amount)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(reimbursement.expenseDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(reimbursement.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(reimbursement.createdAt), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {reimbursement.daysSinceSubmission} days ago
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewReimbursement(reimbursement._id)}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {(reimbursement.status === 'Pending' || reimbursement.status === 'Under Review') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Coming Soon",
                                description: "Edit functionality will be available soon",
                              });
                            }}
                            title="Edit reimbursement"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {(reimbursement.status === 'Pending' || reimbursement.status === 'Under Review') && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Cancel reimbursement request"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Reimbursement Request?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete your
                                  reimbursement request for <strong>{reimbursement.title}</strong> and remove all associated receipts.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep Request</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteReimbursement(reimbursement._id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Cancel Request
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Reimbursement Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedReimbursement && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getCategoryDisplay(selectedReimbursement.category)}
                  <span>- {selectedReimbursement.title}</span>
                </DialogTitle>
                <DialogDescription>
                  Submitted on {format(new Date(selectedReimbursement.createdAt), 'MMMM dd, yyyy')}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedReimbursement.status)}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                    <div className="mt-1 text-2xl font-bold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: selectedReimbursement.currency || 'USD'
                      }).format(selectedReimbursement.amount)}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Expense Date</Label>
                    <div className="mt-1">{format(new Date(selectedReimbursement.expenseDate), 'MMMM dd, yyyy')}</div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                    <div className="mt-1">
                      <Badge variant="outline">{selectedReimbursement.priority}</Badge>
                    </div>
                  </div>

                  {selectedReimbursement.tags && selectedReimbursement.tags.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Tags</Label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selectedReimbursement.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      <p className="text-sm">{selectedReimbursement.description}</p>
                    </div>
                  </div>

                  {selectedReimbursement.reviewNotes && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Review Notes</Label>
                      <div className="mt-1 p-3 bg-muted rounded-md">
                        <p className="text-sm">{selectedReimbursement.reviewNotes}</p>
                      </div>
                    </div>
                  )}

                                        {selectedReimbursement.receipts && selectedReimbursement.receipts.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Receipts ({selectedReimbursement.receipts.length})
                          </Label>
                          <div className="mt-1 space-y-2">
                            {selectedReimbursement.receipts.map((receipt, index) => (
                              <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  <span className="text-sm">{receipt.originalName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({(receipt.fileSize / 1024 / 1024).toFixed(2)} MB)
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(receipt.fileUrl, '_blank')}
                                    title="View receipt"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDownloadReceipt(selectedReimbursement._id, receipt._id, receipt.originalName)}
                                    title="Download receipt"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                </div>
              </div>

              {selectedReimbursement.statusHistory && selectedReimbursement.statusHistory.length > 0 && (
                <div className="mt-6">
                  <Label className="text-sm font-medium text-muted-foreground">Status History</Label>
                  <div className="mt-2 space-y-2">
                    {selectedReimbursement.statusHistory.map((history, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-muted/50 rounded-md">
                        <div className={`w-2 h-2 rounded-full ${statusConfig[history.status]?.bgColor || 'bg-gray-200'}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{history.status}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(history.updatedAt), 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                          {history.note && (
                            <p className="text-xs text-muted-foreground mt-1">{history.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reimbursements; 