import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import { toast } from '@/hooks/use-toast';
import TimeClock from './TimeClock';
import TimePunch from './TimePunch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, AlertCircle } from 'lucide-react';

const TimeTrackingWrapper = () => {
  const { user } = useAuth();
  const [employmentType, setEmploymentType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployeeDetails();
  }, [user?._id]); // Add user ID as dependency to re-fetch when user changes

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching employee details for user:', user);
      // Add timestamp to prevent caching
      const response = await api.get('/employees/me', {
        params: {
          _t: Date.now()
        }
      });
      console.log('Employee details response:', response.data);
      setEmploymentType(response.data.employmentType);
      console.log('Employment type set to:', response.data.employmentType);
    } catch (error) {
      console.error('Error fetching employee details:', error);
      const { message } = handleApiError(error);
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
              Error Loading Time Tracking
            </CardTitle>
            <CardDescription>
              Unable to load your employment information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {error}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('Rendering TimeTrackingWrapper with employment type:', employmentType);

  // Determine which component to render based on employment type
  // Based on Employee model enum: ['Part-time', 'Full-time', 'Contract', 'Hourly', 'Consultant']
  const shouldRenderPunch = employmentType === 'Full-time' || employmentType === 'Part-time';
  const shouldRenderClock = employmentType === 'Contract' || employmentType === 'Hourly' || employmentType === 'Consultant';

  console.log('Should render punch:', shouldRenderPunch);
  console.log('Should render clock:', shouldRenderClock);

  if (shouldRenderPunch) {
    console.log('Rendering TimePunch component');
    return <TimePunch key={`punch-${employmentType}`} />;
  }

  if (shouldRenderClock) {
    console.log('Rendering TimeClock component');
    return <TimeClock key={`clock-${employmentType}`} />;
  }

  // Fallback for unknown employment types
  console.log('Rendering fallback component');
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Time Tracking Not Available
          </CardTitle>
          <CardDescription>
            Time tracking is not configured for your employment type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your employment type ({employmentType}) does not have time tracking configured. 
            Please contact your administrator for assistance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTrackingWrapper; 