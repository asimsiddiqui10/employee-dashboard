import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"

const chartData = [
  { department: "Active", value: 250, fill: "hsl(var(--chart-1))" },
  { department: "Inactive", value: 120, fill: "hsl(var(--chart-2))" },
  { department: "On Leave", value: 89, fill: "hsl(var(--chart-3))" },
  { department: "Terminated", value: 60, fill: "hsl(var(--chart-4))" }
];

const chartConfig = {
  value: {
    label: "Employees",
  },
  active: {
    label: "Active",
    color: "hsl(var(--chart-1))",
  },
  inactive: {
    label: "Inactive",
    color: "hsl(var(--chart-2))",
  },
  onLeave: {
    label: "On Leave",
    color: "hsl(var(--chart-3))",
  },
  terminated: {
    label: "Terminated",
    color: "hsl(var(--chart-4))",
  }
};

export function DonutChartComponent() {
  const totalEmployees = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0)
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Employee Distribution</CardTitle>
        <CardDescription>Current Month</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="mx-auto aspect-square max-h-[180px]">
          <PieChart width={180} height={180}>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="department"
              innerRadius={40}
              outerRadius={65}
              paddingAngle={0}
              strokeWidth={0}
            >
              <Label
                content={({ viewBox }) => {
                  const { cx, cy } = viewBox;
                  return (
                    <text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={cx}
                        y={cy}
                        className="fill-foreground text-3xl font-bold"
                      >
                        {totalEmployees}
                      </tspan>
                      <tspan
                        x={cx}
                        y={cy + 24}
                        className="fill-muted-foreground"
                      >
                        Total
                      </tspan>
                    </text>
                  );
                }}
              />
            </Pie>
          </PieChart>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Active employees up by 5.2% <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
} 