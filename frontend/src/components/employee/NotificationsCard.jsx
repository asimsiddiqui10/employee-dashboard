import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, DollarSign, Building2, Megaphone, FileText, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { toast } from '@/hooks/use-toast';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'payroll':
      return <DollarSign className="h-5 w-5" />;
    case 'company':
      return <Building2 className="h-5 w-5" />;
    case 'announcement':
      return <Megaphone className="h-5 w-5" />;
    case 'policy':
      return <FileText className="h-5 w-5" />;
    default:
      return <AlertCircle className="h-5 w-5" />;
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

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Get the latest 4 notifications
  const latestNotifications = notifications.slice(0, 4);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInHours = Math.floor((now - notificationDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle 
          className="text-lg font-semibold flex items-center gap-2 cursor-pointer hover:text-primary transition-colors" 
          onClick={() => navigate('/employee-dashboard/notifications')}
        >
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
                className={`flex items-start gap-3 p-1.5 rounded-md transition-colors cursor-pointer hover:bg-muted/50 ${
                  !notification.isRead ? 'bg-primary/5' : ''
                }`}
                onClick={() => {
                  if (!notification.isRead) {
                    markAsRead(notification._id);
                  }
                  navigate('/employee-dashboard/notifications');
                }}
              >
                <div className={`mt-0.5 rounded-full p-1.5 ${getNotificationStyle(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{notification.title}</p>
                    <Badge variant="outline" className={`text-xs ${getNotificationStyle(notification.type)}`}>
                      {notification.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatTimeAgo(notification.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsCard; 