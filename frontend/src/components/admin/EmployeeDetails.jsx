import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { Upload, User, ArrowLeft, Pencil, Trash2, Download } from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EmployeeDetails = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documents, setDocuments] = useState({
    personal: [],
    payroll: [],
    company: [],
    onboarding: [],
    benefits: [],
    training: []
  });

  useEffect(() => {
    fetchEmployeeDetails();
    fetchAllDocuments();
  }, [employeeId]);

  const fetchEmployeeDetails = async () => {
    try {
      const response = await api.get(`/employees/${employeeId}`);
      setForm(response.data);
    } catch (error) {
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
      await api.put(`/employees/${employeeId}`, form);
      setIsEditing(false);
      fetchEmployeeDetails(); // Refresh the data
    } catch (error) {
      const { message } = handleApiError(error);
      console.error(message);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/employees/${employeeId}`);
      navigate('/admin-dashboard/employees');
    } catch (error) {
      const { message } = handleApiError(error);
      console.error(message);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      const response = await api.post(`/employees/${employeeId}/profile-pic`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setForm(prev => ({ ...prev, profilePic: response.data.profilePic }));
    } catch (error) {
      const { message } = handleApiError(error);
      console.error(message);
      alert('Failed to upload profile picture');
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

  if (!form) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Employees
        </Button>
      </div>

      <Card>
        <CardHeader className="bg-background p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-6">
              <div className="relative group">
                {form?.profilePic ? (
                  <img
                    src={form.profilePic}
                    alt={form.name}
                    className="w-24 h-24 rounded-lg object-cover ring-2 ring-muted"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center ring-2 ring-muted">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                
                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="profile-upload"
                      accept="image/*"
                    />
                    <label
                      htmlFor="profile-upload"
                      className="bg-background/80 hover:bg-background/90 text-foreground px-3 py-2 rounded-lg text-sm cursor-pointer flex items-center shadow-sm"
                    >
                      <Upload size={14} className="mr-1" />
                      Update
                    </label>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-foreground">{form?.name}</h2>
                <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                  <span>{form?.position}</span>
                  {form?.department && (
                    <>
                      <span>•</span>
                      <span>{form.department}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="personal" className="mt-6">
            <div className="relative">
              <div className="overflow-x-auto">
                <TabsList className="w-full inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground">
                  {[
                    'personal',
                    'work',
                    'leave',
                    'documents',
                    'benefits',
                    'performance',
                    'training'
                  ].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>

            <CardContent className="p-6">
              <TabsContent value="documents" className="mt-0">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Employee Documents</h3>
                    <Button
                      onClick={() => navigate(`/admin-dashboard/documents?employeeId=${employeeId}`)}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Document
                    </Button>
                  </div>
                  <Separator />
                  <div className="space-y-8">
                    {Object.entries(documents).map(([type, docs]) => (
                      <div key={type} className="space-y-4">
                        <h4 className="font-medium capitalize text-muted-foreground">{type} Documents</h4>
                        {docs.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No {type} documents found</p>
                        ) : (
                          <div className="grid gap-4">
                            {docs.map((doc) => (
                              <div key={doc._id} className="flex justify-between items-center p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                                <div>
                                  <h3 className="font-medium">{doc.title}</h3>
                                  <p className="text-sm text-muted-foreground">{doc.description}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownload(doc._id)}
                                  className="gap-2"
                                >
                                  <Download className="h-4 w-4" />
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
              </TabsContent>

              <TabsContent value="personal">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isEditing ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="dateOfBirth">Date of Birth</Label>
                          <Input
                            id="dateOfBirth"
                            name="dateOfBirth"
                            type="date"
                            value={form?.dateOfBirth ? new Date(form.dateOfBirth).toISOString().split('T')[0] : ''}
                            onChange={handleInputChange}
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
                        <InfoField label="Date of Birth" value={form?.dateOfBirth ? new Date(form.dateOfBirth).toLocaleDateString() : 'Not provided'} />
                        <InfoField label="SSN" value={form?.ssn} />
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
              </TabsContent>

              <TabsContent value="work">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Work Information</h3>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isEditing ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Input
                            id="department"
                            name="department"
                            value={form?.department || ''}
                            onChange={handleInputChange}
                          />
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
                              <SelectItem value="On leave">On leave</SelectItem>
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
                            disabled={form?.employmentStatus !== 'Terminated'}
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
              </TabsContent>

              <TabsContent value="leave">
                {/* Leave content */}
              </TabsContent>

              <TabsContent value="benefits">
                {/* Benefits content */}
              </TabsContent>

              <TabsContent value="performance">
                {/* Performance content */}
              </TabsContent>

              <TabsContent value="training">
                {/* Training content */}
              </TabsContent>
            </CardContent>
          </Tabs>
        </CardHeader>
      </Card>

      {showDeleteModal && (
        <DeleteConfirmationModal
          employee={form}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

// Helper component for displaying information fields
const InfoField = ({ label, value }) => (
  <div className="space-y-1">
    <Label className="text-sm text-muted-foreground">{label}</Label>
    <p className="font-medium text-foreground">{value || 'Not provided'}</p>
  </div>
);

export default EmployeeDetails; 