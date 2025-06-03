import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, FileText } from 'lucide-react';

const TasksCard = () => {
  const tasks = [
    {
      id: 1,
      title: "Complete Q4 Performance Review",
      dueDate: "Due by Nov 15",
      priority: "high",
      type: "review"
    },
    {
      id: 2,
      title: "Submit Travel Expense Report",
      dueDate: "Due by Nov 10",
      priority: "medium",
      type: "document"
    },
    {
      id: 3,
      title: "Schedule Team Planning Meeting",
      dueDate: "Due by Nov 8",
      priority: "low",
      type: "meeting"
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getTaskIcon = (type) => {
    switch (type) {
      case 'review':
        return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />;
      case 'document':
        return <FileText className="h-4 w-4 text-muted-foreground" />;
      case 'meeting':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start gap-3">
              {getTaskIcon(task.type)}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{task.title}</p>
                  <Badge className={getPriorityColor(task.priority)} variant="secondary">
                    {task.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{task.dueDate}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TasksCard; 