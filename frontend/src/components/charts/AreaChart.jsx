import React from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const chartData = [
  { date: "2024-01-01", visitors: 2890, revenue: 2400 },
  { date: "2024-02-01", visitors: 2756, revenue: 1398 },
  { date: "2024-03-01", visitors: 3322, revenue: 2400 },
  { date: "2024-04-01", visitors: 3470, revenue: 3908 },
  { date: "2024-05-01", visitors: 3475, revenue: 3800 },
  { date: "2024-06-01", visitors: 3129, revenue: 3800 }
];

export function VisitorsAreaChart() {
  const [timeRange, setTimeRange] = React.useState("6m");

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Visitors & Revenue Trend</CardTitle>
          <CardDescription>Monthly analysis for 2024</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto">
            <SelectValue placeholder="Last 6 months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6m">Last 6 months</SelectItem>
            <SelectItem value="3m">Last 3 months</SelectItem>
            <SelectItem value="1m">Last month</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px] w-full">
          <AreaChart
            width={500}
            height={300}
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
            />
            <Tooltip
              formatter={(value, name) => [`${value}`, name.charAt(0).toUpperCase() + name.slice(1)]}
              labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="visitors"
              stroke="hsl(var(--chart-1))"
              fillOpacity={1}
              fill="url(#colorVisitors)"
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--chart-2))"
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </div>
      </CardContent>
    </Card>
  );
}