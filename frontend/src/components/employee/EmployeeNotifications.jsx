import React, { useState, useEffect } from 'react';
import { Bell, DollarSign, Building2, Megaphone, FileText, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const EmployeeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);

  const notificationTypes = [
    { value: 'all', label: 'All', icon: Bell },
    { value: 'payroll', label: 'Payroll', icon: DollarSign },
    { value: 'company', label: 'Company', icon: Building2 },
    { value: 'announcement', label: 'Announcements', icon: Megaphone },
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

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Notifications</h2>
        <div className="flex gap-2">
          {notificationTypes.map(type => (
            <Button
              key={type.value}
              variant={selectedType === type.value ? "default" : "outline"}
              onClick={() => setSelectedType(type.value)}
              className="flex items-center gap-2"
            >
              <type.icon className="h-4 w-4" />
              {type.label}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No notifications found</p>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification._id} 
              className={`p-4 border rounded-lg ${
                notification.isRead ? 'bg-card' : 'bg-primary/5 border-primary/20'
              }`}
              onClick={() => !notification.isRead && markAsRead(notification._id)}
            >
              <div className="flex items-start gap-3">
                <div className={`shrink-0 rounded-full p-1.5 ${getNotificationStyle(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{notification.title}</h3>
                    <Badge variant="outline" className={getNotificationStyle(notification.type)}>
                      {notification.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    From: {notification.sender?.name || 'System'} • 
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-2">{notification.message}</p>
                  {notification.link && (
                    <Button variant="link" className="mt-2 p-0" asChild>
                      <a href={notification.link}>View Details</a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmployeeNotifications; 