import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { ArrowUpIcon, ArrowDownIcon, Users, DollarSign, Building, Bell } from "lucide-react";
import { DonutChartComponent } from '../charts/DonutChart';
import { RevenueBarChart } from '../charts/BarChart';
import { VisitorsAreaChart } from '../charts/AreaChart';
import { ScrollArea } from "../ui/scroll-area";

// Add this notification data
const notifications = [
  {
    id: 1,
    title: "New Employee Onboarding",
    description: "Sarah Johnson has completed onboarding process",
    time: "2 hours ago",
    type: "info"
  },
  {
    id: 2,
    title: "System Update",
    description: "Critical security update scheduled for tonight",
    time: "5 hours ago",
    type: "warning"
  },
  {
    id: 3,
    title: "Meeting Reminder",
    description: "Monthly review meeting in 30 minutes",
    time: "30 minutes ago",
    type: "alert"
  },
  {
    id: 4,
    title: "New Employee Onboarding",
    description: "Sarah Johnson has completed onboarding process",
    time: "2 hours ago",
    type: "info"
  },
];

const AdminHome = () => {
  // Sample data for charts
  const chartdata = [
    { date: "Apr 1", Visitors: 2890, Revenue: 2400 },
    { date: "Apr 6", Visitors: 2756, Revenue: 1398 },
    { date: "Apr 11", Visitors: 3322, Revenue: 2400 },
    { date: "Apr 17", Visitors: 3470, Revenue: 3908 },
    { date: "Apr 23", Visitors: 3475, Revenue: 3800 },
    { date: "Apr 29", Visitors: 3129, Revenue: 3800 },
    { date: "May 5", Visitors: 2989, Revenue: 2800 },
    { date: "May 11", Visitors: 2756, Revenue: 2498 },
    { date: "May 17", Visitors: 3322, Revenue: 3100 },
    { date: "May 23", Visitors: 2890, Revenue: 2400 },
  ];

  const donutData = [
    { name: "Active", value: 456 },
    { name: "Inactive", value: 120 },
    { name: "On Leave", value: 89 },
    { name: "Terminated", value: 10 },
  ];

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      {/* Main Content */}
      <div className="flex w-full flex-col gap-4 lg:w-3/4">
        {/* Stats Section */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total Revenue</CardTitle>
              <Badge variant="outline" className="bg-green-50 text-green-700 text-[10px] px-2 py-0.5">
                <ArrowUpIcon className="mr-1 h-2.5 w-2.5" />
                +12.5%
              </Badge>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold tracking-tight">$1,250.00</div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">New Customers</CardTitle>
              <Badge variant="outline" className="bg-red-50 text-red-700 text-[10px] px-2 py-0.5">
                <ArrowDownIcon className="mr-1 h-2.5 w-2.5" />
                -20%
              </Badge>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold tracking-tight">1,234</div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Accounts</CardTitle>
              <Badge variant="outline" className="bg-green-50 text-green-700 text-[10px] px-2 py-0.5">
                <ArrowUpIcon className="mr-1 h-2.5 w-2.5" />
                +12.5%
              </Badge>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold tracking-tight">45,678</div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Growth Rate</CardTitle>
              <Badge variant="outline" className="bg-green-50 text-green-700 text-[10px] px-2 py-0.5">
                <ArrowUpIcon className="mr-1 h-2.5 w-2.5" />
                +4.5%
              </Badge>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold tracking-tight">4.5%</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-full lg:col-span-4">
            <RevenueBarChart />
          </div>
          <div className="col-span-full md:col-span-1 lg:col-span-3">
            <DonutChartComponent />
          </div>
        </div>

        {/* Visitors Area Chart */}
        <div className="grid gap-4">
          <div className="w-full">
            <VisitorsAreaChart />
          </div>
        </div>
      </div>

      {/* Notifications Card */}
      <Card className="w-full lg:w-1/4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Notifications</CardTitle>
            <Badge variant="secondary" className="font-normal">
              {notifications.length} New
            </Badge>
          </div>
          <CardDescription>Recent updates and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-13rem)] pr-4">
            <div className="flex flex-col gap-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex flex-col gap-2 rounded-lg border p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{notification.title}</h4>
                    <Badge 
                      variant={
                        notification.type === "warning" 
                          ? "destructive" 
                          : notification.type === "alert" 
                          ? "secondary" 
                          : "outline"
                      }
                      className="text-xs"
                    >
                      {notification.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.description}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {notification.time}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHome;