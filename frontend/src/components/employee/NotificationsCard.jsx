import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Users, FileSignature, Clock, Heart } from 'lucide-react';

const NotificationsCard = () => {
  // Fake notifications data
  const notifications = [
    {
      id: 1,
      icon: <Users className="h-5 w-5" />,
      title: "You have 25 applicants for the Payroll Specialist opening",
      timeAgo: "8 days ago",
    },
    {
      id: 2,
      icon: <FileSignature className="h-5 w-5" />,
      title: "You have 4 documents waiting for your signature",
      timeAgo: "20 days ago",
    },
    {
      id: 3,
      icon: <Clock className="h-5 w-5" />,
      title: "Time Tracking is enabled and ready for setup",
      timeAgo: "20 days ago",
    },
    {
      id: 4,
      icon: <Heart className="h-5 w-5" />,
      title: "Benefits Administration is enabled and ready for setup",
      timeAgo: "20 days ago",
    },
    {
      id: 5,
      icon: <Heart className="h-5 w-5" />,
      title: "You have benefit plans ending soon",
      timeAgo: "1 month ago",
    },
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
              <div className="mt-1 text-muted-foreground">
                {notification.icon}
              </div>
              <div>
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-xs text-muted-foreground">{notification.timeAgo}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsCard; 