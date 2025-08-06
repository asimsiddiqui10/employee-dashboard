import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertCircle, Plus } from 'lucide-react';

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
      Pending: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
      Approved: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
      Rejected: "bg-red-500/10 text-red-500 hover:bg-red-500/20"
    };
    return <Badge className={styles[status]}>{status}</Badge>;
  };

  const handleRequestLeave = () => {
    navigate('/employee-dashboard/leave');
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Time Off
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Time Off
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Leave Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {leaveSummary?.leavesRemaining || 0}
              </div>
              <div className="text-xs text-muted-foreground">Available Days</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {leaveSummary?.leavesTaken || 0}
              </div>
              <div className="text-xs text-muted-foreground">Days Taken</div>
            </div>
          </div>

          {/* Recent Requests */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Recent Requests</span>
              <span className="text-xs text-muted-foreground">
                {recentRequests.filter(req => req.status === 'Pending').length} pending
              </span>
            </div>
            
            {recentRequests.length > 0 ? (
              <div className="space-y-2 max-h-24 overflow-y-auto">
                {recentRequests.slice(0, 2).map((request) => (
                  <div key={request._id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{request.leaveType}</span>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                ))}
                {recentRequests.length > 2 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{recentRequests.length - 2} more requests
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-xs">
                No recent requests
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              className="flex-1" 
              onClick={handleRequestLeave}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Request Leave
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/employee-dashboard/leave')}
            >
              <Clock className="h-4 w-4" />
            </Button>
          </div>

          {/* Warning if low balance */}
          {leaveSummary?.leavesRemaining <= 5 && leaveSummary?.leavesRemaining > 0 && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded text-xs text-yellow-700">
              <AlertCircle className="h-3 w-3" />
              <span>Low leave balance remaining</span>
            </div>
          )}

          {/* Warning if no balance */}
          {leaveSummary?.leavesRemaining === 0 && (
            <div className="flex items-center gap-2 p-2 bg-red-50 rounded text-xs text-red-700">
              <AlertCircle className="h-3 w-3" />
              <span>No leave balance available</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeOffCard; 