import React from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const chartData = [
  { date: "2023-01-01", visitors: 2450, revenue: 1600 },
  { date: "2023-02-01", visitors: 2680, revenue: 1800 },
  { date: "2023-03-01", visitors: 3100, revenue: 1900 },
  { date: "2023-04-01", visitors: 2756, revenue: 2300 },
  { date: "2023-05-01", visitors: 900, revenue: 2800 },
  { date: "2023-06-01", visitors: 3250, revenue: 3400 },
  { date: "2023-07-01", visitors: 3000, revenue: 1900 },
  { date: "2023-08-01", visitors: 3322, revenue: 2600 },
  { date: "2023-09-01", visitors: 2900, revenue: 4000 },
  { date: "2023-10-01", visitors: 3475, revenue: 2400 },
  { date: "2023-11-01", visitors: 3100, revenue: 1800 },
  { date: "2023-12-01", visitors: 3250, revenue: 2200 },
  { date: "2024-01-01", visitors: 1600, revenue: 2900 },
  { date: "2024-02-01", visitors: 3100, revenue: 2300 },
  { date: "2024-03-01", visitors: 3600, revenue: 1700 },
  { date: "2024-04-01", visitors: 2000, revenue: 2800 },
  { date: "2024-05-01", visitors: 1800, revenue: 3200 },
  { date: "2024-06-01", visitors: 3400, revenue: 2500 }
];

export function VisitorsAreaChart() {
  const [timeRange, setTimeRange] = React.useState("6m");

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-3 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Visitors & Revenue Trend</CardTitle>
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
      <CardContent className="pt-4">
        <div className="h-[200px] w-full">
          <AreaChart
            width={800}
            height={200}
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            style={{ width: '100%', height: '100%' }}
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
            <CartesianGrid strokeOpacity={0.4} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <Tooltip
              formatter={(value, name) => [`${value}`, name.charAt(0).toUpperCase() + name.slice(1)]}
              labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            />
            <Legend verticalAlign="top" height={36} />
            <Area
              type="monotone"
              dataKey="visitors"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVisitors)"
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </div>
      </CardContent>
    </Card>
  );
}