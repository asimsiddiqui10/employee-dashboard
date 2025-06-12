import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useAuth } from '../../context/authContext';
import { User } from 'lucide-react';
import { handleApiError } from '@/utils/errorHandler';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getDepartmentConfig } from '@/lib/departments';

const MyDetails = () => {
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchEmployeeDetails();
    } else {
      setLoading(false);
      toast({
        title: "Error",
        description: "User not found. Please try logging in again.",
        variant: "destructive",
      });
    }
  }, [user]);

  const fetchEmployeeDetails = async () => {
    try {
      const response = await api.get('/employees/me');
      console.log('Employee details:', response.data);
      setEmployeeDetails(response.data);
    } catch (error) {
      const { message } = handleApiError(error);
      console.error('Error fetching employee details:', error);
      toast({
        title: "Error",
        description: "Failed to load employee details. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading your details...</p>
      </div>
    </div>
  );

  if (!employeeDetails) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-muted-foreground">No employee details found.</p>
      </div>
    </div>
  );

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : 'Not provided';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const InfoItem = ({ label, value, isSpecial }) => {
    if (label === "Department" && value) {
      const deptConfig = getDepartmentConfig(value);
      const Icon = deptConfig.icon;
      return (
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className={`p-1.5 rounded-md ${deptConfig.bgColor}`}>
              <Icon className={`h-4 w-4 ${deptConfig.color}`} />
            </div>
            <p className={`font-medium ${deptConfig.color}`}>{value}</p>
          </div>
        </div>
      );
    }
    return (
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground">{value}</p>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="bg-background p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-6">
              <div className="relative">
                {employeeDetails.profilePic ? (
                  <img
                    src={employeeDetails.profilePic}
                    alt={employeeDetails.name}
                    className="w-24 h-24 rounded-lg object-cover ring-2 ring-muted"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center ring-2 ring-muted">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-foreground">{employeeDetails.name}</h2>
                <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                  <span>{employeeDetails.position}</span>
                  {employeeDetails.department && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        {(() => {
                          const deptConfig = getDepartmentConfig(employeeDetails.department);
                          const Icon = deptConfig.icon;
                          return (
                            <>
                              <Icon className={`h-4 w-4 ${deptConfig.color}`} />
                              <span className={deptConfig.color}>{employeeDetails.department}</span>
                            </>
                          );
                        })()}
                      </div>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Employee ID: {employeeDetails.employeeId}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {/* Personal Information */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Personal Information</h2>
            <Separator className="mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem label="Full Name" value={employeeDetails.name} />
              <InfoItem label="SSN" value={employeeDetails.ssn || 'Not provided'} />
              <InfoItem label="Email" value={employeeDetails.email} />
              <InfoItem label="Phone Number" value={employeeDetails.phoneNumber || 'Not provided'} />
              <InfoItem label="Work Phone" value={employeeDetails.workPhoneNumber || 'Not provided'} />
              <InfoItem label="Date of Birth" value={formatDate(employeeDetails.dateOfBirth)} />
              <InfoItem label="Gender" value={employeeDetails.gender || 'Not provided'} />
              <InfoItem label="Marital Status" value={employeeDetails.maritalStatus || 'Not provided'} />
              <InfoItem label="Nationality" value={employeeDetails.nationality || 'Not provided'} />
            </div>
          </div>

          {/* Work Information */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Work Information</h2>
            <Separator className="mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem label="Position" value={employeeDetails.position} />
              <InfoItem label="Department" value={employeeDetails.department} />
              <InfoItem label="Employment Type" value={employeeDetails.employmentType || 'Not specified'} />
              <InfoItem label="Role" value={employeeDetails.role} />
              <InfoItem label="Status" value={employeeDetails.active ? 'Active' : 'Inactive'} />
              <InfoItem label="Date of Hire" value={formatDate(employeeDetails.dateOfHire)} />
              <InfoItem label="Manager" value={employeeDetails.manager?.name || 'Not assigned'} />
            </div>
          </div>

          {/* Compensation Information */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Compensation Information</h2>
            <Separator className="mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem label="Compensation Type" value={employeeDetails.compensationType || 'Not specified'} />
              <InfoItem 
                label="Compensation Value" 
                value={employeeDetails.compensationValue ? formatCurrency(employeeDetails.compensationValue) : 'Not specified'} 
              />
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Contact Information</h2>
            <Separator className="mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem label="Address" value={employeeDetails.address || 'Not provided'} />
              <InfoItem label="City" value={employeeDetails.city || 'Not provided'} />
              <InfoItem label="State" value={employeeDetails.state || 'Not provided'} />
              <InfoItem label="Postal Code" value={employeeDetails.postalCode || 'Not provided'} />
              <InfoItem label="Country" value={employeeDetails.country || 'Not provided'} />
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Emergency Contact</h2>
            <Separator className="mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem label="Name" value={employeeDetails.emergencyContact?.name || 'Not provided'} />
              <InfoItem label="Relationship" value={employeeDetails.emergencyContact?.relationship || 'Not provided'} />
              <InfoItem label="Phone" value={employeeDetails.emergencyContact?.phone || 'Not provided'} />
              <InfoItem label="Email" value={employeeDetails.emergencyContact?.email || 'Not provided'} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyDetails; 