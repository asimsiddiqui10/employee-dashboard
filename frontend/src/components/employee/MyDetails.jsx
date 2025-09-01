import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useAuth } from '../../context/authContext';
import { User, Eye, EyeOff } from 'lucide-react';
import { handleApiError } from '@/utils/errorHandler';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDepartmentConfig } from '@/lib/departments';
import { cn } from "@/lib/utils";

const MyDetails = () => {
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSSN, setShowSSN] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
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
      
      // Fetch job codes assigned to this employee
      let assignedJobCodes = [];
      try {
        // Get all active job codes and filter by those that have this employee
        const allJobCodesResponse = await api.get('/job-codes/active/all');
        console.log('All active job codes:', allJobCodesResponse.data);
        
        if (allJobCodesResponse.data && Array.isArray(allJobCodesResponse.data)) {
          // Use the employee's _id (MongoDB ObjectId) for comparison
          const employeeMongoId = response.data._id;
          console.log(`Looking for employee with MongoDB _id:`, employeeMongoId);
          
          const filteredJobCodes = allJobCodesResponse.data.filter(jobCode => 
            jobCode.assignedTo && 
            jobCode.assignedTo.some(assignment => 
              assignment.employee && assignment.employee._id === employeeMongoId
            )
          );
          
          console.log('Filtered job codes for this employee:', filteredJobCodes);
          
          assignedJobCodes = filteredJobCodes.map(jobCode => ({
            code: jobCode.code,
            title: jobCode.title,
            description: jobCode.description,
            rate: jobCode.rate
          }));
        }
        
        console.log('Final assigned job codes:', assignedJobCodes);
        
      } catch (jobCodeError) {
        console.log('Error fetching job codes:', jobCodeError);
      }
      
      // Combine employee details with job codes
      const employeeDataWithJobCodes = {
        ...response.data,
        assignedJobCodes: assignedJobCodes
      };
      
      setEmployeeDetails(employeeDataWithJobCodes);
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

  const tabs = [
    'personal',
    'work', 
    'compensation',
    'contact',
    'emergency'
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem label="Full Name" value={employeeDetails.name} />
            <InfoItem label="SSN" value={employeeDetails.ssn || 'Not provided'} isSSN />
            <InfoItem label="Email" value={employeeDetails.email} />
            <InfoItem label="Password" value={employeeDetails.password || 'Not provided'} isPassword />
            <InfoItem label="Phone Number" value={employeeDetails.phoneNumber || 'Not provided'} />
            <InfoItem label="Date of Birth" value={formatDate(employeeDetails.dateOfBirth)} />
            <InfoItem label="Gender" value={employeeDetails.gender || 'Not provided'} />
            <InfoItem label="Marital Status" value={employeeDetails.maritalStatus || 'Not provided'} />
            <InfoItem label="Nationality" value={employeeDetails.nationality || 'Not provided'} />
          </div>
        );

      case 'work':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem label="Position" value={employeeDetails.position} />
            <InfoItem label="Department" value={employeeDetails.department} />
            <InfoItem label="Employment Type" value={employeeDetails.employmentType || 'Not specified'} />
            <InfoItem label="Role" value={employeeDetails.role} />
            <InfoItem label="Status" value={employeeDetails.active ? 'Active' : 'Inactive'} />
            <InfoItem label="Date of Hire" value={formatDate(employeeDetails.dateOfHire)} />
            <InfoItem label="Manager" value={employeeDetails.manager?.name || 'Not assigned'} />
            <InfoItem label="Work Phone" value={employeeDetails.workPhoneNumber || 'Not provided'} />
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Job Codes</p>
              <div className="mt-2">
                {employeeDetails.assignedJobCodes && employeeDetails.assignedJobCodes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {employeeDetails.assignedJobCodes.map((jobCode, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {jobCode.code}: {jobCode.title}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">No job codes assigned</span>
                )}
              </div>
            </div>
          </div>
        );

      case 'compensation':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem label="Compensation Type" value={employeeDetails.compensationType || 'Not specified'} />
            <InfoItem 
              label="Compensation Value" 
              value={employeeDetails.compensationValue ? formatCurrency(employeeDetails.compensationValue) : 'Not specified'} 
            />
          </div>
        );

      case 'contact':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem label="Address" value={employeeDetails.address || 'Not provided'} />
            <InfoItem label="City" value={employeeDetails.city || 'Not provided'} />
            <InfoItem label="State" value={employeeDetails.state || 'Not provided'} />
            <InfoItem label="Postal Code" value={employeeDetails.postalCode || 'Not provided'} />
            <InfoItem label="Country" value={employeeDetails.country || 'Not provided'} />
          </div>
        );

      case 'emergency':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem label="Name" value={employeeDetails.emergencyContact?.name || 'Not provided'} />
            <InfoItem label="Relationship" value={employeeDetails.emergencyContact?.relationship || 'Not provided'} />
            <InfoItem label="Phone" value={employeeDetails.emergencyContact?.phone || 'Not provided'} />
            <InfoItem label="Email" value={employeeDetails.emergencyContact?.email || 'Not provided'} />
          </div>
        );

      default:
        return null;
    }
  };

  const InfoItem = ({ label, value, isPassword, isSSN }) => {
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
            <p className={`text-base font-medium ${deptConfig.color}`}>{value}</p>
          </div>
        </div>
      );
    }

    if (isPassword || isSSN) {
      const isVisible = isPassword ? showPassword : showSSN;
      const toggleVisibility = isPassword ? () => setShowPassword(!showPassword) : () => setShowSSN(!showSSN);
      return (
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="flex items-center gap-2">
            <p className="text-base font-medium text-foreground">
              {isVisible ? value : '••••••••'}
            </p>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0"
              onClick={toggleVisibility}
            >
              {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-base font-medium text-foreground">{value}</p>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card className="border-none">
        {/* Header Section */}
        <CardHeader className="px-6 pb-0">
          <div className="flex flex-col lg:flex-row items-start gap-6 pb-6">
            {/* Profile Picture */}
            <div className="relative shrink-0">
              {employeeDetails.profilePic ? (
                <img
                  src={employeeDetails.profilePic}
                  alt={employeeDetails.name}
                  className="w-24 h-24 lg:w-32 lg:h-32 rounded-lg object-cover ring-2 ring-muted"
                />
              ) : (
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-lg bg-muted flex items-center justify-center ring-2 ring-muted">
                  <User className="h-12 w-12 lg:h-16 lg:w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Employee Info */}
            <div className="flex-1 min-w-0 w-full">
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <h2 className="text-xl lg:text-2xl font-semibold text-foreground">{employeeDetails.name}</h2>
                </div>

                {/* Position, Department and ID */}
                <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                  <span>{employeeDetails.position}</span>
                  {employeeDetails.department && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <div className="flex items-center gap-1">
                        {(() => {
                          const deptConfig = getDepartmentConfig(employeeDetails.department);
                          const Icon = deptConfig.icon;
                          return (
                            <>
                              <div className={`p-1 rounded transition-colors ${deptConfig.bgColor}`}>
                                <Icon className={`h-3.5 w-3.5 transition-colors ${deptConfig.color}`} />
                              </div>
                              <span className={`transition-colors ${deptConfig.color}`}>
                                {employeeDetails.department}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </>
                  )}
                  <span className="hidden sm:inline">•</span>
                  <span>ID: {employeeDetails.employeeId}</span>
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
    </div>
  );
};

export default MyDetails; 