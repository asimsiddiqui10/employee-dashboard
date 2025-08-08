import React, { useState, useEffect } from 'react';
import { Bell, DollarSign, Building2, Megaphone, FileText, AlertCircle, Clock, Check, Info } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from '@/lib/axios';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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
      return <Info className="h-5 w-5" />;
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

const EmployeeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);

  const notificationTypes = [
    { value: 'all', label: 'All', icon: Bell },
    { value: 'payroll', label: 'Payroll', icon: DollarSign },
    { value: 'company', label: 'Company', icon: Building2 },
    { value: 'announcement', label: 'Company Updates', icon: Megaphone },
    { value: 'policy', label: 'Policy', icon: FileText }
  ];

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      });
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

  const filteredNotifications = notifications.filter(
    notif => selectedType === 'all' || notif.type === selectedType
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Notifications</h1>
        <p className="text-muted-foreground">Stay updated with company news and important information</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {notificationTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedType === type.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <Icon className="h-4 w-4" />
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Notifications List - Compact Layout */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-muted-foreground">
                  {selectedType === 'all' 
                    ? 'You have no notifications at this time.'
                    : `You have no ${selectedType} notifications.`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification._id}
              className={`transition-all hover:shadow-sm ${
                !notification.isRead ? 'border-primary/50 bg-primary/5' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    notification.type === 'payroll' ? 'bg-blue-100 text-blue-600' :
                    notification.type === 'company' ? 'bg-purple-100 text-purple-600' :
                    notification.type === 'announcement' ? 'bg-yellow-100 text-yellow-600' :
                    notification.type === 'policy' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {notification.type === 'payroll' && <DollarSign className="h-4 w-4" />}
                    {notification.type === 'company' && <Building2 className="h-4 w-4" />}
                    {notification.type === 'announcement' && <Megaphone className="h-4 w-4" />}
                    {notification.type === 'policy' && <FileText className="h-4 w-4" />}
                    {!['payroll', 'company', 'announcement', 'policy'].includes(notification.type) && 
                      <Bell className="h-4 w-4" />
                    }
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="font-semibold text-base leading-tight">{notification.title}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className="text-xs">
                          {notification.type}
                        </Badge>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                        </span>
                        {notification.priority && (
                          <Badge 
                            variant={notification.priority === 'high' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {notification.priority} priority
                          </Badge>
                        )}
                      </div>
                      
                      {!notification.isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-3 text-xs"
                          onClick={(e) => {
                            console.log('Mark as read button clicked!', notification._id);
                            markAsRead(notification._id, e);
                          }}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default EmployeeNotifications; 