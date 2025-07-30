import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, User, Clock, Calendar } from 'lucide-react';
import { getDepartmentConfig } from '@/lib/departments';

const MyTeam = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myDepartment, setMyDepartment] = useState(null);

  useEffect(() => {
    fetchMyDetails();
  }, []);

  const fetchMyDetails = async () => {
    try {
      const response = await api.get('/employees/me');
      const employee = response.data;
      setMyDepartment(employee.department);
      
      if (employee.department) {
        fetchTeamMembers(employee.department);
      }
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

  const fetchTeamMembers = async (department) => {
    try {
      const response = await api.get(`/employees/department/${department}`);
      setTeamMembers(response.data.data);
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getEmploymentTypeColor = (type) => {
    const colors = {
      'Full-time': 'bg-green-500/10 text-green-500',
      'Part-time': 'bg-blue-500/10 text-blue-500',
      'Contract': 'bg-orange-500/10 text-orange-500',
      'Hourly': 'bg-purple-500/10 text-purple-500',
      'Consultant': 'bg-gray-500/10 text-gray-500'
    };
    return colors[type] || colors['Consultant'];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const departmentConfig = myDepartment ? getDepartmentConfig(myDepartment) : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Team</h1>
          <p className="text-muted-foreground">
            {myDepartment ? `${departmentConfig?.label || myDepartment} Department` : 'Loading department...'}
          </p>
        </div>
        {departmentConfig && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${departmentConfig.bgColor}`}>
            <departmentConfig.icon className={`h-4 w-4 ${departmentConfig.color}`} />
            <span className={`text-sm font-medium ${departmentConfig.color}`}>
              {departmentConfig.label}
            </span>
          </div>
        )}
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {teamMembers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Team Members Found</h3>
            <p className="text-muted-foreground">
              No active employees found in your department.
            </p>
          </div>
        ) : (
          teamMembers.map((member) => (
            <Card key={member._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.profilePic} alt={member.name} />
                    <AvatarFallback className="text-sm font-medium">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold truncate">{member.name}</h3>
                      <Badge variant="outline" className={getEmploymentTypeColor(member.employmentType)}>
                        {member.employmentType}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {member.position || 'No position specified'}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>ID: {member.employeeId}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Team Stats */}
      {teamMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Total Members</div>
                <div className="text-2xl font-bold mt-1">{teamMembers.length}</div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Full-time</div>
                <div className="text-2xl font-bold mt-1">
                  {teamMembers.filter(m => m.employmentType === 'Full-time').length}
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Part-time</div>
                <div className="text-2xl font-bold mt-1">
                  {teamMembers.filter(m => m.employmentType === 'Part-time').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyTeam; 