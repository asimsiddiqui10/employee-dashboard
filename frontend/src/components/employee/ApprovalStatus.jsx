import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from 'date-fns';
import { CheckCircle2, XCircle, Clock } from "lucide-react";

const ApprovalStatus = ({ timeEntry }) => {
  const getStatusConfig = (status) => {
    const configs = {
      pending_approval: {
        icon: Clock,
        variant: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
        label: "Pending Approval",
        tooltip: "Awaiting manager approval"
      },
      approved: {
        icon: CheckCircle2,
        variant: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
        label: "Approved",
        tooltip: timeEntry.approvedBy ? 
          `Approved by ${timeEntry.approvedBy.name} on ${format(new Date(timeEntry.approvalDate), 'MMM d, yyyy')}` :
          "Approved"
      },
      rejected: {
        icon: XCircle,
        variant: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
        label: "Rejected",
        tooltip: "Hours record rejected"
      },
      completed: {
        icon: Clock,
        variant: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
        label: "Completed",
        tooltip: "Hours record completed, pending your approval"
      }
    };

    return configs[status] || configs.completed;
  };

  const config = getStatusConfig(timeEntry.status);
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge className={`flex items-center gap-1 ${config.variant}`}>
            <Icon className="h-3.5 w-3.5" />
            <span>{config.label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ApprovalStatus; 