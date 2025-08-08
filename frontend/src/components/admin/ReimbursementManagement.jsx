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
import { Label } from "@/components/ui/label";
import { 
  Receipt, 
  DollarSign, 
  Search,
  Filter,
  Eye, 
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  CreditCard,
  TrendingUp,
  TrendingDown,
  FileText,
  User,
  Calendar,
  Building,
  Download
} from 'lucide-react';

// Category and status configurations (same as employee component)
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

const ReimbursementManagement = () => {
  const [reimbursements, setReimbursements] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReimbursement, setSelectedReimbursement] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    priority: 'all',
    search: '',
    startDate: '',
    endDate: ''
  });

  const [reviewForm, setReviewForm] = useState({
    status: '',
    reviewNotes: '',
    paidAmount: ''
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReimbursements();
  }, [filters]);

  const fetchReimbursements = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          queryParams.append(key, value);
        }
      });

      const response = await api.get(`/reimbursements?${queryParams.toString()}`);
      setReimbursements(response.data.data);
      setStats(response.data.stats);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
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

  const openReviewDialog = (reimbursement) => {
    setSelectedReimbursement(reimbursement);
    setReviewForm({
      status: reimbursement.status,
      reviewNotes: reimbursement.reviewNotes || '',
      paidAmount: reimbursement.paidAmount || reimbursement.amount
    });
    setIsReviewDialogOpen(true);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.put(`/reimbursements/${selectedReimbursement._id}/status`, reviewForm);
      
      toast({
        title: "Success",
        description: `Reimbursement ${reviewForm.status.toLowerCase()} successfully`,
      });

      setIsReviewDialogOpen(false);
      fetchReimbursements();
    } catch (error) {
      handleApiError(error);
    } finally {
      setSubmitting(false);
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

  const getPriorityBadge = (priority) => {
    const colors = {
      Low: 'bg-gray-100 text-gray-700',
      Medium: 'bg-blue-100 text-blue-700',
      High: 'bg-orange-100 text-orange-700',
      Urgent: 'bg-red-100 text-red-700'
    };
    
    return (
      <Badge variant="outline" className={colors[priority]}>
        {priority}
      </Badge>
    );
  };

  const getStatsCards = () => {
    const summary = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      paid: 0,
      totalAmount: 0,
      pendingAmount: 0,
      approvedAmount: 0,
      paidAmount: 0
    };

    stats.forEach(stat => {
      summary.total += stat.count;
      summary.totalAmount += stat.totalAmount;

      switch (stat._id) {
        case 'Pending':
          summary.pending += stat.count;
          summary.pendingAmount += stat.totalAmount;
          break;
        case 'Under Review':
          summary.pending += stat.count;
          summary.pendingAmount += stat.totalAmount;
          break;
        case 'Approved':
          summary.approved = stat.count;
          summary.approvedAmount = stat.totalAmount;
          break;
        case 'Rejected':
          summary.rejected = stat.count;
          break;
        case 'Paid':
          summary.paid = stat.count;
          summary.paidAmount = stat.totalAmount;
          break;
      }
    });

    return [
      {
        title: "Total Requests",
        value: summary.total,
        subtitle: `$${summary.totalAmount.toLocaleString()}`,
        icon: Receipt,
        color: "text-slate-600"
      },
      {
        title: "Pending Review",
        value: summary.pending,
        subtitle: `$${summary.pendingAmount.toLocaleString()}`,
        icon: Clock,
        color: "text-yellow-600"
      },
      {
        title: "Approved",
        value: summary.approved,
        subtitle: `$${summary.approvedAmount.toLocaleString()}`,
        icon: CheckCircle,
        color: "text-green-600"
      },
      {
        title: "Paid Out",
        value: summary.paid,
        subtitle: `$${summary.paidAmount.toLocaleString()}`,
        icon: CreditCard,
        color: "text-emerald-600"
      }
    ];
  };

  const statsCards = getStatsCards();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reimbursement Management</h1>
          <p className="text-muted-foreground">Review and manage employee expense reimbursements</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by employee, title..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
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

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => setFilters({
                status: 'all',
                category: 'all',
                priority: 'all',
                search: '',
                startDate: '',
                endDate: ''
              })}
            >
              Clear Filters
            </Button>
            <Button
              variant="outline"
              onClick={() => setFilters(prev => ({ ...prev, status: 'Pending' }))}
            >
              Show Pending Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reimbursements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reimbursement Requests</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `${reimbursements.length} requests found`}
          </CardDescription>
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
                No reimbursements match your current filters.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reimbursements.map((reimbursement) => (
                  <TableRow key={reimbursement._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{reimbursement.employee?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {reimbursement.employee?.employeeId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
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
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(reimbursement.expenseDate), 'MMM dd, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(reimbursement.priority)}
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
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openReviewDialog(reimbursement)}
                        >
                          Review
                        </Button>
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
                  Submitted by {selectedReimbursement.employee?.name} ({selectedReimbursement.employee?.employeeId}) on {format(new Date(selectedReimbursement.createdAt), 'MMMM dd, yyyy')}
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
                    {selectedReimbursement.paidAmount && selectedReimbursement.paidAmount !== selectedReimbursement.amount && (
                      <div className="text-sm text-muted-foreground">
                        Paid: {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: selectedReimbursement.currency || 'USD'
                        }).format(selectedReimbursement.paidAmount)}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Expense Date</Label>
                    <div className="mt-1">{format(new Date(selectedReimbursement.expenseDate), 'MMMM dd, yyyy')}</div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                    <div className="mt-1">
                      {getPriorityBadge(selectedReimbursement.priority)}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Employee</Label>
                    <div className="mt-1">
                      <div className="font-medium">{selectedReimbursement.employee?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedReimbursement.employee?.employeeId} • {selectedReimbursement.employee?.department}
                      </div>
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

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          {selectedReimbursement && (
            <>
              <DialogHeader>
                <DialogTitle>Review Reimbursement</DialogTitle>
                <DialogDescription>
                  Update the status and add notes for {selectedReimbursement.employee?.name}'s reimbursement request
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleReview} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select 
                    value={reviewForm.status} 
                    onValueChange={(value) => setReviewForm(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Under Review">Under Review</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {reviewForm.status === 'Paid' && (
                  <div className="space-y-2">
                    <Label htmlFor="paidAmount">Paid Amount</Label>
                    <Input
                      id="paidAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={reviewForm.paidAmount}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, paidAmount: e.target.value }))}
                      placeholder="Enter paid amount"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reviewNotes">Review Notes</Label>
                  <Textarea
                    id="reviewNotes"
                    value={reviewForm.reviewNotes}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, reviewNotes: e.target.value }))}
                    placeholder="Add notes about your decision..."
                    className="min-h-[100px]"
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Updating...' : 'Update Status'}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReimbursementManagement; 