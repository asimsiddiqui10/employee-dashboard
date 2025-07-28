import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { Upload, User, ArrowLeft, Pencil, Trash2, Download, Eye, EyeOff, Key } from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getDepartmentConfig, departments } from "@/lib/departments";
import ChangePasswordModal from './ChangePasswordModal';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const EmployeeDetails = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [documents, setDocuments] = useState({
    personal: [],
    payroll: [],
    company: [],
    onboarding: [],
    benefits: [],
    training: []
  });
  const [employees, setEmployees] = useState([]);
  const [showSSN, setShowSSN] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveLoading, setLeaveLoading] = useState(false);

  useEffect(() => {
    fetchEmployeeDetails();
    fetchAllDocuments();
    fetchEmployees();
  }, [employeeId]);

  useEffect(() => {
    if (activeTab === 'leave') {
      fetchLeaveRequests();
    }
  }, [activeTab, employeeId]);

  useEffect(() => {
    // When employment status changes to Terminated, set termination date
    if (form?.employmentStatus === 'Terminated' && !form.terminationDate) {
      setForm(prev => ({
        ...prev,
        terminationDate: new Date().toISOString().split('T')[0]
      }));
    }
  }, [form?.employmentStatus]);

  const fetchEmployeeDetails = async () => {
    try {
      console.log('Fetching employee details for:', employeeId);
      const response = await api.get(`/employees/${employeeId}`);
      console.log('Fetched employee details:', response.data);
      
      // Format the data to ensure supervisor is handled consistently
      const formattedData = {
        ...response.data,
        supervisor: response.data.supervisor?._id || null
      };
      
      console.log('Setting formatted form data:', formattedData);
      setForm(formattedData);
    } catch (error) {
      console.error('Error fetching employee details:', error.response || error);
      const { message } = handleApiError(error);
      console.error(message);
    }
  };

  const fetchAllDocuments = async () => {
    try {
      const documentTypes = ['personal', 'payroll', 'company', 'onboarding', 'benefits', 'training'];
      console.log('Fetching documents for employee:', employeeId);
      
      const fetchPromises = documentTypes.map(type => 
        api.get(`/documents/type/${type}?employeeId=${employeeId}`)
          .then(response => {
            console.log(`Fetched ${type} documents:`, response.data);
            return {
              type,
              documents: response.data
            };
          })
          .catch(error => {
            console.error(`Error fetching ${type} documents:`, error.response || error);
            return {
              type,
              documents: []
            };
          })
      );
      
      const results = await Promise.all(fetchPromises);
      const grouped = results.reduce((acc, { type, documents }) => {
        acc[type] = documents;
        return acc;
      }, {
        personal: [],
        payroll: [],
        company: [],
        onboarding: [],
        benefits: [],
        training: []
      });
      
      console.log('All documents fetched:', grouped);
      setDocuments(grouped);
    } catch (error) {
      console.error('Error in fetchAllDocuments:', error.response || error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error.response || error);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      setLeaveLoading(true);
      const response = await api.get(`/leaves/employee/${employeeId}`);
      setLeaveRequests(response.data.data || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error.response || error);
      const { message } = handleApiError(error);
      console.error(message);
    } finally {
      setLeaveLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      // Create a copy of the form data to modify
      const formData = { ...form };
      
      // Store the original email to check if it changed
      const originalEmail = form.email;
      
      // Handle supervisor field
      if (formData.supervisor) {
        // If supervisor is an object with _id, use the _id
        formData.supervisor = formData.supervisor._id || formData.supervisor;
      }

      console.log('Saving employee with form data:', formData);
      
      // Update employee details (this will also update the user's email)
      const response = await api.put(`/employees/${employeeId}`, formData);
      console.log('Save response:', response.data);
      
      setIsEditing(false);
      await fetchEmployeeDetails(); // Refresh the data
      
      // Show different toast messages based on whether email was changed
      if (formData.email !== originalEmail) {
        toast({
          title: "Success",
          description: "Employee details updated successfully. New login credentials have been set with the updated email.",
          duration: 5000,
        });
      } else {
        toast({
          title: "Success",
          description: "Employee details updated successfully",
        });
      }
    } catch (error) {
      console.error('Error saving employee:', error.response || error);
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message || "Failed to update employee details",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/employees/${employeeId}`);
      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message || "Employee deleted successfully",
        });
        setShowDeleteModal(false);
        navigate('/admin-dashboard/employees', { replace: true });
      } else {
        throw new Error(response.data.message || 'Failed to delete employee');
      }
    } catch (error) {
      const { message } = handleApiError(error);
      console.error('Error deleting employee:', error);
      toast({
        title: "Error",
        description: message || "Failed to delete employee",
        variant: "destructive",
      });
      setShowDeleteModal(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      console.log('Uploading profile picture for employee:', employeeId);
      const response = await api.post(`/employees/${employeeId}/profile-pic`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Profile picture upload response:', response.data);
      setForm(prev => ({ ...prev, profilePic: response.data.profilePic }));
      
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      const { message } = handleApiError(error);
      
      toast({
        title: "Error",
        description: message || "Failed to upload profile picture",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (documentId) => {
    try {
      const response = await api.get(`/documents/download/${documentId}`);
      if (response.data.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
      } else {
        console.error('Download URL not found in response:', response.data);
      }
    } catch (error) {
      console.error('Error downloading document:', error.response || error);
      const { message } = handleApiError(error);
      alert(`Failed to download document: ${message}`);
    }
  };

  const handlePasswordChange = async (passwordData) => {
    try {
      const response = await api.put(`/employees/${employeeId}/change-password`, passwordData);
      
      if (response.data.message) {
        toast({
          title: "Success",
          description: "Password changed successfully",
        });
        setShowPasswordModal(false);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive",
      });
    }
  };

  const tabs = [
    'personal',
    'work',
    'leave',
    'payroll',
    'documents',
    'benefits',
    'performance',
    'training'
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'payroll':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Payroll Documents</h3>
              <Button
                onClick={() => navigate(`/admin-dashboard/documents?employeeId=${employeeId}&type=payroll`)}
                size="sm"
                className="h-8"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Payroll Document
              </Button>
            </div>
            <Separator className="my-4" />
            <div className="space-y-6">
              {documents.payroll.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payroll documents found</p>
              ) : (
                <div className="grid gap-3">
                  {documents.payroll.map((doc) => (
                    <div key={doc._id} className="flex justify-between items-center p-3 rounded-lg border bg-card text-card-foreground">
                      <div>
                        <h3 className="font-medium text-sm">{doc.title}</h3>
                        <p className="text-sm text-muted-foreground">{doc.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(doc._id)}
                        className="h-8"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 'documents':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Employee Documents</h3>
              <Button
                onClick={() => navigate(`/admin-dashboard/documents?employeeId=${employeeId}`)}
                size="sm"
                className="h-8"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
            <Separator className="my-4" />
            <div className="space-y-6">
              {Object.entries(documents)
                .filter(([type]) => type !== 'payroll') // Exclude payroll documents
                .map(([type, docs]) => (
                <div key={type} className="space-y-3">
                  <h4 className="font-medium capitalize text-sm text-muted-foreground">{type} Documents</h4>
                  {docs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No {type} documents found</p>
                  ) : (
                    <div className="grid gap-3">
                      {docs.map((doc) => (
                        <div key={doc._id} className="flex justify-between items-center p-3 rounded-lg border bg-card text-card-foreground">
                          <div>
                            <h3 className="font-medium text-sm">{doc.title}</h3>
                            <p className="text-sm text-muted-foreground">{doc.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(doc._id)}
                            className="h-8"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 'personal':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Personal Information</h3>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form?.email || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={form?.dateOfBirth ? new Date(form.dateOfBirth).toISOString().split('T')[0] : ''}
                      onChange={handleInputChange}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ssn">SSN</Label>
                    <Input
                      id="ssn"
                      name="ssn"
                      value={form?.ssn || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      name="nationality"
                      value={form?.nationality || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={form?.phoneNumber || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={form?.address || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={form?.city || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={form?.state || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={form?.zipCode || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="educationLevel">Education Level</Label>
                    <Input
                      id="educationLevel"
                      name="educationLevel"
                      value={form?.educationLevel || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="certifications">Certifications (comma-separated)</Label>
                    <Input
                      id="certifications"
                      name="certifications"
                      value={form?.certifications?.join(', ') || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact.name">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContact.name"
                      name="emergencyContact.name"
                      value={form?.emergencyContact?.name || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact.phone">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyContact.phone"
                      name="emergencyContact.phone"
                      value={form?.emergencyContact?.phone || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              ) : (
                <>
                  <InfoField label="Gender" value={form?.gender} />
                  <InfoField label="Marital Status" value={form?.maritalStatus} />
                  <InfoField label="Date of Birth" value={form?.dateOfBirth ? new Date(form.dateOfBirth).toLocaleDateString() : 'Not provided'} />
                  <InfoField label="SSN" value={form?.ssn} isSSN />
                  <InfoField label="Nationality" value={form?.nationality} />
                  <InfoField label="Phone Number" value={form?.phoneNumber} />
                  <InfoField label="Address" value={form?.address} />
                  <InfoField label="City" value={form?.city} />
                  <InfoField label="State" value={form?.state} />
                  <InfoField label="ZIP Code" value={form?.zipCode} />
                  <InfoField label="Education Level" value={form?.educationLevel} />
                  <InfoField label="Certifications" value={form?.certifications?.join(', ')} />
                  <InfoField label="Emergency Contact Name" value={form?.emergencyContact?.name} />
                  <InfoField label="Emergency Contact Phone" value={form?.emergencyContact?.phone} />
                </>
              )}
            </div>
          </div>
        );
      case 'work':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Work Information</h3>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm">Department</Label>
                    <Select
                      value={form?.department || ''}
                      onValueChange={(value) => handleInputChange({ target: { name: 'department', value } })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(departments).map(([key, dept]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <dept.icon className={`h-4 w-4 ${dept.color}`} />
                              <span>{dept.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supervisor">Supervisor</Label>
                    <Select
                      value={form?.supervisor || 'none'}
                      onValueChange={(value) => {
                        console.log('Supervisor selection changed to:', value);
                        setForm(prev => ({
                          ...prev,
                          supervisor: value === 'none' ? null : value
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supervisor">
                          {form?.supervisor ? 
                            employees?.find(emp => emp._id === form.supervisor)?.name || 'None'
                            : 'None'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {employees?.filter(emp => emp._id !== form?._id).map((employee) => (
                          <SelectItem key={employee._id} value={employee._id}>
                            {employee.name} ({employee.employeeId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      name="position"
                      value={form?.position || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      name="jobTitle"
                      value={form?.jobTitle || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employmentType">Employment Type</Label>
                    <Select
                      value={form?.employmentType || ''}
                      onValueChange={(value) => handleInputChange({ target: { name: 'employmentType', value } })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Consultant">Consultant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employmentStatus">Employment Status</Label>
                    <Select
                      value={form?.employmentStatus || ''}
                      onValueChange={(value) => handleInputChange({ target: { name: 'employmentStatus', value } })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="On leave">On Leave</SelectItem>
                        <SelectItem value="Terminated">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfHire">Date of Hire</Label>
                    <Input
                      id="dateOfHire"
                      name="dateOfHire"
                      type="date"
                      value={form?.dateOfHire ? new Date(form.dateOfHire).toISOString().split('T')[0] : ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="terminationDate">Termination Date</Label>
                    <Input
                      id="terminationDate"
                      name="terminationDate"
                      type="date"
                      value={form?.terminationDate ? new Date(form.terminationDate).toISOString().split('T')[0] : ''}
                      onChange={handleInputChange}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="terminationReason">Termination Reason</Label>
                    <Input
                      id="terminationReason"
                      name="terminationReason"
                      value={form?.terminationReason || ''}
                      onChange={handleInputChange}
                      className="h-9"
                      placeholder="Enter reason for termination"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workEmail">Work Email</Label>
                    <Input
                      id="workEmail"
                      name="workEmail"
                      type="email"
                      value={form?.workEmail || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workPhoneNumber">Work Phone Number</Label>
                    <Input
                      id="workPhoneNumber"
                      name="workPhoneNumber"
                      value={form?.workPhoneNumber || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="jobDescription">Job Description</Label>
                    <Input
                      id="jobDescription"
                      name="jobDescription"
                      value={form?.jobDescription || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              ) : (
                <>
                  <InfoField label="Department" value={form?.department} />
                  <InfoField 
                    label="Supervisor" 
                    value={
                      employees?.find(emp => emp._id === form?.supervisor)?.name || 'None'
                    } 
                  />
                  <InfoField label="Position" value={form?.position} />
                  <InfoField label="Job Title" value={form?.jobTitle} />
                  <InfoField label="Employment Type" value={form?.employmentType} />
                  <InfoField label="Employment Status" value={form?.employmentStatus} />
                  <InfoField label="Date of Hire" value={form?.dateOfHire ? new Date(form.dateOfHire).toLocaleDateString() : 'Not provided'} />
                  <InfoField label="Termination Date" value={form?.terminationDate ? new Date(form.terminationDate).toLocaleDateString() : 'Not provided'} />
                  <InfoField label="Work Email" value={form?.workEmail} />
                  <InfoField label="Work Phone Number" value={form?.workPhoneNumber} />
                  <InfoField label="Job Description" value={form?.jobDescription} />
                </>
              )}
            </div>
          </div>
        );
      case 'leave':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Leave History</h3>
            </div>
            <Separator className="my-4" />
            <div className="space-y-6">
              {leaveLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading leave history...</div>
                </div>
              ) : leaveRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No leave requests found</p>
              ) : (
                <div className="grid gap-3">
                  {leaveRequests.map((request) => (
                    <div key={request._id} className="flex justify-between items-center p-4 rounded-lg border bg-card text-card-foreground">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge 
                            variant={
                              request.status === 'Approved' 
                                ? 'default' 
                                : request.status === 'Rejected' 
                                ? 'destructive' 
                                : 'secondary'
                            }
                            className={
                              request.status === 'Approved' 
                                ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' 
                                : request.status === 'Rejected' 
                                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                                : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                            }
                          >
                            {request.status}
                          </Badge>
                          <span className="text-sm font-medium">{request.leaveType}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {request.totalDays} days • Requested on {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                        {request.description && (
                          <div className="text-sm text-muted-foreground mt-2">
                            {request.description}
                          </div>
                        )}
                        {request.reviewNotes && (
                          <div className="text-sm text-muted-foreground mt-2">
                            <span className="font-medium">Review Notes:</span> {request.reviewNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Move InfoField inside EmployeeDetails component
  const InfoField = ({ label, value, isPassword, isSSN }) => {
    if (isPassword || isSSN) {
      const isVisible = isPassword ? showPassword : showSSN;
      const toggleVisibility = isPassword ? () => setShowPassword(!showPassword) : () => setShowSSN(!showSSN);
      return (
        <div className="space-y-1.5">
          <Label>{label}</Label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  name={label.toLowerCase()}
                  value={value || ''}
                  onChange={handleInputChange}
                  type={isVisible ? "text" : "password"}
                />
              ) : (
                <p className="text-sm">{isVisible ? value : '••••••••'}</p>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0"
              onClick={toggleVisibility}
              type="button"
            >
              {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-1.5">
        <Label>{label}</Label>
        {isEditing ? (
          <Input
            name={label.toLowerCase()}
            value={value || ''}
            onChange={handleInputChange}
          />
        ) : (
          <p className="text-sm">{value || 'Not provided'}</p>
        )}
      </div>
    );
  };

  if (!form) return <div>Loading...</div>;

  return (
    <div className="container mx-auto pt-2 pb-6">
      <Card className="border-none">
        {/* Header Section */}
        <CardHeader className="px-6 pb-0">
          <div className="flex flex-col lg:flex-row items-start gap-6 pb-6">
            {/* Profile Picture */}
            <div className="relative group shrink-0">
              {form?.profilePic ? (
                <img
                  src={form.profilePic}
                  alt={form.name}
                  className="w-24 h-24 lg:w-32 lg:h-32 rounded-lg object-cover ring-2 ring-muted"
                />
              ) : (
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-lg bg-muted flex items-center justify-center ring-2 ring-muted">
                  <User className="h-12 w-12 lg:h-16 lg:w-16 text-muted-foreground" />
                </div>
              )}
              
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="profile-upload"
                    accept="image/*"
                  />
                  <label
                    htmlFor="profile-upload"
                    className="bg-background/95 hover:bg-background/100 text-foreground px-3 py-2 rounded-md text-sm cursor-pointer flex items-center shadow-sm"
                  >
                    <Upload size={14} className="mr-2" />
                    Update Photo
                  </label>
                </div>
              )}
            </div>

            {/* Employee Info and Actions */}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-4">
                  {/* Back Button and Name */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(-1)}
                      className="h-10 w-10 -ml-2.5"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    {isEditing ? (
                      <Input
                        value={form?.name || ''}
                        onChange={(e) => handleInputChange({ target: { name: 'name', value: e.target.value } })}
                        className="h-9 text-xl font-semibold"
                      />
                    ) : (
                      <h2 className="text-xl lg:text-2xl font-semibold text-foreground">{form?.name}</h2>
                    )}
                  </div>

                  {/* Position, Department and ID */}
                  <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                    {isEditing ? (
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Input
                          value={form?.position || ''}
                          onChange={(e) => handleInputChange({ target: { name: 'position', value: e.target.value } })}
                          className="h-8 w-full sm:w-40"
                          placeholder="Position"
                        />
                        <span className="hidden sm:inline">•</span>
                        <Select
                          value={form?.department || ''}
                          onValueChange={(value) => handleInputChange({ target: { name: 'department', value } })}
                        >
                          <SelectTrigger className="h-8 w-full sm:w-40">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(departments).map(([key, dept]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <dept.icon className={`h-4 w-4 ${dept.color}`} />
                                  <span>{dept.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="hidden sm:inline"> </span>
                        <Input
                          value={form?.employeeId || ''}
                          onChange={(e) => handleInputChange({ target: { name: 'employeeId', value: e.target.value } })}
                          className="h-8 w-full sm:w-32"
                          placeholder="Employee ID"
                        />
                      </div>
                    ) : (
                      <>
                        <span>{form?.position}</span>
                        {form?.department && (
                          <>
                            <span className="hidden sm:inline"> </span>
                            <div className="flex items-center gap-1">
                              {(() => {
                                const deptConfig = getDepartmentConfig(form.department);
                                const Icon = deptConfig.icon;
                                return (
                                  <>
                                    <div className={`p-1 rounded transition-colors ${deptConfig.bgColor}`}>
                                      <Icon className={`h-3.5 w-3.5 transition-colors ${deptConfig.color}`} />
                                    </div>
                                    <span className={`transition-colors ${deptConfig.color}`}>
                                      {form.department}
                                    </span>
                                  </>
                                );
                              })()}
                            </div>
                          </>
                        )}
                        <span className="hidden sm:inline"></span>
                        <span>ID: {form?.employeeId}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  {!isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="h-8"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPasswordModal(true)}
                        className="h-8"
                      >
                        <Key className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteModal(true)}
                        className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSave}
                      className="h-8"
                    >
                      Save Changes
                    </Button>
                  )}
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="mt-6 overflow-x-auto pb-2">
                <div className="flex space-x-1 bg-accent p-1 rounded-lg min-w-max">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap",
                        activeTab === tab
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-accent-foreground/80 hover:text-accent-foreground hover:bg-accent-foreground/10"
                      )}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Content Section */}
        <CardContent className="px-4 sm:px-6 pt-6">
          <div className="max-w-full overflow-x-auto">
            {renderTabContent()}
          </div>
        </CardContent>
      </Card>

      {showDeleteModal && (
        <DeleteConfirmationModal
          employee={form}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
        />
      )}

      {showPasswordModal && (
        <ChangePasswordModal
          employee={form}
          onClose={() => setShowPasswordModal(false)}
          onSubmit={handlePasswordChange}
        />
      )}
    </div>
  );
};

export default EmployeeDetails;