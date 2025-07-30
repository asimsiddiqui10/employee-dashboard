import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import { toast } from '@/hooks/use-toast';
import TimeClock from './TimeClock';
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
              Error Loading Hours
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

  // All employees now use TimeClock for hours tracking
  console.log('Rendering TimeClock component');
  return <TimeClock key={`clock-${employmentType}`} />;
};

export default TimeTrackingWrapper; 