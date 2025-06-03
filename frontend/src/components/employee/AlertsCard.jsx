import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, FileText, Calendar } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

const AlertsCard = () => {
  // Fake alerts data
  const alerts = [
    {
      id: 1,
      icon: <AlertTriangle className="h-5 w-5 text-destructive" />,
      title: "Complete your Self Assessment",
      dueDate: "Due by Sep 30",
      status: "PAST DUE",
      type: "urgent"
    },
    {
      id: 2,
      icon: <FileText className="h-5 w-5 text-muted-foreground" />,
      title: "Review updated safety protocols",
      dueDate: "Due by Oct 15",
      status: "DUE SOON",
      type: "warning"
    },
    {
      id: 3,
      icon: <Calendar className="h-5 w-5 text-primary" />,
      title: "Schedule performance review",
      dueDate: "Due by Oct 30",
      type: "info"
    }
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {alerts.map((alert) => (
            <div key={alert.id} className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  {alert.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{alert.title}</p>
                    {alert.status && (
                      <Badge 
                        variant={alert.type === 'urgent' ? 'destructive' : 'secondary'} 
                        className="shrink-0"
                      >
                        {alert.status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.dueDate}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertsCard; 