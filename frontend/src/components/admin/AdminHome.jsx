import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { ArrowUpIcon, ArrowDownIcon, Users, DollarSign, Building } from "lucide-react";
import { DonutChartComponent } from '../charts/DonutChart';
import { RevenueBarChart } from '../charts/BarChart';
import { VisitorsAreaChart } from '../charts/AreaChart';

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
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <ArrowUpIcon className="mr-1 h-3 w-3" />
              +12.5%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,250.00</div>
            <p className="text-xs text-muted-foreground">
              Trending up this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Badge variant="outline" className="bg-red-50 text-red-700">
              <ArrowDownIcon className="mr-1 h-3 w-3" />
              -20%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              Down 20% this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <ArrowUpIcon className="mr-1 h-3 w-3" />
              +12.5%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,678</div>
            <p className="text-xs text-muted-foreground">
              Strong user retention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <ArrowUpIcon className="mr-1 h-3 w-3" />
              +4.5%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.5%</div>
            <p className="text-xs text-muted-foreground">
              Steady performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-full lg:col-span-4">
          <VisitorsAreaChart />
        </div>
        <div className="col-span-full md:col-span-1 lg:col-span-3">
          <DonutChartComponent />
        </div>
      </div>

      {/* Revenue Bar Chart */}
      <div className="grid gap-4">
        <RevenueBarChart />
      </div>
    </div>
  );
};

export default AdminHome;