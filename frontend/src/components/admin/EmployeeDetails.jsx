import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { Upload, User, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const EmployeeDetails = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchEmployeeDetails();
  }, [employeeId]);

  const fetchEmployeeDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/api/employees/${employeeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setForm(response.data);
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prevForm => {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        return {
          ...prevForm,
          [parent]: { ...prevForm[parent], [child]: value }
        };
      }
      return { ...prevForm, [name]: value };
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/api/employees/${employeeId}`, form, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setIsEditing(false);
      fetchEmployeeDetails();
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Failed to update employee details');
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/employees/${employeeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      navigate('/admin-dashboard/employees');
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:3000/api/employees/${employeeId}/profile-pic`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Update the form state with the new profile pic URL
      setForm(prev => ({ ...prev, profilePic: response.data.profilePic }));
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture');
    }
  };

  if (!form) return <div>Loading...</div>;

  return (
    <Card className="w-full">
      <CardHeader className={cn(
        "pb-8 border-b",
        "bg-[hsl(var(--sidebar-background))] dark:bg-[hsl(var(--sidebar-background))]"
      )}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-6">
            {/* Profile Picture */}
            <div className="relative group">
              {form?.profilePic ? (
                <Avatar className="h-24 w-24">
                  <AvatarImage src={`http://localhost:3000${form.profilePic}`} alt={form.name} />
                  <AvatarFallback>{form.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="h-24 w-24">
                  <AvatarFallback>
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
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
                    className="bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-full text-sm cursor-pointer flex items-center"
                  >
                    <Upload size={14} className="mr-1" />
                    Update
                  </label>
                </div>
              )}
            </div>

            {/* Name and Title */}
            <div>
              <h2 className="text-3xl font-bold text-foreground">{form?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg text-muted-foreground">{form?.position}</span>
                {form?.department && (
                  <Badge variant="secondary">
                    {form.department}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className={cn(
                    "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30",
                    "transition-colors font-medium w-full sm:w-auto"
                  )}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(true)}
                  className={cn(
                    "bg-red-500/10 text-red-500 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30",
                    "transition-colors font-medium w-full sm:w-auto"
                  )}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                onClick={handleSave}
                className={cn(
                  "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30",
                  "transition-colors font-medium w-full sm:w-auto"
                )}
              >
                Save Changes
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => navigate('/admin-dashboard/employees')}
              className={cn(
                "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30",
                "transition-colors font-medium w-full sm:w-auto"
              )}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-8 px-6">
        {/* Personal Information */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <Separator className="my-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input
                      id="employeeId"
                      name="employeeId"
                      value={form?.employeeId || ''}
                      onChange={handleInputChange}
                    />
                  </div>
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
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={form?.phoneNumber || ''}
                      onChange={handleInputChange}
                    />
                  </div>
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
                    <Label htmlFor="gender">Gender</Label>
                    <Input
                      id="gender"
                      name="gender"
                      value={form?.gender || ''}
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
                </>
              ) : (
                <>
                  <InfoField label="Employee ID" value={form?.employeeId} />
                  <InfoField label="Email" value={form?.email} />
                  <InfoField label="Phone Number" value={form?.phoneNumber} />
                  <InfoField 
                    label="Date of Birth" 
                    value={form?.dateOfBirth ? new Date(form.dateOfBirth).toLocaleDateString() : 'Not provided'} 
                  />
                  <InfoField label="Gender" value={form?.gender} />
                  <InfoField label="Nationality" value={form?.nationality} />
                </>
              )}
            </div>
          </div>

          {/* Work Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Work Information</h3>
            <Separator className="my-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoField label="Position" value={form?.position} />
              <InfoField label="Department" value={form?.department} />
              <InfoField label="Employment Type" value={form?.employmentType} />
              <InfoField 
                label="Date of Hire" 
                value={form?.dateOfHire ? new Date(form.dateOfHire).toLocaleDateString() : 'Not provided'} 
              />
              <InfoField label="Work Email" value={form?.workEmail} />
              <InfoField label="Work Phone" value={form?.workPhoneNumber} />
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <Separator className="my-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <InfoField label="Address" value={form?.address} />
              </div>
              <InfoField label="City" value={form?.city} />
              <InfoField label="State" value={form?.state} />
              <InfoField label="Zip Code" value={form?.zipCode} />
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
            <Separator className="my-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoField label="Name" value={form?.emergencyContact?.name} />
              <InfoField label="Phone" value={form?.emergencyContact?.phone} />
            </div>
          </div>
        </div>
      </CardContent>

      {showDeleteModal && (
        <DeleteConfirmationModal
          employee={form}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
        />
      )}
    </Card>
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