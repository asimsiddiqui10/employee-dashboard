import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, DollarSign, Building2, Megaphone, FileText, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

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
  // Example notifications with new type-based structure
  const notifications = [
    {
      id: 1,
      type: 'payroll',
      title: "New payroll document available",
      timeAgo: "2 hours ago",
    },
    {
      id: 2,
      type: 'policy',
      title: "Updated workplace safety guidelines",
      timeAgo: "1 day ago",
    },
    {
      id: 3,
      type: 'announcement',
      title: "Company town hall next week",
      timeAgo: "2 days ago",
    },
    {
      id: 4,
      type: 'company',
      title: "New benefits package announcement",
      timeAgo: "3 days ago",
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          What's happening at ACT
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-start gap-3">
              <div className={`mt-1 rounded-full p-1.5 ${getNotificationStyle(notification.type)}`}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{notification.title}</p>
                  <Badge variant="outline" className={getNotificationStyle(notification.type)}>
                    {notification.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{notification.timeAgo}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsCard; 