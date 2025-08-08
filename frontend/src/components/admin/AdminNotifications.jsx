import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, MoreVertical, Users, Eye, Clock, DollarSign, Building2, Megaphone, FileText, AlertCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import api from '@/lib/axios';
import { toast } from '@/hooks/use-toast';
import { handleApiError } from '@/utils/errorHandler';
import SendNotificationModal from './SendNotificationModal';

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
      return <Info className="h-4 w-4" />;
  }
};

const getNotificationStyle = (type) => {
  const styles = {
    payroll: "bg-blue-100 text-blue-600",
    company: "bg-purple-100 text-purple-600",
    announcement: "bg-yellow-100 text-yellow-600",
    policy: "bg-red-100 text-red-600",
    other: "bg-gray-100 text-gray-600"
  };
  return styles[type] || styles.other;
};

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('24h');

  useEffect(() => {
    fetchNotifications();
  }, [timeFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/notifications/all?timeFilter=${timeFilter}`);
      setNotifications(response.data || []);
      setFilteredNotifications(response.data || []);
    } catch (error) {
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

  const handleNotificationSent = () => {
    fetchNotifications();
    toast({
      title: "Success",
      description: "Notification sent successfully",
    });
  };

  const ReadStatusDropdown = ({ notification }) => {
    const readRecipients = notification.recipients.filter(r => r.read);
    const unreadRecipients = notification.recipients.filter(r => !r.read);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4" />
              <span className="font-medium">Read Status</span>
            </div>
            
            <div className="space-y-3">
              {/* Summary */}
              <div className="flex items-center justify-between text-sm">
                <span>Total Recipients:</span>
                <Badge variant="secondary">{notification.totalRecipients}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Read:</span>
                <Badge variant="default" className="bg-green-100 text-green-700">
                  {notification.readCount}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Unread:</span>
                <Badge variant="default" className="bg-orange-100 text-orange-700">
                  {notification.unreadCount}
                </Badge>
              </div>

              {/* Read Recipients */}
              {readRecipients.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-medium text-green-600">Read by:</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {readRecipients.map((recipient, index) => (
                      <div key={index} className="text-xs bg-green-50 p-2 rounded">
                        <div className="font-medium">{recipient.employeeId?.name || 'Unknown'}</div>
                        <div className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {recipient.readAt ? format(new Date(recipient.readAt), 'MMM d, h:mm a') : 'Unknown time'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unread Recipients */}
              {unreadRecipients.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="h-3 w-3 text-orange-600" />
                    <span className="text-xs font-medium text-orange-600">Not read by:</span>
                  </div>
                  <div className="max-h-24 overflow-y-auto space-y-1">
                    {unreadRecipients.map((recipient, index) => (
                      <div key={index} className="text-xs bg-orange-50 p-2 rounded">
                        <div className="font-medium">{recipient.employeeId?.name || 'Unknown'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Notifications Management</h1>
          <p className="text-muted-foreground">Send and manage company notifications</p>
        </div>
        <SendNotificationModal onNotificationSent={handleNotificationSent} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Time Filter:</span>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Badge variant="secondary">
          {notifications.length} notifications
        </Badge>
      </div>

      {/* Notifications List - Full Width */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-muted-foreground">No notifications found for the selected time period.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card key={notification._id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-2 rounded-lg flex-shrink-0 ${getNotificationStyle(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-semibold text-base leading-tight mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className="text-xs">
                          {notification.type}
                        </Badge>
                        <ReadStatusDropdown notification={notification} />
                      </div>
                    </div>
                    
                    {/* Stats and Meta */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {notification.totalRecipients} recipients
                        </span>
                        {notification.sender?.name && (
                          <span>by {notification.sender.name}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-green-100 text-green-700 text-xs">
                          {notification.readCount} read
                        </Badge>
                        <Badge variant="default" className="bg-orange-100 text-orange-700 text-xs">
                          {notification.unreadCount} unread
                        </Badge>
                        {notification.priority === 'high' && (
                          <Badge variant="destructive" className="text-xs">
                            High Priority
                          </Badge>
                        )}
                      </div>
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

export default AdminNotifications;