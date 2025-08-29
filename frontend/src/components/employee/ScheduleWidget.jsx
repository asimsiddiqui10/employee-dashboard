import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Edit } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const ScheduleWidget = ({ isLoading = false }) => {
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
          <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-3 bg-muted rounded animate-pulse"></div>
            <div className="h-3 bg-muted rounded w-2/3 animate-pulse"></div>
            <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Schedule
        </CardTitle>
        <CardDescription className="text-sm">
          Your work schedule for this week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Today's Hours:</span>
            <span className="font-medium">9:00 AM - 5:00 PM</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Weekly Total:</span>
            <span className="font-medium">40 hours</span>
          </div>
          <div className="pt-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/employee-dashboard/schedule')}
            >
              <Edit className="h-3 w-3 mr-2" />
              View Full Schedule
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleWidget; 