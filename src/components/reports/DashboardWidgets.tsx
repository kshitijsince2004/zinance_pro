
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, DollarSign, Package } from 'lucide-react';
import { ReportsData } from '@/lib/reports-service';

interface DashboardWidgetsProps {
  data: ReportsData;
  filters: any;
}

export const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({ data, filters }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const chartConfig = {
    companiesAct: {
      label: "Companies Act",
      color: "hsl(var(--chart-1))",
    },
    itAct: {
      label: "IT Act",
      color: "hsl(var(--chart-2))",
    },
    count: {
      label: "Count",
      color: "hsl(var(--chart-3))",
    },
    value: {
      label: "Value",
      color: "hsl(var(--chart-4))",
    },
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="min-w-0">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Assets</p>
                <p className="text-lg sm:text-2xl font-bold">{data.totalAssets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Active Assets</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">{data.activeAssets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Depreciation This FY</p>
                <p className="text-sm sm:text-xl font-bold truncate">{formatCurrency(data.totalDepreciationThisFY)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Unverified</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-600">{data.unverifiedAssets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Expiry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <Card className="min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm truncate">Expiring Insurance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl sm:text-2xl font-bold text-red-600">{data.expiringServices.insurance}</p>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm truncate">Expiring AMC</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl sm:text-2xl font-bold text-orange-600">{data.expiringServices.amc}</p>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm truncate">Expiring Warranty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">{data.expiringServices.warranty}</p>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 w-full">
        {/* Depreciation Trends */}
        <Card className="w-full min-w-0">
          <CardHeader>
            <CardTitle className="text-sm sm:text-base truncate">Depreciation Trends (5-Year)</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <ChartContainer config={chartConfig} className="w-full h-[200px] sm:h-[300px]">
              <LineChart data={data.depreciationTrends}>
                <XAxis dataKey="year" fontSize={12} />
                <YAxis fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="companiesAct" 
                  stroke="var(--color-companiesAct)" 
                  strokeWidth={2}
                  name="Companies Act"
                />
                <Line 
                  type="monotone" 
                  dataKey="itAct" 
                  stroke="var(--color-itAct)" 
                  strokeWidth={2}
                  name="IT Act"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Asset Class Distribution */}
        <Card className="w-full min-w-0">
          <CardHeader>
            <CardTitle className="text-sm sm:text-base truncate">Asset Class Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <ChartContainer config={chartConfig} className="w-full h-[200px] sm:h-[300px]">
              <PieChart>
                <Pie
                  data={data.assetClassDistribution.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius="80%"
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.assetClassDistribution.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card className="w-full min-w-0">
          <CardHeader>
            <CardTitle className="text-sm sm:text-base truncate">Department-wise Assets</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <ChartContainer config={chartConfig} className="w-full h-[200px] sm:h-[300px]">
              <BarChart data={data.departmentDistribution.slice(0, 10)}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={10} />
                <YAxis fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" name="Asset Count" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Acquisition Trends */}
        <Card className="w-full min-w-0">
          <CardHeader>
            <CardTitle className="text-sm sm:text-base truncate">Asset Acquisition Trends</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <ChartContainer config={chartConfig} className="w-full h-[200px] sm:h-[300px]">
              <BarChart data={data.acquisitionTrends}>
                <XAxis dataKey="year" fontSize={12} />
                <YAxis fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" name="Assets Acquired" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Service Status Table */}
      <Card className="w-full min-w-0">
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">Service Status Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 text-xs sm:text-sm">Service Type</th>
                  <th className="text-right p-2 text-xs sm:text-sm">Active</th>
                  <th className="text-right p-2 text-xs sm:text-sm">Expiring (30 days)</th>
                  <th className="text-right p-2 text-xs sm:text-sm">Expired</th>
                </tr>
              </thead>
              <tbody>
                {data.serviceStatus.map((service, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium text-xs sm:text-sm">{service.type}</td>
                    <td className="p-2 text-right text-green-600 text-xs sm:text-sm">{service.active}</td>
                    <td className="p-2 text-right text-orange-600 text-xs sm:text-sm">{service.expiring}</td>
                    <td className="p-2 text-right text-red-600 text-xs sm:text-sm">{service.expired}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
