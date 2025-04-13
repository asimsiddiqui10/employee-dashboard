import React from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";

const chartData = [
  { month: "January", revenue: 18600, profit: 8000 },
  { month: "February", revenue: 30500, profit: 20000 },
  { month: "March", revenue: 23700, profit: 12000 },
  { month: "April", revenue: 7300, profit: 19000 },
  { month: "May", revenue: 20900, profit: 13000 },
  { month: "June", revenue: 21400, profit: 14000 },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  profit: {
    label: "Profit",
    color: "hsl(var(--chart-2))",
  },
};

export function RevenueBarChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Revenue & Profit</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[160px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData}
              margin={{
                top: 15,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
                stroke="hsl(var(--foreground) / 0.4)"
              />
              <Tooltip
                cursor={false}
                formatter={(value, name) => [
                  `$${value}`,
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]}
              />
              <Bar 
                dataKey="revenue" 
                fill="hsl(var(--chart-1))" 
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="profit" 
                fill="hsl(var(--chart-2))" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Revenue up by 15.2% <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
} 