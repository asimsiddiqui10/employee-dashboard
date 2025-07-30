import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/context/authContext';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import { toast } from '@/hooks/use-toast';
import { getDepartmentConfig } from '@/lib/departments';

const MyTeamCard = () => {
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
      console.error('Error fetching employee details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async (department) => {
    try {
      const response = await api.get(`/employees/department/${department}`);
      // Get only the first 4 team members for the card
      setTeamMembers(response.data.data.slice(0, 4));
    } catch (error) {
      const { message } = handleApiError(error);
      console.error('Error fetching team members:', error);
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
      <Card className="col-span-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-green-700">
            <Users className="h-5 w-5" />
            My Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const departmentConfig = myDepartment ? getDepartmentConfig(myDepartment) : null;

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-green-700">
          <Users className="h-5 w-5" />
          My Team
          {departmentConfig && (
            <Badge variant="outline" className={`text-xs ${departmentConfig.bgColor} ${departmentConfig.color}`}>
              {departmentConfig.label}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {teamMembers.length === 0 ? (
          <div className="text-center py-6">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No team members found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamMembers.map((member) => (
              <div key={member._id} className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.profilePic} alt={member.name} />
                  <AvatarFallback className="text-xs font-medium">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {member.position || 'No position'}
                  </p>
                  <Badge variant="outline" className={`text-xs mt-1 ${getEmploymentTypeColor(member.employmentType)}`}>
                    {member.employmentType}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyTeamCard; 