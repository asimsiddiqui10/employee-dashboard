import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, DollarSign, Building2, Megaphone, FileText, AlertCircle, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'payroll':
      return <DollarSign className="h-4 w-4" />;
    case 'company':
      return <Building2 className="h-4 w-4" />;
    case 'announcement':
      return <Megaphone className="h-4 w-4" />;
    case 'policy':
      return <FileText className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const getNotificationStyle = (type) => {
  const styles = {
    payroll: "bg-blue-500/10 text-blue-500",
    company: "bg-purple-500/10 text-purple-500",
    announcement: "bg-yellow-500/10 text-yellow-500",
    policy: "bg-red-500/10 text-red-500",
    other: "bg-gray-500/10 text-gray-500"
  };
  return styles[type] || styles.other;
};

const NotificationsCard = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Don't show toast for card component to avoid spam
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      console.log('Marking notification as read:', notificationId);
      const response = await api.patch(`/notifications/${notificationId}/read`);
      console.log('Mark as read response:', response.data);
      
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
      ));
      
      // Show success feedback
      toast({
        title: "Success",
        description: "Notification marked as read",
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const handleNotificationClick = (notificationId) => {
    // Mark as read if it's unread, then navigate
    const notification = notifications.find(n => n._id === notificationId);
    if (notification && !notification.isRead) {
      markAsRead(notificationId);
    }
    navigate('/employee-dashboard/notifications');
  };

  // Get the latest 4 notifications
  const latestNotifications = notifications.slice(0, 4);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInHours = Math.floor((now - notificationDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle 
            className="text-lg font-semibold flex items-center gap-2 cursor-pointer hover:text-primary transition-colors" 
            onClick={() => navigate('/employee-dashboard/notifications')}
          >
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {notifications.filter(n => !n.isRead).length} new
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col h-[calc(100%-5rem)] pb-0.5">
        <div className="space-y-2 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          ) : latestNotifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No notifications</p>
          ) : (
            latestNotifications.map((notification) => (
              <div 
                key={notification._id} 
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md transition-colors cursor-pointer hover:bg-muted/50",
                  !notification.isRead && "bg-primary/5 border border-primary/20"
                )}
                onClick={() => handleNotificationClick(notification._id)}
              >
                <div className={cn("p-1 rounded", getNotificationStyle(notification.type))}>
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{notification.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                    <Badge variant="outline" className="text-xs h-4 px-1">
                      {notification.type}
                    </Badge>
                  </div>
                </div>

                {!notification.isRead && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-green-100 hover:text-green-600 relative z-10"
                    onClick={(e) => {
                      console.log('Button clicked!', notification._id, e);
                      markAsRead(notification._id, e);
                    }}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
        
        {/* View All Button - Always at bottom */}
        <div className="pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs"
            onClick={() => navigate('/employee-dashboard/notifications')}
          >
            View All ({notifications.length})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsCard; 