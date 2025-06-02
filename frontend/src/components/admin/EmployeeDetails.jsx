import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { Upload, User, ArrowLeft, Pencil, Trash2, Download } from 'lucide-react';
import { Card } from "@/components/ui/card";
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
    <div className="container mx-auto -mt-2">
      <div className="flex items-center h-14 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground px-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Employees
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gray-100 dark:bg-gray-800 p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-6">
              <div className="relative group">
                {form?.profilePic ? (
                  <img
                    src={form.profilePic}
                    alt={form.name}
                    className="w-24 h-24 rounded-lg object-cover border-2 border-white"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-white">
                    <User className="h-12 w-12 text-gray-400" />
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
                      className="bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-lg text-sm cursor-pointer flex items-center"
                    >
                      <Upload size={14} className="mr-1" />
                      Update
                    </label>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-3xl font-bold">{form?.name}</h2>
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
                    className="bg-white hover:bg-gray-50"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-white hover:bg-gray-50 text-red-600 hover:text-red-700"
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
            <TabsList className="bg-white dark:bg-gray-700 p-1 gap-1">
              <TabsTrigger 
                value="personal"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
              >
                Personal
              </TabsTrigger>
              <TabsTrigger 
                value="work"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
              >
                Work
              </TabsTrigger>
              <TabsTrigger 
                value="leave"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
              >
                Leave
              </TabsTrigger>
              <TabsTrigger 
                value="documents"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
              >
                Documents
              </TabsTrigger>
              <TabsTrigger 
                value="benefits"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
              >
                Benefits
              </TabsTrigger>
              <TabsTrigger 
                value="performance"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
              >
                Performance
              </TabsTrigger>
              <TabsTrigger 
                value="training"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
              >
                Training
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
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

              <TabsContent value="documents">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Employee Documents</h3>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/admin-dashboard/documents?employeeId=${employeeId}`)}
                      className="bg-white hover:bg-gray-50"
                    >
                      Upload New Document
                    </Button>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-8">
                    {Object.entries(documents).map(([type, docs]) => (
                      <div key={type} className="space-y-4">
                        <h4 className="font-medium capitalize">{type} Documents</h4>
                        {docs.length === 0 ? (
                          <p className="text-muted-foreground text-sm">No {type} documents found</p>
                        ) : (
                          <div className="grid gap-4">
                            {docs.map((doc) => (
                              <div key={doc._id} className="flex justify-between items-center p-4 border rounded-lg bg-white dark:bg-gray-900">
                                <div>
                                  <h3 className="font-medium">{doc.title}</h3>
                                  <p className="text-sm text-gray-500">{doc.description}</p>
                                  <p className="text-xs text-gray-400">
                                    Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownload(doc._id)}
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
            </div>
          </Tabs>
        </div>
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
    <p className="font-medium">{value || 'Not provided'}</p>
  </div>
);

export default EmployeeDetails; 