import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';

// Custom Semi-Circle Progress Component
const SemiCircularProgress = ({ value, total, size = 120, strokeWidth = 12 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // Half circle
  const offset = circumference - (value / total) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size / 2 + strokeWidth / 2}
        viewBox={`0 0 ${size} ${size / 2 + strokeWidth / 2}`}
      >
        {/* Background semi-circle */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted-foreground/20"
          strokeLinecap="round"
        />
        {/* Progress semi-circle */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-500 ease-in-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ marginTop: '15px' }}>
        <div className="text-2xl font-bold text-primary">
          {value}
        </div>
        <div className="text-xs text-muted-foreground">
          OUT OF {total}
        </div>
      </div>
    </div>
  );
};

const TimeOffCard = () => {
  const navigate = useNavigate();
  const [leaveSummary, setLeaveSummary] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      
      // Fetch employee details with leave summary
      const employeeResponse = await api.get('/employees/me');
      setLeaveSummary(employeeResponse.data.leaveSummary);
      
      // Fetch recent leave requests
      const requestsResponse = await api.get('/leaves/my-requests');
      setRecentRequests(requestsResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching leave data:', error);
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

  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20 dark:text-yellow-400 dark:border-yellow-400/30",
      Approved: "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20 dark:text-green-400 dark:border-green-400/30", 
      Rejected: "bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20 dark:text-red-400 dark:border-red-400/30"
    };
    return <Badge className={styles[status]} variant="outline">{status}</Badge>;
  };

  const handleRequestLeave = () => {
    navigate('/employee-dashboard/leave');
  };

  if (loading) {
    return (
      <Card className="h-80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Leaves
            </CardTitle>
            <Button 
              size="sm"
              onClick={handleRequestLeave}
              className="h-7 px-2 text-xs bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30"
              variant="secondary"
            >
              <Plus className="h-3 w-3 mr-1" />
              Request Time-Off
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalLeaves = leaveSummary?.totalLeaves || 20;
  const leavesTaken = leaveSummary?.leavesTaken || 0;

  return (
    <Card className="h-80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Leaves
          </CardTitle>
          <Button 
            size="sm"
            onClick={handleRequestLeave}
            className="h-7 px-2 text-xs bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30"
            variant="secondary"
          >
            <Plus className="h-3 w-3 mr-1" />
            Request Time-Off
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col h-[calc(100%-5rem)] pb-2">
        <div className="space-y-4 flex-1 overflow-y-auto">
          {/* Semi-Circular Progress Chart */}
          <div className="flex justify-center pt-2">
            <SemiCircularProgress 
              value={leavesTaken} 
              total={totalLeaves}
              size={120}
              strokeWidth={12}
            />
          </div>

          {/* Recent Requests */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Recent Requests</span>
              <span className="text-xs text-muted-foreground">
                {recentRequests.filter(req => req.status === 'Pending').length} pending
              </span>
            </div>
            
            {recentRequests.length > 0 ? (
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {recentRequests.slice(0, 3).map((request) => (
                  <div key={request._id} className="flex items-center justify-between p-1.5 rounded-md text-xs border border-border/50 bg-card">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <Calendar className="h-2.5 w-2.5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-foreground text-xs">{request.leaveType}</span>
                        <span className="text-muted-foreground ml-1.5 text-xs">
                          {format(new Date(request.startDate), 'MMM d')} - {format(new Date(request.endDate), 'MMM d')}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge className={`${getStatusBadge(request.status).props.className} text-xs px-1 py-0 h-4`} variant="outline">
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {recentRequests.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center pt-0.5">
                    +{recentRequests.length - 3} more requests
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-xs">
                No recent requests
              </div>
            )}
          </div>
        </div>

        {/* Warning if low balance */}
        {leaveSummary?.leavesRemaining <= 5 && leaveSummary?.leavesRemaining > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-md text-xs text-yellow-700 dark:text-yellow-400 mt-2 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
            <AlertCircle className="h-3 w-3" />
            <span>Low leave balance remaining</span>
          </div>
        )}

        {/* Warning if no balance */}
        {leaveSummary?.leavesRemaining === 0 && (
          <div className="flex items-center gap-2 p-2 rounded-md text-xs text-red-700 dark:text-red-400 mt-2 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <AlertCircle className="h-3 w-3" />
            <span>No leave balance available</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeOffCard; 