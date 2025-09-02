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

  const tabConfig = {
    personal: 'Basic Info',
    work: 'Work',
    compensation: 'Compensation',
    contact: 'Contact',
    emergency: 'Emergency'
  };

  return (
    <div className="min-h-screen">
      {/* Header with employee info */}
      <div className="">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-6">
            {/* Profile Picture - Increased size by 50% */}
            <div className="relative shrink-0">
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

            {/* Employee Name and Info - Reformatted */}
            <div className="flex-1 min-w-0">
              <div className="space-y-1">
                {/* Name and ID on same line */}
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">{employeeDetails.name}</h1>
                  <span className="text-sm text-muted-foreground">{employeeDetails.employeeId}</span>
                </div>
                
                {/* Department and Position */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {employeeDetails.department && (
                    <>
                      <div className="flex items-center gap-1">
                        {(() => {
                          const deptConfig = getDepartmentConfig(employeeDetails.department);
                          const Icon = deptConfig.icon;
                          return (
                            <>
                              <div className={`p-1 rounded transition-colors ${deptConfig.bgColor}`}>
                                <Icon className={`h-3 w-3 transition-colors ${deptConfig.color}`} />
                              </div>
                              <span className={`transition-colors ${deptConfig.color}`}>
                                {employeeDetails.department}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                      {employeeDetails.position && (
                        <>
                          <span>•</span>
                          <span>{employeeDetails.position}</span>
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Email */}
                <div className="text-sm text-muted-foreground">
                  {employeeDetails.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex min-h-[calc(100vh-120px)]">
        {/* Left Sidebar with Tabs - Individual right borders on each item */}
        <div className="w-64 relative">
          <div className="p-4">
            <nav className="space-y-0">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "w-full text-left px-4 py-3 text-sm transition-all",
                    activeTab === tab
                      ? "bg-blue-50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-100 border-r-[3px] border-r-blue-500 font-semibold"
                      : "text-gray-600 dark:text-gray-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/10 hover:text-blue-800 dark:hover:text-blue-200 border-r border-r-gray-300 dark:border-r-gray-600 font-medium"
                  )}
                >
                  {tabConfig[tab] || tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <div className="p-8">
            <div className="max-w-4xl">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyDetails; 