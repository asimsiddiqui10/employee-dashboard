import React from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const chartData = [
  { date: "2023-01-01", fulltime: 24, contract: 16 },
  { date: "2023-02-01", fulltime: 27, contract: 18 },
  { date: "2023-03-01", fulltime: 31, contract: 19 },
  { date: "2023-04-01", fulltime: 28, contract: 23 },
  { date: "2023-05-01", fulltime: 9, contract: 28 },
  { date: "2023-06-01", fulltime: 33, contract: 34 },
  { date: "2023-07-01", fulltime: 30, contract: 19 },
  { date: "2023-08-01", fulltime: 33, contract: 26 },
  { date: "2023-09-01", fulltime: 29, contract: 40 },
  { date: "2023-10-01", fulltime: 35, contract: 24 },
  { date: "2023-11-01", fulltime: 31, contract: 18 },
  { date: "2023-12-01", fulltime: 33, contract: 22 },
  { date: "2024-01-01", fulltime: 16, contract: 29 },
  { date: "2024-02-01", fulltime: 31, contract: 23 },
  { date: "2024-03-01", fulltime: 36, contract: 17 },
  { date: "2024-04-01", fulltime: 20, contract: 28 },
  { date: "2024-05-01", fulltime: 18, contract: 32 },
  { date: "2024-06-01", fulltime: 34, contract: 25 }
];

export function VisitorsAreaChart() {
  const [timeRange, setTimeRange] = React.useState("6m");

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-3 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Attendance Trends</CardTitle>
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
              <linearGradient id="colorFulltime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorContract" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeOpacity={0.7} 
              vertical={false}
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))', fillOpacity: 0.8 }}
              tickMargin={10}
              stroke="hsl(var(--border))"
              strokeOpacity={0.2}
            />
            <Tooltip
              formatter={(value, name) => [
                `${value}`, 
                name === 'fulltime' ? 'Full-time' : name === 'contract' ? 'Contract' : name.charAt(0).toUpperCase() + name.slice(1)
              ]}
              labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            />
            <Legend verticalAlign="top" height={36} />
            <Area
              type="monotone"
              dataKey="fulltime"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorFulltime)"
              name="Full-time"
            />
            <Area
              type="monotone"
              dataKey="contract"
              stroke="hsl(var(--chart-2))" 
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorContract)"
              name="Contract"
            />
          </AreaChart>
        </div>
      </CardContent>
    </Card>
  );
}