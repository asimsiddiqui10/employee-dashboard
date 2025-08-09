import * as React from "react"
import { TrendingUp, Building } from "lucide-react"
import { Label, Pie, PieChart, Cell, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import api from '@/lib/axios'
import { handleApiError } from '@/utils/errorHandler'
import { departments } from '@/lib/departments'

// Color palette for departments
const departmentColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))", 
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))",
  "hsl(var(--chart-8))",
  "hsl(var(--chart-9))",
  "hsl(var(--chart-10))"
];

export function DonutChartComponent() {
  const [chartData, setChartData] = React.useState([]);
  const [totalEmployees, setTotalEmployees] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchDepartmentData();
  }, []);

  const fetchDepartmentData = async () => {
    try {
      const response = await api.get('/employees/department-counts');
      const { departments: deptCounts, total } = response.data.data;
      
      // Transform data for chart
      const transformedData = deptCounts.map((dept, index) => ({
        department: dept._id || 'Other',
        value: dept.count,
        fill: departmentColors[index % departmentColors.length]
      }));
      
      setChartData(transformedData);
      setTotalEmployees(total);
    } catch (error) {
      console.error('Error fetching department data:', error);
      const { message } = handleApiError(error);
      console.error(message);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const deptConfig = departments[data.payload.department];
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            {deptConfig && (
              <div className={`p-1 rounded ${deptConfig.bgColor}`}>
                <deptConfig.icon className={`h-3 w-3 ${deptConfig.color}`} />
              </div>
            )}
            <span className="font-medium">{data.payload.department}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {data.value} employees
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Department Distribution</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="mx-auto aspect-square max-h-[180px] flex items-center justify-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Department Distribution
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <span>{chartData.length} departments</span>
        </CardDescription>
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
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
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
                        className="fill-muted-foreground text-sm"
                      >
                        Total
                      </tspan>
                    </text>
                  );
                }}
              />
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </div>
      </CardContent>
    </Card>
  );
} 